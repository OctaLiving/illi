<script setup lang="ts">
// The Maison Illi logo: "Maison" in Gilda Display, a ginkgo leaf, and "Illi" in
// Corinthia script, with the tagline "De notre cuisine à la vôtre" under the
// lockup. The mark is the ginkgo leaf alone. Text and leaf colours come from the
// brand palette; `reversed` switches to light colours for dark backgrounds.
const { variant = 'wordmark', reversed = false } = defineProps<{
  variant?: 'wordmark' | 'mark' | 'lockup'
  /** Light colours for dark backgrounds. */
  reversed?: boolean
}>()

const ink = computed(() => (reversed ? 'var(--color-sand-50)' : 'var(--color-terra-700)'))
const leaf = computed(() => (reversed ? 'var(--color-sage-200)' : 'var(--color-sage-500)'))
</script>

<template>
  <span
    class="inline-flex flex-col items-center leading-none"
    dir="ltr"
    :style="{ color: ink }"
    role="img"
    aria-label="Maison Illi"
  >
    <span
      class="inline-flex items-end"
      aria-hidden="true"
    >
      <span
        v-if="variant !== 'mark'"
        class="text-[1em] tracking-[-0.01em]"
        style="font-family: 'Gilda Display', Georgia, serif; font-weight: 400"
      >Maison</span>
      <svg
        viewBox="0 0 100 120"
        :class="variant === 'mark' ? 'h-[1.1em] w-auto' : 'relative top-[0.2em] -mx-[0.02em] h-[0.8em] w-auto shrink-0'"
        fill="none"
        :stroke="leaf"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <g transform="rotate(-14 50 70)">
          <path
            d="M50 70C38 60 16 48 6 34C10 18 24 6 38 7C44 8 48 14 50 24C52 14 56 8 62 7C76 6 90 18 94 34C84 48 62 60 50 70Z"
            :fill="leaf"
            fill-opacity="0.14"
            stroke-width="3"
          />
          <path
            d="M50 70L12 30M50 70L18 20M50 70L27 13M50 70L37 10M50 70L45 17M50 70L55 17M50 70L63 10M50 70L73 13M50 70L82 20M50 70L88 30"
            stroke-width="1.4"
            stroke-opacity="0.8"
          />
          <path
            d="M50 70C50 86 48 102 44 116"
            stroke-width="3"
          />
        </g>
      </svg>
      <span
        v-if="variant !== 'mark'"
        class="-ms-[0.04em] text-[1.6em] leading-[0.8]"
        style="font-family: 'Corinthia', cursive; font-weight: 700"
      >Illi</span>
    </span>
    <span
      v-if="variant === 'lockup'"
      class="mt-[0.9em] text-[0.2em] uppercase tracking-[0.14em]"
      style="font-family: 'Questrial', sans-serif"
      aria-hidden="true"
    >De notre cuisine à la vôtre</span>
  </span>
</template>
