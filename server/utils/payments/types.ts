import type { H3Event } from 'h3'

export interface CreatePaymentInput {
  orderId: string
  amount: number
  description: string
  successUrl: string
  cancelUrl: string
  ipnUrl: string
}

export interface CreatePaymentResult {
  providerRef: string
  payUrl: string
  status: string
}

export type NormalizedStatus = 'paid' | 'pending' | 'failed' | 'expired'

export interface PaymentEvent {
  /** Our order id, when the provider echoes it back. */
  orderId?: string
  /** The provider's own reference, as a fallback match. */
  providerRef?: string
  status: NormalizedStatus
  raw: unknown
}

export interface PaymentProvider {
  name: string
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>
  /** Verify + normalise an incoming webhook. Returns null if invalid. */
  parseWebhook(event: H3Event, rawBody: string): Promise<PaymentEvent | null>
}
