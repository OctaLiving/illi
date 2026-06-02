<script setup lang="ts">
import type { CatalogProduct } from '~/types/catalog'
import { getEligiblePlansForProduct } from '~/utils/catalog'

const { data: catalog } = await useCatalog()
const catalogProducts = computed(() => catalog.value.products)
const subscriptionPlans = computed(() => catalog.value.plans)

const groups = computed(() =>
  catalog.value.categories
    .map(category => ({
      category,
      products: catalog.value.products.filter(product => product.eligibleSlotTypes.includes(category.slug))
    }))
    .filter(group => group.products.length > 0)
)

function matchedPlanCount(product: CatalogProduct) {
  return getEligiblePlansForProduct(product, catalog.value.plans).length
}

useSeoMeta({
  title: 'The collection',
  description: 'Browse the preserved foods and pantry staples available for customization inside illi subscription plans.'
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="maghreb-wash relative overflow-hidden border-b border-amber-600/15">
      <div class="mx-auto grid max-w-6xl items-end gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p
            class="reveal inline-flex items-center gap-3 font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.3em] text-indigo-700"
            style="animation-delay:.05s"
          >
            <span class="h-px w-8 bg-terra-600" />
            The collection
          </p>
          <h1
            class="reveal mt-6 max-w-3xl font-[family:var(--font-serif)] text-5xl font-normal leading-[1.0] tracking-tight text-stone-900 sm:text-6xl"
            style="animation-delay:.16s"
          >
            Preserved foods for the <em class="italic text-terra-600">season.</em>
          </h1>
          <p
            class="reveal mt-6 max-w-xl text-lg leading-8 text-stone-700"
            style="animation-delay:.26s"
          >
            The illi collection is intentionally narrow: products that keep well, belong in a recurring
            household ritual, and fit into a curated subscription with clear rules.
          </p>
          <div
            class="reveal mt-8 flex flex-wrap gap-3"
            style="animation-delay:.36s"
          >
            <NuxtLink
              to="/subscribe"
              class="inline-flex items-center gap-2 rounded-sm bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-amber-50 transition hover:bg-indigo-700"
            >
              Shape a subscription
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4"
              />
            </NuxtLink>
            <NuxtLink
              to="/"
              class="inline-flex items-center gap-2 rounded-sm border border-indigo-600 px-6 py-3.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-600/8"
            >
              Back to brand story
            </NuxtLink>
          </div>
        </div>

        <div
          class="reveal grid gap-px overflow-hidden rounded-md border border-amber-600/40 bg-amber-600/40"
          style="animation-delay:.3s"
        >
          <div class="grid grid-cols-3 gap-px bg-amber-600/40">
            <div class="bg-[#f4ecdd] p-5">
              <p class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-terra-600">
                Products
              </p>
              <p class="mt-2 font-[family:var(--font-serif)] text-4xl text-stone-900">
                {{ catalogProducts.length }}
              </p>
            </div>
            <div class="bg-[#f4ecdd] p-5">
              <p class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-terra-600">
                Categories
              </p>
              <p class="mt-2 font-[family:var(--font-serif)] text-4xl text-stone-900">
                {{ groups.length }}
              </p>
            </div>
            <div class="bg-[#f4ecdd] p-5">
              <p class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-terra-600">
                Plans
              </p>
              <p class="mt-2 font-[family:var(--font-serif)] text-4xl text-stone-900">
                {{ subscriptionPlans.length }}
              </p>
            </div>
          </div>
          <div class="bg-[#f4ecdd] p-6">
            <p class="text-sm leading-7 text-stone-600">
              Every item already knows its category — from live ferments to marinated fish. That
              compatibility becomes the basis for the subscription builder.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Grouped grid -->
    <section class="mx-auto max-w-6xl space-y-20 px-5 py-16 sm:px-8 sm:py-20">
      <div
        v-for="group in groups"
        :key="group.category.slug"
        class="scroll-mt-24"
      >
        <div class="flex flex-col gap-2 border-b border-amber-600/20 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.24em] text-terra-600">
              {{ group.products.length }} {{ group.products.length === 1 ? 'product' : 'products' }}
            </p>
            <h2 class="mt-1 font-[family:var(--font-serif)] text-4xl text-stone-900">
              {{ group.category.name }}
            </h2>
          </div>
          <p class="max-w-md text-sm leading-7 text-stone-600 sm:text-right">
            {{ group.category.blurb }}
          </p>
        </div>

        <div class="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          <CatalogProductCard
            v-for="product in group.products"
            :key="product.id"
            :product="product"
            :matched-plan-count="matchedPlanCount(product)"
          />
        </div>
      </div>
    </section>
  </div>
</template>
