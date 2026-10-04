<script setup lang="ts">
const { data: catalog } = await useCatalog()
const { t } = useI18n()
const { tr, price } = useLocalized()
const localePath = useLocalePath()
const categoryName = (slug: string) => {
  const category = catalog.value.categories.find(c => c.slug === slug)
  return category ? tr(category, 'name') : slug
}
const subtitle = (p: { storage: string, shelfLifeDays: number }) =>
  t('product.subtitle', { storage: p.storage === 'Refrigerated' ? t('product.refrigerated') : t('product.roomTemp'), n: p.shelfLifeDays })
const slotLabelById = (slotId: string, fallback: string) => {
  const slot = selectedPlan.value?.includedSlots.find(s => s.id === slotId)
  return slot ? tr(slot, 'label') : fallback
}
const productNameById = (id: string, fallback: string) => {
  const product = catalog.value.products.find(p => p.id === id)
  return product ? tr(product, 'name') : fallback
}

const {
  products,
  plans,
  selectedPlan,
  selectedPlanId,
  validationIssues,
  bundleSummary,
  remainingRequiredSlots,
  setPlan,
  getSelectedProductIds,
  isSelected,
  toggleProduct,
  clearSlot,
  getEligibleProductsForSlot
} = useSubscriptionBuilder(catalog.value.products, catalog.value.plans)

// All derived from the single bundle summary — no slot completion is re-computed
// here, so the progress meter, slot fill states and readiness can never disagree.
const summaryBySlot = computed(
  () => new Map((bundleSummary.value?.selectionItems ?? []).map(item => [item.slotId, item]))
)

const requiredTotal = computed(() => bundleSummary.value?.requiredSlots ?? 0)
const requiredFilled = computed(() => bundleSummary.value?.completedRequiredSlots ?? 0)
const isReady = computed(() => bundleSummary.value?.isReadyForCheckout ?? false)

const requiredSlotStates = computed(() =>
  (selectedPlan.value?.includedSlots ?? [])
    .filter(slot => slot.required)
    .map(slot => ({ id: slot.id, filled: summaryBySlot.value.get(slot.id)?.isComplete ?? false }))
)

function slotIsFilled(slotId: string) {
  return summaryBySlot.value.get(slotId)?.isComplete ?? false
}

// Checkout is the gate: browsing and building are open, but proceeding requires
// an account.
const { data: me } = useMe()

function proceedToCheckout() {
  return navigateTo(localePath(me.value?.user ? '/checkout' : '/login?next=/checkout'))
}

useSeoMeta({
  title: () => t('builder.metaTitle'),
  description: () => t('builder.metaDescription')
})
</script>

