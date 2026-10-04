<script setup lang="ts">
import type { SubscriptionPlan } from '~/types/catalog'
import { field, labelText, errMessage } from '~/utils/manage'

definePageMeta({ layout: 'manage', middleware: 'operator' })

const { data: catalog, refresh } = await useCatalog()
const categories = computed(() => catalog.value.categories)
const plans = computed(() => catalog.value.plans)

const showPlanForm = ref(false)
const editingPlanId = ref<string | null>(null)
const savingPlan = ref(false)
const planError = ref('')
const planForm = reactive({
  name: '',
  cadence: 'weekly',
  summary: '',
  amount: 0,
  nameFr: '',
  summaryFr: '',
  nameAr: '',
  summaryAr: '',
  includedSlots: [] as Array<{ slotType: string, label: string, description: string, minQuantity: number, maxQuantity: number, required: boolean, labelFr: string, descriptionFr: string, labelAr: string, descriptionAr: string }>
})

function blankSlot() {
  return { slotType: categories.value[0]?.slug ?? '', label: '', description: '', minQuantity: 1, maxQuantity: 1, required: true, labelFr: '', descriptionFr: '', labelAr: '', descriptionAr: '' }
}

function newPlan() {
  editingPlanId.value = null
  planError.value = ''
  Object.assign(planForm, { name: '', cadence: 'weekly', summary: '', amount: 0, nameFr: '', summaryFr: '', nameAr: '', summaryAr: '', includedSlots: [blankSlot()] })
  showPlanForm.value = true
}

function editPlan(pl: SubscriptionPlan) {
  editingPlanId.value = pl.id
  planError.value = ''
  Object.assign(planForm, {
    name: pl.name,
    cadence: pl.cadence,
    summary: pl.summary,
    amount: pl.price.amount,
    nameFr: String(pl.translations?.fr?.name ?? ''),
    summaryFr: String(pl.translations?.fr?.summary ?? ''),
    nameAr: String(pl.translations?.ar?.name ?? ''),
    summaryAr: String(pl.translations?.ar?.summary ?? ''),
    includedSlots: pl.includedSlots.map(s => ({
      slotType: s.slotType,
      label: s.label,
      description: s.description,
      minQuantity: s.minQuantity,
      maxQuantity: s.maxQuantity,
      required: s.required,
      labelFr: String(s.translations?.fr?.label ?? ''),
      descriptionFr: String(s.translations?.fr?.description ?? ''),
      labelAr: String(s.translations?.ar?.label ?? ''),
      descriptionAr: String(s.translations?.ar?.description ?? '')
    }))
  })
  showPlanForm.value = true
}

function addSlot() {
  planForm.includedSlots.push(blankSlot())
}
function removeSlot(i: number) {
  planForm.includedSlots.splice(i, 1)
}

