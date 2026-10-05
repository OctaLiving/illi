<script setup lang="ts">
// "Notre mission" from the brand guideline, on the olive panel. The home page
// shows the short statement; the story page shows both.
const { full = false } = defineProps<{ full?: boolean }>()
const quotes = computed(() => (full ? ['mission.quote1', 'mission.quote2'] : ['mission.quote2']))
</script>

<template>
  <section class="mx-auto max-w-6xl px-5 sm:px-8">
    <div class="rounded-[2rem] bg-sage-700 px-7 py-12 text-sand-50 sm:px-14 sm:py-16">
      <h2 class="brand-block bg-sand-50/10 text-sand-50">
        {{ $t('mission.title') }}
      </h2>
      <div class="mt-10 space-y-10">
        <blockquote
          v-for="key in quotes"
          :key="key"
          class="relative max-w-4xl ps-14 sm:ps-20"
        >
          <span
            class="absolute -top-3 start-0 font-serif text-7xl leading-none text-terra-200 sm:text-8xl"
            aria-hidden="true"
          >“</span>
          <p
            class="font-serif leading-snug"
            :class="key === 'mission.quote2' ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-2xl'"
          >
            {{ $t(key) }}
          </p>
        </blockquote>
      </div>
    </div>
  </section>
</template>
