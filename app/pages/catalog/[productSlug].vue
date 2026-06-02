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
      statusMessage: 'Catalog product not found'
    })
  }

  return foundProduct
})

const compatiblePlans = computed(() => getEligiblePlansForProduct(product.value, catalog.value.plans))

useSeoMeta({
  title: () => `${product.value.name} · Collection`,
  description: () => product.value.description
})
</script>

<template>
  <div class="maghreb-wash">
    <div class="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <NuxtLink
        to="/catalog"
        class="inline-flex items-center gap-2 font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.22em] text-stone-500 transition hover:text-terra-700"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4"
        />
        Back to collection
      </NuxtLink>

      <section class="mt-10 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-14">
        <!-- Arched product frame -->
        <div
          class="reveal relative mx-auto w-full max-w-sm lg:sticky lg:top-28"
          style="animation-delay:.1s"
        >
          <div class="arch border-[1.5px] border-amber-600/60 bg-gradient-to-b from-amber-50 to-stone-100 p-3.5 shadow-[0_36px_70px_-34px_rgba(42,29,18,0.55)]">
            <div class="arch-inner aspect-[3/4] overflow-hidden bg-stone-100">
              <img
                :src="product.image.src"
                :alt="product.image.alt"
                class="size-full object-cover"
              >
            </div>
          </div>
          <div
            class="wax-seal stamp-in absolute -bottom-5 -right-4 [--seal-size:5.5rem]"
            style="animation-delay:.5s"
          >
            <span>illi<br>·<br>by<br>invitation</span>
          </div>
        </div>

        <div class="space-y-8">
          <div class="space-y-5">
            <div class="flex flex-wrap gap-2 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.18em]">
              <span
                v-for="slotType in product.eligibleSlotTypes"
                :key="slotType"
                class="rounded-sm bg-terra-600/10 px-2.5 py-1 text-terra-700"
              >
                {{ slotType }} slot
              </span>
            </div>

            <p class="font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.3em] text-indigo-700">
              The product
            </p>
            <h1 class="font-[family:var(--font-serif)] text-5xl font-normal leading-[1.0] tracking-tight text-stone-900 sm:text-6xl">
              {{ product.name }}
            </h1>
            <p class="font-[family:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-stone-500">
              {{ product.subtitle }}
            </p>
            <p class="max-w-2xl text-lg leading-8 text-stone-700">
              {{ product.description }}
            </p>

            <div class="flex flex-wrap gap-3 pt-1">
              <NuxtLink
                to="/subscribe"
                class="inline-flex items-center gap-2 rounded-sm bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-amber-50 transition hover:bg-indigo-700"
              >
                Add through subscription
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4"
                />
              </NuxtLink>
              <NuxtLink
                to="/catalog"
                class="inline-flex items-center gap-2 rounded-sm border border-indigo-600 px-6 py-3.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-600/8"
              >
                Full collection
              </NuxtLink>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-amber-600/40 bg-amber-600/40">
            <div class="bg-[#f4ecdd] p-6">
              <p class="font-[family:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.16em] text-terra-600">
                Pack format
              </p>
              <p class="mt-2 font-[family:var(--font-serif)] text-3xl text-stone-900">
                {{ product.defaultUnitLabel }}
              </p>
            </div>
            <div class="bg-[#f4ecdd] p-6">
              <p class="font-[family:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.16em] text-terra-600">
                Keeps
              </p>
              <p class="mt-2 font-[family:var(--font-serif)] text-3xl text-stone-900">
                {{ product.shelfLifeDays }} days
              </p>
            </div>
            <div class="bg-[#f4ecdd] p-6">
              <p class="font-[family:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.16em] text-terra-600">
                Storage
              </p>
              <p class="mt-2 font-[family:var(--font-serif)] text-3xl text-stone-900">
                {{ product.storage }}
              </p>
            </div>
            <div class="bg-[#f4ecdd] p-6">
              <p class="font-[family:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.16em] text-terra-600">
                Subscription fit
              </p>
              <p class="mt-2 font-[family:var(--font-serif)] text-3xl text-stone-900">
                {{ compatiblePlans.length }} plans
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Nutrition -->
      <section class="mt-16 rounded-md border border-amber-600/25 bg-[#f4ecdd] p-8">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.3em] text-indigo-700">
              Nutrition
            </p>
            <h2 class="mt-3 font-[family:var(--font-serif)] text-4xl text-stone-900">
              Macro split.
            </h2>
          </div>
          <div class="flex gap-6 font-[family:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.14em]">
            <span class="flex items-center gap-2 text-stone-600">
              <span class="size-2.5 rounded-full bg-indigo-600" />Protein {{ product.nutrition.proteins }}%
            </span>
            <span class="flex items-center gap-2 text-stone-600">
              <span class="size-2.5 rounded-full bg-terra-600" />Fat {{ product.nutrition.fats }}%
            </span>
            <span class="flex items-center gap-2 text-stone-600">
              <span class="size-2.5 rounded-full bg-amber-400" />Carbs {{ product.nutrition.carbs }}%
            </span>
          </div>
        </div>

        <div class="mt-6 flex h-3.5 overflow-hidden rounded-full border border-amber-600/20">
          <div
            class="bg-indigo-600"
            :style="`width:${product.nutrition.proteins}%`"
          />
          <div
            class="bg-terra-600"
            :style="`width:${product.nutrition.fats}%`"
          />
          <div
            class="bg-amber-400"
            :style="`width:${product.nutrition.carbs}%`"
          />
        </div>

        <p
          v-if="product.nutrition.summary"
          class="mt-6 font-[family:var(--font-mono)] text-xs leading-6 text-stone-500"
        >
          {{ product.nutrition.summary }}
        </p>
      </section>

      <section class="mt-16 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <!-- Ingredients -->
        <div class="rounded-md border border-amber-600/25 bg-amber-50/50 p-8">
          <p class="font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.3em] text-indigo-700">
            Ingredients
          </p>
          <h2 class="mt-3 font-[family:var(--font-serif)] text-4xl text-stone-900">
            Short and traceable.
          </h2>
          <ul class="mt-6 space-y-3 text-base leading-7 text-stone-700">
            <li
              v-for="ingredient in product.ingredients"
              :key="ingredient"
              class="flex items-start gap-3"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-1 size-4 shrink-0 text-terra-600"
              />
              <span>{{ ingredient }}</span>
            </li>
          </ul>
        </div>

        <!-- Subscription fit -->
        <div class="rounded-md border border-amber-600/25 bg-[#f4ecdd] p-8">
          <p class="font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.3em] text-indigo-700">
            Subscription fit
          </p>
          <h2 class="mt-3 font-[family:var(--font-serif)] text-4xl text-stone-900">
            Where this product belongs.
          </h2>

          <div class="mt-6 space-y-4">
            <div
              v-for="entry in compatiblePlans"
              :key="entry.plan.id"
              class="rounded-md border border-amber-600/25 p-5"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="space-y-2">
                  <h3 class="font-[family:var(--font-serif)] text-2xl text-stone-900">
                    {{ entry.plan.name }}
                  </h3>
                  <p class="text-sm leading-7 text-stone-600">
                    {{ entry.plan.summary }}
                  </p>
                </div>
                <span class="shrink-0 font-[family:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.16em] text-terra-600">{{ entry.plan.cadence }}</span>
              </div>
              <div class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="slot in entry.matchingSlots"
                  :key="slot.id"
                  class="rounded-sm border border-indigo-600/40 px-2.5 py-1 font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-indigo-700"
                >
                  {{ slot.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
