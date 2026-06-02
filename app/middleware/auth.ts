// Logged-in-only routes (e.g. /checkout). Redirects guests to login.
export default defineNuxtRouteMiddleware(async (to) => {
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
  const me = await $fetch('/api/me', { headers }).catch(() => ({ user: null }))
  if (!me?.user) {
    return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
  }
})
