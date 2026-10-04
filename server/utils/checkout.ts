import type { H3Event } from 'h3'
import { prisma } from '~~/server/utils/db/client'
import { getPaymentProvider } from '~~/server/utils/payments'

// Checkout = delivery details + a payment method. Card payments will run through
// Solutio (our own checkout) once it is connected; crypto runs through
// NOWPayments; cash on delivery needs no gateway and is collected by the courier.

export const paymentMethods = ['card', 'crypto', 'cod'] as const
export type PaymentMethod = typeof paymentMethods[number]

// Countries we deliver to. Cash on delivery is only offered in Morocco.
export const deliveryCountries: Record<string, string> = {
  MA: 'Morocco',
  FR: 'France',
  ES: 'Spain',
  BE: 'Belgium',
  NL: 'Netherlands',
  DE: 'Germany',
  IT: 'Italy',
  PT: 'Portugal',
  SK: 'Slovakia',
  CZ: 'Czechia',
  GB: 'United Kingdom',
  AE: 'United Arab Emirates'
}
export const COD_COUNTRIES = ['MA']

export interface Shipping {
  name: string
  phone: string
  address: string
  city: string
  country: string
  notes: string
}

export interface PaymentOption {
  id: PaymentMethod
  available: boolean
  /** Why it can't be used right now, shown to the shopper. */
  reason?: string
}

export async function getPaymentOptions(): Promise<PaymentOption[]> {
  const settings = await getSettings()
  return [
    { id: 'card', available: false, reason: 'Card payment is coming soon.' },
    { id: 'crypto', available: true },
    settings.codEnabled
      ? { id: 'cod', available: true }
      : { id: 'cod', available: false, reason: 'Cash on delivery is paused right now.' }
  ]
}

const clean = (v: unknown, max: number) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, max)

export function normalizeShipping(input: Partial<Shipping> | undefined): Shipping {
  const shipping: Shipping = {
    name: clean(input?.name, 120),
    phone: clean(input?.phone, 30),
    address: clean(input?.address, 240),
    city: clean(input?.city, 80),
    country: clean(input?.country, 2).toUpperCase() || 'MA',
    notes: clean(input?.notes, 500)
  }
  if (!shipping.name || !shipping.address || !shipping.city) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter your name, address and city.' })
  }
  if (!/^\+?[\d\s().-]{6,}$/.test(shipping.phone) || shipping.phone.replace(/\D/g, '').length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a phone number the courier can call.' })
  }
  if (!deliveryCountries[shipping.country]) {
    throw createError({ statusCode: 400, statusMessage: 'We don\'t deliver to that country yet.' })
  }
  return shipping
}

export async function resolveMethod(method: unknown, shipping: Shipping): Promise<PaymentMethod> {
  const option = (await getPaymentOptions()).find(o => o.id === method)
  if (!option) {
    throw createError({ statusCode: 400, statusMessage: 'Choose how you want to pay.' })
  }
  if (!option.available) {
    throw createError({ statusCode: 400, statusMessage: option.reason ?? 'That payment method is not available.' })
  }
  if (option.id === 'cod' && !COD_COUNTRIES.includes(shipping.country)) {
    throw createError({ statusCode: 400, statusMessage: 'Cash on delivery is only available in Morocco.' })
  }
  return option.id
}

interface PlaceOrderInput {
  userId: string
  amount: number
  currency: string
  snapshot: string
  method: PaymentMethod
  shipping: Shipping
  description: string
  cancelPath: string
  subscriptionId?: string
}

// Creates the order and starts payment. Returns where to send the shopper next:
// the payment page for online methods, or the order page for cash on delivery.
export async function placeOrder(event: H3Event, input: PlaceOrderInput): Promise<{ orderId: string, nextUrl: string }> {
  const shipping = { ...input.shipping }

  if (input.method === 'cod') {
    const order = await prisma.order.create({
      data: {
        userId: input.userId,
        subscriptionId: input.subscriptionId,
        currency: input.currency,
        amount: input.amount,
        snapshot: input.snapshot,
        paymentMethod: 'cod',
        shipping,
        status: 'cod_pending',
        provider: 'cod'
      }
    })
    await confirmCashOrder(order.id)
    return { orderId: order.id, nextUrl: `/orders/${order.id}` }
  }

  // Online payment (crypto today; card once Solutio is connected).
  const provider = await getPaymentProvider()
  const order = await prisma.order.create({
    data: {
      userId: input.userId,
      subscriptionId: input.subscriptionId,
      currency: input.currency,
      amount: input.amount,
      snapshot: input.snapshot,
      paymentMethod: input.method,
      shipping,
      provider: provider.name
    }
  })

  const base = process.env.BETTER_AUTH_URL || getRequestURL(event).origin
  const payment = await provider.createPayment({
    orderId: order.id,
    amount: input.amount,
    currency: input.currency,
    description: input.description,
    successUrl: `${base}/orders/${order.id}`,
    cancelUrl: `${base}${input.cancelPath}`,
    ipnUrl: `${base}/api/webhooks/nowpayments`
  })

  await prisma.payment.create({
    data: { orderId: order.id, provider: provider.name, providerRef: payment.providerRef, amount: input.amount, currency: input.currency }
  })
  await prisma.order.update({
    where: { id: order.id },
    data: { providerRef: payment.providerRef, payUrl: payment.payUrl }
  })

  return { orderId: order.id, nextUrl: payment.payUrl }
}
