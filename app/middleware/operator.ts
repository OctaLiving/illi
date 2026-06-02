// Operator-only routes (the /manage console). Redirects everyone else to login.
export default defineNuxtRouteMiddleware(async (to) => {
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
  const me = await $fetch('/api/me', { headers }).catch(() => ({ user: null }))
  if (me?.user?.role !== 'operator') {
    return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
  }
})
