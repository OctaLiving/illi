import { prisma } from '~~/server/utils/db/client'

// Operator view of live commerce: every subscription + recent orders, with the
// customer attached.
export default defineEventHandler(async (event) => {
  await requireOperator(event)
  const userSelect = { select: { name: true, email: true } }
  const [subscriptions, orders] = await Promise.all([
    prisma.subscription.findMany({ orderBy: { createdAt: 'desc' }, include: { user: userSelect } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { user: userSelect } })
  ])
  return { subscriptions, orders }
})
