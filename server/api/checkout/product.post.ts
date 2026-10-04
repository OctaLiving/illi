import { prisma } from '~~/server/utils/db/client'
import { getPaymentProvider } from '~~/server/utils/payments'

// One-time purchase of a single product, outside any subscription. Priced from
// the catalog server-side; the order has no subscription attached.
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const { productId } = await readBody<{ productId?: string }>(event)

  const store = await getStore()
  const product = store.products.find(p => p.id === productId)
  if (!product || !product.isAvailable) {
    throw createError({ statusCode: 400, statusMessage: 'That product is not available.' })
  }
  if (product.price.amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'That product has no price yet.' })
  }

  const { amount, currency } = product.price
  const snapshot = JSON.stringify({
    kind: 'product',
    productId: product.id,
    productName: product.name,
    quantity: 1,
    unitLabel: product.defaultUnitLabel,
    amount,
    currency
  })

  const provider = await getPaymentProvider()
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
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
    currency,
    description: `illi — ${product.name}`,
    successUrl: `${base}/account`,
    cancelUrl: `${base}/catalog/${product.slug}`,
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
