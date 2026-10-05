<script setup lang="ts">
import { MAX_QUANTITY } from '~/composables/useCart'

const { min = 1, size = 'md' } = defineProps<{ min?: number, size?: 'sm' | 'md' }>()
const quantity = defineModel<number>({ required: true })
</script>

<template>
  <div
    class="inline-flex items-center rounded-full bg-sand-50 ring-1 ring-sand-300"
    :class="size === 'sm' ? 'h-9' : 'h-12'"
  >
    <button
      type="button"
      class="grid h-full place-items-center rounded-full text-stone-600 transition hover:bg-sand-100 hover:text-stone-900 disabled:opacity-30"
      :class="size === 'sm' ? 'w-9' : 'w-12'"
      :disabled="quantity <= min"
      :aria-label="$t('qty.decrease')"
      @click="quantity = Math.max(min, quantity - 1)"
    >
      <UIcon
        :name="quantity <= 1 && min === 0 ? 'i-lucide-trash-2' : 'i-lucide-minus'"
        class="size-4"
      />
    </button>
    <span
      class="min-w-7 text-center font-semibold tabular-nums text-stone-900"
      :class="size === 'sm' ? 'text-sm' : 'text-base'"
      aria-live="polite"
    >{{ quantity }}</span>
    <button
      type="button"
      class="grid h-full place-items-center rounded-full text-stone-600 transition hover:bg-sand-100 hover:text-stone-900 disabled:opacity-30"
      :class="size === 'sm' ? 'w-9' : 'w-12'"
      :disabled="quantity >= MAX_QUANTITY"
      :aria-label="$t('qty.increase')"
      @click="quantity = Math.min(MAX_QUANTITY, quantity + 1)"
    >
      <UIcon
        name="i-lucide-plus"
        class="size-4"
      />
    </button>
  </div>
</template>
