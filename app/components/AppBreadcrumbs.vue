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
    aria-label="Breadcrumb"
    class="flex flex-wrap items-center gap-2 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em]"
  >
    <template
      v-for="(item, i) in items"
      :key="i"
    >
      <NuxtLink
        v-if="item.to"
        :to="item.to"
        class="text-stone-500 transition hover:text-terra-700"
      >
        {{ item.label }}
      </NuxtLink>
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
        class="size-3 shrink-0 text-amber-600/50"
      />
    </template>
  </nav>
</template>
