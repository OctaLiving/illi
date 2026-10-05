<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface OrderRow { id: string, amount: number, currency: string, status: string }
interface AccountData { orders: OrderRow[] }

const route = useRoute()
const { t } = useI18n()
const { price } = useLocalized()
const localePath = useLocalePath()
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
    await navigateTo(localePath(`/orders/${orderId.value}`))
  } catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    error.value = e?.data?.statusMessage ?? t('pay.error')
    paying.value = false
  }
}

useSeoMeta({ title: () => t('pay.title'), robots: 'noindex' })
</script>

<template>
  <div class="maghreb-wash min-h-[80vh] px-5 py-16">
    <div class="mx-auto max-w-sm">
      <AppBreadcrumbs
        class="mb-6"
        :items="[{ label: $t('pay.crumbHome'), to: '/' }, { label: $t('pay.crumbAccount'), to: '/account' }, { label: $t('pay.crumbInvoice') }]"
      />
      <div class="w-full rounded-3xl bg-sand-50 ring-1 ring-sand-200 p-7 text-center">
        <p class="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-sage-600">
          {{ $t('pay.simulated') }}
        </p>
        <h1 class="mt-3 font-serif text-4xl text-stone-900">
          {{ order ? price(order.amount) : $t('pay.order') }}
        </h1>
        <p class="mt-3 text-sm leading-7 text-stone-600">
          {{ $t('pay.body') }}
        </p>

        <p
          v-if="error"
          class="mt-4 rounded-lg bg-sage-600/10 px-3 py-2 text-sm text-sage-700"
        >
          {{ error }}
        </p>

        <button
          type="button"
          class="mt-6 w-full rounded-lg bg-sage-600 py-3 text-sm font-semibold text-sand-50 transition hover:bg-sage-700 disabled:opacity-50"
          :disabled="paying || !order"
          @click="confirm"
        >
          {{ paying ? $t('pay.confirming') : $t('pay.simulate') }}
        </button>
        <NuxtLinkLocale
          to="/subscribe"
          class="mt-3 inline-block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-stone-500 hover:text-stone-800"
        >
          {{ $t('pay.cancel') }}
        </NuxtLinkLocale>
      </div>
    </div>
  </div>
</template>
