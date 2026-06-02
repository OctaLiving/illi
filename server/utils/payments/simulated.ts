import type { PaymentProvider } from './types'

// Dev/demo provider — used when no NOWPAYMENTS_API_KEY is set. createPayment
// returns an internal "hosted" page (/pay/:orderId) with a confirm button; the
// confirmation goes through /api/payments/:id/simulate, not parseWebhook.
export const simulatedProvider: PaymentProvider = {
  name: 'simulated',

  async createPayment(input) {
    return {
      providerRef: `sim_${input.orderId}`,
      payUrl: `/pay/${input.orderId}`,
      status: 'pending'
    }
  },

  async parseWebhook(_event, rawBody) {
    try {
      const body = JSON.parse(rawBody) as { orderId?: string, status?: string }
      if (!body.orderId) {
        return null
      }
      return { orderId: body.orderId, status: (body.status as 'paid') ?? 'paid', raw: body }
    } catch {
      return null
    }
  }
}
