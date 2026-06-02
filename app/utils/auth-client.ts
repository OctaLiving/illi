import { createAuthClient } from 'better-auth/vue'

// Talks to the catch-all handler at /api/auth/* on the same origin.
export const authClient = createAuthClient()
