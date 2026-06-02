import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client'
import { catalogProducts, productCategories, subscriptionPlans } from '../app/data/catalog'

// Seeds the catalog from the generated baseline (app/data/catalog.ts, produced by
// `pnpm import:catalog`). Idempotent — upserts by id/slug, so re-running restores
// the baseline without duplicating rows. Operator edits made via /manage persist
// on top until the next seed touches the same row.
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

async function main() {
  for (let i = 0; i < productCategories.length; i++) {
    const c = productCategories[i]!
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, blurb: c.blurb, sortOrder: i },
      update: { name: c.name, blurb: c.blurb, sortOrder: i }
    })
  }

  for (let i = 0; i < catalogProducts.length; i++) {
    const p = catalogProducts[i]!
    const data = {
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle,
      description: p.description,
      category: p.category,
      ingredients: p.ingredients,
      tags: p.tags,
      imageSrc: p.image.src,
      imageAlt: p.image.alt,
      defaultUnitLabel: p.defaultUnitLabel,
      storage: p.storage,
      shelfLifeDays: p.shelfLifeDays,
      proteins: p.nutrition.proteins,
      fats: p.nutrition.fats,
      carbs: p.nutrition.carbs,
      nutritionSummary: p.nutrition.summary,
      isAvailable: p.isAvailable,
      eligibleSlotTypes: p.eligibleSlotTypes,
      sortOrder: i
    }
    await prisma.product.upsert({ where: { id: p.id }, create: { id: p.id, ...data }, update: data })
  }

  for (let i = 0; i < subscriptionPlans.length; i++) {
    const pl = subscriptionPlans[i]!
    const slots = pl.includedSlots.map((s, j) => ({
      id: s.id,
      slotType: s.slotType,
      label: s.label,
      description: s.description,
      minQuantity: s.minQuantity,
      maxQuantity: s.maxQuantity,
      required: s.required,
      sortOrder: j
    }))
    const base = {
      slug: pl.slug,
      name: pl.name,
      cadence: pl.cadence,
      summary: pl.summary,
      priceAmount: pl.price.amount,
      priceCurrency: pl.price.currency,
      sortOrder: i
    }
    // Clear existing slots first so re-seeding replaces them rather than colliding on ids.
    await prisma.planSlot.deleteMany({ where: { planId: pl.id } })
    await prisma.plan.upsert({
      where: { id: pl.id },
      create: { id: pl.id, ...base, includedSlots: { create: slots } },
      update: { ...base, includedSlots: { create: slots } }
    })
  }

  console.log(`Seeded ${productCategories.length} categories, ${catalogProducts.length} products, ${subscriptionPlans.length} plans.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })
