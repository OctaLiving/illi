<script setup lang="ts">
const { data: catalog } = await useCatalog()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { tr, price } = useLocalized()

const activeCategory = computed(() => (typeof route.query.category === 'string' ? route.query.category : ''))
const activeName = computed(() => {
  const category = catalog.value.categories.find(c => c.slug === activeCategory.value)
  return category ? tr(category, 'name') : undefined
})

// Products switched off in the console are hidden from the shop entirely.
const listed = computed(() => catalog.value.products.filter(p => p.isAvailable))
const products = computed(() => activeCategory.value
  ? listed.value.filter(p => p.eligibleSlotTypes.includes(activeCategory.value as never))
  : listed.value)

const counts = computed(() =>
  Object.fromEntries(catalog.value.categories.map(c => [c.slug, listed.value.filter(p => p.eligibleSlotTypes.includes(c.slug)).length]))
)
const lowestPlan = computed(() => Math.min(...catalog.value.plans.map(p => p.price.amount)))

function selectCategory(slug: string) {
  router.replace({ query: slug ? { category: slug } : {} })
}

useSeoMeta({
  title: () => (activeName.value ? t('shop.metaCategory', { name: activeName.value }) : t('shop.metaAll')),
  description: () => t('shop.metaDescription')
})
</script>

<template>
  <div>
    <section class="maghreb-wash border-b border-sand-200">
      <div class="mx-auto max-w-6xl px-5 pb-8 pt-12 sm:px-8 sm:pt-16">
        <p class="eyebrow">
          {{ $t('shop.eyebrow') }}
        </p>
        <h1 class="mt-3 max-w-3xl font-serif text-4xl leading-[1.05] text-stone-900 sm:text-6xl">
          {{ activeName ?? $t('shop.titleAll') }}
        </h1>
        <p class="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
          {{ $t('shop.intro') }}
        </p>

        <div class="no-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button
            type="button"
            class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition"
            :class="!activeCategory ? 'bg-terra-700 text-sand-50' : 'bg-sand-50 text-stone-700 ring-1 ring-sand-300 hover:ring-terra-600'"
            @click="selectCategory('')"
          >
            {{ $t('shop.all') }} <span class="opacity-70">{{ listed.length }}</span>
          </button>
          <button
            v-for="category in catalog.categories"
            :key="category.slug"
            type="button"
            class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition"
            :class="activeCategory === category.slug ? 'bg-terra-700 text-sand-50' : 'bg-sand-50 text-stone-700 ring-1 ring-sand-300 hover:ring-terra-600'"
            @click="selectCategory(category.slug)"
          >
            {{ tr(category, 'name') }} <span class="opacity-70">{{ counts[category.slug] }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        <template
          v-for="(product, i) in products"
          :key="product.id"
        >
          <CatalogProductCard :product="product" />
          <NuxtLinkLocale
            v-if="i === 5 && catalog.plans.length"
            to="/subscribe"
            class="col-span-2 flex flex-col justify-between gap-6 rounded-3xl bg-terra-800 p-6 text-sand-100 transition hover:bg-terra-900 sm:p-8 lg:col-span-1"
          >
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-sage-300">
                {{ $t('shop.boxesEyebrow') }}
              </p>
              <p class="mt-3 font-serif text-3xl leading-tight text-sand-50">
                {{ $t('shop.boxesTitle') }}
              </p>
            </div>
            <p class="flex items-center justify-between text-sm font-semibold">
              {{ $t('shop.boxesFrom', { price: price(lowestPlan) }) }}
              <span class="inline-flex items-center gap-1 rounded-full bg-sand-100 px-4 py-2 text-terra-800">
                {{ $t('shop.buildBox') }}
                <UIcon
                  name="i-lucide-arrow-right"
                  class="flip-rtl size-4"
                />
              </span>
            </p>
          </NuxtLinkLocale>
        </template>
      </div>

      <p
        v-if="products.length === 0"
        class="rounded-3xl bg-sand-50 p-10 text-center text-stone-600 ring-1 ring-sand-200"
      >
        {{ $t('shop.empty') }}
      </p>
    </section>
  </div>
</template>
