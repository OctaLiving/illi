import { prisma } from '~~/server/utils/db/client'
import type { Settings } from '~~/prisma/generated/client'

// Read the single settings row, seeding it from env on first run so existing
// .env configuration carries over. After that the DB is the source of truth.
export async function getSettings(): Promise<Settings> {
  const existing = await prisma.settings.findUnique({ where: { id: 'global' } })
  if (existing) {
    return existing
  }
  return prisma.settings.create({
    data: {
      id: 'global',
      paymentMode: process.env.NOWPAYMENTS_API_KEY ? 'live' : 'simulated',
      nowpaymentsLiveApiKey: process.env.NOWPAYMENTS_API_KEY || null,
      nowpaymentsLiveIpnSecret: process.env.NOWPAYMENTS_IPN_SECRET || null,
      payCurrency: process.env.NOWPAYMENTS_PAY_CURRENCY || 'usdttrc20',
      smtpHost: process.env.SMTP_HOST || null,
      smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null,
      smtpSecure: process.env.SMTP_SECURE === 'true',
      smtpUser: process.env.SMTP_USER || null,
      smtpPass: process.env.SMTP_PASS || null,
      mailFrom: process.env.MAIL_FROM || null
    }
  })
}

export interface ResolvedPayment {
  mode: string
  apiKey: string | null
  ipnSecret: string | null
  baseUrl: string
  payCurrency: string
}

// The active NOWPayments config for the selected mode (test → sandbox).
export function resolvePayment(s: Settings): ResolvedPayment {
  const live = s.paymentMode === 'live'
  return {
    mode: s.paymentMode,
    apiKey: live ? s.nowpaymentsLiveApiKey : s.nowpaymentsTestApiKey,
    ipnSecret: live ? s.nowpaymentsLiveIpnSecret : s.nowpaymentsTestIpnSecret,
    baseUrl: live ? 'https://api.nowpayments.io/v1' : 'https://api-sandbox.nowpayments.io/v1',
    payCurrency: s.payCurrency
  }
}
