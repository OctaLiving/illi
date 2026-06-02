import { prisma } from '~~/server/utils/db/client'

const PROFILE_SELECT = {
  name: true,
  email: true,
  phone: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  postalCode: true,
  country: true,
  deliveryNotes: true
} as const

// The signed-in customer's contact + delivery details.
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  return prisma.user.findUnique({ where: { id: session.user.id }, select: PROFILE_SELECT })
})
