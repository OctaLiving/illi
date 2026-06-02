import {
  bundleSlotTypes,
  subscriptionCadences
} from '~/types/catalog'
import type {
  BundleSlotRule,
  BundleSlotType,
  CatalogProduct,
  ProductCategory,
  SubscriptionCadence,
  SubscriptionPlan
} from '~/types/catalog'
import { prisma } from '~~/server/utils/db/client'

// The catalog now lives in Postgres (models in prisma/schema/catalog.prisma). This
// module is the seam between those relational rows and the rich CatalogProduct /
// SubscriptionPlan shapes the storefront consumes — callers keep the same shapes,
// the functions just became async. The generated seed (app/data/catalog.ts) is the
// baseline; operator edits land here via the API routes.
export interface CatalogStore {
  categories: ProductCategory[]
  products: CatalogProduct[]
  plans: SubscriptionPlan[]
}

export interface ProductInput {
  name?: string
  slotType?: BundleSlotType
  subtitle?: string
  description?: string
  ingredients?: string[] | string
  imageSrc?: string
  defaultUnitLabel?: string
  storage?: string
  shelfLifeDays?: number
  tags?: string[]
  nutrition?: { proteins?: number, fats?: number, carbs?: number, summary?: string }
  isAvailable?: boolean
}

export interface PlanSlotInput {
  slotType?: BundleSlotType
  label?: string
  description?: string
  minQuantity?: number
  maxQuantity?: number
  required?: boolean
}

export interface PlanInput {
  name?: string
  cadence?: SubscriptionCadence
  summary?: string
  price?: { amount?: number, currency?: string }
  includedSlots?: PlanSlotInput[]
}

// Row types derived from the client so we never import generated names directly.
type CategoryRow = NonNullable<Awaited<ReturnType<typeof prisma.category.findUnique>>>
type ProductRow = NonNullable<Awaited<ReturnType<typeof prisma.product.findUnique>>>
type PlanSlotRow = NonNullable<Awaited<ReturnType<typeof prisma.planSlot.findUnique>>>
type PlanRow = NonNullable<Awaited<ReturnType<typeof prisma.plan.findUnique>>> & { includedSlots: PlanSlotRow[] }

const isSlotType = (v: unknown): v is BundleSlotType => bundleSlotTypes.includes(v as BundleSlotType)
const isCadence = (v: unknown): v is SubscriptionCadence => subscriptionCadences.includes(v as SubscriptionCadence)

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

function uniqueSlug(base: string, taken: Set<string>) {
  const root = base || 'item'
  let slug = root
  let n = 2
  while (taken.has(slug)) {
    slug = `${root}-${n++}`
  }
  return slug
}

// --- Row → contract shape ---

function toCategory(row: CategoryRow): ProductCategory {
  return { slug: row.slug as BundleSlotType, name: row.name, blurb: row.blurb }
}

function toProduct(row: ProductRow): CatalogProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    description: row.description,
    category: row.category,
    ingredients: row.ingredients,
    tags: row.tags,
    image: { src: row.imageSrc, alt: row.imageAlt },
    defaultUnitLabel: row.defaultUnitLabel,
    storage: row.storage,
    shelfLifeDays: row.shelfLifeDays,
    nutrition: { proteins: row.proteins, fats: row.fats, carbs: row.carbs, summary: row.nutritionSummary },
    isAvailable: row.isAvailable,
    eligibleSlotTypes: row.eligibleSlotTypes as BundleSlotType[]
  }
}

function toSlot(row: PlanSlotRow): BundleSlotRule {
  return {
    id: row.id,
    slotType: row.slotType as BundleSlotType,
    label: row.label,
    description: row.description,
    minQuantity: row.minQuantity,
    maxQuantity: row.maxQuantity,
    required: row.required
  }
}

function toPlan(row: PlanRow): SubscriptionPlan {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    cadence: row.cadence as SubscriptionCadence,
    summary: row.summary,
    price: { amount: row.priceAmount, currency: 'USDT' },
    includedSlots: row.includedSlots.map(toSlot)
  }
}

export async function getStore(): Promise<CatalogStore> {
  const [categories, products, plans] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.product.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.plan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { includedSlots: { orderBy: { sortOrder: 'asc' } } }
    })
  ])
  return {
    categories: categories.map(toCategory),
    products: products.map(toProduct),
    plans: plans.map(toPlan)
  }
}

// --- Products ---

interface NormalizedProduct {
  name: string
  slotType: BundleSlotType
  storage: string
  shelfLifeDays: number
  ingredients: string[]
}

function normalizeProduct(input: ProductInput): NormalizedProduct {
  const name = String(input.name ?? '').trim()
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Product name is required.' })
  }
  if (!isSlotType(input.slotType)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid category is required.' })
  }
  const ingredients = Array.isArray(input.ingredients)
    ? input.ingredients.map(s => s.trim()).filter(Boolean)
    : String(input.ingredients ?? '').split(',').map(s => s.trim()).filter(Boolean)
  return {
    name,
    slotType: input.slotType,
    storage: input.storage === 'Refrigerated' ? 'Refrigerated' : 'Room Temp',
    shelfLifeDays: Math.max(0, Math.round(Number(input.shelfLifeDays) || 0)),
    ingredients
  }
}

