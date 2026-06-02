<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface Profile {
  name: string
  email: string
  phone: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  deliveryNotes: string | null
}

const { data: profile } = await useFetch<Profile>('/api/profile', {
  key: 'profile',
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined
})

const form = reactive({
  name: profile.value?.name ?? '',
  phone: profile.value?.phone ?? '',
  addressLine1: profile.value?.addressLine1 ?? '',
  addressLine2: profile.value?.addressLine2 ?? '',
  city: profile.value?.city ?? '',
  postalCode: profile.value?.postalCode ?? '',
  country: profile.value?.country ?? '',
  deliveryNotes: profile.value?.deliveryNotes ?? ''
})

const saving = ref(false)
const saved = ref(false)
const error = ref('')

const field = 'w-full rounded-sm border border-amber-600/30 bg-amber-50/60 px-3.5 py-2.5 text-sm text-stone-900 transition focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600/30'
const labelText = 'mb-1 block font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-500'

async function save() {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    await $fetch('/api/profile', { method: 'PUT', body: { ...form } })
    await refreshNuxtData('me') // name may have changed → header
    saved.value = true
  } catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    error.value = e?.data?.statusMessage ?? 'Could not save your information.'
  } finally {
    saving.value = false
  }
}

useSeoMeta({ title: 'Your information · illi', robots: 'noindex' })
</script>

<template>
  <div class="maghreb-wash">
    <div class="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <AppBreadcrumbs
        class="mb-8"
        :items="[{ label: 'Home', to: '/' }, { label: 'Account', to: '/account' }, { label: 'Information' }]"
      />

      <p class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.3em] text-terra-600">
        Your information
      </p>
      <h1 class="mt-2 font-[family:var(--font-serif)] text-4xl text-stone-900 sm:text-5xl">
        Contact & delivery
      </h1>
      <p class="mt-3 max-w-lg text-sm leading-7 text-stone-600">
        Where your boxes go and how we reach you. This is the address each subscription delivery
        is sent to.
      </p>

      <form
        class="mt-8 space-y-5 rounded-md border border-amber-600/25 bg-[#f4ecdd] p-7"
        @submit.prevent="save"
      >
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label :class="labelText">Name</label>
            <input
              v-model="form.name"
              :class="field"
            >
          </div>
          <div>
            <label :class="labelText">Email</label>
            <input
              :value="profile?.email"
              disabled
              :class="[field, 'cursor-not-allowed opacity-60']"
            >
          </div>
        </div>

        <div>
          <label :class="labelText">Phone</label>
          <input
            v-model="form.phone"
            type="tel"
            autocomplete="tel"
            :class="field"
          >
        </div>

        <div>
          <label :class="labelText">Address line 1</label>
          <input
            v-model="form.addressLine1"
            autocomplete="address-line1"
            :class="field"
          >
        </div>
        <div>
          <label :class="labelText">Address line 2</label>
          <input
            v-model="form.addressLine2"
            autocomplete="address-line2"
            :class="field"
          >
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label :class="labelText">City</label>
            <input
              v-model="form.city"
              autocomplete="address-level2"
              :class="field"
            >
          </div>
          <div>
            <label :class="labelText">Postal code</label>
            <input
              v-model="form.postalCode"
              autocomplete="postal-code"
              :class="field"
            >
          </div>
          <div>
            <label :class="labelText">Country</label>
            <input
              v-model="form.country"
              autocomplete="country-name"
              :class="field"
            >
          </div>
        </div>

        <div>
          <label :class="labelText">Delivery notes</label>
          <textarea
            v-model="form.deliveryNotes"
            rows="2"
            placeholder="Gate code, drop-off preference…"
            :class="field"
          />
        </div>

        <p
          v-if="error"
          class="rounded-sm bg-terra-600/10 px-3 py-2 text-sm text-terra-700"
        >
          {{ error }}
        </p>

        <div class="flex items-center gap-4">
          <button
            type="submit"
            class="rounded-sm bg-indigo-600 px-6 py-3 font-[family:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.16em] text-amber-50 transition hover:bg-indigo-700 disabled:opacity-50"
            :disabled="saving"
          >
            {{ saving ? 'Saving…' : 'Save information' }}
          </button>
          <span
            v-if="saved"
            class="inline-flex items-center gap-1.5 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-indigo-700"
          >
            <UIcon
              name="i-lucide-check"
              class="size-4"
            />
            Saved
          </span>
        </div>
      </form>
    </div>
  </div>
</template>
