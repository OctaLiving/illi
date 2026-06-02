import { prisma } from '~~/server/utils/db/client'

// List invitations (newest first). Operators only.
export default defineEventHandler(async (event) => {
  await requireOperator(event)
  return prisma.invitation.findMany({ orderBy: { createdAt: 'desc' } })
})
