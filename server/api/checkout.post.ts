import { prisma } from '~~/server/utils/db/client'
import type { PaymentMethod, Shipping } from '~~/server/utils/checkout'
import type { BundleSelectionInput } from '~/types/catalog'
import { createCheckoutHandoffPayload, createSubscriptionBundleSummary } from '~/utils/bundle'

// Start a box: re-price the bundle server-side, snapshot it, create the
// subscription and its first order, then start payment (or confirm cash on delivery).
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody<{ selection: BundleSelectionInput, method?: PaymentMethod, shipping?: Partial<Shipping> }>(event)
  const { selection } = body

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

  const shipping = normalizeShipping(body.shipping)
  const method = await resolveMethod(body.method, shipping)

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
      snapshot,
      paymentMethod: method,
      shipping: { ...shipping }
    }
  })

  return placeOrder(event, {
    userId: session.user.id,
    subscriptionId: subscription.id,
    amount,
    currency,
    snapshot,
    method,
    shipping,
    description: `illi — ${plan.name}`,
    cancelPath: '/checkout'
  })
})
