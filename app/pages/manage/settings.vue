<script setup lang="ts">
import { field, labelText } from '~/utils/manage'

definePageMeta({ layout: 'manage', middleware: 'operator' })

interface SettingsView {
  paymentMode: string
  payCurrency: string
  hasTestApiKey: boolean
  hasLiveApiKey: boolean
  hasTestIpnSecret: boolean
  hasLiveIpnSecret: boolean
  smtpHost: string | null
  smtpPort: number | null
  smtpSecure: boolean
  smtpUser: string | null
  mailFrom: string | null
  hasSmtpPass: boolean
}
const { data: settings, refresh: refreshSettings } = await useFetch<SettingsView>('/api/admin/settings', {
  key: 'admin-settings',
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined
})

const paymentForm = reactive({
  paymentMode: settings.value?.paymentMode ?? 'simulated',
  payCurrency: settings.value?.payCurrency ?? 'usdttrc20',
  nowpaymentsTestApiKey: '',
  nowpaymentsLiveApiKey: '',
  nowpaymentsTestIpnSecret: '',
  nowpaymentsLiveIpnSecret: ''
})
const emailForm = reactive({
  smtpHost: settings.value?.smtpHost ?? '',
  smtpPort: settings.value?.smtpPort ?? 587,
  smtpSecure: settings.value?.smtpSecure ?? false,
  smtpUser: settings.value?.smtpUser ?? '',
  smtpPass: '',
  mailFrom: settings.value?.mailFrom ?? ''
})
const savingSettings = ref(false)
const settingsSaved = ref('')

async function saveSettings(scope: 'payment' | 'email') {
  savingSettings.value = true
  settingsSaved.value = ''
  try {
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: scope === 'payment' ? { ...paymentForm } : { ...emailForm }
    })
    if (scope === 'payment') {
      paymentForm.nowpaymentsTestApiKey = ''
      paymentForm.nowpaymentsLiveApiKey = ''
      paymentForm.nowpaymentsTestIpnSecret = ''
      paymentForm.nowpaymentsLiveIpnSecret = ''
    } else {
      emailForm.smtpPass = ''
    }
    await refreshSettings()
    settingsSaved.value = scope
  } finally {
    savingSettings.value = false
  }
}

const secretPlaceholder = (set: boolean) => (set ? '•••••••• configured — leave blank to keep' : 'not set')

useSeoMeta({ title: 'Settings · illi ops', robots: 'noindex, nofollow' })
</script>

