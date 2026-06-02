<script setup lang="ts">
definePageMeta({ layout: 'manage', middleware: 'operator' })

const { data: catalog } = await useCatalog()
const products = computed(() => catalog.value.products)
const categories = computed(() => catalog.value.categories)
const plans = computed(() => catalog.value.plans)

interface AdminSubscription { id: string, status: string }
interface AdminOrder { id: string, amount: number, status: string }
const { data: commerce } = await useFetch<{ subscriptions: AdminSubscription[], orders: AdminOrder[] }>('/api/admin/commerce', {
  key: 'admin-commerce',
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  default: () => ({ subscriptions: [], orders: [] })
})
const activeSubscribers = computed(() => commerce.value.subscriptions.filter(s => s.status === 'active').length)
const revenueCollected = computed(() => commerce.value.orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0))

const avgShelf = computed(() =>
  products.value.length
    ? Math.round(products.value.reduce((sum, p) => sum + p.shelfLifeDays, 0) / products.value.length)
    : 0
)
const categoryRows = computed(() =>
  categories.value.map(category => ({
    ...category,
    count: products.value.filter(p => p.eligibleSlotTypes.includes(category.slug)).length
  }))
)
const kpis = computed(() => [
  { label: 'Products', value: String(products.value.length), note: 'in catalog' },
  { label: 'Categories', value: String(categories.value.length), note: 'slot types' },
  { label: 'Plans', value: String(plans.value.length), note: 'subscription boxes' },
  { label: 'Avg shelf life', value: String(avgShelf.value), note: 'days' },
  { label: 'Active subscribers', value: String(activeSubscribers.value), note: 'active now' },
  { label: 'Collected', value: String(revenueCollected.value), note: 'USDT · paid orders' }
])

useSeoMeta({ title: 'Operator console · illi', robots: 'noindex, nofollow' })
</script>

<template>
  <section>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.28em] text-terra-600">
          Operator console
        </p>
        <h1 class="mt-2 font-[family:var(--font-serif)] text-4xl text-stone-900 sm:text-5xl">
          Store at a glance.
        </h1>
      </div>
    </div>

    <div class="mt-8 grid gap-px overflow-hidden rounded-md border border-amber-600/30 bg-amber-600/30 sm:grid-cols-3">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="bg-[#f4ecdd] p-6"
      >
        <p class="font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">
          {{ kpi.label }}
        </p>
        <p class="mt-3 font-[family:var(--font-serif)] text-4xl text-stone-900">
          {{ kpi.value }}
        </p>
        <p class="mt-1 font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-terra-600">
          {{ kpi.note }}
        </p>
      </div>
    </div>

    <div class="mt-6 rounded-md border border-amber-600/25 bg-[#f4ecdd] p-6">
      <p class="font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">
        Products per category
      </p>
      <div class="mt-5 space-y-3">
        <div
          v-for="row in categoryRows"
          :key="row.slug"
          class="flex items-center gap-4"
        >
          <span class="w-44 shrink-0 truncate font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.12em] text-stone-600">
            {{ row.name }}
          </span>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-amber-600/10">
            <div
              class="h-full rounded-full bg-indigo-600 transition-all duration-500"
              :style="`width:${products.length ? (row.count / products.length) * 100 : 0}%`"
            />
          </div>
          <span class="w-6 shrink-0 text-right font-[family:var(--font-mono)] text-sm text-stone-900">
            {{ row.count }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
