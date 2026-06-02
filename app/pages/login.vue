<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

const route = useRoute()
const next = computed(() => (typeof route.query.next === 'string' ? route.query.next : '/'))

const email = ref('')
const password = ref('')
const error = ref('')
const pending = ref(false)

const field = 'w-full rounded-sm border border-amber-600/30 bg-amber-50/60 px-3.5 py-2.5 text-sm text-stone-900 transition focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600/30'

async function submit() {
  pending.value = true
  error.value = ''
  const { error: e } = await authClient.signIn.email({ email: email.value, password: password.value })
  if (e) {
    error.value = e.message || 'Could not sign in — check your email and password.'
    pending.value = false
    return
  }
  await refreshNuxtData('me')
  await navigateTo(next.value)
}

useSeoMeta({ title: 'Sign in · illi', robots: 'noindex' })
</script>

<template>
  <div class="maghreb-wash flex min-h-[80vh] items-center justify-center px-5 py-16">
    <div class="w-full max-w-sm">
      <div class="reveal text-center">
        <p class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.3em] text-terra-600">
          Members
        </p>
        <h1 class="mt-3 font-[family:var(--font-serif)] text-4xl text-stone-900">
          Welcome back.
        </h1>
      </div>

      <form
        class="reveal mt-8 space-y-4 rounded-md border border-amber-600/25 bg-[#f4ecdd] p-7"
        style="animation-delay:.1s"
        @submit.prevent="submit"
      >
        <div>
          <label class="mb-1 block font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-500">Email</label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            :class="field"
          >
        </div>
        <div>
          <label class="mb-1 block font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-500">Password</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            :class="field"
          >
        </div>

        <p
          v-if="error"
          class="rounded-sm bg-terra-600/10 px-3 py-2 text-sm text-terra-700"
        >
          {{ error }}
        </p>

        <button
          type="submit"
          class="w-full rounded-sm bg-indigo-600 py-3 font-[family:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.16em] text-amber-50 transition hover:bg-indigo-700 disabled:opacity-50"
          :disabled="pending"
        >
          {{ pending ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-stone-600">
        Have an invitation?
        <NuxtLink
          to="/join"
          class="font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.14em] text-indigo-700 underline decoration-terra-600 decoration-2 underline-offset-4"
        >
          Redeem it here
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
