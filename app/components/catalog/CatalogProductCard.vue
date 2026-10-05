<script setup lang="ts">
import type { CatalogProduct } from '~/types/catalog'

const { product } = defineProps<{ product: CatalogProduct }>()

const { add } = useCart()
const { tr, price } = useLocalized()
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
  <article class="group relative flex flex-col overflow-hidden rounded-3xl bg-sand-50 ring-1 ring-sand-200 transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-28px_rgba(46,39,27,0.45)] hover:ring-sand-300">
    <NuxtLinkLocale
      :to="`/catalog/${product.slug}`"
      class="relative block aspect-square overflow-hidden bg-sand-50"
    >
      <img
        :src="product.image.src"
        :alt="tr(product, 'name')"
        class="ivory-photo size-full object-cover transition duration-500 group-hover:scale-[1.04]"
        loading="lazy"
      >
      <span
        v-if="product.storage === 'Refrigerated'"
        class="absolute left-3 top-3 rounded-full bg-sand-50/90 px-2.5 py-1 text-[0.7rem] font-semibold text-terra-800 shadow-sm backdrop-blur"
      >{{ $t('product.fresh') }}</span>
      <span
        v-if="!product.isAvailable"
        class="absolute inset-x-3 bottom-3 rounded-full bg-stone-900/80 py-1.5 text-center text-xs font-semibold text-sand-50"
      >{{ $t('product.backSoon') }}</span>
    </NuxtLinkLocale>

    <div class="flex flex-1 flex-col gap-3 p-3.5 sm:p-5">
      <div>
        <p class="truncate text-[0.65rem] font-bold uppercase tracking-[0.12em] text-sage-700 sm:text-[0.7rem]">
          {{ tr(product, 'category') }}
        </p>
        <h3 class="mt-1 font-serif text-lg leading-tight text-stone-900 sm:text-2xl">
          <NuxtLinkLocale
            :to="`/catalog/${product.slug}`"
            class="after:absolute after:inset-0 after:content-['']"
          >
            {{ tr(product, 'name') }}
          </NuxtLinkLocale>
        </h3>
        <p class="mt-1.5 hidden text-sm leading-6 text-stone-600 sm:block">
          <span class="line-clamp-2">{{ tr(product, 'description') }}</span>
        </p>
      </div>

      <div class="mt-auto flex items-center justify-between gap-3 pt-1">
        <p class="leading-tight">
          <span class="whitespace-nowrap text-base font-bold text-stone-900 sm:text-lg">{{ price(product.price.amount) }}</span>
          <span class="block text-xs text-stone-500">{{ $t('product.per', { unit: $t(`units.${product.defaultUnitLabel}`, product.defaultUnitLabel) }) }}</span>
        </p>
        <button
          type="button"
          class="relative z-10 inline-flex size-10 shrink-0 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 sm:size-auto sm:px-4 sm:py-2.5"
          :class="justAdded ? 'bg-sage-700 text-sand-50' : 'bg-terra-700 text-sand-50 hover:bg-terra-800'"
          :disabled="!product.isAvailable || product.price.amount <= 0"
          :aria-label="$t('product.addAria', { name: tr(product, 'name') })"
          @click="addToCart"
        >
          <UIcon
            :name="justAdded ? 'i-lucide-check' : 'i-lucide-plus'"
            class="size-4"
          />
          <span class="hidden sm:inline">{{ justAdded ? $t('product.added') : $t('product.add') }}</span>
        </button>
      </div>
    </div>
  </article>
</template>
