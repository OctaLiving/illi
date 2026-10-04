import type { PaymentMethod, Shipping } from '~~/server/utils/checkout'

const MAX_QUANTITY = 20

// One-time purchase of one or more products, outside any subscription. Every
// price comes from the catalog server-side; client-sent prices are never used.
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody<{
    items?: { productId?: string, quantity?: number }[]
    method?: PaymentMethod
    shipping?: Partial<Shipping>
  }>(event)
  const { items } = body

  if (!Array.isArray(items) || items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Your cart is empty.' })
  }

  const shipping = normalizeShipping(body.shipping)
  const method = await resolveMethod(body.method, shipping)

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
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0)

  return placeOrder(event, {
    userId: session.user.id,
    amount,
    currency,
    snapshot: JSON.stringify({ kind: 'products', items: lines, amount, currency }),
    method,
    shipping,
    description: lines.length === 1 && itemCount === 1 ? `illi — ${lines[0]!.productName}` : `illi — ${itemCount} items`,
    cancelPath: '/cart'
  })
})
