// Current session for the requesting cookie — null when signed out.
export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  return { user: session?.user ?? null }
})
