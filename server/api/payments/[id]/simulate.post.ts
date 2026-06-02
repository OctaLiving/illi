import { prisma } from '~~/server/utils/db/client'
import { getPaymentProvider } from '~~/server/utils/payments'

// Simulate a successful payment. Only active when the simulated provider is in
// use (i.e. no NOWPAYMENTS_API_KEY) — disabled in production.
export default defineEventHandler(async (event) => {
  if ((await getPaymentProvider()).name !== 'simulated') {
    throw createError({ statusCode: 403, statusMessage: 'Simulated payments are disabled.' })
  }
  const session = await requireAuth(event)
  const id = getRouterParam(event, 'id') ?? ''

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order || order.userId !== session.user.id) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
  }

  await fulfillOrder(id, { simulated: true })
  return { ok: true }
})
