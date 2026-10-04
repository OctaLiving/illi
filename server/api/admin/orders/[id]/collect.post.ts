// Operator records that the courier collected the cash for a cash-on-delivery order.
export default defineEventHandler(async (event) => {
  await requireOperator(event)
  const id = getRouterParam(event, 'id') ?? ''
  const order = await collectCashOrder(id)
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
  }
  if (order.paymentMethod !== 'cod') {
    throw createError({ statusCode: 400, statusMessage: 'Only cash-on-delivery orders can be marked as collected.' })
  }
  return { ok: true, status: order.status }
})
