<script setup lang="ts">
import { getEligiblePlansForProduct } from '~/utils/catalog'

const route = useRoute()
const { t } = useI18n()
const { tr, trKey, price } = useLocalized()
const localePath = useLocalePath()
const { data: catalog } = await useCatalog()
const productSlug = computed(() => String(route.params.productSlug ?? ''))

const product = computed(() => {
  // Hidden (switched-off) products are not reachable from the shop.
  const foundProduct = catalog.value.products.find(item => item.slug === productSlug.value && item.isAvailable)

  if (!foundProduct) {
    throw createError({
      statusCode: 404,
      statusMessage: t('product.notFound')
    })
  }

  return foundProduct
})

const categorySlug = computed(() => product.value.eligibleSlotTypes[0])
const compatiblePlans = computed(() => getEligiblePlansForProduct(product.value, catalog.value.plans))
const related = computed(() => {
  const same = catalog.value.products.filter(p => p.id !== product.value.id && p.isAvailable && p.eligibleSlotTypes.includes(categorySlug.value!))
  const others = catalog.value.products.filter(p => p.id !== product.value.id && p.isAvailable && !same.includes(p))
  return [...same, ...others].slice(0, 4)
})

const canBuy = computed(() => product.value.isAvailable && product.value.price.amount > 0)
const quantity = ref(1)
watch(productSlug, () => {
  quantity.value = 1
})

const { add } = useCart()

function addToCart() {
  add(product.value.id, quantity.value)
}
function buyNow() {
  add(product.value.id, quantity.value, false)
  navigateTo(localePath('/cart'))
}

const unit = computed(() => t(`units.${product.value.defaultUnitLabel}`, product.value.defaultUnitLabel))

useSeoMeta({
  title: () => tr(product.value, 'name'),
  description: () => tr(product.value, 'description'),
  ogImage: () => product.value.image.src
})
</script>

<template>
  <div class="pb-28 md:pb-0">
    <div class="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <nav
        class="flex flex-wrap items-center gap-1.5 text-sm text-stone-500"
        :aria-label="$t('product.breadcrumb')"
      >
        <NuxtLinkLocale
          to="/catalog"
          class="hover:text-terra-700"
        >
          {{ $t('nav.shop') }}
        </NuxtLinkLocale>
        <UIcon
          name="i-lucide-chevron-right"
          class="flip-rtl size-3.5"
        />
        <NuxtLinkLocale
          :to="`/catalog?category=${categorySlug}`"
          class="hover:text-terra-700"
        >
          {{ tr(product, 'category') }}
        </NuxtLinkLocale>
        <UIcon
          name="i-lucide-chevron-right"
          class="flip-rtl size-3.5"
        />
        <span class="text-stone-800">{{ tr(product, 'name') }}</span>
      </nav>

      <section class="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <!-- Photo -->
        <div class="lg:sticky lg:top-28 lg:self-start">
          <div class="relative overflow-hidden rounded-[2rem] bg-sand-50 ring-1 ring-sand-200">
            <img
              :src="product.image.src"
              :alt="tr(product, 'name')"
              class="ivory-photo aspect-square w-full object-cover"
            >
            <span
              v-if="product.storage === 'Refrigerated'"
              class="absolute start-4 top-4 rounded-full bg-sand-50/90 px-3 py-1.5 text-xs font-semibold text-terra-800 shadow-sm"
            >{{ $t('product.freshChilled') }}</span>
          </div>
        </div>

        <!-- Buy box -->
        <div>
          <p class="eyebrow">
            {{ tr(product, 'category') }}
          </p>
          <h1 class="mt-2 font-serif text-4xl leading-[1.05] text-stone-900 sm:text-6xl">
            {{ tr(product, 'name') }}
          </h1>
          <p class="mt-5 text-lg leading-8 text-stone-600">
            {{ tr(product, 'description') }}
          </p>

          <div class="mt-7 flex items-baseline gap-3">
            <span class="font-serif text-5xl text-stone-900">{{ price(product.price.amount) }}</span>
            <span class="text-stone-500">{{ $t('product.per', { unit }) }}</span>
          </div>

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <QuantityStepper v-model="quantity" />
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-terra-700 px-7 py-3.5 text-base font-semibold text-sand-50 shadow-[0_14px_30px_-14px_rgba(108,59,34,0.7)] transition hover:bg-terra-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              :disabled="!canBuy"
              @click="addToCart"
            >
              <UIcon
                name="i-lucide-shopping-bag"
                class="size-5"
              />
              <template v-if="canBuy">
                {{ $t('product.addToCart') }}<span class="hidden sm:inline"> · {{ price(product.price.amount * quantity) }}</span>
              </template>
              <template v-else>
                {{ $t('product.backSoon') }}
              </template>
            </button>
          </div>
          <button
            v-if="canBuy"
            type="button"
            class="mt-3 w-full rounded-full bg-sand-50 px-7 py-3.5 text-base font-semibold text-terra-800 ring-1 ring-sand-300 transition hover:ring-terra-600 disabled:opacity-60 sm:w-auto"
            @click="buyNow"
          >
            {{ $t('product.buyNow') }}
          </button>

          <ul class="mt-8 grid grid-cols-3 gap-3 text-sm">
            <li class="rounded-2xl bg-sand-50 p-4 ring-1 ring-sand-200">
              <UIcon
                :name="product.storage === 'Refrigerated' ? 'i-lucide-snowflake' : 'i-lucide-sun'"
                class="size-5 text-terra-600"
              />
              <p class="mt-2 font-semibold text-stone-900">
                {{ product.storage === 'Refrigerated' ? $t('product.refrigerated') : $t('product.roomTemp') }}
              </p>
              <p class="text-xs text-stone-500">
                {{ $t('product.storage') }}
              </p>
            </li>
            <li class="rounded-2xl bg-sand-50 p-4 ring-1 ring-sand-200">
              <UIcon
                name="i-lucide-calendar-check"
                class="size-5 text-terra-600"
              />
              <p class="mt-2 font-semibold text-stone-900">
                {{ $t('product.days', { n: product.shelfLifeDays }) }}
              </p>
              <p class="text-xs text-stone-500">
                {{ $t('product.keepsFor') }}
              </p>
            </li>
            <li class="rounded-2xl bg-sand-50 p-4 ring-1 ring-sand-200">
              <UIcon
                name="i-lucide-map-pin"
                class="size-5 text-terra-600"
              />
              <p class="mt-2 font-semibold text-stone-900">
                {{ $t('product.casablanca') }}
              </p>
              <p class="text-xs text-stone-500">
                {{ $t('product.madeIn') }}
              </p>
            </li>
          </ul>

          <NuxtLinkLocale
            v-if="compatiblePlans[0]"
            to="/subscribe"
            class="mt-6 flex items-center gap-4 rounded-2xl bg-sage-50 p-4 ring-1 ring-sage-200 transition hover:ring-sage-400"
          >
            <span class="grid size-11 shrink-0 place-items-center rounded-full bg-sage-300 text-terra-950">
              <UIcon
                name="i-lucide-repeat"
                class="size-5"
              />
            </span>
            <span class="text-sm leading-6 text-stone-700">
              <strong class="text-stone-900">{{ $t('product.repeatTitle') }}</strong>
              {{ $t('product.repeatBody', { plan: tr(compatiblePlans[0].plan, 'name'), cadence: $t(`cadence.${compatiblePlans[0].plan.cadence}`), price: price(compatiblePlans[0].plan.price.amount) }) }}
            </span>
            <UIcon
              name="i-lucide-arrow-right"
              class="flip-rtl ms-auto size-5 shrink-0 text-sage-700"
            />
          </NuxtLinkLocale>

          <!-- Details -->
          <div class="mt-10 divide-y divide-sand-200 border-y border-sand-200">
            <details
              class="group py-5"
              open
            >
              <summary class="flex cursor-pointer list-none items-center justify-between font-semibold text-stone-900">
                {{ $t('product.ingredients') }}
                <UIcon
                  name="i-lucide-chevron-down"
                  class="size-5 transition group-open:rotate-180"
                />
              </summary>
              <ul class="mt-4 flex flex-wrap gap-2">
                <li
                  v-for="ingredient in tr(product, 'ingredients')"
                  :key="ingredient"
                  class="rounded-full bg-sand-50 px-3 py-1.5 text-sm text-stone-700 ring-1 ring-sand-200"
                >
                  {{ ingredient }}
                </li>
              </ul>
              <p
                v-if="product.ingredients.length"
                class="mt-3 text-sm text-stone-500"
              >
                {{ $t('product.ingredientsCount', { n: product.ingredients.length }) }}
              </p>
            </details>
            <details class="group py-5">
              <summary class="flex cursor-pointer list-none items-center justify-between font-semibold text-stone-900">
                {{ $t('product.nutrition') }}
                <UIcon
                  name="i-lucide-chevron-down"
                  class="size-5 transition group-open:rotate-180"
                />
              </summary>
              <div class="mt-4 flex h-3 overflow-hidden rounded-full bg-sand-200">
                <div
                  class="bg-terra-600"
                  :style="`width:${product.nutrition.proteins}%`"
                />
                <div
                  class="bg-sage-400"
                  :style="`width:${product.nutrition.fats}%`"
                />
                <div
                  class="bg-sand-400"
                  :style="`width:${product.nutrition.carbs}%`"
                />
              </div>
              <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-600">
                <span class="flex items-center gap-2"><span class="size-2.5 rounded-full bg-terra-600" />{{ $t('product.protein', { n: product.nutrition.proteins }) }}</span>
                <span class="flex items-center gap-2"><span class="size-2.5 rounded-full bg-sage-400" />{{ $t('product.fat', { n: product.nutrition.fats }) }}</span>
                <span class="flex items-center gap-2"><span class="size-2.5 rounded-full bg-sand-400" />{{ $t('product.carbs', { n: product.nutrition.carbs }) }}</span>
              </div>
              <p
                v-if="product.nutrition.summary"
                class="mt-3 text-sm leading-6 text-stone-500"
              >
                {{ trKey(product, 'nutritionSummary', product.nutrition.summary) }}
              </p>
            </details>
            <details class="group py-5">
              <summary class="flex cursor-pointer list-none items-center justify-between font-semibold text-stone-900">
                {{ $t('product.storageShelf') }}
                <UIcon
                  name="i-lucide-chevron-down"
                  class="size-5 transition group-open:rotate-180"
                />
              </summary>
              <p class="mt-3 leading-7 text-stone-600">
                {{ product.storage === 'Refrigerated' ? $t('product.keepRefrigerated') : $t('product.keepCool') }}
                {{ $t('product.bestWithin', { n: product.shelfLifeDays, unit }) }}
              </p>
            </details>
          </div>
        </div>
      </section>

      <!-- Related -->
      <section
        v-if="related.length"
        class="mt-20"
      >
        <h2 class="font-serif text-3xl text-stone-900 sm:text-4xl">
          {{ $t('product.related') }}
        </h2>
        <div class="mt-6 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          <CatalogProductCard
            v-for="p in related"
            :key="p.id"
            :product="p"
          />
        </div>
      </section>
    </div>

    <!-- Mobile buy bar -->
    <div
      v-if="canBuy"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-sand-50/95 px-4 py-3 backdrop-blur md:hidden"
    >
      <div class="flex items-center gap-3">
        <div class="min-w-0 flex-1 leading-tight">
          <p class="truncate text-sm font-semibold text-stone-900">
            {{ tr(product, 'name') }}
          </p>
          <p class="text-sm text-stone-500">
            {{ price(product.price.amount) }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-terra-700 px-5 py-3 text-sm font-semibold text-sand-50"
          @click="addToCart"
        >
          <UIcon
            name="i-lucide-shopping-bag"
            class="size-4"
          />
          {{ $t('product.addToCart') }}
        </button>
      </div>
    </div>
  </div>
</template>
