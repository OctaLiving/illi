<script setup lang="ts">
// The illi logo. "illi" reads the same both ways, so the wordmark is four
// symmetric strokes (short, tall, tall, short) with saffron i-dots; the mark
// sets that wordmark inside a Moroccan arch. Strokes follow `currentColor`.
const { variant = 'lockup', reversed = false } = defineProps<{
  variant?: 'wordmark' | 'mark' | 'lockup'
  /** Light arch for dark backgrounds (mark/lockup only). */
  reversed?: boolean
}>()
</script>

<template>
  <span class="inline-flex items-center gap-[0.35em]">
    <svg
      v-if="variant !== 'wordmark'"
      viewBox="0 0 120 150"
      class="h-[1.25em] w-auto shrink-0"
      aria-hidden="true"
    >
      <path
        d="M0 150V60a60 60 0 0 1 120 0v90z"
        :fill="reversed ? 'var(--color-sand-100)' : 'var(--color-olive-700)'"
      />
      <g
        :stroke="reversed ? 'var(--color-olive-700)' : 'var(--color-sand-100)'"
        stroke-width="9"
        stroke-linecap="round"
        fill="none"
      >
        <path d="M30 88V124" />
        <path d="M50 58V124" />
        <path d="M70 58V124" />
        <path d="M90 88V124" />
      </g>
      <circle
        cx="30"
        cy="69"
        r="6.5"
        fill="var(--color-saffron-400)"
      />
      <circle
        cx="90"
        cy="69"
        r="6.5"
        fill="var(--color-saffron-400)"
      />
    </svg>
    <svg
      v-if="variant !== 'mark'"
      viewBox="0 0 132 100"
      class="h-[0.8em] w-auto shrink-0"
      role="img"
      aria-label="illi"
    >
      <g
        stroke="currentColor"
        stroke-width="15"
        stroke-linecap="round"
        fill="none"
      >
        <path d="M14 46V88" />
        <path d="M50 12V88" />
        <path d="M82 12V88" />
        <path d="M118 46V88" />
      </g>
      <circle
        cx="14"
        cy="17"
        r="9.5"
        fill="var(--color-saffron-400)"
      />
      <circle
        cx="118"
        cy="17"
        r="9.5"
        fill="var(--color-saffron-400)"
      />
    </svg>
  </span>
</template>
