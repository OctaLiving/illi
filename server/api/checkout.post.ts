import { prisma } from '~~/server/utils/db/client'
import { getPaymentProvider } from '~~/server/utils/payments'
import type { BundleSelectionInput } from '~/types/catalog'
import { createCheckoutHandoffPayload, createSubscriptionBundleSummary } from '~/utils/bundle'

// Start checkout: re-price the bundle server-side, snapshot it, create the
// order + (pending) subscription, and open a payment with the provider.
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const { selection } = await readBody<{ selection: BundleSelectionInput }>(event)

  if (!selection?.planId) {
    throw createError({ statusCode: 400, statusMessage: 'No plan selected.' })
  }

  // Authoritative catalog + plan (never trust client-sent prices/products).
  const store = await getStore()
  const plan = store.plans.find(p => p.id === selection.planId)
  if (!plan) {
    throw createError({ statusCode: 400, statusMessage: 'Unknown plan.' })
  }

  const summary = createSubscriptionBundleSummary({ plan, products: store.products, selection })
  if (!summary.isReadyForCheckout) {
    throw createError({ statusCode: 400, statusMessage: 'Your bundle is missing required slots.' })
  }

  const snapshot = JSON.stringify(createCheckoutHandoffPayload(summary))
  const amount = plan.price.amount
  const currency = plan.price.currency

  const subscription = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      planId: plan.id,
      planName: plan.name,
      cadence: plan.cadence,
      currency,
      amount,
      snapshot
    }
  })

  const provider = await getPaymentProvider()
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      subscriptionId: subscription.id,
      currency,
      amount,
      snapshot,
      provider: provider.name
    }
  })

  const base = process.env.BETTER_AUTH_URL || getRequestURL(event).origin
  const payment = await provider.createPayment({
    orderId: order.id,
    amount,
    description: `illi — ${plan.name}`,
    successUrl: `${base}/account`,
    cancelUrl: `${base}/checkout`,
    ipnUrl: `${base}/api/webhooks/nowpayments`
  })

  await prisma.payment.create({
    data: { orderId: order.id, provider: provider.name, providerRef: payment.providerRef, amount, currency }
  })
  await prisma.order.update({
    where: { id: order.id },
    data: { providerRef: payment.providerRef, payUrl: payment.payUrl }
  })

  return { orderId: order.id, payUrl: payment.payUrl }
})
