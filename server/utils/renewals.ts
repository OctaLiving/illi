import { prisma } from '~~/server/utils/db/client'
import { getPaymentProvider } from '~~/server/utils/payments'

// Invoice-per-cycle recurring + dunning. Crypto can't auto-charge, so each cycle
// we open a fresh invoice and email a pay link; payment (via the normal webhook /
// fulfillOrder path) reactivates and advances the subscription.
export async function runRenewals(now = new Date()): Promise<{ invoiced: number, canceled: number }> {
  const base = process.env.BETTER_AUTH_URL || 'http://localhost:3000'
  const graceDays = Number(process.env.RENEWAL_GRACE_DAYS) || 3
  const provider = await getPaymentProvider()
  let invoiced = 0
  let canceled = 0

  // 1) Active subscriptions whose next invoice is due → open a renewal invoice.
  const due = await prisma.subscription.findMany({
    where: { status: 'active', nextInvoiceAt: { lte: now } },
    include: { user: true }
  })

  for (const sub of due) {
    // Cash on delivery: the next box is simply prepared and paid at the door, so
    // the subscription stays active and moves on to the following cycle.
    if (sub.paymentMethod === 'cod') {
      const order = await prisma.order.create({
        data: {
          userId: sub.userId,
          subscriptionId: sub.id,
          currency: sub.currency,
          amount: sub.amount,
          snapshot: sub.snapshot,
          paymentMethod: 'cod',
          shipping: sub.shipping ?? undefined,
          status: 'cod_pending',
          provider: 'cod'
        }
      })
      await confirmCashOrder(order.id)
      if (sub.user) {
        try {
          await sendMail({ to: sub.user.email, ...cashRenewalEmail(sub.user.name, sub.planName, sub.amount, sub.currency) })
        } catch (err) {
          console.error('[renewals] renewal email failed:', err)
        }
      }
      invoiced++
      continue
    }

    const order = await prisma.order.create({
      data: {
        userId: sub.userId,
        subscriptionId: sub.id,
        currency: sub.currency,
        amount: sub.amount,
        snapshot: sub.snapshot,
        paymentMethod: sub.paymentMethod,
        shipping: sub.shipping ?? undefined,
        provider: provider.name
      }
    })

    const payment = await provider.createPayment({
      orderId: order.id,
      amount: sub.amount,
      currency: sub.currency,
      description: `illi — ${sub.planName} renewal`,
      successUrl: `${base}/orders/${order.id}`,
      cancelUrl: `${base}/account`,
      ipnUrl: `${base}/api/webhooks/nowpayments`
    })

    await prisma.payment.create({
      data: { orderId: order.id, provider: provider.name, providerRef: payment.providerRef, amount: sub.amount, currency: sub.currency }
    })
    await prisma.order.update({ where: { id: order.id }, data: { providerRef: payment.providerRef, payUrl: payment.payUrl } })
    // Awaiting payment — fulfillOrder flips it back to active and advances nextInvoiceAt.
    await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'past_due' } })

    if (sub.user) {
      const fullPayUrl = payment.payUrl.startsWith('http') ? payment.payUrl : `${base}${payment.payUrl}`
      try {
        await sendMail({ to: sub.user.email, ...renewalEmail(sub.user.name, sub.planName, sub.amount, sub.currency, fullPayUrl) })
      } catch (err) {
        console.error('[renewals] renewal email failed:', err)
      }
    }
    invoiced++
  }

  // 2) Dunning: past-due subscriptions whose renewal invoice has gone unpaid
  //    beyond the grace window → cancel.
  const cutoff = new Date(now.getTime() - graceDays * 86_400_000)
  const pastDue = await prisma.subscription.findMany({ where: { status: 'past_due' } })
  for (const sub of pastDue) {
    // An outstanding renewal invoice (pending) older than the grace window.
    const stale = await prisma.order.findFirst({
      where: { subscriptionId: sub.id, status: 'pending', createdAt: { lt: cutoff } }
    })
    if (stale) {
      await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'canceled' } })
      canceled++
    }
  }

  return { invoiced, canceled }
}
