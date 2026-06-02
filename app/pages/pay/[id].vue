<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface OrderRow { id: string, amount: number, currency: string, status: string }
interface AccountData { orders: OrderRow[] }

const route = useRoute()
const orderId = computed(() => String(route.params.id ?? ''))

const { data: account } = await useFetch<AccountData>('/api/account', {
  key: `account-${orderId.value}`,
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  default: () => ({ orders: [] })
})
const order = computed(() => account.value.orders.find(o => o.id === orderId.value) ?? null)

const paying = ref(false)
const error = ref('')

async function confirm() {
  paying.value = true
  error.value = ''
  try {
    await $fetch(`/api/payments/${orderId.value}/simulate`, { method: 'POST' })
    await navigateTo('/account')
  } catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    error.value = e?.data?.statusMessage ?? 'Could not confirm the payment.'
    paying.value = false
  }
}

useSeoMeta({ title: 'Pay · illi', robots: 'noindex' })
</script>

<template>
  <div class="maghreb-wash min-h-[80vh] px-5 py-16">
    <div class="mx-auto max-w-sm">
      <AppBreadcrumbs
        class="mb-6"
        :items="[{ label: 'Home', to: '/' }, { label: 'Account', to: '/account' }, { label: 'Pay invoice' }]"
      />
      <div class="w-full rounded-md border border-amber-600/25 bg-[#f4ecdd] p-7 text-center">
        <p class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-terra-600">
          Simulated USDT payment
        </p>
        <h1 class="mt-3 font-[family:var(--font-serif)] text-4xl text-stone-900">
          {{ order ? `${order.amount} ${order.currency}` : 'Order' }}
        </h1>
        <p class="mt-3 text-sm leading-7 text-stone-600">
          This is a stand-in for the NOWPayments hosted page. In production you'd be redirected to
          NOWPayments to send USDT; here, confirm to simulate a completed payment.
        </p>

        <p
          v-if="error"
          class="mt-4 rounded-sm bg-terra-600/10 px-3 py-2 text-sm text-terra-700"
        >
          {{ error }}
        </p>

        <button
          type="button"
          class="mt-6 w-full rounded-sm bg-terra-600 py-3 font-[family:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.16em] text-amber-50 transition hover:bg-terra-700 disabled:opacity-50"
          :disabled="paying || !order"
          @click="confirm"
        >
          {{ paying ? 'Confirming…' : 'Simulate successful payment' }}
        </button>
        <NuxtLink
          to="/subscribe"
          class="mt-3 inline-block font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-stone-500 hover:text-stone-800"
        >
          Cancel
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
