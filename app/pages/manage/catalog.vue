<script setup lang="ts">
import type { CatalogProduct } from '~/types/catalog'
import { field, labelText, errMessage } from '~/utils/manage'

definePageMeta({ layout: 'manage', middleware: 'operator' })

const { data: catalog, refresh } = await useCatalog()
const products = computed(() => catalog.value.products)
const categories = computed(() => catalog.value.categories)
const refrigeratedCount = computed(() => products.value.filter(p => p.storage === 'Refrigerated').length)

const showProductForm = ref(false)
const editingProductId = ref<string | null>(null)
const savingProduct = ref(false)
const productError = ref('')
const productForm = reactive({
  name: '',
  slotType: '',
  subtitle: '',
  description: '',
  ingredients: '',
  imageSrc: '',
  defaultUnitLabel: 'jar',
  storage: 'Room Temp',
  shelfLifeDays: 90,
  proteins: 0,
  fats: 0,
  carbs: 0,
  summary: '',
  isAvailable: true
})

function newProduct() {
  editingProductId.value = null
  productError.value = ''
  Object.assign(productForm, {
    name: '',
    slotType: categories.value[0]?.slug ?? '',
    subtitle: '',
    description: '',
    ingredients: '',
    imageSrc: '',
    defaultUnitLabel: 'jar',
    storage: 'Room Temp',
    shelfLifeDays: 90,
    proteins: 0,
    fats: 0,
    carbs: 0,
    summary: '',
    isAvailable: true
  })
  showProductForm.value = true
}

function editProduct(p: CatalogProduct) {
  editingProductId.value = p.id
  productError.value = ''
  Object.assign(productForm, {
    name: p.name,
    slotType: p.eligibleSlotTypes[0] ?? '',
    subtitle: p.subtitle,
    description: p.description,
    ingredients: p.ingredients.join(', '),
    imageSrc: p.image.src,
    defaultUnitLabel: p.defaultUnitLabel,
    storage: p.storage,
    shelfLifeDays: p.shelfLifeDays,
    proteins: p.nutrition.proteins,
    fats: p.nutrition.fats,
    carbs: p.nutrition.carbs,
    summary: p.nutrition.summary,
    isAvailable: p.isAvailable
  })
  showProductForm.value = true
}

