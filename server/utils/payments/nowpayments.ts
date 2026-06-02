import { createHmac } from 'node:crypto'
import { getHeader } from 'h3'
import type { NormalizedStatus, PaymentProvider } from './types'

interface NowPaymentsConfig {
  apiKey: string
  ipnSecret: string | null
  baseUrl: string
  payCurrency: string
}

function mapStatus(status: string): NormalizedStatus {
  if (status === 'finished' || status === 'confirmed') return 'paid'
  if (status === 'expired') return 'expired'
  if (status === 'failed' || status === 'refunded') return 'failed'
  return 'pending' // waiting | confirming | sending | partially_paid
}

// NOWPayments signs the IPN as HMAC-SHA512 over the JSON body with keys sorted
// recursively, using the IPN secret. We reproduce that and compare.
function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map(k => [k, sortDeep((value as Record<string, unknown>)[k])])
    )
  }
  return value
}

// Built per-request from the active settings (test → sandbox, live → production).
export function createNowPaymentsProvider(config: NowPaymentsConfig): PaymentProvider {
  return {
    name: 'nowpayments',

    async createPayment(input) {
      const res = await $fetch<{ id: string | number, invoice_url: string }>(`${config.baseUrl}/invoice`, {
        method: 'POST',
        headers: { 'x-api-key': config.apiKey, 'content-type': 'application/json' },
        body: {
          price_amount: input.amount,
          price_currency: 'usd',
          pay_currency: config.payCurrency,
          order_id: input.orderId,
          order_description: input.description,
          ipn_callback_url: input.ipnUrl,
          success_url: input.successUrl,
          cancel_url: input.cancelUrl
        }
      })
      return { providerRef: String(res.id), payUrl: res.invoice_url, status: 'pending' }
    },

    async parseWebhook(event, rawBody) {
      if (!config.ipnSecret) return null
      const sig = getHeader(event, 'x-nowpayments-sig')
      if (!sig) return null

      let body: Record<string, unknown>
      try {
        body = JSON.parse(rawBody)
      } catch {
        return null
      }

      const expected = createHmac('sha512', config.ipnSecret).update(JSON.stringify(sortDeep(body))).digest('hex')
      if (expected !== sig) return null

      return {
        orderId: body.order_id ? String(body.order_id) : undefined,
        providerRef: body.invoice_id ? String(body.invoice_id) : undefined,
        status: mapStatus(String(body.payment_status ?? '')),
        raw: body
      }
    }
  }
}
