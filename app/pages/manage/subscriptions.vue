<script setup lang="ts">
import { statusBadge, fmtDate } from '~/utils/manage'

definePageMeta({ layout: 'manage', middleware: 'operator' })

interface AdminUser { name: string, email: string }
interface AdminSubscription {
  id: string
  planName: string
  cadence: string
  amount: number
  currency: string
  status: string
  nextInvoiceAt: string | null
  createdAt: string
  user: AdminUser
}
interface AdminOrder {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
  user: AdminUser
}
const { data: commerce } = await useFetch<{ subscriptions: AdminSubscription[], orders: AdminOrder[] }>('/api/admin/commerce', {
  key: 'admin-commerce',
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  default: () => ({ subscriptions: [], orders: [] })
})
const activeSubscribers = computed(() => commerce.value.subscriptions.filter(s => s.status === 'active').length)
const revenueCollected = computed(() => commerce.value.orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0))

const runningRenewals = ref(false)
async function runRenewalsNow() {
  runningRenewals.value = true
  try {
    await $fetch('/api/admin/run-renewals', { method: 'POST' })
    await refreshNuxtData('admin-commerce')
  } finally {
    runningRenewals.value = false
  }
}

useSeoMeta({ title: 'Subscriptions · illi ops', robots: 'noindex, nofollow' })
</script>

<template>
  <section>
    <div class="flex flex-wrap items-end justify-between gap-3 border-b border-amber-600/20 pb-4">
      <div>
        <p class="font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.24em] text-terra-600">
          {{ activeSubscribers }} active · {{ revenueCollected }} USDT collected
        </p>
        <h1 class="mt-1 font-[family:var(--font-serif)] text-3xl text-stone-900">
          Subscriptions
        </h1>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-sm border border-indigo-600 px-4 py-2.5 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-indigo-700 transition hover:bg-indigo-600/8 disabled:opacity-50"
        :disabled="runningRenewals"
        @click="runRenewalsNow"
      >
        <UIcon
          name="i-lucide-refresh-cw"
          class="size-3.5"
        />
        {{ runningRenewals ? 'Running…' : 'Run renewals now' }}
      </button>
    </div>

    <div class="mt-6 overflow-x-auto rounded-md border border-amber-600/25 bg-[#f4ecdd]">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr class="border-b border-amber-600/25 font-[family:var(--font-mono)] text-[0.56rem] uppercase tracking-[0.14em] text-stone-500">
            <th class="px-5 py-3 font-medium">
              Customer
            </th>
            <th class="px-5 py-3 font-medium">
              Plan
            </th>
            <th class="px-5 py-3 font-medium">
              Cadence
            </th>
            <th class="px-5 py-3 text-right font-medium">
              Amount
            </th>
            <th class="px-5 py-3 font-medium">
              Renews
            </th>
            <th class="px-5 py-3 text-right font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="commerce.subscriptions.length === 0">
            <td
              colspan="6"
              class="px-5 py-8 text-center font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.14em] text-stone-400"
            >
              No subscriptions yet — they appear here after checkout.
            </td>
          </tr>
          <tr
            v-for="sub in commerce.subscriptions"
            :key="sub.id"
            class="border-b border-amber-600/10 last:border-0"
          >
            <td class="px-5 py-3">
              <p class="text-sm text-stone-900">
                {{ sub.user.name }}
              </p>
              <p class="font-[family:var(--font-mono)] text-[0.6rem] text-stone-500">
                {{ sub.user.email }}
              </p>
            </td>
            <td class="px-5 py-3 font-[family:var(--font-serif)] text-lg text-stone-900">
              {{ sub.planName }}
            </td>
            <td class="px-5 py-3 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.1em] text-stone-500">
              {{ sub.cadence }}
            </td>
            <td class="px-5 py-3 text-right font-[family:var(--font-mono)] text-sm text-stone-700">
              {{ sub.amount }} {{ sub.currency }}
            </td>
            <td class="px-5 py-3 font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.1em] text-stone-500">
              {{ sub.nextInvoiceAt ? fmtDate(sub.nextInvoiceAt) : '—' }}
            </td>
            <td class="px-5 py-3 text-right">
              <span
                class="rounded-sm px-2 py-0.5 font-[family:var(--font-mono)] text-[0.56rem] uppercase tracking-[0.1em]"
                :class="statusBadge[sub.status]"
              >
                {{ sub.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="mt-8 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.2em] text-stone-500">
      Recent orders
    </h2>
    <div class="mt-3 overflow-x-auto rounded-md border border-amber-600/25 bg-[#f4ecdd]">
      <table class="w-full border-collapse text-left">
        <tbody>
          <tr v-if="commerce.orders.length === 0">
            <td class="px-5 py-6 text-center font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.14em] text-stone-400">
              No orders yet.
            </td>
          </tr>
          <tr
            v-for="o in commerce.orders"
            :key="o.id"
            class="border-b border-amber-600/10 last:border-0"
          >
            <td class="px-5 py-3 font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.1em] text-stone-500">
              {{ fmtDate(o.createdAt) }}
            </td>
            <td class="px-5 py-3 text-sm text-stone-700">
              {{ o.user.email }}
            </td>
            <td class="px-5 py-3 text-right font-[family:var(--font-serif)] text-lg text-stone-900">
              {{ o.amount }} {{ o.currency }}
            </td>
            <td class="px-5 py-3 text-right">
              <span
                class="rounded-sm px-2 py-0.5 font-[family:var(--font-mono)] text-[0.56rem] uppercase tracking-[0.1em]"
                :class="statusBadge[o.status]"
              >
                {{ o.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
