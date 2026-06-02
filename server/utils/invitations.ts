import { randomBytes } from 'node:crypto'
import { prisma } from '~~/server/utils/db/client'

// Unambiguous alphabet (no 0/O/1/I) for human-readable invite codes.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export async function generateInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const bytes = randomBytes(6)
    let suffix = ''
    for (let i = 0; i < 6; i++) {
      suffix += ALPHABET[bytes[i]! % ALPHABET.length]
    }
    const code = `ILLI-${suffix}`
    const existing = await prisma.invitation.findUnique({ where: { code } })
    if (!existing) {
      return code
    }
  }
  throw createError({ statusCode: 500, statusMessage: 'Could not generate a unique invitation code.' })
}
