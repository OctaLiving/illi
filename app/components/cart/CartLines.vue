<script setup lang="ts">
// The cart's line items, shared by the drawer and the /cart page.
const { lines, setQuantity, isOpen } = useCart()
const { tr, price } = useLocalized()
</script>

<template>
  <ul class="divide-y divide-sand-200">
    <li
      v-for="line in lines"
      :key="line.productId"
      class="flex gap-4 py-4"
    >
      <NuxtLinkLocale
        :to="`/catalog/${line.product.slug}`"
        class="shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-sand-200"
        @click="isOpen = false"
      >
        <img
          :src="line.product.image.src"
          :alt="tr(line.product, 'name')"
          class="size-20 object-cover"
          loading="lazy"
        >
      </NuxtLinkLocale>
      <div class="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <NuxtLinkLocale
              :to="`/catalog/${line.product.slug}`"
              class="block truncate font-semibold text-stone-900 hover:text-olive-700"
              @click="isOpen = false"
            >
              {{ tr(line.product, 'name') }}
            </NuxtLinkLocale>
            <p class="text-sm text-stone-500">
              {{ price(line.product.price.amount) }} · {{ $t(`units.${line.product.defaultUnitLabel}`, line.product.defaultUnitLabel) }}
            </p>
          </div>
          <p class="shrink-0 font-semibold tabular-nums text-stone-900">
            {{ price(line.lineTotal) }}
          </p>
        </div>
        <QuantityStepper
          class="self-start"
          :model-value="line.quantity"
          :min="0"
          size="sm"
          @update:model-value="q => setQuantity(line.productId, q)"
        />
      </div>
    </li>
  </ul>
</template>
