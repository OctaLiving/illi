<script setup lang="ts">
import type { CatalogProduct } from '~/types/catalog'

const { data: catalog } = await useCatalog()
const { t } = useI18n()
const { tr, price } = useLocalized()

const bySlug = (slug: string) => catalog.value.products.find(p => p.slug === slug && p.isAvailable)

// Hand-picked favourites, topped up from the rest of the catalog if any are missing.
const FEATURED = ['amlou', 'marinated-sardines', 'pistachio-butter', 'kombucha', 'sun-dried-tomatoes', 'spread-cheese', 'marinated-olives', 'pomegranate-concentrate']
const featured = computed<CatalogProduct[]>(() => {
  const picked = FEATURED.map(bySlug).filter((p): p is CatalogProduct => Boolean(p))
  const rest = catalog.value.products.filter(p => p.isAvailable && !picked.includes(p))
  return [...picked, ...rest].slice(0, 8)
})

const heroProducts = computed(() =>
  ['marinated-olives', 'amlou', 'water-kefir'].map(bySlug).filter((p): p is CatalogProduct => Boolean(p))
)

// One photo per category for the "shop by category" tiles.
const categoryTiles = computed(() =>
  catalog.value.categories.map(category => ({
    category,
    image: catalog.value.products.find(p => p.eligibleSlotTypes.includes(category.slug) && !p.image.src.endsWith('.svg'))?.image
  }))
)

const lowestPrice = computed(() => {
  const prices = catalog.value.products.filter(p => p.isAvailable && p.price.amount > 0).map(p => p.price.amount)
  return prices.length ? Math.min(...prices) : 0
})

const values = [
  { icon: 'i-lucide-sprout', key: 'sourced' },
  { icon: 'i-lucide-flask-conical', key: 'old' },
  { icon: 'i-lucide-ban', key: 'nothing' }
]

