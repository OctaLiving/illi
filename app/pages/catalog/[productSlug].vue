<script setup lang="ts">
import { getEligiblePlansForProduct } from '~/utils/catalog'

const route = useRoute()
const { data: catalog } = await useCatalog()
const productSlug = computed(() => String(route.params.productSlug ?? ''))

const product = computed(() => {
  const foundProduct = catalog.value.products.find(item => item.slug === productSlug.value)

  if (!foundProduct) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found'
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
const { checkout, pending: buying, error: buyError } = useCheckout()

function addToCart() {
  add(product.value.id, quantity.value)
}
function buyNow() {
  checkout([{ productId: product.value.id, quantity: quantity.value }])
}

const cadenceLabel: Record<string, string> = { weekly: 'every week', biweekly: 'every two weeks', monthly: 'every month' }

useSeoMeta({
  title: () => product.value.name,
  description: () => product.value.description,
  ogImage: () => product.value.image.src
})
</script>

<template>
  <div class="pb-28 md:pb-0">
    <div class="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <nav
        class="flex flex-wrap items-center gap-1.5 text-sm text-stone-500"
        aria-label="Breadcrumb"
      >
        <NuxtLink
          to="/catalog"
          class="hover:text-olive-700"
        >Shop</NuxtLink>
        <UIcon
          name="i-lucide-chevron-right"
          class="size-3.5"
        />
        <NuxtLink
          :to="`/catalog?category=${categorySlug}`"
          class="hover:text-olive-700"
        >{{ product.category }}</NuxtLink>
        <UIcon
          name="i-lucide-chevron-right"
          class="size-3.5"
        />
        <span class="text-stone-800">{{ product.name }}</span>
      </nav>

      <section class="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <!-- Photo -->
        <div class="lg:sticky lg:top-28 lg:self-start">
          <div class="relative overflow-hidden rounded-[2rem] bg-white ring-1 ring-sand-200">
            <img
              :src="product.image.src"
              :alt="product.image.alt"
              class="aspect-square w-full object-cover"
            >
            <span
              v-if="product.storage === 'Refrigerated'"
              class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-olive-800 shadow-sm"
            >Fresh · keep chilled</span>
          </div>
        </div>

        <!-- Buy box -->
        <div>
          <p class="eyebrow">
            {{ product.category }}
          </p>
          <h1 class="mt-2 font-serif text-4xl leading-[1.05] text-stone-900 sm:text-6xl">
            {{ product.name }}
          </h1>
          <p class="mt-5 text-lg leading-8 text-stone-600">
            {{ product.description }}
          </p>

          <div class="mt-7 flex items-baseline gap-3">
            <span class="font-serif text-5xl text-stone-900">{{ product.price.amount }} MAD</span>
            <span class="text-stone-500">per {{ product.defaultUnitLabel }}</span>
          </div>

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <QuantityStepper v-model="quantity" />
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-olive-700 px-7 py-3.5 text-base font-semibold text-sand-50 shadow-[0_14px_30px_-14px_rgba(47,74,41,0.8)] transition hover:bg-olive-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              :disabled="!canBuy"
              @click="addToCart"
            >
              <UIcon
                name="i-lucide-shopping-bag"
                class="size-5"
              />
              <template v-if="canBuy">
                Add to cart<span class="hidden sm:inline"> · {{ product.price.amount * quantity }} MAD</span>
              </template>
              <template v-else>
                Back soon
              </template>
            </button>
          </div>
          <button
            v-if="canBuy"
            type="button"
            class="mt-3 w-full rounded-full bg-white px-7 py-3.5 text-base font-semibold text-olive-800 ring-1 ring-sand-300 transition hover:ring-olive-600 disabled:opacity-60 sm:w-auto"
            :disabled="buying"
            @click="buyNow"
          >
            {{ buying ? 'Starting checkout…' : 'Buy now' }}
          </button>
          <p
            v-if="buyError"
            class="mt-3 rounded-xl bg-saffron-50 px-3 py-2 text-sm text-saffron-800"
          >
            {{ buyError }}
          </p>

          <ul class="mt-8 grid grid-cols-3 gap-3 text-sm">
            <li class="rounded-2xl bg-white p-4 ring-1 ring-sand-200">
              <UIcon
                :name="product.storage === 'Refrigerated' ? 'i-lucide-snowflake' : 'i-lucide-sun'"
                class="size-5 text-olive-600"
              />
              <p class="mt-2 font-semibold text-stone-900">
                {{ product.storage === 'Refrigerated' ? 'Refrigerated' : 'Room temp' }}
              </p>
              <p class="text-xs text-stone-500">
                Storage
              </p>
            </li>
            <li class="rounded-2xl bg-white p-4 ring-1 ring-sand-200">
              <UIcon
                name="i-lucide-calendar-check"
                class="size-5 text-olive-600"
              />
              <p class="mt-2 font-semibold text-stone-900">
                {{ product.shelfLifeDays }} days
              </p>
              <p class="text-xs text-stone-500">
                Keeps for
              </p>
            </li>
            <li class="rounded-2xl bg-white p-4 ring-1 ring-sand-200">
              <UIcon
                name="i-lucide-map-pin"
                class="size-5 text-olive-600"
              />
              <p class="mt-2 font-semibold text-stone-900">
                Casablanca
              </p>
              <p class="text-xs text-stone-500">
                Made in
              </p>
            </li>
          </ul>

          <NuxtLink
            v-if="compatiblePlans[0]"
            to="/subscribe"
            class="mt-6 flex items-center gap-4 rounded-2xl bg-saffron-50 p-4 ring-1 ring-saffron-200 transition hover:ring-saffron-400"
          >
            <span class="grid size-11 shrink-0 place-items-center rounded-full bg-saffron-300 text-olive-950">
              <UIcon
                name="i-lucide-repeat"
                class="size-5"
              />
            </span>
            <span class="text-sm leading-6 text-stone-700">
              <strong class="text-stone-900">Want it on repeat?</strong> Add it to the {{ compatiblePlans[0].plan.name }},
              delivered {{ cadenceLabel[compatiblePlans[0].plan.cadence] ?? compatiblePlans[0].plan.cadence }} —
              {{ compatiblePlans[0].plan.price.amount }} MAD.
            </span>
            <UIcon
              name="i-lucide-arrow-right"
              class="ml-auto size-5 shrink-0 text-saffron-700"
            />
          </NuxtLink>

          <!-- Details -->
          <div class="mt-10 divide-y divide-sand-200 border-y border-sand-200">
            <details
              class="group py-5"
              open
            >
              <summary class="flex cursor-pointer list-none items-center justify-between font-semibold text-stone-900">
                Ingredients
                <UIcon
                  name="i-lucide-chevron-down"
                  class="size-5 transition group-open:rotate-180"
                />
              </summary>
              <ul class="mt-4 flex flex-wrap gap-2">
                <li
                  v-for="ingredient in product.ingredients"
                  :key="ingredient"
                  class="rounded-full bg-white px-3 py-1.5 text-sm text-stone-700 ring-1 ring-sand-200"
                >
                  {{ ingredient }}
                </li>
              </ul>
              <p
                v-if="product.ingredients.length"
                class="mt-3 text-sm text-stone-500"
              >
                {{ product.ingredients.length }} ingredients. Nothing else.
              </p>
            </details>
            <details class="group py-5">
              <summary class="flex cursor-pointer list-none items-center justify-between font-semibold text-stone-900">
                Nutrition
                <UIcon
                  name="i-lucide-chevron-down"
                  class="size-5 transition group-open:rotate-180"
                />
              </summary>
              <div class="mt-4 flex h-3 overflow-hidden rounded-full bg-sand-200">
                <div
                  class="bg-olive-600"
                  :style="`width:${product.nutrition.proteins}%`"
                />
                <div
                  class="bg-saffron-400"
                  :style="`width:${product.nutrition.fats}%`"
                />
                <div
                  class="bg-sand-400"
                  :style="`width:${product.nutrition.carbs}%`"
                />
              </div>
              <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-600">
                <span class="flex items-center gap-2"><span class="size-2.5 rounded-full bg-olive-600" />Protein {{ product.nutrition.proteins }}%</span>
                <span class="flex items-center gap-2"><span class="size-2.5 rounded-full bg-saffron-400" />Fat {{ product.nutrition.fats }}%</span>
                <span class="flex items-center gap-2"><span class="size-2.5 rounded-full bg-sand-400" />Carbs {{ product.nutrition.carbs }}%</span>
              </div>
              <p
                v-if="product.nutrition.summary"
                class="mt-3 text-sm leading-6 text-stone-500"
              >
                {{ product.nutrition.summary }}
              </p>
            </details>
            <details class="group py-5">
              <summary class="flex cursor-pointer list-none items-center justify-between font-semibold text-stone-900">
                Storage & shelf life
                <UIcon
                  name="i-lucide-chevron-down"
                  class="size-5 transition group-open:rotate-180"
                />
              </summary>
              <p class="mt-3 leading-7 text-stone-600">
                {{ product.storage === 'Refrigerated' ? 'Keep refrigerated.' : 'Store in a cool, dry place; refrigerate after opening.' }}
                Best within {{ product.shelfLifeDays }} days. Sold by the {{ product.defaultUnitLabel }}.
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
          You may also like
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
      class="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden"
    >
      <div class="flex items-center gap-3">
        <div class="min-w-0 flex-1 leading-tight">
          <p class="truncate text-sm font-semibold text-stone-900">
            {{ product.name }}
          </p>
          <p class="text-sm text-stone-500">
            {{ product.price.amount }} MAD
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-olive-700 px-5 py-3 text-sm font-semibold text-sand-50"
          @click="addToCart"
        >
          <UIcon
            name="i-lucide-shopping-bag"
            class="size-4"
          />
          Add to cart
        </button>
      </div>
    </div>
  </div>
</template>
