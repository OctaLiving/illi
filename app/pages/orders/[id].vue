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
  subscription: { planName: string, cadence: string } | null
}

const route = useRoute()
const { data: order, error } = await useFetch<OrderDetail>(`/api/orders/${route.params.id}`, {
  key: `order-${route.params.id}`,
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined
})
if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Order not found', fatal: true })
}

const lines = computed(() => {
  if (!order.value) return []
  try {
    const snap = JSON.parse(order.value.snapshot) as {
      kind?: string
      items?: { productName: string, quantity: number, unitPrice: number }[]
      selections?: { productIds: string[] }[]
    }
    if (snap.kind === 'products') {
      return (snap.items ?? []).map(i => ({ label: i.productName, detail: `${i.quantity} × ${i.unitPrice} MAD` }))
    }
  } catch {
    // Unreadable snapshot — show the total only.
  }
  return order.value.subscription ? [{ label: order.value.subscription.planName, detail: `Box · ${order.value.subscription.cadence}` }] : []
})

const isCash = computed(() => order.value?.paymentMethod === 'cod')
const awaitingPayment = computed(() => order.value?.status === 'pending' && !isCash.value)
const payLink = computed(() => {
  const o = order.value
  if (!o) return ''
  return o.payUrl && /^https?:\/\//.test(o.payUrl) ? o.payUrl : `/pay/${o.id}`
})

const heading = computed(() => {
  if (!order.value) return ''
  if (order.value.status === 'paid') return 'Thank you — your order is paid.'
  if (isCash.value) return 'Thank you — your order is confirmed.'
  if (awaitingPayment.value) return 'Almost there — complete your payment.'
  return 'This order was not completed.'
})
const methodLabel: Record<string, string> = { cod: 'Cash on delivery', card: 'Card', crypto: 'Crypto' }

useSeoMeta({ title: 'Your order', robots: 'noindex' })
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
        We're preparing it now. Please have <strong class="text-stone-900">{{ order.amount }} {{ order.currency }}</strong>
        ready in cash for the courier.
      </p>
      <p class="mt-3 text-sm text-stone-500">
        Order {{ order.id.slice(-8).toUpperCase() }} · {{ new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }}
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
      Pay {{ order.amount }} {{ order.currency }}
    </a>

    <section class="mt-10 rounded-3xl bg-white p-6 ring-1 ring-sand-200 sm:p-8">
      <h2 class="font-serif text-2xl text-stone-900">
        Summary
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
        <span class="text-stone-600">Total</span>
        <span class="font-serif text-3xl text-stone-900">{{ order.amount }} {{ order.currency }}</span>
      </div>

      <dl class="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <dt class="text-xs font-bold uppercase tracking-[0.14em] text-saffron-700">
            Payment
          </dt>
          <dd class="mt-1 text-stone-800">
            {{ methodLabel[order.paymentMethod] ?? order.paymentMethod }}
            <span class="block text-sm text-stone-500">
              {{ order.status === 'paid' ? 'Paid' : isCash ? 'Pay on delivery' : awaitingPayment ? 'Waiting for payment' : order.status }}
            </span>
          </dd>
        </div>
        <div v-if="order.shipping">
          <dt class="text-xs font-bold uppercase tracking-[0.14em] text-saffron-700">
            Delivery to
          </dt>
          <dd class="mt-1 text-stone-800">
            {{ order.shipping.name }}<br>
            {{ order.shipping.address }}<br>
            {{ order.shipping.city }}, {{ order.countryName ?? order.shipping.country }}<br>
            <span class="text-sm text-stone-500">{{ order.shipping.phone }}</span>
            <span
              v-if="order.shipping.notes"
              class="block text-sm text-stone-500"
            >“{{ order.shipping.notes }}”</span>
          </dd>
        </div>
      </dl>
    </section>

    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <NuxtLink
        to="/catalog"
        class="rounded-full bg-olive-700 px-6 py-3 font-semibold text-sand-50 transition hover:bg-olive-800"
      >
        Keep shopping
      </NuxtLink>
      <NuxtLink
        to="/account"
        class="rounded-full bg-white px-6 py-3 font-semibold text-olive-800 ring-1 ring-sand-300 transition hover:ring-olive-600"
      >
        Your orders
      </NuxtLink>
    </div>
  </div>
</template>
