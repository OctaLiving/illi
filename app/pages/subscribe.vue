<script setup lang="ts">
const { data: catalog } = await useCatalog()

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
// an account (which only exists via a redeemed invitation).
const { data: me } = useMe()

function proceedToCheckout() {
  return navigateTo(me.value?.user ? '/checkout' : '/login?next=/checkout')
}

useSeoMeta({
  title: 'The subscription',
  description: 'Choose a base plan and fill the allowed bundle slots with compatible products from the illi collection.'
})
</script>

<template>
  <div class="maghreb-wash">
    <div class="mx-auto max-w-6xl space-y-16 px-5 py-14 pb-28 sm:px-8 sm:py-20 xl:pb-20">
      <!-- Hero + progress -->
      <section class="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p
            class="reveal inline-flex items-center gap-3 font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.3em] text-indigo-700"
            style="animation-delay:.05s"
          >
            <span class="h-px w-8 bg-terra-600" />
            The subscription
          </p>
          <h1
            class="reveal mt-6 max-w-3xl font-[family:var(--font-serif)] text-5xl font-normal leading-[1.0] tracking-tight text-stone-900 sm:text-6xl"
            style="animation-delay:.16s"
          >
            A curated pantry with room to <em class="italic text-terra-600">choose.</em>
          </h1>
          <p
            class="reveal mt-6 max-w-2xl text-lg leading-8 text-stone-700"
            style="animation-delay:.26s"
          >
            Start with a fixed plan, then fill the allowed slots with products from the current collection.
            The builder keeps the logic strict — the experience should still feel like curation.
          </p>
        </div>

        <!-- Progress card -->
        <div
          class="reveal rounded-md border p-7 transition-colors duration-500"
          :class="isReady ? 'border-indigo-600/40 bg-indigo-600/[0.04]' : 'border-amber-600/30 bg-amber-50/60'"
          style="animation-delay:.3s"
        >
          <div class="flex items-center justify-between">
            <p class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.2em] text-terra-600">
              Bundle progress
            </p>
            <p class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.16em] text-stone-500">
              {{ requiredFilled }} / {{ requiredTotal }}
            </p>
          </div>

          <!-- segmented required-slot track -->
          <div class="mt-5 flex gap-1.5">
            <span
              v-for="(seg, i) in requiredSlotStates"
              :key="seg.id"
              class="h-1.5 flex-1 rounded-full transition-colors duration-500"
              :class="seg.filled ? 'bg-indigo-600' : 'bg-amber-600/20'"
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
              The bundle satisfies the plan structure. Ready to seal and hand off to checkout.
            </p>
          </div>
          <div
            v-else
            class="mt-6"
          >
            <p class="font-[family:var(--font-serif)] text-5xl leading-none text-stone-900">
              {{ remainingRequiredSlots }}
            </p>
            <p class="mt-2 font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.16em] text-stone-500">
              required slot{{ remainingRequiredSlots === 1 ? '' : 's' }} left to fill
            </p>
          </div>
        </div>
      </section>

      <!-- Step 1 -->
      <section class="space-y-6">
        <div class="flex items-baseline gap-4">
          <span class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.24em] text-terra-600">Step 1</span>
          <h2 class="font-[family:var(--font-serif)] text-4xl text-stone-900">
            Choose the base plan.
          </h2>
        </div>

        <div class="grid gap-5 lg:grid-cols-2">
          <button
            v-for="plan in plans"
            :key="plan.id"
            type="button"
            class="rounded-md border p-7 text-left transition"
            :class="selectedPlanId === plan.id
              ? 'border-indigo-600 bg-indigo-600/[0.04] shadow-[0_20px_40px_-30px_rgba(30,58,95,0.6)]'
              : 'border-amber-600/30 bg-[#f4ecdd] hover:border-terra-600/50'"
            @click="setPlan(plan.id)"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="space-y-3">
                <p class="font-[family:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.2em] text-terra-600">
                  {{ plan.cadence }}
                </p>
                <h3 class="font-[family:var(--font-serif)] text-3xl text-stone-900">
                  {{ plan.name }}
                </h3>
                <p class="max-w-md text-sm leading-7 text-stone-600">
                  {{ plan.summary }}
                </p>
              </div>
              <span
                class="shrink-0 rounded-sm px-3 py-1.5 font-[family:var(--font-mono)] text-xs"
                :class="selectedPlanId === plan.id ? 'bg-indigo-600 text-amber-50' : 'bg-amber-600/10 text-stone-600'"
              >
                {{ plan.price.amount }} {{ plan.price.currency }}
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
            <span class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.24em] text-terra-600">Step 2</span>
            <h2 class="font-[family:var(--font-serif)] text-4xl text-stone-900">
              Fill the {{ selectedPlan.name }}.
            </h2>
          </div>

          <div class="space-y-6">
            <section
              v-for="slot in selectedPlan.includedSlots"
              :key="slot.id"
              class="rounded-md border p-6 transition-colors duration-300"
              :class="slotIsFilled(slot.id) ? 'border-indigo-600/40 bg-indigo-600/[0.02]' : 'border-amber-600/25 bg-[#f4ecdd]'"
            >
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div class="space-y-3">
                  <div class="flex flex-wrap gap-2 font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em]">
                    <span class="rounded-sm bg-terra-600/10 px-2 py-1 text-terra-700">{{ slot.slotType }} slot</span>
                    <span
                      class="rounded-sm px-2 py-1"
                      :class="slot.required ? 'bg-indigo-600/10 text-indigo-700' : 'bg-amber-600/10 text-stone-500'"
                    >
                      {{ slot.required ? 'Required' : 'Optional' }}
                    </span>
                  </div>
                  <div>
                    <h3 class="flex items-center gap-2 font-[family:var(--font-serif)] text-3xl text-stone-900">
                      {{ slot.label }}
                      <UIcon
                        v-if="slotIsFilled(slot.id)"
                        name="i-lucide-check"
                        class="size-5 text-indigo-600"
                      />
                    </h3>
                    <p class="mt-2 max-w-md text-sm leading-7 text-stone-600">
                      {{ slot.description }}
                    </p>
                  </div>
                </div>

                <div class="flex shrink-0 items-center gap-3 font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.14em] text-stone-500">
                  <span>{{ getSelectedProductIds(slot.id).length }} / {{ slot.maxQuantity }}</span>
                  <button
                    type="button"
                    class="rounded-sm px-2.5 py-1.5 text-indigo-700 transition hover:bg-indigo-600/8 disabled:opacity-30 disabled:hover:bg-transparent"
                    :disabled="getSelectedProductIds(slot.id).length === 0"
                    @click="clearSlot(slot.id)"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div class="mt-6 grid gap-4 sm:grid-cols-2">
                <button
                  v-for="product in getEligibleProductsForSlot(products, slot)"
                  :key="`${slot.id}-${product.id}`"
                  type="button"
                  class="group/card rounded-md border p-3 text-left transition active:scale-[0.99]"
                  :class="isSelected(slot.id, product.id)
                    ? 'border-terra-600 bg-terra-600/[0.06] shadow-[0_18px_34px_-26px_rgba(194,65,12,0.7)] ring-1 ring-terra-600/30'
                    : 'border-amber-600/25 bg-amber-50/40 hover:border-terra-600/50'"
                  @click="toggleProduct(slot, product.id)"
                >
                  <div class="flex gap-4">
                    <div class="arch-inner h-24 w-20 shrink-0 overflow-hidden border border-amber-600/30 bg-stone-100">
                      <img
                        :src="product.image.src"
                        :alt="product.image.alt"
                        class="size-full object-cover transition duration-500 group-hover/card:scale-[1.05]"
                      >
                    </div>
                    <div class="min-w-0 space-y-1.5">
                      <div class="flex items-center gap-2">
                        <h4 class="font-[family:var(--font-serif)] text-xl text-stone-900">
                          {{ product.name }}
                        </h4>
                        <UIcon
                          v-if="isSelected(slot.id, product.id)"
                          name="i-lucide-check"
                          class="size-4 shrink-0 text-terra-600"
                        />
                      </div>
                      <p class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-stone-500">
                        {{ product.subtitle }}
                      </p>
                      <p class="line-clamp-2 text-sm leading-6 text-stone-600">
                        {{ product.description }}
                      </p>
                      <p
                        class="font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] transition"
                        :class="isSelected(slot.id, product.id) ? 'text-terra-700' : 'text-transparent group-hover/card:text-stone-400'"
                      >
                        {{ isSelected(slot.id, product.id) ? '✓ in the box' : 'tap to add' }}
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
          <section class="rounded-md border border-amber-600/30 bg-amber-50/60 p-6">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.2em] text-terra-600">
                  Live summary
                </p>
                <h2 class="mt-2 font-[family:var(--font-serif)] text-3xl text-stone-900">
                  Current bundle
                </h2>
              </div>
              <div
                v-if="isReady"
                class="wax-seal stamp-in shrink-0 [--seal-size:4.25rem]"
              >
                <span>sealed</span>
              </div>
            </div>

            <div
              v-if="bundleSummary"
              class="mt-6 space-y-4"
            >
              <div class="rounded-md border border-amber-600/25 bg-[#f4ecdd] p-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.18em] text-stone-500">
                      {{ bundleSummary.cadence }}
                    </p>
                    <p class="mt-1.5 font-[family:var(--font-serif)] text-2xl text-stone-900">
                      {{ bundleSummary.planName }}
                    </p>
                    <p class="mt-1 font-[family:var(--font-mono)] text-sm text-indigo-700">
                      {{ bundleSummary.basePriceAmount }} {{ bundleSummary.currency }}
                    </p>
                  </div>
                  <span
                    class="rounded-sm px-2.5 py-1 font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em]"
                    :class="isReady ? 'bg-indigo-600 text-amber-50' : 'bg-terra-600/15 text-terra-700'"
                  >
                    {{ isReady ? 'Ready' : 'In progress' }}
                  </span>
                </div>
              </div>

              <div
                v-for="item in bundleSummary.selectionItems"
                :key="item.slotId"
                class="rounded-md border border-amber-600/20 bg-amber-50/40 p-4"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-medium text-stone-900">
                      {{ item.slotLabel }}
                    </p>
                    <p class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-stone-500">
                      {{ item.slotType }} slot
                    </p>
                  </div>
                  <span
                    class="rounded-sm px-2 py-0.5 font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.12em]"
                    :class="item.isComplete ? 'bg-indigo-600/10 text-indigo-700' : 'bg-terra-600/10 text-terra-700'"
                  >
                    {{ item.isComplete ? 'Filled' : item.required ? 'Required' : 'Optional' }}
                  </span>
                </div>

                <ul class="mt-3 space-y-2 text-sm leading-7 text-stone-700">
                  <li
                    v-if="item.productNames.length === 0"
                    class="text-stone-400"
                  >
                    No product selected yet.
                  </li>
                  <li
                    v-for="productName in item.productNames"
                    :key="productName"
                    class="flex items-start gap-3"
                  >
                    <UIcon
                      name="i-lucide-check"
                      class="mt-1 size-4 shrink-0 text-terra-600"
                    />
                    <span>{{ productName }}</span>
                  </li>
                </ul>
              </div>

              <!-- Finish line -->
              <div class="space-y-2 pt-1">
                <button
                  type="button"
                  class="flex w-full items-center justify-center gap-2 rounded-sm px-5 py-3.5 font-[family:var(--font-mono)] text-xs uppercase tracking-[0.16em] transition"
                  :class="isReady
                    ? 'bg-terra-600 text-amber-50 hover:bg-terra-700'
                    : 'cursor-not-allowed bg-amber-600/10 text-stone-400'"
                  :disabled="!isReady"
                  @click="proceedToCheckout"
                >
                  {{ !isReady ? `Fill ${remainingRequiredSlots} more to continue` : me?.user ? 'Continue to checkout' : 'Sign in to check out' }}
                  <UIcon
                    v-if="isReady"
                    name="i-lucide-arrow-right"
                    class="size-4"
                  />
                </button>
                <p class="text-center font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.12em] text-stone-400">
                  Members only · USDT checkout is the next phase
                </p>
              </div>
            </div>
          </section>

          <section
            v-if="validationIssues.length > 0"
            class="rounded-md border border-terra-600/30 bg-terra-50/70 p-6"
          >
            <p class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.2em] text-terra-700">
              Guardrails
            </p>
            <h2 class="mt-2 font-[family:var(--font-serif)] text-2xl text-stone-900">
              Finish the missing pieces.
            </h2>
            <ul class="mt-4 space-y-3 text-sm leading-7 text-stone-700">
              <li
                v-for="issue in validationIssues"
                :key="`${issue.slotId}-${issue.type}`"
                class="flex items-start gap-3"
              >
                <UIcon
                  name="i-lucide-alert-circle"
                  class="mt-1 size-4 shrink-0 text-terra-600"
                />
                <span>{{ issue.message }}</span>
              </li>
            </ul>
          </section>
        </aside>
      </section>
    </div>

    <!-- Mobile sticky finish bar -->
    <div
      v-if="selectedPlan"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-amber-600/20 bg-[#f4ecdd]/95 px-5 py-3 backdrop-blur-md xl:hidden"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div class="min-w-0 flex-1">
          <div class="flex gap-1">
            <span
              v-for="seg in requiredSlotStates"
              :key="seg.id"
              class="h-1 flex-1 rounded-full transition-colors duration-500"
              :class="seg.filled ? 'bg-indigo-600' : 'bg-amber-600/20'"
            />
          </div>
          <p class="mt-1.5 font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-stone-500">
            {{ requiredFilled }} / {{ requiredTotal }} required filled
          </p>
        </div>
        <a
          href="#bundle-summary"
          class="shrink-0 rounded-sm px-4 py-2.5 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] transition"
          :class="isReady ? 'bg-terra-600 text-amber-50' : 'bg-indigo-600 text-amber-50'"
        >
          {{ isReady ? 'Ready · review' : `${remainingRequiredSlots} left` }}
        </a>
      </div>
    </div>
  </div>
</template>
