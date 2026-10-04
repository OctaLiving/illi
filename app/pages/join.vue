<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const next = computed(() => (typeof route.query.next === 'string' ? route.query.next : '/'))

const form = reactive({ name: '', email: '', password: '' })
const error = ref('')
const pending = ref(false)

const field = 'w-full rounded-lg border border-sand-600/30 bg-sand-50/60 px-3.5 py-2.5 text-sm text-stone-900 transition focus:border-olive-600 focus:outline-none focus:ring-1 focus:ring-olive-600/30'

async function submit() {
  pending.value = true
  error.value = ''
  try {
    await $fetch('/api/register', { method: 'POST', body: { ...form } })
    await refreshNuxtData('me')
    await navigateTo(localePath(next.value))
  } catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    // Better Auth's messages (e.g. email already used) are English-only.
    error.value = locale.value === 'en' && e?.data?.statusMessage ? e.data.statusMessage : t('auth.joinError')
    pending.value = false
  }
}

useSeoMeta({ title: () => t('auth.joinTitle'), robots: 'noindex' })
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
          {{ $t('auth.createYourAccount') }}
        </h1>
      </div>

      <form
        class="reveal mt-8 space-y-4 rounded-3xl bg-white ring-1 ring-sand-200 p-7"
        style="animation-delay:.1s"
        @submit.prevent="submit"
      >
        <div>
          <label class="mb-1 block font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-500">{{ $t('auth.name') }}</label>
          <input
            v-model="form.name"
            required
            autocomplete="name"
            :class="field"
          >
        </div>
        <div>
          <label class="mb-1 block font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-500">{{ $t('auth.email') }}</label>
          <input
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            :class="field"
          >
        </div>
        <div>
          <label class="mb-1 block font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-500">{{ $t('auth.password') }}</label>
          <input
            v-model="form.password"
            type="password"
            required
            autocomplete="new-password"
            minlength="8"
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
          {{ pending ? $t('auth.joining') : $t('auth.join') }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-stone-600">
        {{ $t('auth.haveAccount') }}
        <NuxtLinkLocale
          :to="{ path: '/login', query: route.query }"
          class="font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.14em] text-olive-700 underline decoration-saffron-600 decoration-2 underline-offset-4"
        >
          {{ $t('auth.signIn') }}
        </NuxtLinkLocale>
      </p>
    </div>
  </div>
</template>
