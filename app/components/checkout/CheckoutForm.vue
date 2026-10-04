<script setup lang="ts">
import type { CheckoutDetails, PaymentMethod, ShippingDetails } from '~/composables/useCart'

const { total, pending = false, error = '' } = defineProps<{
  total: number
  pending?: boolean
  error?: string
}>()
const emit = defineEmits<{ submit: [details: CheckoutDetails] }>()

interface Options {
  methods: { id: PaymentMethod, available: boolean, reason?: string }[]
  countries: { code: string, name: string }[]
  codCountries: string[]
}
const { data: options } = await useFetch<Options>('/api/checkout/options', {
  key: 'checkout-options',
  default: () => ({ methods: [], countries: [{ code: 'MA', name: 'Morocco' }], codCountries: ['MA'] })
})
const { data: me } = useMe()
const { t, te } = useI18n()
const { price } = useLocalized()
const countryName = (c: { code: string, name: string }) => (te(`countries.${c.code}`) ? t(`countries.${c.code}`) : c.name)

const SAVED_KEY = 'illi-shipping'
const shipping = reactive<ShippingDetails>({ name: me.value?.user?.name ?? '', phone: '', address: '', city: '', country: 'MA', notes: '' })
const method = ref<PaymentMethod | ''>('')

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_KEY) ?? 'null') as Partial<ShippingDetails> | null
    if (saved) Object.assign(shipping, { ...saved, notes: '' })
  } catch {
    // Nothing saved yet.
  }
})

const METHOD_ICON: Record<PaymentMethod, string> = {
  cod: 'i-lucide-banknote',
  card: 'i-lucide-credit-card',
  crypto: 'i-lucide-bitcoin'
}
const ORDER: PaymentMethod[] = ['cod', 'card', 'crypto']

const codAllowed = computed(() => options.value.codCountries.includes(shipping.country))
const methods = computed(() =>
  ORDER.flatMap((id) => {
    const option = options.value.methods.find(m => m.id === id)
    if (!option) return []
    const blockedByCountry = id === 'cod' && !codAllowed.value
    return [{
      ...option,
      icon: METHOD_ICON[id],
      title: t(`checkout.methods.${id}.title`),
      body: t(`checkout.methods.${id}.body`),
      available: option.available && !blockedByCountry,
      reason: blockedByCountry ? t('checkout.reasons.codCountry') : te(`checkout.reasons.${id}`) ? t(`checkout.reasons.${id}`) : option.reason
    }]
  })
)

// Pick the first usable method, and drop a choice that stops being usable.
watchEffect(() => {
  const current = methods.value.find(m => m.id === method.value)
  if (!current?.available) {
    method.value = methods.value.find(m => m.available)?.id ?? ''
  }
})

const submitLabel = computed(() => {
  if (pending) return method.value === 'cod' ? t('checkout.placing') : t('checkout.startingPayment')
  return method.value === 'cod' ? t('checkout.placeOrder', { price: price(total) }) : t('checkout.continueToPayment', { price: price(total) })
})

function onSubmit() {
  if (!method.value) return
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify({ ...shipping, notes: '' }))
  } catch {
    // Private mode — the form simply won't be prefilled next time.
  }
  emit('submit', { method: method.value, shipping: { ...shipping } })
}

const field = 'w-full rounded-xl border-0 bg-white px-4 py-3 text-stone-900 ring-1 ring-sand-300 transition placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terra-600'
const label = 'mb-1.5 block text-sm font-semibold text-stone-700'
</script>

