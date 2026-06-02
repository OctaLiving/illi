import { APIError } from 'better-auth/api'
import { prisma } from '~~/server/utils/db/client'

// Public: redeem an invitation and create the account in one step.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ code?: string, name?: string, email?: string, password?: string }>(event)
  const code = body.code?.trim()
  const name = body.name?.trim()
  const email = body.email?.trim()
  const password = body.password

  if (!code || !name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Code, name, email and password are all required.' })
  }

  const invite = await prisma.invitation.findUnique({ where: { code } })
  if (!invite || invite.status !== 'pending') {
    throw createError({ statusCode: 400, statusMessage: 'That invitation code is invalid or has already been used.' })
  }
  if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
    await prisma.invitation.update({ where: { id: invite.id }, data: { status: 'expired' } })
    throw createError({ statusCode: 400, statusMessage: 'This invitation has expired.' })
  }
  if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
    throw createError({ statusCode: 400, statusMessage: 'This invitation was issued for a different email address.' })
  }

  // Create the account via Better Auth, capturing its Set-Cookie headers.
  let signUp
  try {
    signUp = await auth.api.signUpEmail({
      body: { name, email, password },
      returnHeaders: true
    })
  } catch (err) {
    if (err instanceof APIError) {
      throw createError({ statusCode: 400, statusMessage: err.message })
    }
    throw err
  }

  for (const cookie of signUp.headers.getSetCookie()) {
    appendResponseHeader(event, 'set-cookie', cookie)
  }

  // Consume the invitation now that the account exists.
  await prisma.invitation.update({
    where: { id: invite.id },
    data: {
      status: 'redeemed',
      redeemedByUserId: signUp.response.user.id,
      redeemedAt: new Date()
    }
  })

  return { user: signUp.response.user }
})
