<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface OrderDetail {
  id: string
  status: string
  amount: number
  currency: string
  paymentMethod: 'card' | 'crypto' | 'cod'
  shipping: { name: string, phone: string, address: string, city: string, country: string, notes: string } | null
  snapshot: string
  payUrl: string | null
  createdAt: string
  countryName: string | null
  subscription: { planId: string, planName: string, cadence: string } | null
}

const route = useRoute()
const { t, locale } = useI18n()
const { price } = useLocalized()
const { productName, planName } = useCatalogText()
const localePath = useLocalePath()
const { data: order, error } = await useFetch<OrderDetail>(`/api/orders/${route.params.id}`, {
  key: `order-${route.params.id}`,
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined
})
if (error.value) {
  throw createError({ statusCode: 404, statusMessage: t('order.notFound'), fatal: true })
}

const lines = computed(() => {
  if (!order.value) return []
  try {
    const snap = JSON.parse(order.value.snapshot) as {
      kind?: string
      items?: { productId: string, productName: string, quantity: number, unitPrice: number }[]
      selections?: { productIds: string[] }[]
    }
    if (snap.kind === 'products') {
      return (snap.items ?? []).map(i => ({ label: productName(i.productId, i.productName), detail: `${i.quantity} × ${price(i.unitPrice)}` }))
    }
  } catch {
    // Unreadable snapshot — show the total only.
  }
  const sub = order.value.subscription
  return sub ? [{ label: planName(sub.planId, sub.planName), detail: t('order.box', { cadence: t(`cadence.${sub.cadence}`) }) }] : []
})

const isCash = computed(() => order.value?.paymentMethod === 'cod')
const awaitingPayment = computed(() => order.value?.status === 'pending' && !isCash.value)
const payLink = computed(() => {
  const o = order.value
  if (!o) return ''
  return o.payUrl && /^https?:\/\//.test(o.payUrl) ? o.payUrl : localePath(`/pay/${o.id}`)
})

const heading = computed(() => {
  if (!order.value) return ''
  if (order.value.status === 'paid') return t('order.paid')
  if (isCash.value) return t('order.confirmed')
  if (awaitingPayment.value) return t('order.awaiting')
  return t('order.incomplete')
})
const statusLabel = computed(() => {
  const o = order.value
  if (!o) return ''
  if (o.status === 'paid') return t('order.status.paid')
  if (isCash.value) return t('order.status.cod')
  return awaitingPayment.value ? t('order.status.awaiting') : t('order.status.other')
})
const placedOn = computed(() => order.value
  ? new Date(order.value.createdAt).toLocaleDateString(locale.value === 'ar' ? 'ar-MA' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  : '')

useSeoMeta({ title: () => t('order.title'), robots: 'noindex' })
</script>

<template>
  <div
    v-if="order"
    class="mx-auto max-w-2xl px-5 py-12 sm:py-16"
  >
    <div class="text-center">
      <span
        class="mx-auto grid size-16 place-items-center rounded-full"
        :class="order.status === 'paid' || isCash ? 'bg-olive-700 text-sand-50' : 'bg-saffron-300 text-olive-950'"
      >
        <UIcon
          :name="order.status === 'paid' || isCash ? 'i-lucide-check' : 'i-lucide-clock'"
          class="size-8"
        />
      </span>
      <h1 class="mt-6 font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
        {{ heading }}
      </h1>
      <p
        v-if="isCash && order.status !== 'paid'"
        class="mx-auto mt-4 max-w-md text-lg leading-8 text-stone-600"
      >
        {{ $t('order.cashNote', { amount: price(order.amount) }) }}
      </p>
      <p class="mt-3 text-sm text-stone-500">
        {{ $t('order.meta', { ref: order.id.slice(-8).toUpperCase(), date: placedOn }) }}
      </p>
    </div>

    <a
      v-if="awaitingPayment"
      :href="payLink"
      class="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-olive-700 py-4 font-semibold text-sand-50 transition hover:bg-olive-800"
    >
      <UIcon
        name="i-lucide-lock"
        class="size-5"
      />
      {{ $t('order.pay', { amount: price(order.amount) }) }}
    </a>

    <section class="mt-10 rounded-3xl bg-white p-6 ring-1 ring-sand-200 sm:p-8">
      <h2 class="font-serif text-2xl text-stone-900">
        {{ $t('order.summary') }}
      </h2>
      <ul class="mt-4 divide-y divide-sand-200">
        <li
          v-for="line in lines"
          :key="line.label"
          class="flex justify-between gap-4 py-3"
        >
          <span class="font-semibold text-stone-900">{{ line.label }}</span>
          <span class="text-stone-600">{{ line.detail }}</span>
        </li>
      </ul>
      <div class="mt-2 flex items-baseline justify-between border-t border-sand-200 pt-4">
        <span class="text-stone-600">{{ $t('order.total') }}</span>
        <span class="font-serif text-3xl text-stone-900">{{ price(order.amount) }}</span>
      </div>

      <dl class="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <dt class="text-xs font-bold uppercase tracking-[0.14em] text-saffron-700">
            {{ $t('order.payment') }}
          </dt>
          <dd class="mt-1 text-stone-800">
            {{ $t(`checkout.methods.${order.paymentMethod}.title`) }}
            <span class="block text-sm text-stone-500">
              {{ statusLabel }}
            </span>
          </dd>
        </div>
        <div v-if="order.shipping">
          <dt class="text-xs font-bold uppercase tracking-[0.14em] text-saffron-700">
            {{ $t('order.deliveryTo') }}
          </dt>
          <dd class="mt-1 text-stone-800">
            {{ order.shipping.name }}<br>
            {{ order.shipping.address }}<br>
            {{ order.shipping.city }}{{ $t('common.listSep') }}{{ $te(`countries.${order.shipping.country}`) ? $t(`countries.${order.shipping.country}`) : (order.countryName ?? order.shipping.country) }}<br>
            <span
              class="text-sm text-stone-500"
              dir="ltr"
            >{{ order.shipping.phone }}</span>
            <span
              v-if="order.shipping.notes"
              class="block text-sm text-stone-500"
            >“{{ order.shipping.notes }}”</span>
          </dd>
        </div>
      </dl>
    </section>

    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <NuxtLinkLocale
        to="/catalog"
        class="rounded-full bg-olive-700 px-6 py-3 font-semibold text-sand-50 transition hover:bg-olive-800"
      >
        {{ $t('order.keepShopping') }}
      </NuxtLinkLocale>
      <NuxtLinkLocale
        to="/account"
        class="rounded-full bg-white px-6 py-3 font-semibold text-olive-800 ring-1 ring-sand-300 transition hover:ring-olive-600"
      >
        {{ $t('order.yourOrders') }}
      </NuxtLinkLocale>
    </div>
  </div>
</template>
