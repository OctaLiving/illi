<script setup lang="ts">
const { data: catalog } = await useCatalog()
const catalogProducts = computed(() => catalog.value.products)
const subscriptionPlans = computed(() => catalog.value.plans)
const previewProducts = computed(() => catalog.value.products.slice(0, 4))

const protocolSteps = [
  {
    id: '01',
    title: 'Sourced close.',
    body: 'Ingredients come from local and regional farms, selected for the season and chosen for quality over volume.'
  },
  {
    id: '02',
    title: 'Kept well.',
    body: 'Each product follows a preservation protocol: small batches, short ingredient lists, reusable glass, and careful handling.'
  },
  {
    id: '03',
    title: 'Delivered by subscription.',
    body: 'Customers choose a base plan, then shape the box with compatible products from the current collection.'
  }
]

useSeoMeta({
  title: 'illi',
  description: 'Small-batch foods for the season. Made in Casablanca. Available by invitation.'
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="maghreb-wash relative overflow-hidden">
      <div class="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p
            class="reveal inline-flex items-center gap-3 font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.3em] text-indigo-700"
            style="animation-delay:.05s"
          >
            <span class="h-px w-8 bg-terra-600" />
            Made in Casablanca · By invitation
          </p>

          <h1
            class="reveal mt-6 font-[family:var(--font-serif)] text-5xl font-normal leading-[0.98] tracking-tight text-stone-900 sm:text-7xl"
            style="animation-delay:.16s"
          >
            Small-batch foods<br>for the <em class="italic text-terra-600">season.</em>
          </h1>

          <p
            class="reveal mt-7 max-w-xl text-lg leading-8 text-stone-700"
            style="animation-delay:.28s"
          >
            A curated pantry of ferments, spreads, marinated fish and slow fruit — short ingredient
            lists, reusable glass, and a subscription you shape yourself before checkout ever appears.
          </p>

          <div
            class="reveal mt-9 flex flex-wrap gap-3"
            style="animation-delay:.4s"
          >
            <NuxtLink
              to="/catalog"
              class="inline-flex items-center gap-2 rounded-sm bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-amber-50 transition hover:bg-indigo-700"
            >
              Explore the collection
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4"
              />
            </NuxtLink>
            <NuxtLink
              to="/subscribe"
              class="inline-flex items-center gap-2 rounded-sm border border-indigo-600 px-6 py-3.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-600/8"
            >
              Build a subscription
            </NuxtLink>
          </div>
        </div>

        <div
          class="reveal relative mx-auto w-full max-w-sm"
          style="animation-delay:.34s"
        >
          <div class="arch border-[1.5px] border-amber-600/60 bg-gradient-to-b from-amber-50 to-stone-100 p-3.5 shadow-[0_36px_70px_-34px_rgba(42,29,18,0.55)]">
            <div class="arch-inner relative aspect-[3/4] overflow-hidden bg-stone-100">
              <img
                :src="previewProducts[0]?.image.src"
                :alt="previewProducts[0]?.image.alt"
                class="size-full object-cover"
              >
              <span class="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-indigo-600 px-3.5 py-2 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.18em] text-amber-50">
                {{ previewProducts[0]?.category }}
              </span>
            </div>
          </div>
          <div
            class="wax-seal stamp-in absolute -bottom-5 -left-5 [--seal-size:6rem]"
            style="animation-delay:.7s"
          >
            <span>illi<br>·<br>by<br>invitation</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Tile strip -->
    <section class="mx-auto max-w-6xl px-5 pb-6 sm:px-8">
      <div class="grid gap-px overflow-hidden rounded-md border border-amber-600/40 bg-amber-600/40 sm:grid-cols-3">
        <div class="bg-[#f4ecdd] p-6 sm:p-7">
          <p class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.18em] text-terra-600">
            № 01 · Collection
          </p>
          <p class="mt-3 font-[family:var(--font-serif)] text-4xl text-stone-900">
            {{ catalogProducts.length }} lots
          </p>
          <p class="mt-2 text-sm leading-6 text-stone-600">
            Ferments, spreads, seafood and sauces — each one traceable.
          </p>
        </div>
        <div class="bg-[#f4ecdd] p-6 sm:p-7">
          <p class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.18em] text-terra-600">
            № 02 · Plans
          </p>
          <p class="mt-3 font-[family:var(--font-serif)] text-4xl text-stone-900">
            {{ subscriptionPlans.length }} boxes
          </p>
          <p class="mt-2 text-sm leading-6 text-stone-600">
            Choose a base cadence, then fill the slots it allows yourself.
          </p>
        </div>
        <div class="bg-[#f4ecdd] p-6 sm:p-7">
          <p class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.18em] text-terra-600">
            № 03 · Payment
          </p>
          <p class="mt-3 font-[family:var(--font-serif)] text-4xl text-stone-900">
            USDT
          </p>
          <p class="mt-2 text-sm leading-6 text-stone-600">
            Crypto checkout, members only. Access is by invitation.
          </p>
        </div>
      </div>
    </section>

    <!-- The collection -->
    <section class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div class="lg:sticky lg:top-28">
          <p class="font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.3em] text-indigo-700">
            The collection
          </p>
          <h2 class="mt-4 font-[family:var(--font-serif)] text-4xl leading-tight text-stone-900">
            Pantry foods shaped by season and preservation.
          </h2>
          <p class="mt-4 max-w-md text-base leading-8 text-stone-700">
            Amlou, kefirs, raw-milk cheeses, marinated fish and preserved goods belong to the same logic: what keeps well,
            what nourishes, and what can be returned to the table with ease.
          </p>
          <NuxtLink
            to="/catalog"
            class="mt-6 inline-flex items-center gap-2 font-[family:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-stone-900 underline decoration-terra-600 decoration-2 underline-offset-4 transition hover:text-terra-700"
          >
            See the full collection
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4"
            />
          </NuxtLink>
        </div>

        <div class="grid gap-6 sm:grid-cols-2">
          <NuxtLink
            v-for="product in previewProducts"
            :key="product.id"
            :to="`/catalog/${product.slug}`"
            class="group"
          >
            <div class="arch border-[1.5px] border-amber-600/40 bg-gradient-to-b from-amber-50 to-stone-100 p-2.5 transition group-hover:border-terra-600/60 group-hover:shadow-[0_28px_50px_-30px_rgba(42,29,18,0.5)]">
              <div class="arch-inner aspect-[4/5] overflow-hidden bg-stone-100">
                <img
                  :src="product.image.src"
                  :alt="product.image.alt"
                  class="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                >
              </div>
            </div>
            <p class="mt-3 px-1 font-[family:var(--font-serif)] text-2xl text-stone-900">{{ product.name }}</p>
            <p class="px-1 font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.16em] text-stone-500">{{ product.subtitle }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- The subscription -->
    <section class="border-y border-amber-600/15 bg-amber-50/40">
      <div class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div class="max-w-2xl space-y-4">
          <p class="font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.3em] text-indigo-700">
            The subscription
          </p>
          <h2 class="font-[family:var(--font-serif)] text-4xl leading-tight text-stone-900">
            A fixed structure with room to choose.
          </h2>
        </div>

        <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="plan in subscriptionPlans"
            :key="plan.id"
            class="flex flex-col rounded-md border border-amber-600/25 bg-[#f4ecdd] p-7"
          >
            <div class="flex items-start justify-between gap-3">
              <p class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.2em] text-terra-600">
                {{ plan.cadence }}
              </p>
              <p class="font-[family:var(--font-mono)] text-sm text-indigo-700">
                {{ plan.price.amount }} {{ plan.price.currency }}
              </p>
            </div>
            <h3 class="mt-3 font-[family:var(--font-serif)] text-3xl text-stone-900">
              {{ plan.name }}
            </h3>
            <p class="mt-3 flex-1 text-sm leading-7 text-stone-600">
              {{ plan.summary }}
            </p>
            <NuxtLink
              to="/subscribe"
              class="mt-6 inline-flex items-center gap-2 font-[family:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-indigo-700 transition hover:gap-3"
            >
              Shape this box
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4"
              />
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <!-- Protocol -->
    <section class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p class="font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.3em] text-indigo-700">
            Why illi?
          </p>
          <h2 class="mt-4 font-[family:var(--font-serif)] text-4xl leading-tight text-stone-900">
            Short ingredient lists, local sourcing, and food that can be trusted.
          </h2>
        </div>
        <div class="grid gap-8 sm:grid-cols-3">
          <div
            v-for="step in protocolSteps"
            :key="step.id"
            class="border-t border-amber-600/30 pt-5"
          >
            <p class="font-[family:var(--font-serif)] text-5xl font-light text-amber-300">
              {{ step.id }}
            </p>
            <h3 class="mt-3 font-[family:var(--font-serif)] text-2xl text-stone-900">
              {{ step.title }}
            </h3>
            <p class="mt-2 text-sm leading-7 text-stone-600">
              {{ step.body }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Closing CTA -->
    <section class="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
      <div class="maghreb-wash relative overflow-hidden rounded-lg border border-amber-600/25 bg-indigo-600 px-8 py-14 sm:px-14">
        <div class="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div class="space-y-5">
            <p class="font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.3em] text-amber-200/80">
              Inquire
            </p>
            <h2 class="max-w-2xl font-[family:var(--font-serif)] text-4xl leading-tight text-amber-50">
              The storefront is ready for a branded subscription journey.
            </h2>
            <p class="max-w-xl text-base leading-8 text-indigo-100">
              Browse the collection, shape a subscription, then let the next phase bring invitation access
              and USDT checkout into the same experience.
            </p>
            <div class="flex flex-wrap gap-3 pt-1">
              <NuxtLink
                to="/catalog"
                class="inline-flex items-center gap-2 rounded-sm bg-terra-600 px-6 py-3.5 text-sm font-semibold text-amber-50 transition hover:bg-terra-700"
              >
                View collection
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4"
                />
              </NuxtLink>
              <NuxtLink
                to="/subscribe"
                class="inline-flex items-center gap-2 rounded-sm border border-amber-200/50 px-6 py-3.5 text-sm font-semibold text-amber-50 transition hover:bg-amber-50/10"
              >
                Start subscription
              </NuxtLink>
            </div>
          </div>
          <div class="wax-seal stamp-in justify-self-center [--seal-size:8.5rem]">
            <span>illi<br>·<br>by<br>invitation</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
