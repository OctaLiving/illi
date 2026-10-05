<script setup lang="ts">
import type { CheckoutDetails } from '~/composables/useCart'

const { lines, count, subtotal, items, clear } = useCart()
const { submit, pending, error } = useCheckout('/api/checkout/cart')
const { data: me } = useMe()
const { t } = useI18n()
const { price } = useLocalized()

function placeOrder(details: CheckoutDetails) {
  submit({ items: items.value, ...details }, clear)
}

useSeoMeta({ title: () => t('checkout.title'), robots: 'noindex' })
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <h1 class="font-serif text-4xl text-stone-900 sm:text-5xl">
      {{ $t('checkout.title') }}
    </h1>

    <ClientOnly>
      <div
        v-if="lines.length === 0"
        class="mt-10 rounded-3xl bg-sand-50 p-10 text-center ring-1 ring-sand-200"
      >
        <p class="font-serif text-2xl text-stone-900">
          {{ $t('cart.empty') }}
        </p>
        <p class="mt-2 text-stone-600">
          {{ $t('checkout.emptyBody') }}
        </p>
        <NuxtLinkLocale
          to="/catalog"
          class="mt-6 inline-flex rounded-full bg-terra-700 px-6 py-3 text-sm font-semibold text-sand-50 transition hover:bg-terra-800"
        >
          {{ $t('cart.shop') }}
        </NuxtLinkLocale>
      </div>

      <div
        v-else
        class="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start"
      >
        <!-- Order summary -->
        <section class="rounded-3xl bg-sand-50 px-6 pb-2 pt-5 ring-1 ring-sand-200 lg:sticky lg:top-28">
          <div class="flex items-baseline justify-between">
            <h2 class="font-serif text-2xl text-stone-900">
              {{ $t('checkout.yourOrder') }}
            </h2>
            <NuxtLinkLocale
              to="/catalog"
              class="text-sm font-semibold text-terra-700 hover:underline"
            >
              {{ $t('checkout.addMore') }}
            </NuxtLinkLocale>
          </div>
          <CartLines />
          <div class="flex items-baseline justify-between border-t border-sand-200 py-4">
            <span class="text-stone-600">{{ $t('checkout.items', { n: count }, count) }}</span>
            <span class="font-serif text-3xl text-stone-900">{{ price(subtotal) }}</span>
          </div>
        </section>

        <!-- Details + payment -->
        <section class="rounded-3xl bg-sand-50 p-6 ring-1 ring-sand-200 sm:p-8">
          <CheckoutForm
            v-if="me?.user"
            :total="subtotal"
            :pending="pending"
            :error="error"
            @submit="placeOrder"
          />
          <div
            v-else
            class="space-y-4 text-center"
          >
            <p class="font-serif text-2xl text-stone-900">
              {{ $t('checkout.signInTitle') }}
            </p>
            <p class="text-stone-600">
              {{ $t('checkout.signInBody') }}
            </p>
            <div class="flex flex-wrap justify-center gap-3">
              <NuxtLinkLocale
                to="/join?next=/cart"
                class="rounded-full bg-terra-700 px-6 py-3 font-semibold text-sand-50 transition hover:bg-terra-800"
              >
                {{ $t('checkout.createAccount') }}
              </NuxtLinkLocale>
              <NuxtLinkLocale
                to="/login?next=/cart"
                class="rounded-full bg-sand-50 px-6 py-3 font-semibold text-terra-800 ring-1 ring-sand-300 transition hover:ring-terra-600"
              >
                {{ $t('checkout.signIn') }}
              </NuxtLinkLocale>
            </div>
          </div>
        </section>
      </div>
    </ClientOnly>
  </div>
</template>
