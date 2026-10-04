import { prisma } from '~~/server/utils/db/client'
import { getPaymentProvider } from '~~/server/utils/payments'

const MAX_QUANTITY = 20

// One-time purchase of one or more products, outside any subscription. Every
// price comes from the catalog server-side; client-sent prices are never used.
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const { items } = await readBody<{ items?: { productId?: string, quantity?: number }[] }>(event)

  if (!Array.isArray(items) || items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Your cart is empty.' })
  }

  const store = await getStore()
  // Merge duplicate lines, then price each from the catalog.
  const quantities = new Map<string, number>()
  for (const item of items) {
    const quantity = Math.round(Number(item?.quantity) || 0)
    if (typeof item?.productId !== 'string' || quantity < 1) {
      throw createError({ statusCode: 400, statusMessage: 'Your cart has an invalid item.' })
    }
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + quantity)
  }

  const lines = [...quantities].map(([productId, quantity]) => {
    const product = store.products.find(p => p.id === productId)
    if (!product || !product.isAvailable || product.price.amount <= 0) {
      throw createError({ statusCode: 400, statusMessage: `${product?.name ?? 'A product in your cart'} is not available right now.` })
    }
    if (quantity > MAX_QUANTITY) {
      throw createError({ statusCode: 400, statusMessage: `You can order up to ${MAX_QUANTITY} of ${product.name}.` })
    }
    return {
      productId: product.id,
      productName: product.name,
      unitLabel: product.defaultUnitLabel,
      unitPrice: product.price.amount,
      quantity
    }
  })

  const amount = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  const currency = 'MAD'
  const snapshot = JSON.stringify({ kind: 'products', items: lines, amount, currency })
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0)
  const description = lines.length === 1 && itemCount === 1 ? `illi — ${lines[0]!.productName}` : `illi — ${itemCount} items`

  const provider = await getPaymentProvider()
  const order = await prisma.order.create({
    data: { userId: session.user.id, currency, amount, snapshot, provider: provider.name }
  })

  const base = process.env.BETTER_AUTH_URL || getRequestURL(event).origin
  const payment = await provider.createPayment({
    orderId: order.id,
    amount,
    currency,
    description,
    successUrl: `${base}/account`,
    cancelUrl: `${base}/cart`,
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