async function submitPlan() {
  savingPlan.value = true
  planError.value = ''
  try {
    const body = {
      name: planForm.name,
      cadence: planForm.cadence,
      summary: planForm.summary,
      price: { amount: planForm.amount },
      translations: {
        fr: { name: planForm.nameFr, summary: planForm.summaryFr },
        ar: { name: planForm.nameAr, summary: planForm.summaryAr }
      },
      includedSlots: planForm.includedSlots.map(({ labelFr, descriptionFr, labelAr, descriptionAr, ...slot }) => ({
        ...slot,
        translations: {
          fr: { label: labelFr, description: descriptionFr },
          ar: { label: labelAr, description: descriptionAr }
        }
      }))
    }
    if (editingPlanId.value) {
      await $fetch(`/api/plans/${editingPlanId.value}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/plans', { method: 'POST', body })
    }
    await refresh()
    showPlanForm.value = false
  } catch (err) {
    planError.value = errMessage(err)
  } finally {
    savingPlan.value = false
  }
}

async function removePlan(pl: SubscriptionPlan) {
  if (!window.confirm(`Delete the "${pl.name}" plan? This cannot be undone.`)) {
    return
  }
  await $fetch(`/api/plans/${pl.id}`, { method: 'DELETE' })
  await refresh()
}

useSeoMeta({ title: 'Plans · illi ops', robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <section>
      <div class="flex flex-wrap items-end justify-between gap-3 border-b border-sand-600/20 pb-4">
        <div>
          <p class="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-sage-600">
            {{ plans.length }} boxes
          </p>
          <h1 class="mt-1 font-serif text-3xl text-stone-900">
            Plans
          </h1>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-sm bg-terra-600 px-4 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sand-50 transition hover:bg-terra-700"
          @click="newPlan"
        >
          <UIcon
            name="i-lucide-plus"
            class="size-3.5"
          />
          Add plan
        </button>
      </div>

      <div class="mt-6 grid gap-5 lg:grid-cols-3">
        <article
          v-for="plan in plans"
          :key="plan.id"
          class="flex flex-col rounded-md border border-sand-600/25 bg-sand-100 p-6"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-sage-600">
                {{ plan.cadence }}
              </p>
              <h3 class="mt-1 font-serif text-2xl text-stone-900">
                {{ plan.name }}
              </h3>
            </div>
            <span class="shrink-0 rounded-sm bg-terra-600 px-2.5 py-1 font-mono text-[0.62rem] text-sand-50">
              {{ plan.price.amount }} {{ plan.price.currency }}
            </span>
          </div>

          <p class="mt-3 text-sm leading-6 text-stone-600">
            {{ plan.summary }}
          </p>

          <ul class="mt-5 space-y-2 border-t border-sand-600/15 pt-4">
            <li
              v-for="slot in plan.includedSlots"
              :key="slot.id"
              class="flex items-center justify-between gap-3 font-mono text-[0.62rem] uppercase tracking-[0.1em]"
            >
              <span class="flex items-center gap-2 text-stone-700">
                <span
                  class="size-1.5 rounded-full"
                  :class="slot.required ? 'bg-sage-600' : 'bg-sand-600/40'"
                />
                {{ slot.slotType }}
              </span>
              <span class="text-stone-400">
                {{ slot.required ? 'required' : 'optional' }} · ×{{ slot.maxQuantity }}
              </span>
            </li>
          </ul>

          <div class="mt-5 flex gap-2 border-t border-sand-600/15 pt-4">
            <button
              type="button"
              class="flex flex-1 items-center justify-center gap-2 rounded-sm border border-terra-600/40 py-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-terra-700 transition hover:bg-terra-600/8"
              @click="editPlan(plan)"
            >
              <UIcon
                name="i-lucide-pencil"
                class="size-3.5"
              />
              Edit
            </button>
            <button
              type="button"
              class="flex items-center justify-center gap-2 rounded-sm border border-sage-600/40 px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sage-700 transition hover:bg-sage-600/8"
              @click="removePlan(plan)"
            >
              <UIcon
                name="i-lucide-trash-2"
                class="size-3.5"
              />
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- Plan slide-over -->
    <Teleport to="body">
      <div
        v-if="showPlanForm"
        class="fixed inset-0 z-50"
      >
        <div
          class="absolute inset-0 bg-terra-950/40 backdrop-blur-sm"
          @click="showPlanForm = false"
        />
        <div class="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-sand-100 shadow-2xl">
          <header class="flex items-center justify-between border-b border-sand-600/20 px-6 py-5">
            <div>
              <p class="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-sage-600">
                {{ editingPlanId ? 'Edit plan' : 'New plan' }}
              </p>
              <h3 class="mt-1 font-serif text-2xl text-stone-900">
                {{ planForm.name || 'Untitled box' }}
              </h3>
            </div>
            <button
              type="button"
              class="rounded-sm p-1.5 text-stone-500 hover:bg-sand-600/10"
              @click="showPlanForm = false"
            >
              <UIcon
                name="i-lucide-x"
                class="size-5"
              />
            </button>
          </header>

          <div class="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div>
              <label :class="labelText">Plan name</label>
              <input
                v-model="planForm.name"
                :class="field"
                placeholder="e.g. Coastal Box"
              >
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label :class="labelText">Cadence</label>
                <select
                  v-model="planForm.cadence"
                  :class="field"
                >
                  <option value="weekly">
                    weekly
                  </option>
                  <option value="biweekly">
                    biweekly
                  </option>
                  <option value="monthly">
                    monthly
                  </option>
                </select>
              </div>
              <div>
                <label :class="labelText">Price (MAD)</label>
                <input
                  v-model.number="planForm.amount"
                  type="number"
                  min="0"
                  :class="field"
                >
              </div>
            </div>
            <div>
              <label :class="labelText">Summary</label>
              <textarea
                v-model="planForm.summary"
                rows="2"
                :class="field"
              />
            </div>
            <div class="space-y-2 rounded-sm border border-sand-600/25 bg-sand-50/40 p-3">
              <p :class="labelText">
                French — shown on /fr (blank = English)
              </p>
              <input
                v-model="planForm.nameFr"
                lang="fr"
                :class="field"
                placeholder="Nom de la box"
              >
              <textarea
                v-model="planForm.summaryFr"
                lang="fr"
                rows="2"
                :class="field"
                placeholder="Description"
              />
            </div>
            <div class="space-y-2 rounded-sm border border-sand-600/25 bg-sand-50/40 p-3">
              <p :class="labelText">
                Arabic — shown on /ar (blank = English)
              </p>
              <input
                v-model="planForm.nameAr"
                dir="rtl"
                :class="field"
                placeholder="اسم الصندوق"
              >
              <textarea
                v-model="planForm.summaryAr"
                dir="rtl"
                rows="2"
                :class="field"
                placeholder="الوصف"
              />
            </div>

            <div class="border-t border-sand-600/20 pt-4">
              <div class="flex items-center justify-between">
                <label :class="labelText">Slots</label>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-terra-700 transition hover:gap-2"
                  @click="addSlot"
                >
                  <UIcon
                    name="i-lucide-plus"
                    class="size-3.5"
                  />
                  Add slot
                </button>
              </div>

              <div class="mt-3 space-y-3">
                <div
                  v-for="(slot, i) in planForm.includedSlots"
                  :key="i"
                  class="rounded-sm border border-sand-600/25 bg-sand-50/40 p-3"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-stone-400">Slot {{ i + 1 }}</span>
                    <button
                      type="button"
                      class="rounded-sm p-1 text-stone-400 transition hover:bg-sage-600/10 hover:text-sage-700"
                      @click="removeSlot(i)"
                    >
                      <UIcon
                        name="i-lucide-trash-2"
                        class="size-3.5"
                      />
                    </button>
                  </div>
                  <div class="mt-2 grid grid-cols-2 gap-2">
                    <select
                      v-model="slot.slotType"
                      :class="field"
                    >
                      <option
                        v-for="c in categories"
                        :key="c.slug"
                        :value="c.slug"
                      >
                        {{ c.name }}
                      </option>
                    </select>
                    <input
                      v-model="slot.label"
                      :class="field"
                      placeholder="Label"
                    >
                  </div>
                  <input
                    v-model="slot.description"
                    :class="[field, 'mt-2']"
                    placeholder="Slot description"
                  >
                  <div class="mt-2 grid grid-cols-2 gap-2">
                    <input
                      v-model="slot.labelFr"
                      lang="fr"
                      :class="field"
                      placeholder="Libellé en français"
                    >
                    <input
                      v-model="slot.descriptionFr"
                      lang="fr"
                      :class="field"
                      placeholder="Description en français"
                    >
                    <input
                      v-model="slot.labelAr"
                      dir="rtl"
                      :class="field"
                      placeholder="التسمية بالعربية"
                    >
                    <input
                      v-model="slot.descriptionAr"
                      dir="rtl"
                      :class="field"
                      placeholder="الوصف بالعربية"
                    >
                  </div>
                  <div class="mt-2 flex items-center gap-4">
                    <label class="flex items-center gap-2">
                      <span class="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-stone-500">Max</span>
                      <input
                        v-model.number="slot.maxQuantity"
                        type="number"
                        min="1"
                        class="w-16 rounded-sm border border-sand-600/30 bg-sand-100 px-2 py-1 text-sm"
                      >
                    </label>
                    <label class="flex items-center gap-2">
                      <input
                        v-model="slot.required"
                        type="checkbox"
                        class="size-4 accent-terra-600"
                      >
                      <span class="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-stone-500">Required</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="space-y-3 border-t border-sand-600/20 px-6 py-5">
            <p
              v-if="planError"
              class="rounded-sm bg-sage-600/10 px-3 py-2 text-sm text-sage-700"
            >
              {{ planError }}
            </p>
            <div class="flex gap-3">
              <button
                type="button"
                class="flex-1 rounded-sm bg-terra-600 py-3 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-sand-50 transition hover:bg-terra-700 disabled:opacity-50"
                :disabled="savingPlan"
                @click="submitPlan"
              >
                {{ savingPlan ? 'Saving…' : editingPlanId ? 'Save changes' : 'Create plan' }}
              </button>
              <button
                type="button"
                class="rounded-sm border border-sand-600/40 px-5 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-stone-600 transition hover:bg-sand-600/8"
                @click="showPlanForm = false"
              >
                Cancel
              </button>
            </div>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>
