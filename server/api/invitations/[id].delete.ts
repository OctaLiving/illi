import { prisma } from '~~/server/utils/db/client'

// Delete a pending/revoked invitation. Operators only. Redeemed invitations are
// kept as a record (who joined with which code).
export default defineEventHandler(async (event) => {
  await requireOperator(event)
  const id = getRouterParam(event, 'id') ?? ''

  const invite = await prisma.invitation.findUnique({ where: { id } })
  if (!invite) {
    throw createError({ statusCode: 404, statusMessage: 'Invitation not found.' })
  }
  if (invite.status === 'redeemed') {
    throw createError({ statusCode: 400, statusMessage: 'A redeemed invitation cannot be deleted.' })
  }

  await prisma.invitation.delete({ where: { id } })
  return { ok: true }
})
