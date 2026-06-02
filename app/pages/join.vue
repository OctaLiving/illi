<script setup lang="ts">
const route = useRoute()
const next = computed(() => (typeof route.query.next === 'string' ? route.query.next : '/'))

const form = reactive({ code: '', name: '', email: '', password: '' })
const error = ref('')
const pending = ref(false)

const field = 'w-full rounded-sm border border-amber-600/30 bg-amber-50/60 px-3.5 py-2.5 text-sm text-stone-900 transition focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600/30'

onMounted(() => {
  if (typeof route.query.code === 'string') {
    form.code = route.query.code
  }
})

async function submit() {
  pending.value = true
  error.value = ''
  try {
    await $fetch('/api/register', { method: 'POST', body: { ...form } })
    await refreshNuxtData('me')
    await navigateTo(next.value)
  } catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    error.value = e?.data?.statusMessage ?? 'Could not redeem this invitation.'
    pending.value = false
  }
}

useSeoMeta({ title: 'Join illi', robots: 'noindex' })
</script>

<template>
  <div class="maghreb-wash flex min-h-[80vh] items-center justify-center px-5 py-16">
    <div class="w-full max-w-sm">
      <div class="reveal text-center">
        <p class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.3em] text-terra-600">
          By invitation
        </p>
        <h1 class="mt-3 font-[family:var(--font-serif)] text-4xl text-stone-900">
          Redeem your invitation.
        </h1>
      </div>

      <form
        class="reveal mt-8 space-y-4 rounded-md border border-amber-600/25 bg-[#f4ecdd] p-7"
        style="animation-delay:.1s"
        @submit.prevent="submit"
      >
        <div>
          <label class="mb-1 block font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-500">Invitation code</label>
          <input
            v-model="form.code"
            required
            placeholder="ILLI-XXXXXX"
            :class="[field, 'font-[family:var(--font-mono)] tracking-[0.1em]']"
          >
        </div>
        <div>
          <label class="mb-1 block font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-500">Name</label>
          <input
            v-model="form.name"
            required
            autocomplete="name"
            :class="field"
          >
        </div>
        <div>
          <label class="mb-1 block font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-500">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            :class="field"
          >
        </div>
        <div>
          <label class="mb-1 block font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-500">Password</label>
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
          class="rounded-sm bg-terra-600/10 px-3 py-2 text-sm text-terra-700"
        >
          {{ error }}
        </p>

        <button
          type="submit"
          class="w-full rounded-sm bg-indigo-600 py-3 font-[family:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.16em] text-amber-50 transition hover:bg-indigo-700 disabled:opacity-50"
          :disabled="pending"
        >
          {{ pending ? 'Joining…' : 'Join illi' }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-stone-600">
        Already a member?
        <NuxtLink
          to="/login"
          class="font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.14em] text-indigo-700 underline decoration-terra-600 decoration-2 underline-offset-4"
        >
          Sign in
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
