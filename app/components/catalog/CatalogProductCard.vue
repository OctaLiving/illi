<script setup lang="ts">
import type { CatalogProduct } from '~/types/catalog'

const { product } = defineProps<{ product: CatalogProduct }>()

const { add } = useCart()
const justAdded = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function addToCart() {
  add(product.id)
  justAdded.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (justAdded.value = false), 1600)
}
</script>

<template>
  <article class="group relative flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-sand-200 transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-28px_rgba(46,39,27,0.45)] hover:ring-sand-300">
    <NuxtLink
      :to="`/catalog/${product.slug}`"
      class="relative block aspect-square overflow-hidden bg-white"
    >
      <img
        :src="product.image.src"
        :alt="product.image.alt"
        class="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
        loading="lazy"
      >
      <span
        v-if="product.storage === 'Refrigerated'"
        class="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[0.7rem] font-semibold text-olive-800 shadow-sm backdrop-blur"
      >Fresh · chilled</span>
      <span
        v-if="!product.isAvailable"
        class="absolute inset-x-3 bottom-3 rounded-full bg-stone-900/80 py-1.5 text-center text-xs font-semibold text-sand-50"
      >Back soon</span>
    </NuxtLink>

    <div class="flex flex-1 flex-col gap-3 p-3.5 sm:p-5">
      <div>
        <p class="truncate text-[0.65rem] font-bold uppercase tracking-[0.12em] text-saffron-700 sm:text-[0.7rem]">
          {{ product.category }}
        </p>
        <h3 class="mt-1 font-serif text-lg leading-tight text-stone-900 sm:text-2xl">
          <NuxtLink
            :to="`/catalog/${product.slug}`"
            class="after:absolute after:inset-0 after:content-['']"
          >
            {{ product.name }}
          </NuxtLink>
        </h3>
        <p class="mt-1.5 hidden text-sm leading-6 text-stone-600 sm:block">
          <span class="line-clamp-2">{{ product.description }}</span>
        </p>
      </div>

      <div class="mt-auto flex items-center justify-between gap-3 pt-1">
        <p class="leading-tight">
          <span class="whitespace-nowrap text-base font-bold text-stone-900 sm:text-lg">{{ product.price.amount }} MAD</span>
          <span class="block text-xs text-stone-500">per {{ product.defaultUnitLabel }}</span>
        </p>
        <button
          type="button"
          class="relative z-10 inline-flex size-10 shrink-0 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 sm:size-auto sm:px-4 sm:py-2.5"
          :class="justAdded ? 'bg-saffron-400 text-olive-950' : 'bg-olive-700 text-sand-50 hover:bg-olive-800'"
          :disabled="!product.isAvailable || product.price.amount <= 0"
          :aria-label="`Add ${product.name} to cart`"
          @click="addToCart"
        >
          <UIcon
            :name="justAdded ? 'i-lucide-check' : 'i-lucide-plus'"
            class="size-4"
          />
          <span class="hidden sm:inline">{{ justAdded ? 'Added' : 'Add' }}</span>
        </button>
      </div>
    </div>
  </article>
</template>
