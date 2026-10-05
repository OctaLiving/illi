<script setup lang="ts">
// "Notre histoire": the brand story from the ILLI guideline, told in the
// founder's own words, followed by the values and the mission.
const { t, tm, rt } = useI18n()
const { data: catalog } = await useCatalog()

const photo = (slug: string) => catalog.value.products.find(p => p.slug === slug && p.isAvailable)?.image

// Each part is a list of short paragraphs; headings sit between parts.
const parts = computed(() => (['part1', 'part2', 'part3', 'part4'] as const).map(key =>
  (tm(`story.${key}`) as unknown[]).map(p => rt(p as Parameters<typeof rt>[0]))
))

useSeoMeta({
  title: () => t('story.metaTitle'),
  description: () => t('story.metaDescription')
})
</script>

<template>
  <div>
    <section class="maghreb-wash border-b border-sand-200">
      <div class="mx-auto max-w-6xl px-5 pb-12 pt-12 sm:px-8 sm:pt-16">
        <p class="brand-block bg-terra-700 text-sand-50">
          {{ $t('nav.story') }}
        </p>
        <h1 class="mt-8 max-w-3xl font-serif text-4xl leading-tight text-terra-800 sm:text-6xl">
          {{ $t('story.lead') }}
        </h1>
      </div>
    </section>

    <section class="mx-auto mt-12 grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div class="lg:sticky lg:top-28 lg:self-start">
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <div
            v-if="photo('water-kefir')"
            class="arch overflow-hidden ring-1 ring-sand-200"
          >
            <img
              :src="photo('water-kefir')!.src"
              :alt="$t('home.storyAlt')"
              class="ivory-photo aspect-[4/5] size-full object-cover"
            >
          </div>
          <div
            v-if="photo('kombucha')"
            class="overflow-hidden rounded-3xl ring-1 ring-sand-200 lg:hidden"
          >
            <img
              :src="photo('kombucha')!.src"
              alt=""
              class="ivory-photo aspect-[4/5] size-full object-cover"
            >
          </div>
        </div>
      </div>

      <article class="max-w-2xl text-lg leading-8 text-stone-700">
        <div class="space-y-4">
          <p
            v-for="(para, i) in parts[0]"
            :key="`a${i}`"
          >
            {{ para }}
          </p>
        </div>
        <div class="mt-8 space-y-4">
          <p
            v-for="(para, i) in parts[1]"
            :key="`b${i}`"
          >
            {{ para }}
          </p>
        </div>

        <h2 class="mt-12 font-serif text-2xl leading-snug text-terra-800 sm:text-3xl">
          {{ $t('story.heading2') }}
        </h2>
        <div class="mt-4 space-y-4">
          <p
            v-for="(para, i) in parts[2]"
            :key="`c${i}`"
          >
            {{ para }}
          </p>
        </div>

        <h2 class="mt-12 font-serif text-2xl leading-snug text-terra-800 sm:text-3xl">
          {{ $t('story.heading3') }}
        </h2>
        <div class="mt-4 space-y-4">
          <p
            v-for="(para, i) in parts[3]"
            :key="`d${i}`"
          >
            {{ para }}
          </p>
        </div>

        <p class="mt-12 font-script text-5xl font-bold leading-tight text-saffron-600 rtl:text-3xl">
          {{ $t('story.signature') }}
        </p>
      </article>
    </section>

    <BrandValues class="mt-24" />

    <BrandMission
      full
      class="mt-20"
    />

    <section class="mx-auto mt-20 max-w-6xl px-5 text-center sm:px-8">
      <p class="font-serif text-3xl text-stone-900 sm:text-4xl">
        {{ $t('home.ctaTitle') }}
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <NuxtLinkLocale
          to="/catalog"
          class="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-terra-700 px-7 py-4 font-semibold text-sand-50 transition hover:bg-terra-800"
        >
          {{ $t('home.shop') }}
          <UIcon
            name="i-lucide-arrow-right"
            class="flip-rtl size-5"
          />
        </NuxtLinkLocale>
        <NuxtLinkLocale
          to="/subscribe"
          class="inline-flex items-center whitespace-nowrap rounded-full bg-sand-50 px-7 py-4 font-semibold text-terra-800 ring-1 ring-sand-300 transition hover:ring-terra-600"
        >
          {{ $t('home.buildBox') }}
        </NuxtLinkLocale>
      </div>
    </section>
  </div>
</template>