<template>
  <section>
    <div class="flex flex-wrap items-end justify-between gap-3 border-b border-amber-600/20 pb-4">
      <div>
        <p class="font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.24em] text-terra-600">
          {{ settings?.paymentMode }} mode · {{ settings?.smtpHost ? 'SMTP configured' : 'SMTP off' }}
        </p>
        <h1 class="mt-1 font-[family:var(--font-serif)] text-3xl text-stone-900">
          Settings
        </h1>
      </div>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-2">
      <!-- Payment -->
      <form
        class="space-y-4 rounded-md border border-amber-600/25 bg-[#f4ecdd] p-6"
        @submit.prevent="saveSettings('payment')"
      >
        <div class="flex items-center justify-between">
          <h2 class="font-[family:var(--font-serif)] text-2xl text-stone-900">
            Checkout · NOWPayments
          </h2>
          <span
            v-if="settingsSaved === 'payment'"
            class="inline-flex items-center gap-1.5 font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-indigo-700"
          >
            <UIcon
              name="i-lucide-check"
              class="size-4"
            />
            Saved
          </span>
        </div>
        <div>
          <label :class="labelText">Mode</label>
          <select
            v-model="paymentForm.paymentMode"
            :class="field"
          >
            <option value="simulated">
              Simulated (dev)
            </option>
            <option value="test">
              Test (sandbox)
            </option>
            <option value="live">
              Live
            </option>
          </select>
        </div>
        <div>
          <label :class="labelText">Pay currency</label>
          <input
            v-model="paymentForm.payCurrency"
            :class="field"
            placeholder="usdttrc20"
          >
        </div>
        <div>
          <label :class="labelText">Test API key</label>
          <input
            v-model="paymentForm.nowpaymentsTestApiKey"
            type="password"
            autocomplete="off"
            :class="field"
            :placeholder="secretPlaceholder(settings?.hasTestApiKey ?? false)"
          >
        </div>
        <div>
          <label :class="labelText">Test IPN secret</label>
          <input
            v-model="paymentForm.nowpaymentsTestIpnSecret"
            type="password"
            autocomplete="off"
            :class="field"
            :placeholder="secretPlaceholder(settings?.hasTestIpnSecret ?? false)"
          >
        </div>
        <div>
          <label :class="labelText">Live API key</label>
          <input
            v-model="paymentForm.nowpaymentsLiveApiKey"
            type="password"
            autocomplete="off"
            :class="field"
            :placeholder="secretPlaceholder(settings?.hasLiveApiKey ?? false)"
          >
        </div>
        <div>
          <label :class="labelText">Live IPN secret</label>
          <input
            v-model="paymentForm.nowpaymentsLiveIpnSecret"
            type="password"
            autocomplete="off"
            :class="field"
            :placeholder="secretPlaceholder(settings?.hasLiveIpnSecret ?? false)"
          >
        </div>
        <button
          type="submit"
          class="rounded-sm bg-indigo-600 px-5 py-2.5 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-amber-50 transition hover:bg-indigo-700 disabled:opacity-50"
          :disabled="savingSettings"
        >
          Save payment settings
        </button>
      </form>

      <!-- Email -->
      <form
        class="space-y-4 rounded-md border border-amber-600/25 bg-[#f4ecdd] p-6"
        @submit.prevent="saveSettings('email')"
      >
        <div class="flex items-center justify-between">
          <h2 class="font-[family:var(--font-serif)] text-2xl text-stone-900">
            Email · SMTP
          </h2>
          <span
            v-if="settingsSaved === 'email'"
            class="inline-flex items-center gap-1.5 font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-indigo-700"
          >
            <UIcon
              name="i-lucide-check"
              class="size-4"
            />
            Saved
          </span>
        </div>
        <div>
          <label :class="labelText">SMTP host</label>
          <input
            v-model="emailForm.smtpHost"
            :class="field"
            placeholder="smtp.provider.com"
          >
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label :class="labelText">Port</label>
            <input
              v-model.number="emailForm.smtpPort"
              type="number"
              :class="field"
            >
          </div>
          <label class="flex items-center gap-2 pt-7">
            <input
              v-model="emailForm.smtpSecure"
              type="checkbox"
              class="size-4 accent-indigo-600"
            >
            <span class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.12em] text-stone-600">Secure (TLS)</span>
          </label>
        </div>
        <div>
          <label :class="labelText">Username</label>
          <input
            v-model="emailForm.smtpUser"
            autocomplete="off"
            :class="field"
          >
        </div>
        <div>
          <label :class="labelText">Password</label>
          <input
            v-model="emailForm.smtpPass"
            type="password"
            autocomplete="off"
            :class="field"
            :placeholder="secretPlaceholder(settings?.hasSmtpPass ?? false)"
          >
        </div>
        <div>
          <label :class="labelText">From address</label>
          <input
            v-model="emailForm.mailFrom"
            :class="field"
            placeholder="illi <hello@illi.example>"
          >
        </div>
        <button
          type="submit"
          class="rounded-sm bg-indigo-600 px-5 py-2.5 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-amber-50 transition hover:bg-indigo-700 disabled:opacity-50"
          :disabled="savingSettings"
        >
          Save email settings
        </button>
      </form>
    </div>

    <p class="mt-4 font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.12em] text-stone-400">
      Secrets are stored server-side and never shown here once saved — leave a field blank to keep its current value.
    </p>
  </section>
</template>
