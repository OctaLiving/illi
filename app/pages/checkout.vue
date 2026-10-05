<script setup lang="ts">
import type { CheckoutDetails } from '~/composables/useCart'

definePageMeta({ middleware: 'auth' })

const { data: me } = useMe()
const firstName = computed(() => me.value?.user?.name?.split(' ')[0] ?? '')
const { data: catalog } = await useCatalog()
const { t } = useI18n()
const { price } = useLocalized()
const { productName, planName, slotLabel } = useCatalogText()
const { bundleSummary, selection } = useSubscriptionBuilder(catalog.value.products, catalog.value.plans)

const { submit, pending, error } = useCheckout('/api/checkout')

function placeOrder(details: CheckoutDetails) {
  submit({ selection: selection.value, ...details })
}

useSeoMeta({ title: () => t('box.checkoutTitle'), robots: 'noindex' })
</script>

<template>
  <div class="maghreb-wash">
    <div class="mx-auto max-w-2xl px-5 py-16 sm:py-20">
      <AppBreadcrumbs
        class="mb-10 justify-center"
        :items="[{ label: $t('box.crumbHome'), to: '/' }, { label: $t('box.crumbBuild'), to: '/subscribe' }, { label: $t('box.checkoutTitle') }]"
      />
      <div class="reveal text-center">
        <BrandLogo
          variant="mark"
          class="text-6xl"
        />
        <p class="mt-6 font-mono text-[0.66rem] uppercase tracking-[0.3em] text-sage-600">
          {{ firstName ? $t('box.youreInName', { name: firstName }) : $t('box.youreIn') }}
        </p>
        <h1 class="mt-3 font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
          {{ $t('box.ready') }}
        </h1>
        <p class="mx-auto mt-4 max-w-md text-base leading-7 text-stone-600">
          {{ $t('box.readyBody') }}
        </p>
      </div>

      <div
        v-if="bundleSummary"
        class="reveal mt-10 rounded-3xl bg-sand-50 ring-1 ring-sand-200 p-7"
        style="animation-delay:.1s"
      >
        <div class="flex items-center justify-between border-b border-sand-600/15 pb-4">
          <div>
            <p class="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-stone-500">
              {{ $t(`cadenceTitle.${bundleSummary.cadence}`) }}
            </p>
            <p class="mt-1 font-serif text-2xl text-stone-900">
              {{ planName(bundleSummary.planId, bundleSummary.planName) }}
            </p>
          </div>
          <p class="font-mono text-lg text-terra-700">
            {{ price(bundleSummary.basePriceAmount) }}
          </p>
        </div>

        <ul class="mt-4 space-y-2">
          <li
            v-for="item in bundleSummary.selectionItems"
            :key="item.slotId"
            class="flex items-start justify-between gap-3 text-sm leading-7"
          >
            <span class="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-stone-500">
              {{ slotLabel(bundleSummary.planId, item.slotId, item.slotLabel) }}
            </span>
            <span class="text-end text-stone-700">
              {{ item.productIds.length ? item.productIds.map((id, i) => productName(id, item.productNames[i] ?? id)).join($t('common.listSep')) : '—' }}
            </span>
          </li>
        </ul>

        <NuxtLinkLocale
          to="/subscribe"
          class="mt-5 inline-flex text-sm font-semibold text-terra-700 hover:underline"
        >
          {{ $t('box.changePicks') }}
        </NuxtLinkLocale>
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
        class="mt-8 rounded-2xl bg-sage-50 p-5 text-center text-stone-700 ring-1 ring-sage-200"
      >
        {{ $t('box.incompleteA') }} <NuxtLinkLocale
          to="/subscribe"
          class="font-semibold text-terra-700 underline"
        >
          {{ $t('box.finish') }}
        </NuxtLinkLocale> {{ $t('box.incompleteB') }}
      </p>
    </div>
  </div>
</template>
