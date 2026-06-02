import { prisma } from '~~/server/utils/db/client'

// Issue an invitation. Operators only.
export default defineEventHandler(async (event) => {
  const session = await requireOperator(event)
  const body = await readBody<{ email?: string, expiresInDays?: number }>(event)

  const email = body.email?.trim() || null
  const days = Number(body.expiresInDays)
  const expiresAt = Number.isFinite(days) && days > 0
    ? new Date(Date.now() + days * 86_400_000)
    : null

  const code = await generateInviteCode()

  const invitation = await prisma.invitation.create({
    data: {
      code,
      email,
      issuedByUserId: session.user.id,
      expiresAt
    }
  })

  // Email the join link if the invite is addressed to someone.
  if (email) {
    const base = process.env.BETTER_AUTH_URL || getRequestURL(event).origin
    const joinUrl = `${base}/join?code=${invitation.code}`
    try {
      await sendMail({ to: email, ...invitationEmail(invitation.code, joinUrl) })
    } catch (err) {
      console.error('[invitations] failed to send invite email:', err)
    }
  }

  return invitation
})