<template>
  <form
    class="space-y-8"
    @submit.prevent="onSubmit"
  >
    <fieldset class="space-y-4">
      <legend class="font-serif text-2xl text-stone-900">
        {{ $t('checkout.delivery') }}
      </legend>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label
            for="co-name"
            :class="label"
          >{{ $t('checkout.fullName') }}</label>
          <input
            id="co-name"
            v-model="shipping.name"
            required
            autocomplete="name"
            :class="field"
          >
        </div>
        <div>
          <label
            for="co-phone"
            :class="label"
          >{{ $t('checkout.phone') }}</label>
          <input
            id="co-phone"
            v-model="shipping.phone"
            required
            type="tel"
            autocomplete="tel"
            placeholder="+212 6 12 34 56 78"
            dir="ltr"
            :class="field"
          >
        </div>
        <div>
          <label
            for="co-country"
            :class="label"
          >{{ $t('checkout.country') }}</label>
          <select
            id="co-country"
            v-model="shipping.country"
            autocomplete="country"
            :class="field"
          >
            <option
              v-for="c in options.countries"
              :key="c.code"
              :value="c.code"
            >
              {{ countryName(c) }}
            </option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label
            for="co-address"
            :class="label"
          >{{ $t('checkout.address') }}</label>
          <input
            id="co-address"
            v-model="shipping.address"
            required
            autocomplete="street-address"
            :placeholder="$t('checkout.addressPlaceholder')"
            :class="field"
          >
        </div>
        <div>
          <label
            for="co-city"
            :class="label"
          >{{ $t('checkout.city') }}</label>
          <input
            id="co-city"
            v-model="shipping.city"
            required
            autocomplete="address-level2"
            :class="field"
          >
        </div>
        <div>
          <label
            for="co-notes"
            :class="label"
          >{{ $t('checkout.notes') }} <span class="font-normal text-stone-400">{{ $t('checkout.optional') }}</span></label>
          <input
            id="co-notes"
            v-model="shipping.notes"
            :placeholder="$t('checkout.notesPlaceholder')"
            :class="field"
          >
        </div>
      </div>
    </fieldset>

    <fieldset class="space-y-3">
      <legend class="mb-1 font-serif text-2xl text-stone-900">
        {{ $t('checkout.payment') }}
      </legend>
      <label
        v-for="m in methods"
        :key="m.id"
        class="flex items-start gap-4 rounded-2xl bg-white p-4 ring-1 transition"
        :class="!m.available ? 'cursor-not-allowed opacity-55 ring-sand-200' : method === m.id ? 'cursor-pointer ring-2 ring-terra-600' : 'cursor-pointer ring-sand-300 hover:ring-terra-500'"
      >
        <input
          v-model="method"
          type="radio"
          name="payment-method"
          :value="m.id"
          :disabled="!m.available"
          class="mt-1 size-4 accent-terra-700"
        >
        <span class="grid size-10 shrink-0 place-items-center rounded-full bg-terra-50 text-terra-700">
          <UIcon
            :name="m.icon"
            class="size-5"
          />
        </span>
        <span class="min-w-0">
          <span class="block font-semibold text-stone-900">{{ m.title }}</span>
          <span class="block text-sm text-stone-600">{{ m.available ? m.body : m.reason }}</span>
        </span>
      </label>
    </fieldset>

    <div class="space-y-3">
      <p
        v-if="error"
        class="rounded-xl bg-sage-50 px-4 py-3 text-sm text-sage-800 ring-1 ring-sage-200"
        role="alert"
      >
        {{ error }}
      </p>
      <button
        type="submit"
        class="flex w-full items-center justify-center gap-2 rounded-full bg-terra-700 py-4 text-base font-semibold text-sand-50 shadow-[0_14px_30px_-14px_rgba(108,59,34,0.7)] transition hover:bg-terra-800 disabled:opacity-60"
        :disabled="pending || !method"
      >
        <UIcon
          :name="method === 'cod' ? 'i-lucide-check' : 'i-lucide-lock'"
          class="size-5"
        />
        {{ submitLabel }}
      </button>
      <p class="text-center text-xs text-stone-500">
        {{ $t('checkout.pricesNote') }}
        <template v-if="method === 'cod'">
          {{ $t('checkout.codNote') }}
        </template>
        <template v-else>
          {{ $t('checkout.onlineNote') }}
        </template>
      </p>
    </div>
  </form>
</template>
