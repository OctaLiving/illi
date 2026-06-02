import { prisma } from '~~/server/utils/db/client'
import { getPaymentProvider } from '~~/server/utils/payments'

// NOWPayments IPN. Verifies the signature, then fulfils the order. Idempotent.
export default defineEventHandler(async (event) => {
  const provider = await getPaymentProvider()
  const rawBody = (await readRawBody(event)) ?? ''

  const result = await provider.parseWebhook(event, rawBody)
  if (!result) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or unverified webhook.' })
  }

  if (result.status === 'paid') {
    let orderId = result.orderId
    if (!orderId && result.providerRef) {
      const order = await prisma.order.findFirst({ where: { providerRef: result.providerRef } })
      orderId = order?.id
    }
    if (orderId) {
      await fulfillOrder(orderId, result.raw)
    }
  }

  return { ok: true }
})
