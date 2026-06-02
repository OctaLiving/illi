<script setup lang="ts">
definePageMeta({ layout: 'manage', middleware: 'operator' })

// Reflect the live gateway status from saved settings (configured on the
// Settings page) rather than a hardcoded placeholder.
interface SettingsView {
  paymentMode: string
  payCurrency: string
  hasTestApiKey: boolean
  hasLiveApiKey: boolean
}
const { data: settings } = await useFetch<SettingsView>('/api/admin/settings', {
  key: 'admin-settings',
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined
})

// A dot + label describing whether the active mode is ready to take payments.
const gateway = computed(() => {
  const mode = settings.value?.paymentMode ?? 'simulated'
  if (mode === 'simulated') {
    return { label: 'Simulated (dev)', ready: true, dot: 'bg-amber-500', note: 'Orders are marked paid instantly — no real USDT moves.' }
  }
  const keyed = mode === 'live' ? settings.value?.hasLiveApiKey : settings.value?.hasTestApiKey
  if (keyed) {
    return { label: `${mode === 'live' ? 'Live' : 'Test'} · ${settings.value?.payCurrency}`, ready: true, dot: 'bg-indigo-500', note: 'NOWPayments keys are configured — invoices open against the gateway.' }
  }
  return { label: `${mode === 'live' ? 'Live' : 'Test'} · keys missing`, ready: false, dot: 'bg-terra-500', note: 'Add the NOWPayments API key on the Settings page to take payments.' }
})

const handoffContract = `{
  "planId": "plan-pantry",
  "planName": "Pantry Box",
  "cadence": "monthly",
  "currency": "USDT",
  "basePriceAmount": 64,
  "selections": [
    { "slotId": "pantry-spread", "slotType": "spreads", "productIds": ["prod-amlou"] }
  ],
  "totalSelectedProducts": 3,
  "isReadyForCheckout": true
}`

useSeoMeta({ title: 'Checkout · illi ops', robots: 'noindex, nofollow' })
</script>

<template>
  <section>
    <div class="flex flex-wrap items-end justify-between gap-3 border-b border-amber-600/20 pb-4">
      <div>
        <p class="font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.24em] text-terra-600">
          USDT · NOWPayments
        </p>
        <h1 class="mt-1 font-[family:var(--font-serif)] text-3xl text-stone-900">
          Checkout
        </h1>
      </div>
      <NuxtLink
        to="/manage/settings"
        class="inline-flex items-center gap-2 rounded-sm border border-indigo-600/40 px-4 py-2.5 font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-indigo-700 transition hover:bg-indigo-600/8"
      >
        <UIcon
          name="i-lucide-settings"
          class="size-3.5"
        />
        Configure
      </NuxtLink>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div class="space-y-4">
        <div class="rounded-md border border-amber-600/25 bg-[#f4ecdd] p-6">
          <p class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] text-stone-500">
            USDT gateway
          </p>
          <p class="mt-3 flex items-center gap-2 font-[family:var(--font-serif)] text-2xl text-stone-900">
            <span
              class="size-2.5 rounded-full"
              :class="gateway.dot"
            />
            {{ gateway.label }}
          </p>
          <p class="mt-2 text-sm leading-6 text-stone-600">
            {{ gateway.note }}
          </p>
        </div>
      </div>

      <div class="overflow-hidden rounded-md border border-indigo-900/40 bg-indigo-950">
        <div class="border-b border-amber-50/10 px-6 py-4">
          <p class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-amber-200/70">
            Checkout handoff contract
          </p>
          <h2 class="mt-1 font-[family:var(--font-serif)] text-xl text-amber-50">
            What a completed bundle hands off
          </h2>
        </div>
        <pre class="overflow-x-auto px-6 py-4 font-[family:var(--font-mono)] text-[0.7rem] leading-6 text-indigo-100">{{ handoffContract }}</pre>
      </div>
    </div>
  </section>
</template>
