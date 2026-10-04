<script setup lang="ts">
import type { CheckoutDetails } from '~/composables/useCart'

definePageMeta({ middleware: 'auth' })

const { data: me } = useMe()
const firstName = computed(() => me.value?.user?.name?.split(' ')[0] ?? '')
const { data: catalog } = await useCatalog()
const { bundleSummary, selection } = useSubscriptionBuilder(catalog.value.products, catalog.value.plans)

const { submit, pending, error } = useCheckout('/api/checkout')

function placeOrder(details: CheckoutDetails) {
  submit({ selection: selection.value, ...details })
}

useSeoMeta({ title: 'Checkout · illi', robots: 'noindex' })
</script>

<template>
  <div class="maghreb-wash">
    <div class="mx-auto max-w-2xl px-5 py-16 sm:py-20">
      <AppBreadcrumbs
        class="mb-10 justify-center"
        :items="[{ label: 'Home', to: '/' }, { label: 'Build your box', to: '/subscribe' }, { label: 'Checkout' }]"
      />
      <div class="reveal text-center">
        <BrandLogo
          variant="mark"
          class="text-6xl"
        />
        <p class="mt-6 font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.3em] text-saffron-600">
          You're in{{ firstName ? `, ${firstName}` : '' }}
        </p>
        <h1 class="mt-3 font-[family:var(--font-serif)] text-4xl leading-tight text-stone-900 sm:text-5xl">
          Your box is ready.
        </h1>
        <p class="mx-auto mt-4 max-w-md text-base leading-7 text-stone-600">
          Check your picks, add your delivery details and choose how to pay — cash on delivery or online.
          Each renewal is paid the same way.
        </p>
      </div>

      <div
        v-if="bundleSummary"
        class="reveal mt-10 rounded-3xl bg-white ring-1 ring-sand-200 p-7"
        style="animation-delay:.1s"
      >
        <div class="flex items-center justify-between border-b border-sand-600/15 pb-4">
          <div>
            <p class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.18em] text-stone-500">
              {{ bundleSummary.cadence }}
            </p>
            <p class="mt-1 font-[family:var(--font-serif)] text-2xl text-stone-900">
              {{ bundleSummary.planName }}
            </p>
          </div>
          <p class="font-[family:var(--font-mono)] text-lg text-olive-700">
            {{ bundleSummary.basePriceAmount }} {{ bundleSummary.currency }}
          </p>
        </div>

        <ul class="mt-4 space-y-2">
          <li
            v-for="item in bundleSummary.selectionItems"
            :key="item.slotId"
            class="flex items-start justify-between gap-3 text-sm leading-7"
          >
            <span class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.12em] text-stone-500">
              {{ item.slotLabel }}
            </span>
            <span class="text-right text-stone-700">
              {{ item.productNames.length ? item.productNames.join(', ') : '—' }}
            </span>
          </li>
        </ul>

        <NuxtLink
          to="/subscribe"
          class="mt-5 inline-flex text-sm font-semibold text-olive-700 hover:underline"
        >
          Change your picks
        </NuxtLink>
      </div>

      <section
        v-if="bundleSummary?.isReadyForCheckout"
        class="reveal mt-8 rounded-3xl bg-sand-50 p-6 ring-1 ring-sand-200 sm:p-8"
        style="animation-delay:.15s"
      >
        <CheckoutForm
          :total="bundleSummary.basePriceAmount"
          :pending="pending"
          :error="error"
          @submit="placeOrder"
        />
      </section>
      <p
        v-else
        class="mt-8 rounded-2xl bg-saffron-50 p-5 text-center text-stone-700 ring-1 ring-saffron-200"
      >
        Your box isn't complete yet. <NuxtLink
          to="/subscribe"
          class="font-semibold text-olive-700 underline"
        >Finish choosing</NuxtLink> to check out.
      </p>
    </div>
  </div>
</template>
