import { prisma } from '~~/server/utils/db/client'

// The signed-in member's subscriptions + order history.
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const [subscriptions, orders] = await Promise.all([
    prisma.subscription.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } })
  ])
  return { subscriptions, orders }
})