async function submitProduct() {
  savingProduct.value = true
  productError.value = ''
  try {
    const body = {
      name: productForm.name,
      slotType: productForm.slotType,
      subtitle: productForm.subtitle,
      description: productForm.description,
      ingredients: productForm.ingredients,
      imageSrc: productForm.imageSrc,
      defaultUnitLabel: productForm.defaultUnitLabel,
      storage: productForm.storage,
      shelfLifeDays: productForm.shelfLifeDays,
      nutrition: {
        proteins: productForm.proteins,
        fats: productForm.fats,
        carbs: productForm.carbs,
        summary: productForm.summary
      },
      isAvailable: productForm.isAvailable
    }
    if (editingProductId.value) {
      await $fetch(`/api/products/${editingProductId.value}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/products', { method: 'POST', body })
    }
    await refresh()
    showProductForm.value = false
  } catch (err) {
    productError.value = errMessage(err)
  } finally {
    savingProduct.value = false
  }
}

async function removeProduct(p: CatalogProduct) {
  if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
    return
  }
  await $fetch(`/api/products/${p.id}`, { method: 'DELETE' })
  await refresh()
}

useSeoMeta({ title: 'Catalog · illi ops', robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <section>
      <div class="flex flex-wrap items-end justify-between gap-3 border-b border-amber-600/20 pb-4">
        <div>
          <p class="font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.24em] text-terra-600">
            {{ products.length }} products · {{ refrigeratedCount }} cold-chain
          </p>
          <h1 class="mt-1 font-[family:var(--font-serif)] text-3xl text-stone-900">
            Catalog
          </h1>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-sm bg-indigo-600 px-4 py-2.5 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-amber-50 transition hover:bg-indigo-700"
          @click="newProduct"
        >
          <UIcon
            name="i-lucide-plus"
            class="size-3.5"
          />
          Add product
        </button>
      </div>

      <div class="mt-6 overflow-x-auto rounded-md border border-amber-600/25 bg-[#f4ecdd]">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-amber-600/25 font-[family:var(--font-mono)] text-[0.56rem] uppercase tracking-[0.14em] text-stone-500">
              <th class="px-5 py-3 font-medium">
                Product
              </th>
              <th class="px-5 py-3 font-medium">
                Category
              </th>
              <th class="px-5 py-3 font-medium">
                Storage
              </th>
              <th class="px-5 py-3 text-right font-medium">
                Keeps
              </th>
              <th class="px-5 py-3 text-right font-medium">
                Status
              </th>
              <th class="px-5 py-3 text-right font-medium">
                Manage
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in products"
              :key="product.id"
              class="border-b border-amber-600/10 transition last:border-0 hover:bg-amber-50/50"
            >
              <td class="px-5 py-3">
                <NuxtLink
                  :to="`/catalog/${product.slug}`"
                  class="font-[family:var(--font-serif)] text-lg text-stone-900 transition hover:text-terra-700"
                >
                  {{ product.name }}
                </NuxtLink>
              </td>
              <td class="px-5 py-3 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.1em] text-stone-500">
                {{ product.category }}
              </td>
              <td class="px-5 py-3">
                <span
                  class="inline-flex items-center gap-1.5 font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.1em]"
                  :class="product.storage === 'Refrigerated' ? 'text-indigo-700' : 'text-stone-500'"
                >
                  <span
                    class="size-1.5 rounded-full"
                    :class="product.storage === 'Refrigerated' ? 'bg-indigo-600' : 'bg-amber-500'"
                  />
                  {{ product.storage }}
                </span>
              </td>
              <td class="px-5 py-3 text-right font-[family:var(--font-mono)] text-sm text-stone-700">
                {{ product.shelfLifeDays }}d
              </td>
              <td class="px-5 py-3 text-right">
                <span
                  class="rounded-sm px-2 py-0.5 font-[family:var(--font-mono)] text-[0.56rem] uppercase tracking-[0.1em]"
                  :class="product.isAvailable ? 'bg-indigo-600/10 text-indigo-700' : 'bg-stone-400/15 text-stone-500'"
                >
                  {{ product.isAvailable ? 'Live' : 'Hidden' }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    class="rounded-sm p-1.5 text-stone-500 transition hover:bg-indigo-600/10 hover:text-indigo-700"
                    title="Edit"
                    @click="editProduct(product)"
                  >
                    <UIcon
                      name="i-lucide-pencil"
                      class="size-4"
                    />
                  </button>
                  <button
                    type="button"
                    class="rounded-sm p-1.5 text-stone-500 transition hover:bg-terra-600/10 hover:text-terra-700"
                    title="Delete"
                    @click="removeProduct(product)"
                  >
                    <UIcon
                      name="i-lucide-trash-2"
                      class="size-4"
                    />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Product slide-over -->
    <Teleport to="body">
      <div
        v-if="showProductForm"
        class="fixed inset-0 z-50"
      >
        <div
          class="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm"
          @click="showProductForm = false"
        />
        <div class="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[#f4ecdd] shadow-2xl">
          <header class="flex items-center justify-between border-b border-amber-600/20 px-6 py-5">
            <div>
              <p class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-terra-600">
                {{ editingProductId ? 'Edit product' : 'New product' }}
              </p>
              <h3 class="mt-1 font-[family:var(--font-serif)] text-2xl text-stone-900">
                {{ productForm.name || 'Untitled' }}
              </h3>
            </div>
            <button
              type="button"
              class="rounded-sm p-1.5 text-stone-500 hover:bg-amber-600/10"
              @click="showProductForm = false"
            >
              <UIcon
                name="i-lucide-x"
                class="size-5"
              />
            </button>
          </header>

          <div class="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div>
              <label :class="labelText">Name</label>
              <input
                v-model="productForm.name"
                :class="field"
                placeholder="e.g. Smoked Almond Butter"
              >
            </div>
            <div>
              <label :class="labelText">Category</label>
              <select
                v-model="productForm.slotType"
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
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label :class="labelText">Storage</label>
                <select
                  v-model="productForm.storage"
                  :class="field"
                >
                  <option value="Room Temp">
                    Room Temp
                  </option>
                  <option value="Refrigerated">
                    Refrigerated
                  </option>
                </select>
              </div>
              <div>
                <label :class="labelText">Shelf life (days)</label>
                <input
                  v-model.number="productForm.shelfLifeDays"
                  type="number"
                  min="0"
                  :class="field"
                >
              </div>
            </div>
            <div>
              <label :class="labelText">Unit of sale</label>
              <input
                v-model="productForm.defaultUnitLabel"
                :class="field"
                placeholder="jar"
              >
            </div>
            <div>
              <label :class="labelText">Image URL</label>
              <input
                v-model="productForm.imageSrc"
                :class="field"
                placeholder="/catalog/your-image.png (blank = placeholder)"
              >
            </div>
            <div>
              <label :class="labelText">Description</label>
              <textarea
                v-model="productForm.description"
                rows="3"
                :class="field"
              />
            </div>
            <div>
              <label :class="labelText">Ingredients (comma-separated)</label>
              <input
                v-model="productForm.ingredients"
                :class="field"
                placeholder="Almonds, Argan oil, Honey"
              >
            </div>
            <div>
              <label :class="labelText">Macros — % of energy (P / F / C)</label>
              <div class="grid grid-cols-3 gap-3">
                <input
                  v-model.number="productForm.proteins"
                  type="number"
                  min="0"
                  max="100"
                  :class="field"
                >
                <input
                  v-model.number="productForm.fats"
                  type="number"
                  min="0"
                  max="100"
                  :class="field"
                >
                <input
                  v-model.number="productForm.carbs"
                  type="number"
                  min="0"
                  max="100"
                  :class="field"
                >
              </div>
            </div>
            <label class="flex items-center gap-3 pt-1">
              <input
                v-model="productForm.isAvailable"
                type="checkbox"
                class="size-4 accent-indigo-600"
              >
              <span class="font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.14em] text-stone-600">Available on the storefront</span>
            </label>
          </div>

          <footer class="space-y-3 border-t border-amber-600/20 px-6 py-5">
            <p
              v-if="productError"
              class="rounded-sm bg-terra-600/10 px-3 py-2 text-sm text-terra-700"
            >
              {{ productError }}
            </p>
            <div class="flex gap-3">
              <button
                type="button"
                class="flex-1 rounded-sm bg-indigo-600 py-3 font-[family:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.16em] text-amber-50 transition hover:bg-indigo-700 disabled:opacity-50"
                :disabled="savingProduct"
                @click="submitProduct"
              >
                {{ savingProduct ? 'Saving…' : editingProductId ? 'Save changes' : 'Create product' }}
              </button>
              <button
                type="button"
                class="rounded-sm border border-amber-600/40 px-5 font-[family:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.16em] text-stone-600 transition hover:bg-amber-600/8"
                @click="showProductForm = false"
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
