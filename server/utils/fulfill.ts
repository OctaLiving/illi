import { prisma } from '~~/server/utils/db/client'

const CADENCE_DAYS: Record<string, number> = { weekly: 7, biweekly: 14, monthly: 30 }

// Idempotent: marks an order paid and activates its subscription. Safe to call
// from a webhook that may be retried — a second call on an already-paid order
// is a no-op.
export async function fulfillOrder(orderId: string, rawEvent?: unknown) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { subscription: true, user: true }
  })
  if (!order || order.status === 'paid') {
    return order
  }

  const now = new Date()
  await prisma.order.update({ where: { id: order.id }, data: { status: 'paid', paidAt: now } })
  await prisma.payment.updateMany({
    where: { orderId: order.id },
    data: { status: 'paid', rawEvent: rawEvent ? JSON.stringify(rawEvent) : null }
  })

  if (order.subscription) {
    const days = CADENCE_DAYS[order.subscription.cadence] ?? 30
    const periodEnd = new Date(now.getTime() + days * 86_400_000)
    await prisma.subscription.update({
      where: { id: order.subscription.id },
      data: { status: 'active', currentPeriodEnd: periodEnd, nextInvoiceAt: periodEnd }
    })

    // Confirmation email — never let a mail failure break fulfillment.
    if (order.user) {
      try {
        await sendMail({
          to: order.user.email,
          ...orderConfirmationEmail(order.user.name, order.subscription.planName, order.amount, order.currency)
        })
      } catch (err) {
        console.error('[fulfill] confirmation email failed:', err)
      }
    }
  }

  return prisma.order.findUnique({ where: { id: order.id } })
}
