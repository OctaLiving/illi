// Operator settings, with secrets masked — booleans say whether each is set,
// the actual key/password is never sent to the browser.
export default defineEventHandler(async (event) => {
  await requireOperator(event)
  const s = await getSettings()
  return {
    paymentMode: s.paymentMode,
    payCurrency: s.payCurrency,
    hasTestApiKey: !!s.nowpaymentsTestApiKey,
    hasLiveApiKey: !!s.nowpaymentsLiveApiKey,
    hasTestIpnSecret: !!s.nowpaymentsTestIpnSecret,
    hasLiveIpnSecret: !!s.nowpaymentsLiveIpnSecret,
    smtpHost: s.smtpHost,
    smtpPort: s.smtpPort,
    smtpSecure: s.smtpSecure,
    smtpUser: s.smtpUser,
    mailFrom: s.mailFrom,
    hasSmtpPass: !!s.smtpPass
  }
})
