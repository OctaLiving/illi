<script setup lang="ts">
import type { CatalogProduct } from '~/types/catalog'

const { product, matchedPlanCount = 0 } = defineProps<{
  product: CatalogProduct
  matchedPlanCount?: number
}>()
</script>

<template>
  <NuxtLink
    :to="`/catalog/${product.slug}`"
    class="group block"
  >
    <div class="arch border-[1.5px] border-amber-600/40 bg-gradient-to-b from-amber-50 to-stone-100 p-2.5 transition group-hover:-translate-y-1 group-hover:border-terra-600/60 group-hover:shadow-[0_30px_55px_-32px_rgba(42,29,18,0.5)]">
      <div class="arch-inner aspect-[4/5] overflow-hidden bg-stone-100">
        <img
          :src="product.image.src"
          :alt="product.image.alt"
          class="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
        >
      </div>
    </div>

    <div class="mt-4 space-y-3 px-1">
      <div class="flex flex-wrap items-center gap-2 font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.18em]">
        <span
          v-for="slotType in product.eligibleSlotTypes"
          :key="slotType"
          class="rounded-sm bg-terra-600/10 px-2 py-1 text-terra-700"
        >
          {{ slotType }} slot
        </span>
        <span
          v-if="product.isAvailable"
          class="text-stone-400"
        >· available</span>
      </div>

      <div>
        <h3 class="font-[family:var(--font-serif)] text-2xl text-stone-900">{{ product.name }}</h3>
        <p class="mt-0.5 font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.16em] text-stone-500">{{ product.subtitle }}</p>
      </div>

      <p class="line-clamp-2 text-sm leading-6 text-stone-600">{{ product.description }}</p>

      <div class="flex items-center justify-between border-t border-amber-600/20 pt-3 font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.14em] text-stone-500">
        <span>{{ product.defaultUnitLabel }}</span>
        <span>{{ matchedPlanCount }} plan{{ matchedPlanCount === 1 ? '' : 's' }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
