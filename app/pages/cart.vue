<script setup lang="ts">
import type { CheckoutDetails } from '~/composables/useCart'

const { lines, count, subtotal, items, clear } = useCart()
const { submit, pending, error } = useCheckout('/api/checkout/cart')
const { data: me } = useMe()

function placeOrder(details: CheckoutDetails) {
  submit({ items: items.value, ...details }, clear)
}

useSeoMeta({ title: 'Checkout', robots: 'noindex' })
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <h1 class="font-serif text-4xl text-stone-900 sm:text-5xl">
      Checkout
    </h1>

    <ClientOnly>
      <div
        v-if="lines.length === 0"
        class="mt-10 rounded-3xl bg-white p-10 text-center ring-1 ring-sand-200"
      >
        <p class="font-serif text-2xl text-stone-900">
          Your cart is empty
        </p>
        <p class="mt-2 text-stone-600">
          Browse the pantry and add a jar or two.
        </p>
        <NuxtLink
          to="/catalog"
          class="mt-6 inline-flex rounded-full bg-olive-700 px-6 py-3 text-sm font-semibold text-sand-50 transition hover:bg-olive-800"
        >
          Shop the pantry
        </NuxtLink>
      </div>

      <div
        v-else
        class="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start"
      >
        <!-- Order summary -->
        <section class="rounded-3xl bg-white px-6 pb-2 pt-5 ring-1 ring-sand-200 lg:sticky lg:top-28">
          <div class="flex items-baseline justify-between">
            <h2 class="font-serif text-2xl text-stone-900">
              Your order
            </h2>
            <NuxtLink
              to="/catalog"
              class="text-sm font-semibold text-olive-700 hover:underline"
            >
              Add more
            </NuxtLink>
          </div>
          <CartLines />
          <div class="flex items-baseline justify-between border-t border-sand-200 py-4">
            <span class="text-stone-600">{{ count }} {{ count === 1 ? 'item' : 'items' }}</span>
            <span class="font-serif text-3xl text-stone-900">{{ subtotal }} MAD</span>
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
              Sign in to check out
            </p>
            <p class="text-stone-600">
              It takes a minute, and you can track your orders afterwards. Your cart is saved.
            </p>
            <div class="flex flex-wrap justify-center gap-3">
              <NuxtLink
                to="/join?next=/cart"
                class="rounded-full bg-olive-700 px-6 py-3 font-semibold text-sand-50 transition hover:bg-olive-800"
              >
                Create an account
              </NuxtLink>
              <NuxtLink
                to="/login?next=/cart"
                class="rounded-full bg-white px-6 py-3 font-semibold text-olive-800 ring-1 ring-sand-300 transition hover:ring-olive-600"
              >
                Sign in
              </NuxtLink>
            </div>
          </div>
        </section>
      </div>
    </ClientOnly>
  </div>
</template>
