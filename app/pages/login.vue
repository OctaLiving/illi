<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const next = computed(() => (typeof route.query.next === 'string' ? route.query.next : '/'))

const email = ref('')
const password = ref('')
const error = ref('')
const pending = ref(false)

const field = 'w-full rounded-lg border border-sand-600/30 bg-sand-50/60 px-3.5 py-2.5 text-sm text-stone-900 transition focus:border-olive-600 focus:outline-none focus:ring-1 focus:ring-olive-600/30'

async function submit() {
  pending.value = true
  error.value = ''
  const { error: e } = await authClient.signIn.email({ email: email.value, password: password.value })
  if (e) {
    error.value = t('auth.signInError')
    pending.value = false
    return
  }
  await refreshNuxtData('me')
  await navigateTo(localePath(next.value))
}

useSeoMeta({ title: () => t('auth.signInTitle'), robots: 'noindex' })
</script>

<template>
  <div class="maghreb-wash flex min-h-[80vh] items-center justify-center px-5 py-16">
    <div class="w-full max-w-sm">
      <div class="reveal text-center">
        <BrandLogo
          variant="mark"
          class="text-6xl"
        />
        <h1 class="mt-3 font-[family:var(--font-serif)] text-4xl text-stone-900">
          {{ $t('auth.welcome') }}
        </h1>
      </div>

      <form
        class="reveal mt-8 space-y-4 rounded-3xl bg-white ring-1 ring-sand-200 p-7"
        style="animation-delay:.1s"
        @submit.prevent="submit"
      >
        <div>
          <label class="mb-1 block font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-500">{{ $t('auth.email') }}</label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            :class="field"
          >
        </div>
        <div>
          <label class="mb-1 block font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-500">{{ $t('auth.password') }}</label>
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
          class="rounded-lg bg-saffron-600/10 px-3 py-2 text-sm text-saffron-700"
        >
          {{ error }}
        </p>

        <button
          type="submit"
          class="w-full rounded-full bg-olive-700 py-3 text-sm font-semibold text-sand-50 transition hover:bg-olive-800 disabled:opacity-50"
          :disabled="pending"
        >
          {{ pending ? $t('auth.signingIn') : $t('auth.signIn') }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-stone-600">
        {{ $t('auth.newHere') }}
        <NuxtLinkLocale
          :to="{ path: '/join', query: route.query }"
          class="font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.14em] text-olive-700 underline decoration-saffron-600 decoration-2 underline-offset-4"
        >
          {{ $t('auth.createAccount') }}
        </NuxtLinkLocale>
      </p>
    </div>
  </div>
</template>
