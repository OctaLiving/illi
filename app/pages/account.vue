<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface SubscriptionRow {
  id: string
  planId: string
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
const { t } = useI18n()
const { price } = useLocalized()
const { productName, planName } = useCatalogText()
const localePath = useLocalePath()
const { data: account } = await useFetch<AccountData>('/api/account', {
  key: 'account',
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  default: () => ({ subscriptions: [], orders: [] })
})

const statusBadge: Record<string, string> = {
  active: 'bg-terra-600/10 text-terra-700',
  pending: 'bg-sage-600/10 text-sage-700',
  cod_pending: 'bg-sage-600/10 text-sage-700',
  paid: 'bg-terra-600/10 text-terra-700',
  past_due: 'bg-sage-600/10 text-sage-700',
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
    const snap = JSON.parse(o.snapshot) as { kind?: string, items?: { productId: string, productName: string, quantity: number }[], planId?: string, planName?: string }
    if (snap.kind === 'products' && snap.items?.length) {
      return snap.items.map((i) => {
        const name = productName(i.productId, i.productName)
        return i.quantity > 1 ? `${name} ×${i.quantity}` : name
      }).join(t('common.listSep'))
    }
    if (snap.planName) return planName(snap.planId, snap.planName)
  } catch {
    // Older orders without a readable snapshot.
  }
  return o.subscriptionId ? t('account.box') : t('account.order')
}

// External hosted page (NOWPayments) when present, else the internal pay page.
function payLink(o: OrderRow) {
  return o.payUrl && /^https?:\/\//.test(o.payUrl) ? o.payUrl : localePath(`/pay/${o.id}`)
}

useSeoMeta({ title: () => t('account.title'), robots: 'noindex' })
</script>

<template>
  <div class="maghreb-wash">
    <div class="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <p class="font-mono text-[0.66rem] uppercase tracking-[0.3em] text-sage-600">
        {{ $t('account.title') }}
      </p>
      <h1 class="mt-2 font-serif text-4xl text-stone-900 sm:text-5xl">
        {{ me?.user ? me.user.name : $t('account.member') }}
      </h1>
      <NuxtLinkLocale
        to="/account/profile"
        class="mt-4 inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-terra-700 underline decoration-sage-600 decoration-2 underline-offset-4 transition hover:text-sage-700"
      >
        {{ $t('account.contact') }}
        <UIcon
          name="i-lucide-arrow-right"
          class="flip-rtl size-4"
        />
      </NuxtLinkLocale>

      <!-- Subscriptions -->
      <h2 class="mt-12 border-b border-sand-600/20 pb-3 font-serif text-2xl text-stone-900">
        {{ $t('account.subscriptions') }}
      </h2>
      <p
        v-if="account.subscriptions.length === 0"
        class="mt-4 text-sm text-stone-600"
      >
        {{ $t('account.noSubs') }}
        <NuxtLinkLocale
          to="/subscribe"
          class="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-terra-700 underline decoration-sage-600 decoration-2 underline-offset-4"
        >
          {{ $t('account.buildOne') }}
        </NuxtLinkLocale>
      </p>
      <div
        v-for="sub in account.subscriptions"
        :key="sub.id"
        class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white ring-1 ring-sand-200 p-5"
      >
        <div>
          <p class="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-stone-500">
            {{ $t(`cadenceTitle.${sub.cadence}`) }} · {{ price(sub.amount) }}
          </p>
          <p class="mt-1 font-serif text-2xl text-stone-900">
            {{ planName(sub.planId, sub.planName) }}
          </p>
          <p class="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-stone-500">
            {{ $t('account.renews', { date: fmt(sub.nextInvoiceAt) }) }}
          </p>
        </div>
        <span
          class="rounded-lg px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em]"
          :class="statusBadge[sub.status]"
        >
          {{ $t(`status.${sub.status}`) }}
        </span>
      </div>

      <!-- Orders -->
      <h2 class="mt-12 border-b border-sand-600/20 pb-3 font-serif text-2xl text-stone-900">
        {{ $t('account.orders') }}
      </h2>
      <div class="mt-4 overflow-x-auto rounded-3xl bg-white ring-1 ring-sand-200">
        <table class="w-full border-collapse text-left">
          <tbody>
            <tr
              v-if="account.orders.length === 0"
            >
              <td
                colspan="4"
                class="px-5 py-6 text-center font-mono text-[0.66rem] uppercase tracking-[0.14em] text-stone-400"
              >
                {{ $t('account.noOrders') }}
              </td>
            </tr>
            <tr
              v-for="o in account.orders"
              :key="o.id"
              class="border-b border-sand-600/10 last:border-0"
            >
              <td class="px-5 py-3 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-stone-500">
                {{ fmt(o.createdAt) }}
              </td>
              <td class="px-5 py-3">
                <p class="text-sm font-semibold text-stone-900">
                  <NuxtLinkLocale
                    :to="`/orders/${o.id}`"
                    class="hover:text-terra-700 hover:underline"
                  >
                    {{ orderLabel(o) }}
                  </NuxtLinkLocale>
                </p>
                <p class="text-sm text-stone-500">
                  {{ price(o.amount) }}
                </p>
              </td>
              <td class="px-5 py-3">
                <span
                  class="rounded-lg px-2 py-0.5 font-mono text-[0.56rem] uppercase tracking-[0.1em]"
                  :class="statusBadge[o.status]"
                >
                  {{ $t(`status.${o.status}`) }}
                </span>
              </td>
              <td class="px-5 py-3 text-end">
                <NuxtLink
                  v-if="o.status === 'pending'"
                  :to="payLink(o)"
                  class="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sage-700 transition hover:text-sage-800"
                >
                  {{ $t('account.pay') }} <span class="flip-rtl inline-block">→</span>
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
