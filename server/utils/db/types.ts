// Database types — re-export Prisma's generated types so route code imports from
// here, never from ~~/prisma/generated/client directly (lets the output move).
export type { Invitation, PrismaClient } from '~~/prisma/generated/client'
