<script setup lang="ts">
// "Nos valeurs" from the brand guideline: the five values as a two-column
// table with alternating olive and ivory rows.
const keys = ['transmission', 'simplicity', 'living', 'authenticity', 'kindness'] as const
</script>

<template>
  <section class="mx-auto max-w-6xl px-5 sm:px-8">
    <div class="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
      <div>
        <h2 class="brand-block bg-sand-200 text-terra-700">
          {{ $t('values.title') }}
        </h2>
        <p class="mt-6 max-w-sm font-serif text-2xl leading-snug text-stone-900 sm:text-3xl">
          {{ $t('values.intro') }}
        </p>
      </div>
      <dl class="overflow-hidden rounded-2xl ring-1 ring-sand-300">
        <div
          v-for="(key, i) in keys"
          :key="key"
          class="grid gap-1 px-5 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6 sm:px-6"
          :class="i % 2 === 0 ? 'bg-sage-200/80' : 'bg-sand-100'"
        >
          <dt
            class="font-bold"
            :class="i % 2 === 0 ? 'text-sage-800' : 'text-terra-800'"
          >
            {{ $t(`values.items.${key}.title`) }}
          </dt>
          <dd class="leading-7 text-stone-700">
            {{ $t(`values.items.${key}.body`) }}
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>
