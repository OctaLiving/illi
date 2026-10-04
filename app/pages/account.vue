<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface SubscriptionRow {
  id: string
  planName: string
  cadence: string
  amount: number
  currency: string
  status: string
  currentPeriodEnd: string | null
  nextInvoiceAt: string | null
}
interface OrderRow {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
  payUrl: string | null
  snapshot: string
  subscriptionId: string | null
}
interface AccountData { subscriptions: SubscriptionRow[], orders: OrderRow[] }

const { data: me } = useMe()
const { data: account } = await useFetch<AccountData>('/api/account', {
  key: 'account',
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  default: () => ({ subscriptions: [], orders: [] })
})

const statusBadge: Record<string, string> = {
  active: 'bg-olive-600/10 text-olive-700',
  pending: 'bg-saffron-600/10 text-saffron-700',
  paid: 'bg-olive-600/10 text-olive-700',
  past_due: 'bg-saffron-600/10 text-saffron-700',
  paused: 'bg-stone-400/15 text-stone-500',
  canceled: 'bg-stone-400/15 text-stone-500',
  failed: 'bg-stone-400/15 text-stone-500',
  expired: 'bg-stone-400/15 text-stone-500'
}

function fmt(iso: string | null) {
  return iso ? new Date(iso).toISOString().slice(0, 10) : '—'
}

// What the order was for: the products bought, or the box it renews.
function orderLabel(o: OrderRow) {
  try {
    const snap = JSON.parse(o.snapshot) as { kind?: string, items?: { productName: string, quantity: number }[], planName?: string }
    if (snap.kind === 'products' && snap.items?.length) {
      return snap.items.map(i => (i.quantity > 1 ? `${i.productName} ×${i.quantity}` : i.productName)).join(', ')
    }
    if (snap.planName) return snap.planName
  } catch {
    // Older orders without a readable snapshot.
  }
  return o.subscriptionId ? 'Box' : 'Order'
}

// External hosted page (NOWPayments) when present, else the internal pay page.
function payLink(o: OrderRow) {
  return o.payUrl && /^https?:\/\//.test(o.payUrl) ? o.payUrl : `/pay/${o.id}`
}

useSeoMeta({ title: 'Your account · illi', robots: 'noindex' })
</script>

<template>
  <div class="maghreb-wash">
    <div class="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <p class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.3em] text-saffron-600">
        Your account
      </p>
      <h1 class="mt-2 font-[family:var(--font-serif)] text-4xl text-stone-900 sm:text-5xl">
        {{ me?.user ? me.user.name : 'Member' }}
      </h1>
      <NuxtLink
        to="/account/profile"
        class="mt-4 inline-flex items-center gap-2 font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.14em] text-olive-700 underline decoration-saffron-600 decoration-2 underline-offset-4 transition hover:text-saffron-700"
      >
        Contact & delivery details
        <UIcon
          name="i-lucide-arrow-right"
          class="size-4"
        />
      </NuxtLink>

      <!-- Subscriptions -->
      <h2 class="mt-12 border-b border-sand-600/20 pb-3 font-[family:var(--font-serif)] text-2xl text-stone-900">
        Subscriptions
      </h2>
      <p
        v-if="account.subscriptions.length === 0"
        class="mt-4 text-sm text-stone-600"
      >
        No subscriptions yet.
        <NuxtLink
          to="/subscribe"
          class="font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.14em] text-olive-700 underline decoration-saffron-600 decoration-2 underline-offset-4"
        >
          Build one
        </NuxtLink>
      </p>
      <div
        v-for="sub in account.subscriptions"
        :key="sub.id"
        class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white ring-1 ring-sand-200 p-5"
      >
        <div>
          <p class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.18em] text-stone-500">
            {{ sub.cadence }} · {{ sub.amount }} {{ sub.currency }}
          </p>
          <p class="mt-1 font-[family:var(--font-serif)] text-2xl text-stone-900">
            {{ sub.planName }}
          </p>
          <p class="mt-1 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.12em] text-stone-500">
            Renews {{ fmt(sub.nextInvoiceAt) }}
          </p>
        </div>
        <span
          class="rounded-lg px-2.5 py-1 font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.12em]"
          :class="statusBadge[sub.status]"
        >
          {{ sub.status }}
        </span>
      </div>

      <!-- Orders -->
      <h2 class="mt-12 border-b border-sand-600/20 pb-3 font-[family:var(--font-serif)] text-2xl text-stone-900">
        Orders
      </h2>
      <div class="mt-4 overflow-x-auto rounded-3xl bg-white ring-1 ring-sand-200">
        <table class="w-full border-collapse text-left">
          <tbody>
            <tr
              v-if="account.orders.length === 0"
            >
              <td
                colspan="4"
                class="px-5 py-6 text-center font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.14em] text-stone-400"
              >
                No orders yet.
              </td>
            </tr>
            <tr
              v-for="o in account.orders"
              :key="o.id"
              class="border-b border-sand-600/10 last:border-0"
            >
              <td class="px-5 py-3 font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.1em] text-stone-500">
                {{ fmt(o.createdAt) }}
              </td>
              <td class="px-5 py-3">
                <p class="text-sm font-semibold text-stone-900">
                  {{ orderLabel(o) }}
                </p>
                <p class="text-sm text-stone-500">
                  {{ o.amount }} {{ o.currency }}
                </p>
              </td>
              <td class="px-5 py-3">
                <span
                  class="rounded-lg px-2 py-0.5 font-[family:var(--font-mono)] text-[0.56rem] uppercase tracking-[0.1em]"
                  :class="statusBadge[o.status]"
                >
                  {{ o.status }}
                </span>
              </td>
              <td class="px-5 py-3 text-right">
                <NuxtLink
                  v-if="o.status === 'pending'"
                  :to="payLink(o)"
                  class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-saffron-700 transition hover:text-saffron-800"
                >
                  Pay →
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
