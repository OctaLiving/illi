<script setup lang="ts">
interface Crumb {
  label: string
  to?: string
}

// Items with `to` render as links; the last item (no `to`) is the current page.
defineProps<{ items: Crumb[] }>()
</script>

<template>
  <nav
    :aria-label="$t('product.breadcrumb')"
    class="flex flex-wrap items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em]"
  >
    <template
      v-for="(item, i) in items"
      :key="i"
    >
      <NuxtLinkLocale
        v-if="item.to"
        :to="item.to"
        class="text-stone-500 transition hover:text-sage-700"
      >
        {{ item.label }}
      </NuxtLinkLocale>
      <span
        v-else
        aria-current="page"
        class="text-stone-800"
      >
        {{ item.label }}
      </span>
      <UIcon
        v-if="i < items.length - 1"
        name="i-lucide-chevron-right"
        class="flip-rtl size-3 shrink-0 text-sand-600/50"
      />
    </template>
  </nav>
</template>
