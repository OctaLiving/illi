import { APIError } from 'better-auth/api'

// Public: create an account and sign it in.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string, email?: string, password?: string }>(event)
  const name = body.name?.trim()
  const email = body.email?.trim()
  const password = body.password

  if (!name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Name, email and password are all required.' })
  }

  // Create the account via Better Auth, capturing its Set-Cookie headers.
  let signUp
  try {
    signUp = await auth.api.signUpEmail({
      body: { name, email, password },
      returnHeaders: true
    })
  } catch (err) {
    if (err instanceof APIError) {
      throw createError({ statusCode: 400, statusMessage: err.message })
    }
    throw err
  }

  for (const cookie of signUp.headers.getSetCookie()) {
    appendResponseHeader(event, 'set-cookie', cookie)
  }

  return { user: signUp.response.user }
})
