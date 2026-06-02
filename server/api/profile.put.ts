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

interface ProfileInput {
  name?: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  postalCode?: string
  country?: string
  deliveryNotes?: string
}

const clean = (v?: string) => (typeof v === 'string' && v.trim() ? v.trim() : null)

// Update the signed-in customer's contact + delivery details.
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody<ProfileInput>(event)
  const name = body.name?.trim()

  return prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name ? { name } : {}), // never blank out the name
      phone: clean(body.phone),
      addressLine1: clean(body.addressLine1),
      addressLine2: clean(body.addressLine2),
      city: clean(body.city),
      postalCode: clean(body.postalCode),
      country: clean(body.country),
      deliveryNotes: clean(body.deliveryNotes)
    },
    select: PROFILE_SELECT
  })
})
