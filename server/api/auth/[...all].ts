// Mounts the Better Auth handler at /api/auth/* (sign-up, sign-in, session, etc.).
export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event))
})