useSeoMeta({
  title: () => t('meta.title'),
  description: () => t('meta.description')
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="maghreb-wash overflow-hidden">
      <div class="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p
            class="eyebrow reveal"
            style="animation-delay:.05s"
          >
            {{ $t('home.eyebrow') }}
          </p>
          <h1
            class="reveal mt-5 font-serif text-5xl leading-[1.02] text-stone-900 sm:text-7xl"
            style="animation-delay:.12s"
          >
            {{ $t('home.titleA') }} <em class="font-script text-[1.5em] leading-[0.7] font-bold not-italic text-terra-700 rtl:text-[1em] rtl:leading-[inherit]">{{ $t('home.titleB') }}</em>
          </h1>
          <p
            class="reveal mt-6 max-w-xl text-lg leading-8 text-stone-600"
            style="animation-delay:.2s"
          >
            {{ $t('home.intro') }}
          </p>
          <div
            class="reveal mt-8 flex flex-wrap items-center gap-3"
            style="animation-delay:.28s"
          >
            <NuxtLinkLocale
              to="/catalog"
              class="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-terra-700 px-6 py-4 text-base font-semibold text-sand-50 shadow-[0_14px_30px_-14px_rgba(108,59,34,0.7)] transition hover:bg-terra-800 sm:flex-none sm:px-7"
            >
              {{ $t('home.shop') }}
              <UIcon
                name="i-lucide-arrow-right"
                class="flip-rtl size-5"
              />
            </NuxtLinkLocale>
            <NuxtLinkLocale
              to="/subscribe"
              class="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-4 text-base font-semibold text-terra-800 ring-1 ring-sand-300 transition hover:ring-terra-600 sm:flex-none sm:px-7"
            >
              {{ $t('home.buildBox') }}
            </NuxtLinkLocale>
          </div>
          <p
            v-if="lowestPrice"
            class="reveal mt-4 text-sm text-stone-500"
            style="animation-delay:.32s"
          >
            {{ $t('home.jarsFrom', { price: price(lowestPrice) }) }}
          </p>

          <ul
            class="reveal mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-sand-300 pt-6 text-xs text-stone-700 sm:text-sm"
            style="animation-delay:.38s"
          >
            <li class="flex flex-col gap-1.5">
              <UIcon
                name="i-lucide-leaf"
                class="size-5 text-terra-600"
              />{{ $t('home.smallBatches') }}
            </li>
            <li class="flex flex-col gap-1.5">
              <UIcon
                name="i-lucide-list-checks"
                class="size-5 text-terra-600"
              />{{ $t('home.shortLists') }}
            </li>
            <li class="flex flex-col gap-1.5">
              <UIcon
                name="i-lucide-map-pin"
                class="size-5 text-terra-600"
              />{{ $t('common.madeInCasablanca') }}
            </li>
          </ul>
        </div>

        <!-- Photo trio -->
        <div
          class="reveal relative mx-auto grid w-full max-w-sm grid-cols-2 gap-3 sm:max-w-lg sm:gap-4"
          style="animation-delay:.18s"
        >
          <NuxtLinkLocale
            v-if="heroProducts[0]"
            :to="`/catalog/${heroProducts[0].slug}`"
            class="arch row-span-2 overflow-hidden bg-white shadow-[0_40px_70px_-40px_rgba(46,39,27,0.6)] ring-1 ring-sand-200"
          >
            <img
              :src="heroProducts[0].image.src"
              :alt="tr(heroProducts[0], 'name')"
              class="size-full object-cover"
            >
          </NuxtLinkLocale>
          <NuxtLinkLocale
            v-for="p in heroProducts.slice(1)"
            :key="p.id"
            :to="`/catalog/${p.slug}`"
            class="overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-40px_rgba(46,39,27,0.6)] ring-1 ring-sand-200"
          >
            <img
              :src="p.image.src"
              :alt="tr(p, 'name')"
              class="aspect-square size-full object-cover"
            >
          </NuxtLinkLocale>
          <div class="wax-seal stamp-in absolute -end-3 -top-6 [--seal-size:5.5rem] sm:-end-8 sm:[--seal-size:6.5rem]">
            <span>{{ $t('home.sealLine1') }}<br>{{ $t('home.sealLine2') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Shop by category -->
    <section class="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
      <div class="flex items-end justify-between gap-4">
        <h2 class="font-serif text-3xl text-stone-900 sm:text-4xl">
          {{ $t('home.byCategory') }}
        </h2>
        <NuxtLinkLocale
          to="/catalog"
          class="hidden text-sm font-semibold text-terra-700 hover:underline sm:block"
        >
          {{ $t('home.seeEverything') }} <span class="flip-rtl inline-block">→</span>
        </NuxtLinkLocale>
      </div>
      <div class="no-scrollbar -mx-5 mt-6 flex gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-7">
        <NuxtLinkLocale
          v-for="tile in categoryTiles"
          :key="tile.category.slug"
          :to="`/catalog?category=${tile.category.slug}`"
          class="group w-32 shrink-0 text-center sm:w-auto"
        >
          <div class="aspect-square overflow-hidden rounded-full bg-white ring-1 ring-sand-200 transition group-hover:ring-2 group-hover:ring-terra-600">
            <img
              v-if="tile.image"
              :src="tile.image.src"
              :alt="tr(tile.category, 'name')"
              class="size-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            >
          </div>
          <p class="mt-3 text-sm font-semibold leading-snug text-stone-800">
            {{ tr(tile.category, 'name') }}
          </p>
        </NuxtLinkLocale>
      </div>
    </section>

    <!-- Favourites -->
    <section class="mx-auto max-w-6xl px-5 pt-20 sm:px-8">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="eyebrow">
            {{ $t('home.favEyebrow') }}
          </p>
          <h2 class="mt-2 font-serif text-3xl text-stone-900 sm:text-5xl">
            {{ $t('home.favTitle') }}
          </h2>
        </div>
        <NuxtLinkLocale
          to="/catalog"
          class="text-sm font-semibold text-terra-700 hover:underline"
        >
          {{ $t('home.shopAll', { n: catalog.products.filter(p => p.isAvailable).length }) }} <span class="flip-rtl inline-block">→</span>
        </NuxtLinkLocale>
      </div>
      <div class="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <CatalogProductCard
          v-for="product in featured"
          :key="product.id"
          :product="product"
        />
      </div>
    </section>

    <!-- Story -->
    <section
      id="story"
      class="mx-auto mt-24 max-w-6xl scroll-mt-24 px-5 sm:px-8"
    >
      <div class="grid overflow-hidden rounded-[2rem] bg-white ring-1 ring-sand-200 lg:grid-cols-2">
        <div class="relative min-h-72 bg-sand-200">
          <img
            v-if="bySlug('seasonal-fermented-vegetables')"
            :src="bySlug('seasonal-fermented-vegetables')!.image.src"
            :alt="$t('home.storyAlt')"
            class="absolute inset-0 size-full object-cover"
            loading="lazy"
          >
        </div>
        <div class="p-8 sm:p-12">
          <p class="eyebrow">
            {{ $t('home.storyEyebrow') }}
          </p>
          <h2 class="mt-3 font-serif text-3xl leading-tight text-stone-900 sm:text-4xl">
            {{ $t('home.storyTitle') }}
          </h2>
          <p class="mt-4 leading-8 text-stone-600">
            {{ $t('home.storyBody') }}
          </p>
          <ul class="mt-8 space-y-6">
            <li
              v-for="v in values"
              :key="v.key"
              class="flex gap-4"
            >
              <span class="grid size-11 shrink-0 place-items-center rounded-full bg-terra-50 text-terra-700">
                <UIcon
                  :name="v.icon"
                  class="size-5"
                />
              </span>
              <div>
                <p class="font-semibold text-stone-900">
                  {{ $t(`home.values.${v.key}.title`) }}
                </p>
                <p class="text-sm leading-6 text-stone-600">
                  {{ $t(`home.values.${v.key}.body`) }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Boxes -->
    <section
      v-if="catalog.plans.length"
      class="mx-auto mt-24 max-w-6xl px-5 sm:px-8"
    >
      <div class="max-w-2xl">
        <p class="eyebrow">
          {{ $t('home.boxesEyebrow') }}
        </p>
        <h2 class="mt-2 font-serif text-3xl text-stone-900 sm:text-5xl">
          {{ $t('home.boxesTitle') }}
        </h2>
        <p class="mt-4 text-lg leading-8 text-stone-600">
          {{ $t('home.boxesBody') }}
        </p>
      </div>
      <div class="mt-10 grid gap-5 md:grid-cols-3">
        <NuxtLinkLocale
          v-for="(plan, i) in catalog.plans"
          :key="plan.id"
          to="/subscribe"
          class="group flex flex-col rounded-3xl p-7 ring-1 transition hover:-translate-y-0.5"
          :class="i === 0 ? 'bg-terra-800 text-sand-100 ring-terra-800' : 'bg-white ring-sand-200 hover:ring-terra-600'"
        >
          <p
            class="text-xs font-bold uppercase tracking-[0.16em]"
            :class="i === 0 ? 'text-sage-300' : 'text-sage-700'"
          >
            {{ $t(`cadenceTitle.${plan.cadence}`) }}
          </p>
          <h3
            class="mt-3 font-serif text-3xl"
            :class="i === 0 ? 'text-sand-50' : 'text-stone-900'"
          >
            {{ tr(plan, 'name') }}
          </h3>
          <p
            class="mt-3 flex-1 leading-7"
            :class="i === 0 ? 'text-sand-200' : 'text-stone-600'"
          >
            {{ tr(plan, 'summary') }}
          </p>
          <p
            class="mt-6 text-sm"
            :class="i === 0 ? 'text-sand-300' : 'text-stone-500'"
          >
            {{ $t('home.boxProducts', { n: plan.includedSlots.length }) }} ·
            <strong
              class="text-lg"
              :class="i === 0 ? 'text-sand-50' : 'text-stone-900'"
            >{{ price(plan.price.amount) }}</strong>
          </p>
          <span
            class="mt-5 inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition"
            :class="i === 0 ? 'bg-sage-400 text-terra-950 group-hover:bg-sage-300' : 'bg-terra-700 text-sand-50 group-hover:bg-terra-800'"
          >
            {{ $t('home.buildThisBox') }}
            <UIcon
              name="i-lucide-arrow-right"
              class="flip-rtl size-4"
            />
          </span>
        </NuxtLinkLocale>
      </div>
    </section>

    <!-- How it works -->
    <section class="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
      <h2 class="text-center font-serif text-3xl text-stone-900 sm:text-4xl">
        {{ $t('home.howTitle') }}
      </h2>
      <ol class="mt-10 grid gap-5 sm:grid-cols-3">
        <li
          v-for="(step, i) in [
            'pick', 'pay', 'prep'
          ]"
          :key="step"
          class="rounded-3xl bg-white p-7 ring-1 ring-sand-200"
        >
          <span class="grid size-10 place-items-center rounded-full bg-sage-300 font-bold text-terra-950">{{ i + 1 }}</span>
          <p class="mt-5 text-lg font-semibold text-stone-900">
            {{ $t(`home.steps.${step}.title`) }}
          </p>
          <p class="mt-1 leading-7 text-stone-600">
            {{ $t(`home.steps.${step}.body`) }}
          </p>
        </li>
      </ol>
    </section>

    <!-- Final CTA -->
    <section class="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
      <div class="relative overflow-hidden rounded-[2rem] bg-terra-800 px-8 py-14 text-center sm:px-16">
        <BrandLogo
          variant="mark"
          reversed
          class="absolute -end-6 -top-6 rotate-12 text-[10rem] opacity-10"
        />
        <h2 class="mx-auto max-w-2xl font-serif text-4xl leading-tight text-sand-50 sm:text-5xl">
          {{ $t('home.ctaTitle') }}
        </h2>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <NuxtLinkLocale
            to="/catalog"
            class="inline-flex items-center gap-2 rounded-full bg-sage-400 px-7 py-4 font-semibold text-terra-950 transition hover:bg-sage-300"
          >
            {{ $t('home.shop') }}
            <UIcon
              name="i-lucide-arrow-right"
              class="flip-rtl size-5"
            />
          </NuxtLinkLocale>
          <NuxtLinkLocale
            to="/subscribe"
            class="inline-flex items-center rounded-full px-7 py-4 font-semibold text-sand-50 ring-1 ring-sand-50/40 transition hover:bg-white/10"
          >
            {{ $t('home.buildBox') }}
          </NuxtLinkLocale>
        </div>
      </div>
    </section>
  </div>
</template>