<template>
  <div class="maghreb-wash">
    <div class="mx-auto max-w-6xl space-y-16 px-5 py-14 pb-28 sm:px-8 sm:py-20 xl:pb-20">
      <!-- Hero + progress -->
      <section class="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p
            class="reveal inline-flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-terra-700"
            style="animation-delay:.05s"
          >
            <span class="h-px w-8 bg-sage-600" />
            {{ $t('builder.eyebrow') }}
          </p>
          <h1
            class="reveal mt-6 max-w-3xl font-serif text-5xl font-normal leading-[1.0] tracking-tight text-stone-900 sm:text-6xl"
            style="animation-delay:.16s"
          >
            {{ $t('builder.titleA') }} <em class="italic text-terra-700">{{ $t('builder.titleB') }}</em>
          </h1>
          <p
            class="reveal mt-6 max-w-2xl text-lg leading-8 text-stone-700"
            style="animation-delay:.26s"
          >
            {{ $t('builder.intro') }}
          </p>
        </div>

        <!-- Progress card -->
        <div
          class="reveal rounded-3xl border p-7 transition-colors duration-500"
          :class="isReady ? 'border-terra-600/40 bg-terra-600/[0.04]' : 'border-sand-600/30 bg-sand-50/60'"
          style="animation-delay:.3s"
        >
          <div class="flex items-center justify-between">
            <p class="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-sage-600">
              {{ $t('builder.progress') }}
            </p>
            <p class="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-stone-500">
              {{ requiredFilled }} / {{ requiredTotal }}
            </p>
          </div>

          <!-- segmented required-slot track -->
          <div class="mt-5 flex gap-1.5">
            <span
              v-for="(seg, i) in requiredSlotStates"
              :key="seg.id"
              class="h-1.5 flex-1 rounded-full transition-colors duration-500"
              :class="seg.filled ? 'bg-terra-600' : 'bg-sand-600/20'"
              :style="`transition-delay:${i * 60}ms`"
            />
          </div>

          <div
            v-if="isReady"
            class="mt-6 flex items-center gap-4"
          >
            <div class="wax-seal stamp-in shrink-0 [--seal-size:4rem]">
              <span>ready</span>
            </div>
            <p class="text-sm leading-6 text-stone-700">
              {{ $t('builder.complete') }}
            </p>
          </div>
          <div
            v-else
            class="mt-6"
          >
            <p class="font-serif text-5xl leading-none text-stone-900">
              {{ remainingRequiredSlots }}
            </p>
            <p class="mt-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-stone-500">
              {{ $t('builder.spotsLeft', remainingRequiredSlots) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Step 1 -->
      <section class="space-y-6">
        <div class="flex items-baseline gap-4">
          <span class="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-sage-600">{{ $t('builder.step', { n: 1 }) }}</span>
          <h2 class="font-serif text-4xl text-stone-900">
            {{ $t('builder.chooseBox') }}
          </h2>
        </div>

        <div class="grid gap-5 lg:grid-cols-2">
          <button
            v-for="plan in plans"
            :key="plan.id"
            type="button"
            class="rounded-3xl border p-7 text-left transition"
            :class="selectedPlanId === plan.id
              ? 'border-terra-600 bg-terra-600/[0.04] shadow-[0_20px_40px_-30px_rgba(30,58,95,0.6)]'
              : 'border-sand-600/30 bg-white hover:border-sage-600/50'"
            @click="setPlan(plan.id)"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="space-y-3">
                <p class="font-mono text-[0.64rem] uppercase tracking-[0.2em] text-sage-600">
                  {{ $t(`cadenceTitle.${plan.cadence}`) }}
                </p>
                <h3 class="font-serif text-3xl text-stone-900">
                  {{ tr(plan, 'name') }}
                </h3>
                <p class="max-w-md text-sm leading-7 text-stone-600">
                  {{ tr(plan, 'summary') }}
                </p>
              </div>
              <span
                class="shrink-0 rounded-lg px-3 py-1.5 font-mono text-xs"
                :class="selectedPlanId === plan.id ? 'bg-terra-600 text-sand-50' : 'bg-sand-600/10 text-stone-600'"
              >
                {{ price(plan.price.amount) }}
              </span>
            </div>
          </button>
        </div>
      </section>

      <!-- Step 2 -->
      <section
        v-if="selectedPlan"
        class="grid gap-10 xl:grid-cols-[1.15fr_0.85fr] xl:items-start"
      >
        <div class="space-y-6">
          <div class="flex items-baseline gap-4">
            <span class="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-sage-600">{{ $t('builder.step', { n: 2 }) }}</span>
            <h2 class="font-serif text-4xl text-stone-900">
              {{ $t('builder.fill', { name: tr(selectedPlan, 'name') }) }}
            </h2>
          </div>

          <div class="space-y-6">
            <section
              v-for="slot in selectedPlan.includedSlots"
              :key="slot.id"
              class="rounded-3xl border p-6 transition-colors duration-300"
              :class="slotIsFilled(slot.id) ? 'border-terra-600/40 bg-terra-600/[0.02]' : 'border-sand-600/25 bg-white'"
            >
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div class="space-y-3">
                  <div class="flex flex-wrap gap-2 font-mono text-[0.6rem] uppercase tracking-[0.16em]">
                    <span class="rounded-lg bg-sage-600/10 px-2 py-1 text-sage-700">{{ categoryName(slot.slotType) }}</span>
                    <span
                      class="rounded-lg px-2 py-1"
                      :class="slot.required ? 'bg-terra-600/10 text-terra-700' : 'bg-sand-600/10 text-stone-500'"
                    >
                      {{ slot.required ? $t('builder.required') : $t('builder.optional') }}
                    </span>
                  </div>
                  <div>
                    <h3 class="flex items-center gap-2 font-serif text-3xl text-stone-900">
                      {{ tr(slot, 'label') }}
                      <UIcon
                        v-if="slotIsFilled(slot.id)"
                        name="i-lucide-check"
                        class="size-5 text-terra-600"
                      />
                    </h3>
                    <p class="mt-2 max-w-md text-sm leading-7 text-stone-600">
                      {{ tr(slot, 'description') }}
                    </p>
                  </div>
                </div>

                <div class="flex shrink-0 items-center gap-3 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-stone-500">
                  <span>{{ getSelectedProductIds(slot.id).length }} / {{ slot.maxQuantity }}</span>
                  <button
                    type="button"
                    class="rounded-lg px-2.5 py-1.5 text-terra-700 transition hover:bg-terra-600/8 disabled:opacity-30 disabled:hover:bg-transparent"
                    :disabled="getSelectedProductIds(slot.id).length === 0"
                    @click="clearSlot(slot.id)"
                  >
                    {{ $t('builder.clear') }}
                  </button>
                </div>
              </div>

              <div class="mt-6 grid gap-4 sm:grid-cols-2">
                <button
                  v-for="product in getEligibleProductsForSlot(products, slot)"
                  :key="`${slot.id}-${product.id}`"
                  type="button"
                  class="group/card rounded-3xl border p-3 text-left transition active:scale-[0.99]"
                  :class="isSelected(slot.id, product.id)
                    ? 'border-sage-600 bg-sage-600/[0.06] shadow-[0_18px_34px_-26px_rgba(194,65,12,0.7)] ring-1 ring-sage-600/30'
                    : 'border-sand-600/25 bg-sand-50/40 hover:border-sage-600/50'"
                  @click="toggleProduct(slot, product.id)"
                >
                  <div class="flex gap-4">
                    <div class="arch-inner h-24 w-20 shrink-0 overflow-hidden border border-sand-600/30 bg-stone-100">
                      <img
                        :src="product.image.src"
                        :alt="tr(product, 'name')"
                        class="size-full object-cover transition duration-500 group-hover/card:scale-[1.05]"
                      >
                    </div>
                    <div class="min-w-0 space-y-1.5">
                      <div class="flex items-center gap-2">
                        <h4 class="font-serif text-xl text-stone-900">
                          {{ tr(product, 'name') }}
                        </h4>
                        <UIcon
                          v-if="isSelected(slot.id, product.id)"
                          name="i-lucide-check"
                          class="size-4 shrink-0 text-sage-600"
                        />
                      </div>
                      <p class="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-stone-500">
                        {{ subtitle(product) }}
                      </p>
                      <p class="line-clamp-2 text-sm leading-6 text-stone-600">
                        {{ tr(product, 'description') }}
                      </p>
                      <p
                        class="font-mono text-[0.58rem] uppercase tracking-[0.16em] transition"
                        :class="isSelected(slot.id, product.id) ? 'text-sage-700' : 'text-transparent group-hover/card:text-stone-400'"
                      >
                        {{ isSelected(slot.id, product.id) ? $t('builder.inBox') : $t('builder.tapToAdd') }}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </section>
          </div>
        </div>

        <!-- Live summary -->
        <aside
          id="bundle-summary"
          class="scroll-mt-28 space-y-6 xl:sticky xl:top-28"
        >
          <section class="rounded-3xl border border-sand-600/30 bg-sand-50/60 p-6">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-sage-600">
                  {{ $t('builder.summary') }}
                </p>
                <h2 class="mt-2 font-serif text-3xl text-stone-900">
                  {{ $t('builder.yourBox') }}
                </h2>
              </div>
              <div
                v-if="isReady"
                class="wax-seal stamp-in shrink-0 [--seal-size:4.25rem]"
              >
                <span>{{ $t('builder.sealed') }}</span>
              </div>
            </div>

            <div
              v-if="bundleSummary"
              class="mt-6 space-y-4"
            >
              <div class="rounded-3xl bg-white ring-1 ring-sand-200 p-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p class="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-stone-500">
                      {{ $t(`cadenceTitle.${bundleSummary.cadence}`) }}
                    </p>
                    <p class="mt-1.5 font-serif text-2xl text-stone-900">
                      {{ selectedPlan ? tr(selectedPlan, 'name') : bundleSummary.planName }}
                    </p>
                    <p class="mt-1 font-mono text-sm text-terra-700">
                      {{ price(bundleSummary.basePriceAmount) }}
                    </p>
                  </div>
                  <span
                    class="rounded-lg px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em]"
                    :class="isReady ? 'bg-terra-600 text-sand-50' : 'bg-sage-600/15 text-sage-700'"
                  >
                    {{ isReady ? $t('builder.ready') : $t('builder.inProgress') }}
                  </span>
                </div>
              </div>

              <div
                v-for="item in bundleSummary.selectionItems"
                :key="item.slotId"
                class="rounded-3xl border border-sand-600/20 bg-sand-50/40 p-4"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-medium text-stone-900">
                      {{ slotLabelById(item.slotId, item.slotLabel) }}
                    </p>
                    <p class="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-stone-500">
                      {{ categoryName(item.slotType) }}
                    </p>
                  </div>
                  <span
                    class="rounded-lg px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em]"
                    :class="item.isComplete ? 'bg-terra-600/10 text-terra-700' : 'bg-sage-600/10 text-sage-700'"
                  >
                    {{ item.isComplete ? $t('builder.filled') : item.required ? $t('builder.required') : $t('builder.optional') }}
                  </span>
                </div>

                <ul class="mt-3 space-y-2 text-sm leading-7 text-stone-700">
                  <li
                    v-if="item.productNames.length === 0"
                    class="text-stone-400"
                  >
                    {{ $t('builder.nothingYet') }}
                  </li>
                  <li
                    v-for="(productId, i) in item.productIds"
                    :key="productId"
                    class="flex items-start gap-3"
                  >
                    <UIcon
                      name="i-lucide-check"
                      class="mt-1 size-4 shrink-0 text-sage-600"
                    />
                    <span>{{ productNameById(productId, item.productNames[i] ?? productId) }}</span>
                  </li>
                </ul>
              </div>

              <!-- Finish line -->
              <div class="space-y-2 pt-1">
                <button
                  type="button"
                  class="flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 font-mono text-xs uppercase tracking-[0.16em] transition"
                  :class="isReady
                    ? 'bg-sage-600 text-sand-50 hover:bg-sage-700'
                    : 'cursor-not-allowed bg-sand-600/10 text-stone-400'"
                  :disabled="!isReady"
                  @click="proceedToCheckout"
                >
                  {{ !isReady ? $t('builder.fillMore', { n: remainingRequiredSlots }) : me?.user ? $t('builder.continue') : $t('builder.signIn') }}
                  <UIcon
                    v-if="isReady"
                    name="i-lucide-arrow-right"
                    class="flip-rtl size-4"
                  />
                </button>
                <p class="text-center font-mono text-[0.58rem] uppercase tracking-[0.12em] text-stone-400">
                  {{ $t('builder.payNote') }}
                </p>
              </div>
            </div>
          </section>

          <section
            v-if="validationIssues.length > 0"
            class="rounded-3xl border border-sage-600/30 bg-sage-50/70 p-6"
          >
            <p class="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-sage-700">
              {{ $t('builder.almost') }}
            </p>
            <h2 class="mt-2 font-serif text-2xl text-stone-900">
              {{ $t('builder.stillToChoose') }}
            </h2>
            <ul class="mt-4 space-y-3 text-sm leading-7 text-stone-700">
              <li
                v-for="issue in validationIssues"
                :key="`${issue.slotId}-${issue.type}`"
                class="flex items-start gap-3"
              >
                <UIcon
                  name="i-lucide-alert-circle"
                  class="mt-1 size-4 shrink-0 text-sage-600"
                />
                <span>{{ $t(`builder.issues.${issue.type}`, { slot: slotLabelById(issue.slotId, issue.slotId) }) }}</span>
              </li>
            </ul>
          </section>
        </aside>
      </section>
    </div>

    <!-- Mobile sticky finish bar -->
    <div
      v-if="selectedPlan"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-sand-600/20 bg-white/95 px-5 py-3 backdrop-blur-md xl:hidden"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div class="min-w-0 flex-1">
          <div class="flex gap-1">
            <span
              v-for="seg in requiredSlotStates"
              :key="seg.id"
              class="h-1 flex-1 rounded-full transition-colors duration-500"
              :class="seg.filled ? 'bg-terra-600' : 'bg-sand-600/20'"
            />
          </div>
          <p class="mt-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-stone-500">
            {{ $t('builder.chosen', { a: requiredFilled, b: requiredTotal }) }}
          </p>
        </div>
        <a
          href="#bundle-summary"
          class="shrink-0 rounded-lg px-4 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] transition"
          :class="isReady ? 'bg-sage-600 text-sand-50' : 'bg-terra-600 text-sand-50'"
        >
          {{ isReady ? $t('builder.readyReview') : $t('builder.left', { n: remainingRequiredSlots }) }}
        </a>
      </div>
    </div>
  </div>
</template>
