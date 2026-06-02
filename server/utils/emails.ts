// Transactional email templates. Inline styles only — email clients have no web
// fonts and strip <style>, so we use system serif + the illi palette inline.

const BONE = '#f4ecdd'
const INK = '#2a1d12'
const TERRA = '#c2410c'
const INDIGO = '#1e3a5f'

function shell(heading: string, bodyHtml: string): string {
  return `<div style="margin:0;padding:32px 0;background:${BONE};font-family:Georgia,'Times New Roman',serif;color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fffaf0;border:1px solid rgba(141,98,62,0.25);border-radius:10px;overflow:hidden;">
      <tr><td style="padding:28px 32px 0;">
        <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${TERRA};">illi · by invitation</div>
        <h1 style="margin:12px 0 0;font-size:28px;font-weight:normal;color:${INK};">${heading}</h1>
      </td></tr>
      <tr><td style="padding:16px 32px 32px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#5a4634;">
        ${bodyHtml}
      </td></tr>
    </table>
    <div style="margin-top:16px;font-family:Arial,sans-serif;font-size:11px;color:#9b8e7c;">Small-batch foods for the season · Made in Casablanca</div>
  </td></tr></table>
</div>`
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${INDIGO};color:${BONE};text-decoration:none;font-size:13px;letter-spacing:1px;text-transform:uppercase;padding:12px 22px;border-radius:3px;">${label}</a>`
}

export function invitationEmail(code: string, joinUrl: string) {
  return {
    subject: 'Your invitation to illi',
    text: `You've been invited to illi. Redeem your code ${code} at ${joinUrl}`,
    html: shell('You\'re invited.', `
      <p>You've been invited to join <strong>illi</strong>, an invitation-only pantry of small-batch preserved foods.</p>
      <p style="margin:20px 0 8px;">Your invitation code:</p>
      <p style="font-family:'Courier New',monospace;font-size:22px;letter-spacing:3px;color:${TERRA};margin:0 0 24px;">${code}</p>
      <p style="margin-bottom:24px;">${button(joinUrl, 'Redeem your invitation')}</p>
      <p style="font-size:13px;color:#8a7761;">If the button doesn't work, paste this link: ${joinUrl}</p>`)
  }
}

export function orderConfirmationEmail(name: string, planName: string, amount: number, currency: string) {
  return {
    subject: `Your illi subscription is active — ${planName}`,
    text: `Hi ${name}, your ${planName} subscription is active (${amount} ${currency} per cycle).`,
    html: shell('Your subscription is active.', `
      <p>Hi ${name},</p>
      <p>Your <strong>${planName}</strong> subscription is confirmed and active.</p>
      <p style="margin:20px 0;font-size:20px;color:${INK};">${amount} ${currency} <span style="font-size:13px;color:#8a7761;">per cycle</span></p>
      <p>We'll send a fresh payment request before each renewal — crypto can't auto-charge, so you approve every cycle.</p>`)
  }
}

export function renewalEmail(name: string, planName: string, amount: number, currency: string, payUrl: string) {
  return {
    subject: `Time to renew — ${planName}`,
    text: `Hi ${name}, your ${planName} renewal (${amount} ${currency}) is ready. Pay: ${payUrl}`,
    html: shell('Time to renew.', `
      <p>Hi ${name},</p>
      <p>Your <strong>${planName}</strong> subscription is up for renewal.</p>
      <p style="margin:20px 0;font-size:20px;color:${INK};">${amount} ${currency} <span style="font-size:13px;color:#8a7761;">this cycle</span></p>
      <p style="margin-bottom:24px;">${button(payUrl, 'Pay & continue')}</p>
      <p style="font-size:13px;color:#8a7761;">If it isn't paid within a few days, your subscription pauses.</p>`)
  }
}
