import type { H3Event } from 'h3'

// Server-side session helpers. `auth` is auto-imported from server/utils/auth.ts.
export function getAuthSession(event: H3Event) {
  return auth.api.getSession({ headers: event.headers })
}

export async function requireAuth(event: H3Event) {
  const session = await getAuthSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  }
  return session
}

export async function requireOperator(event: H3Event) {
  const session = await requireAuth(event)
  if (session.user.role !== 'operator') {
    throw createError({ statusCode: 403, statusMessage: 'Operators only.' })
  }
  return session
}
