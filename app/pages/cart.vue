<script setup lang="ts">
const { lines, count, subtotal, items, clear } = useCart()
const { checkout, pending, error } = useCheckout()
const { data: me } = useMe()

useSeoMeta({ title: 'Your cart', robots: 'noindex' })
</script>

<template>
  <div class="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
    <h1 class="font-serif text-4xl text-stone-900 sm:text-5xl">
      Your cart
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
        class="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start"
      >
        <div class="rounded-3xl bg-white px-6 ring-1 ring-sand-200">
          <CartLines />
        </div>

        <aside class="space-y-4 rounded-3xl bg-white p-6 ring-1 ring-sand-200 lg:sticky lg:top-28">
          <div class="flex items-baseline justify-between text-stone-600">
            <span>{{ count }} {{ count === 1 ? 'item' : 'items' }}</span>
            <span class="font-serif text-3xl text-stone-900">{{ subtotal }} MAD</span>
          </div>
          <p
            v-if="error"
            class="rounded-xl bg-saffron-50 px-3 py-2 text-sm text-saffron-800"
          >
            {{ error }}
          </p>
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-full bg-olive-700 py-4 text-base font-semibold text-sand-50 transition hover:bg-olive-800 disabled:opacity-60"
            :disabled="pending"
            @click="checkout(items, clear)"
          >
            <UIcon
              name="i-lucide-lock"
              class="size-4"
            />
            {{ pending ? 'Starting checkout…' : me?.user ? 'Checkout' : 'Sign in to checkout' }}
          </button>
          <ul class="space-y-2 text-sm text-stone-600">
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-shield-check"
                class="mt-0.5 size-4 text-olive-600"
              />Secure payment in crypto
            </li>
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-leaf"
                class="mt-0.5 size-4 text-olive-600"
              />Made in small batches in Casablanca
            </li>
          </ul>
          <NuxtLink
            to="/catalog"
            class="block text-center text-sm font-semibold text-olive-700 hover:underline"
          >
            Continue shopping
          </NuxtLink>
        </aside>
      </div>
    </ClientOnly>
  </div>
</template>
