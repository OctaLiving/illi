import { prisma } from '~~/server/utils/db/client'

const CADENCE_DAYS: Record<string, number> = { weekly: 7, biweekly: 14, monthly: 30 }

type OrderWithRelations = NonNullable<Awaited<ReturnType<typeof loadOrder>>>

function loadOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { subscription: true, user: true }
  })
}

// Starts (or extends) the subscription's current period from now.
async function activateSubscription(order: OrderWithRelations, now: Date) {
  if (!order.subscription) return
  const days = CADENCE_DAYS[order.subscription.cadence] ?? 30
  const periodEnd = new Date(now.getTime() + days * 86_400_000)
  await prisma.subscription.update({
    where: { id: order.subscription.id },
    data: { status: 'active', currentPeriodEnd: periodEnd, nextInvoiceAt: periodEnd }
  })
}

// Order confirmation email — never let a mail failure break checkout or fulfilment.
async function sendConfirmation(order: OrderWithRelations) {
  if (!order.user) return
  const cash = order.paymentMethod === 'cod'
  try {
    if (order.subscription) {
      await sendMail({
        to: order.user.email,
        ...orderConfirmationEmail(order.user.name, order.subscription.planName, order.amount, order.currency, cash)
      })
    } else {
      const { items = [] } = JSON.parse(order.snapshot) as { items?: { productName: string, quantity: number }[] }
      await sendMail({
        to: order.user.email,
        ...purchaseConfirmationEmail(order.user.name, items, order.amount, order.currency, cash)
      })
    }
  } catch (err) {
    console.error('[fulfill] confirmation email failed:', err)
  }
}

// Idempotent: marks an online order paid and activates its subscription (if it
// has one). Safe to call from a webhook that may be retried — a second call on an
// already-paid order is a no-op. Cash-on-delivery orders are confirmed at checkout
// (confirmCashOrder) and only marked paid when the cash is collected.
export async function fulfillOrder(orderId: string, rawEvent?: unknown) {
  const order = await loadOrder(orderId)
  if (!order || order.status === 'paid') {
    return order
  }
  if (order.paymentMethod === 'cod') {
    return collectCashOrder(orderId)
  }

  const now = new Date()
  await prisma.order.update({ where: { id: order.id }, data: { status: 'paid', paidAt: now } })
  await prisma.payment.updateMany({
    where: { orderId: order.id },
    data: { status: 'paid', rawEvent: rawEvent ? JSON.stringify(rawEvent) : null }
  })
  await activateSubscription(order, now)
  await sendConfirmation(order)

  return prisma.order.findUnique({ where: { id: order.id } })
}

// Cash on delivery: the order is confirmed (and a box starts) as soon as it is
// placed; payment is recorded later, when the courier collects it.
export async function confirmCashOrder(orderId: string) {
  const order = await loadOrder(orderId)
  if (!order || order.paymentMethod !== 'cod') {
    return order
  }
  await activateSubscription(order, new Date())
  await sendConfirmation(order)
  return order
}

// Operator records that the cash was collected on delivery. Idempotent.
export async function collectCashOrder(orderId: string) {
  const order = await loadOrder(orderId)
  if (!order || order.paymentMethod !== 'cod' || order.status === 'paid') {
    return order
  }
  const now = new Date()
  await prisma.order.update({ where: { id: order.id }, data: { status: 'paid', paidAt: now } })
  await prisma.payment.create({
    data: { orderId: order.id, provider: 'cod', status: 'paid', amount: order.amount, currency: order.currency }
  })
  return prisma.order.findUnique({ where: { id: order.id } })
}