// The columns shared by create + update. `category` (display name) is resolved
// from the Category table so it stays consistent with the chosen slot type.
function productData(n: NormalizedProduct, input: ProductInput, category: string) {
  return {
    name: n.name,
    subtitle: input.subtitle?.trim() || `${n.storage === 'Refrigerated' ? 'Refrigerated' : 'Room temp'} · ${n.shelfLifeDays}-day shelf`,
    description: input.description?.trim() ?? '',
    category,
    ingredients: n.ingredients,
    tags: Array.isArray(input.tags) ? input.tags : [],
    imageSrc: input.imageSrc?.trim() || '/catalog/placeholder.svg',
    imageAlt: `${n.name} — ${category}`,
    defaultUnitLabel: input.defaultUnitLabel?.trim() || 'jar',
    storage: n.storage,
    shelfLifeDays: n.shelfLifeDays,
    proteins: Math.max(0, Math.round(Number(input.nutrition?.proteins) || 0)),
    fats: Math.max(0, Math.round(Number(input.nutrition?.fats) || 0)),
    carbs: Math.max(0, Math.round(Number(input.nutrition?.carbs) || 0)),
    nutritionSummary: input.nutrition?.summary?.trim() ?? '',
    isAvailable: input.isAvailable ?? true,
    eligibleSlotTypes: [n.slotType]
  }
}

async function categoryName(slotType: BundleSlotType): Promise<string> {
  const category = await prisma.category.findUnique({ where: { slug: slotType } })
  return category?.name ?? slotType
}

export async function createProduct(input: ProductInput): Promise<CatalogProduct> {
  const n = normalizeProduct(input)
  const existing = await prisma.product.findMany({ select: { slug: true } })
  const slug = uniqueSlug(slugify(n.name), new Set(existing.map(p => p.slug)))
  const row = await prisma.product.create({
    data: {
      id: `prod-${slug}`,
      slug,
      sortOrder: existing.length,
      ...productData(n, input, await categoryName(n.slotType))
    }
  })
  return toProduct(row)
}

export async function updateProduct(id: string, input: ProductInput): Promise<CatalogProduct | null> {
  const current = await prisma.product.findUnique({ where: { id } })
  if (!current) {
    return null
  }
  const n = normalizeProduct(input)
  const row = await prisma.product.update({
    where: { id },
    data: productData(n, input, await categoryName(n.slotType))
  })
  return toProduct(row)
}

export async function deleteProduct(id: string): Promise<boolean> {
  const current = await prisma.product.findUnique({ where: { id }, select: { id: true } })
  if (!current) {
    return false
  }
  await prisma.product.delete({ where: { id } })
  return true
}

// --- Plans ---

interface NormalizedPlan {
  name: string
  cadence: SubscriptionCadence
  slots: PlanSlotInput[]
}

function normalizePlan(input: PlanInput): NormalizedPlan {
  const name = String(input.name ?? '').trim()
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Plan name is required.' })
  }
  if (!isCadence(input.cadence)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid cadence is required.' })
  }
  const slots = Array.isArray(input.includedSlots) ? input.includedSlots : []
  if (slots.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'A plan needs at least one slot.' })
  }
  return { name, cadence: input.cadence, slots }
}

// Slot ids are deterministic (`<plan-slug>-<n>`), so update can drop-and-recreate.
function slotRows(slots: PlanSlotInput[], slug: string) {
  return slots.map((slot, i) => {
    if (!isSlotType(slot.slotType)) {
      throw createError({ statusCode: 400, statusMessage: `Slot ${i + 1} has an invalid category.` })
    }
    const minQuantity = Math.max(1, Math.round(Number(slot.minQuantity) || 1))
    const maxQuantity = Math.max(minQuantity, Math.round(Number(slot.maxQuantity) || 1))
    return {
      id: `${slug}-${i + 1}`,
      slotType: slot.slotType,
      label: slot.label?.trim() || `${slot.slotType} slot`,
      description: slot.description?.trim() ?? '',
      minQuantity,
      maxQuantity,
      required: slot.required ?? true,
      sortOrder: i
    }
  })
}

const planAmount = (input: PlanInput) => Math.max(0, Math.round(Number(input.price?.amount) || 0))

export async function createPlan(input: PlanInput): Promise<SubscriptionPlan> {
  const n = normalizePlan(input)
  const existing = await prisma.plan.findMany({ select: { slug: true } })
  const slug = uniqueSlug(slugify(n.name), new Set(existing.map(p => p.slug)))
  const row = await prisma.plan.create({
    data: {
      id: `plan-${slug}`,
      slug,
      name: n.name,
      cadence: n.cadence,
      summary: input.summary?.trim() ?? '',
      priceAmount: planAmount(input),
      priceCurrency: 'USDT',
      sortOrder: existing.length,
      includedSlots: { create: slotRows(n.slots, slug) }
    },
    include: { includedSlots: { orderBy: { sortOrder: 'asc' } } }
  })
  return toPlan(row)
}

export async function updatePlan(id: string, input: PlanInput): Promise<SubscriptionPlan | null> {
  const current = await prisma.plan.findUnique({ where: { id } })
  if (!current) {
    return null
  }
  const n = normalizePlan(input)
  const slots = slotRows(n.slots, current.slug)
  // Drop-and-recreate slots in one transaction so the deterministic ids never collide.
  const row = await prisma.$transaction(async (tx) => {
    await tx.planSlot.deleteMany({ where: { planId: id } })
    return tx.plan.update({
      where: { id },
      data: {
        name: n.name,
        cadence: n.cadence,
        summary: input.summary?.trim() ?? '',
        priceAmount: planAmount(input),
        includedSlots: { create: slots }
      },
      include: { includedSlots: { orderBy: { sortOrder: 'asc' } } }
    })
  })
  return toPlan(row)
}

export async function deletePlan(id: string): Promise<boolean> {
  const current = await prisma.plan.findUnique({ where: { id }, select: { id: true } })
  if (!current) {
    return false
  }
  await prisma.plan.delete({ where: { id } })
  return true
}
