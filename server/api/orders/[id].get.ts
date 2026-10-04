import { prisma } from '~~/server/utils/db/client'

// One of the signed-in customer's orders, for the order confirmation page.
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = getRouterParam(event, 'id') ?? ''
  const order = await prisma.order.findUnique({
    where: { id },
    include: { subscription: { select: { planName: true, cadence: true } } }
  })
  if (!order || order.userId !== session.user.id) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
  }
  return {
    id: order.id,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    shipping: order.shipping,
    countryName: deliveryCountries[(order.shipping as { country?: string } | null)?.country ?? ''] ?? null,
    snapshot: order.snapshot,
    payUrl: order.payUrl,
    createdAt: order.createdAt,
    subscription: order.subscription
  }
})
