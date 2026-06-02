import { createTransport } from 'nodemailer'
import { getSettings } from '~~/server/utils/settings'

export interface MailInput {
  to: string
  subject: string
  html: string
  text?: string
}

// Reads SMTP config from operator settings each send (so admin changes take
// effect immediately). When no SMTP host is set we log instead of sending.
export async function sendMail(input: MailInput): Promise<{ delivered: boolean }> {
  const s = await getSettings()
  const from = s.mailFrom || 'illi <no-reply@illi.local>'

  if (!s.smtpHost) {
    console.info(`[mail:dev] would send → to=${input.to} · subject="${input.subject}" (SMTP not configured)`)
    return { delivered: false }
  }

  const transport = createTransport({
    host: s.smtpHost,
    port: s.smtpPort || 587,
    secure: s.smtpSecure,
    auth: s.smtpUser ? { user: s.smtpUser, pass: s.smtpPass || undefined } : undefined
  })
  await transport.sendMail({ from, to: input.to, subject: input.subject, html: input.html, text: input.text })
  return { delivered: true }
}
