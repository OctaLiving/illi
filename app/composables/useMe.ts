interface Me {
  user: { id: string, name: string, email: string, role: string } | null
}

// Current signed-in user, SSR-safe (forwards the cookie during server render).
// Keyed 'me' so all callers share one fetch; call refreshNuxtData('me') after
// sign-in / sign-out to update it.
export function useMe() {
  return useFetch<Me>('/api/me', {
    key: 'me',
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
    default: () => ({ user: null })
  })
}
