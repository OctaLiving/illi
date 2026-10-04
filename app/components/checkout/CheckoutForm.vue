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

const METHOD_INFO: Record<PaymentMethod, { title: string, body: string, icon: string }> = {
  cod: { title: 'Cash on delivery', body: 'Pay the courier in cash when your order arrives.', icon: 'i-lucide-banknote' },
  card: { title: 'Card', body: 'Visa, Mastercard, Apple Pay and Google Pay.', icon: 'i-lucide-credit-card' },
  crypto: { title: 'Crypto', body: 'USDT, Bitcoin and more through a secure crypto checkout.', icon: 'i-lucide-bitcoin' }
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
      ...METHOD_INFO[id],
      available: option.available && !blockedByCountry,
      reason: blockedByCountry ? 'Only available for delivery in Morocco.' : option.reason
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
  if (pending) return method.value === 'cod' ? 'Placing your order…' : 'Starting payment…'
  return method.value === 'cod' ? `Place order · ${total} MAD` : `Continue to payment · ${total} MAD`
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

const field = 'w-full rounded-xl border-0 bg-white px-4 py-3 text-stone-900 ring-1 ring-sand-300 transition placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-olive-600'
const label = 'mb-1.5 block text-sm font-semibold text-stone-700'
</script>

<template>
  <form
    class="space-y-8"
    @submit.prevent="onSubmit"
  >
    <fieldset class="space-y-4">
      <legend class="font-serif text-2xl text-stone-900">
        Delivery details
      </legend>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label
            for="co-name"
            :class="label"
          >Full name</label>
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
          >Phone</label>
          <input
            id="co-phone"
            v-model="shipping.phone"
            required
            type="tel"
            autocomplete="tel"
            placeholder="+212 6 12 34 56 78"
            :class="field"
          >
        </div>
        <div>
          <label
            for="co-country"
            :class="label"
          >Country</label>
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
              {{ c.name }}
            </option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label
            for="co-address"
            :class="label"
          >Address</label>
          <input
            id="co-address"
            v-model="shipping.address"
            required
            autocomplete="street-address"
            placeholder="Street, building, apartment"
            :class="field"
          >
        </div>
        <div>
          <label
            for="co-city"
            :class="label"
          >City</label>
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
          >Notes for the courier <span class="font-normal text-stone-400">(optional)</span></label>
          <input
            id="co-notes"
            v-model="shipping.notes"
            placeholder="Floor, landmark, best time to call"
            :class="field"
          >
        </div>
      </div>
    </fieldset>

    <fieldset class="space-y-3">
      <legend class="mb-1 font-serif text-2xl text-stone-900">
        Payment
      </legend>
      <label
        v-for="m in methods"
        :key="m.id"
        class="flex items-start gap-4 rounded-2xl bg-white p-4 ring-1 transition"
        :class="!m.available ? 'cursor-not-allowed opacity-55 ring-sand-200' : method === m.id ? 'cursor-pointer ring-2 ring-olive-600' : 'cursor-pointer ring-sand-300 hover:ring-olive-500'"
      >
        <input
          v-model="method"
          type="radio"
          name="payment-method"
          :value="m.id"
          :disabled="!m.available"
          class="mt-1 size-4 accent-olive-700"
        >
        <span class="grid size-10 shrink-0 place-items-center rounded-full bg-olive-50 text-olive-700">
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
        class="rounded-xl bg-saffron-50 px-4 py-3 text-sm text-saffron-800 ring-1 ring-saffron-200"
        role="alert"
      >
        {{ error }}
      </p>
      <button
        type="submit"
        class="flex w-full items-center justify-center gap-2 rounded-full bg-olive-700 py-4 text-base font-semibold text-sand-50 shadow-[0_14px_30px_-14px_rgba(47,74,41,0.8)] transition hover:bg-olive-800 disabled:opacity-60"
        :disabled="pending || !method"
      >
        <UIcon
          :name="method === 'cod' ? 'i-lucide-check' : 'i-lucide-lock'"
          class="size-5"
        />
        {{ submitLabel }}
      </button>
      <p class="text-center text-xs text-stone-500">
        Prices in Moroccan dirhams (MAD).
        <template v-if="method === 'cod'">
          You pay the courier when your order arrives.
        </template>
        <template v-else>
          You'll be taken to a secure payment page.
        </template>
      </p>
    </div>
  </form>
</template>
