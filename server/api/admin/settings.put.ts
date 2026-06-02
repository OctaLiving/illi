import { prisma } from '~~/server/utils/db/client'

interface SettingsInput {
  paymentMode?: string
  payCurrency?: string
  nowpaymentsTestApiKey?: string
  nowpaymentsLiveApiKey?: string
  nowpaymentsTestIpnSecret?: string
  nowpaymentsLiveIpnSecret?: string
  smtpHost?: string
  smtpPort?: number | string
  smtpSecure?: boolean
  smtpUser?: string
  smtpPass?: string
  mailFrom?: string
}

const VALID_MODES = ['simulated', 'test', 'live']

export default defineEventHandler(async (event) => {
  await requireOperator(event)
  await getSettings() // ensure the row exists
  const body = await readBody<SettingsInput>(event)

  if (body.paymentMode && !VALID_MODES.includes(body.paymentMode)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payment mode.' })
  }

  // Secrets: only overwrite when a non-empty value is supplied (blank = keep).
  const secret = (v?: string) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
  // Plain fields: blank string clears to null; undefined leaves untouched.
  const text = (v?: string) => (typeof v === 'string' ? (v.trim() || null) : undefined)

  const data: Record<string, unknown> = {}
  if (body.paymentMode) data.paymentMode = body.paymentMode
  if (body.payCurrency !== undefined) data.payCurrency = body.payCurrency.trim() || 'usdttrc20'

  const testKey = secret(body.nowpaymentsTestApiKey)
  if (testKey) data.nowpaymentsTestApiKey = testKey
  const liveKey = secret(body.nowpaymentsLiveApiKey)
  if (liveKey) data.nowpaymentsLiveApiKey = liveKey
  const testIpn = secret(body.nowpaymentsTestIpnSecret)
  if (testIpn) data.nowpaymentsTestIpnSecret = testIpn
  const liveIpn = secret(body.nowpaymentsLiveIpnSecret)
  if (liveIpn) data.nowpaymentsLiveIpnSecret = liveIpn

  if (body.smtpHost !== undefined) data.smtpHost = text(body.smtpHost)
  if (body.smtpPort !== undefined) data.smtpPort = body.smtpPort ? Number(body.smtpPort) : null
  if (body.smtpSecure !== undefined) data.smtpSecure = !!body.smtpSecure
  if (body.smtpUser !== undefined) data.smtpUser = text(body.smtpUser)
  if (body.mailFrom !== undefined) data.mailFrom = text(body.mailFrom)
  const smtpPass = secret(body.smtpPass)
  if (smtpPass) data.smtpPass = smtpPass

  await prisma.settings.update({ where: { id: 'global' }, data })
  return { ok: true }
})
