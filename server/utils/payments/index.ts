import { getSettings, resolvePayment } from '~~/server/utils/settings'
import { createNowPaymentsProvider } from './nowpayments'
import { simulatedProvider } from './simulated'
import type { PaymentProvider } from './types'

// Resolves the active provider from operator settings: simulated unless a live/
// test mode is selected with an API key present.
export async function getPaymentProvider(): Promise<PaymentProvider> {
  const payment = resolvePayment(await getSettings())
  if (payment.mode === 'simulated' || !payment.apiKey) {
    return simulatedProvider
  }
  return createNowPaymentsProvider({
    apiKey: payment.apiKey,
    ipnSecret: payment.ipnSecret,
    baseUrl: payment.baseUrl,
    payCurrency: payment.payCurrency
  })
}
