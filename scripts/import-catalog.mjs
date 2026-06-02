// Import the illi catalog from the Airtable CSV exports in /data into the app's
// own data module (app/data/catalog.ts) and download product photos locally to
// /public/catalog. The app depends only on these generated artifacts — never on
// the CSVs or the (expiring) Airtable URLs at runtime.
//
//   node scripts/import-catalog.mjs   (or: pnpm import:catalog)

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const r = p => resolve(root, p)

// --- RFC4180-ish CSV parser (handles quoted fields, commas + newlines inside). ---
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') {
      field += c
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

// --- Category → slot type, unit of sale, and collection blurb. ---
const CATEGORY_SLOT = {
  'Fermented Beverages': 'beverages',
  'Cheeses & Dairy': 'dairy',
  'Fermented Vegetables': 'vegetables',
  'Spreads & Nut Butters': 'spreads',
  'Jams & Fruit Products': 'jams',
  'Fish & Seafood': 'seafood',
  'Sauces & Condiments': 'sauces'
}

const SLOT_UNIT = {
  beverages: 'bottle',
  dairy: 'portion',
  vegetables: 'jar',
  spreads: 'jar',
  jams: 'jar',
  seafood: 'tin',
  sauces: 'jar'
}

const SLOT_BLURB = {
  beverages: 'Live, fermented drinks — kombucha, kefirs, ginger beer.',
  dairy: 'Raw-milk cheeses and cultured dairy, aged and spreadable.',
  vegetables: 'Fermented and marinated vegetables for the table.',
  spreads: 'Nut and seed butters, bound with argan, olive and honey.',
  jams: 'Slow fruit — jams, concentrates, sun-dried tomatoes.',
  seafood: 'Marinated and kefta-style fish, ready to serve.',
  sauces: 'Kitchen bases and condiments, made from scratch.'
}

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// --- Subscription plans (a product decision, not in the CSV). Each slot draws
//     from one category; categories are referenced by slot type. ---
const PLANS = [
  {
    id: 'plan-pantry',
    slug: 'pantry-box',
    name: 'Pantry Box',
    cadence: 'monthly',
    summary: 'Shelf-stable staples for the cupboard — a spread, a fruit product and a sauce, with room for one more.',
    price: { amount: 64, currency: 'USDT' },
    includedSlots: [
      { id: 'pantry-spread', slotType: 'spreads', label: 'Spread', description: 'Choose a nut or seed butter.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'pantry-jam', slotType: 'jams', label: 'Fruit product', description: 'Choose a jam, concentrate or preserve.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'pantry-sauce', slotType: 'sauces', label: 'Sauce', description: 'Choose a base sauce or condiment.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'pantry-extra', slotType: 'spreads', label: 'Extra spread', description: 'An optional second spread for the month.', minQuantity: 1, maxQuantity: 1, required: false }
    ]
  },
  {
    id: 'plan-living',
    slug: 'living-box',
    name: 'Living Box',
    cadence: 'weekly',
    summary: 'Fresh, refrigerated ferments — a live drink, a cultured dairy and a fermented vegetable each week.',
    price: { amount: 58, currency: 'USDT' },
    includedSlots: [
      { id: 'living-beverage', slotType: 'beverages', label: 'Fermented drink', description: 'Choose a live, fermented beverage.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'living-dairy', slotType: 'dairy', label: 'Cultured dairy', description: 'Choose a cheese or cultured dairy.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'living-vegetable', slotType: 'vegetables', label: 'Fermented vegetable', description: 'Choose a marinated or fermented vegetable.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'living-beverage-2', slotType: 'beverages', label: 'Extra drink', description: 'An optional second drink for the week.', minQuantity: 1, maxQuantity: 1, required: false }
    ]
  },
  {
    id: 'plan-coastal',
    slug: 'coastal-box',
    name: 'Coastal Box',
    cadence: 'biweekly',
    summary: 'Sea and table — two marinated fish, a sauce to serve them with, and an optional vegetable.',
    price: { amount: 88, currency: 'USDT' },
    includedSlots: [
      { id: 'coastal-fish-1', slotType: 'seafood', label: 'Fish 1', description: 'Choose a marinated or kefta-style fish.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'coastal-fish-2', slotType: 'seafood', label: 'Fish 2', description: 'Choose a second fish for the box.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'coastal-sauce', slotType: 'sauces', label: 'Sauce', description: 'Choose a sauce to serve alongside.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'coastal-vegetable', slotType: 'vegetables', label: 'Vegetable', description: 'An optional fermented vegetable.', minQuantity: 1, maxQuantity: 1, required: false }
    ]
  }
]

// --- Parse products. ---
const productRows = parseCsv(readFileSync(r('data/Products-Grid view.csv'), 'utf8'))
const header = productRows[0].map(h => h.trim())
const col = name => header.indexOf(name)
const rows = productRows.slice(1).filter(row => (row[col('Product Name')] ?? '').trim())

const categoryOrder = Object.keys(CATEGORY_SLOT)
const imgDir = r('public/catalog')
if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true })

const products = []
let downloaded = 0
let failed = 0

for (const row of rows) {
  const name = row[col('Product Name')].trim()
  const slug = slugify(name)
  const category = row[col('Category')].trim()
  const slotType = CATEGORY_SLOT[category]
  if (!slotType) {
    console.warn(`! skipping "${name}" — unknown category "${category}"`)
    continue
  }

  const ingredients = row[col('Ingredients')].split(',').map(s => s.trim()).filter(Boolean)
  const description = row[col('Short Description (AI)')].trim()
  const proteins = Number(row[col('Proteins')]) || 0
  const fats = Number(row[col('Fats')]) || 0
  const carbs = Number(row[col('Carbs')]) || 0
  const nutritionSummary = row[col('Nutritional Sheet (AI)')].trim()
  const storage = row[col('Storage')].trim() || 'Room Temp'
  const shelfLifeDays = Number(row[col('Shelf Life (days)')]) || 0

  // Photo field is "filename.ext (https://...)". Download it locally.
  const photoField = row[col('Main Photo')] ?? ''
  const urlMatch = photoField.match(/(https?:\/\/[^\s)]+)/)
  const extMatch = photoField.match(/\.(png|jpe?g)\b/i)
  const ext = (extMatch ? extMatch[1].toLowerCase() : 'png').replace('jpeg', 'jpg')
  const imageSrc = `/catalog/${slug}.${ext}`
  if (urlMatch) {
    try {
      execFileSync(
        'curl',
        ['-s', '-f', '--max-time', '90', '-o', r(`public/catalog/${slug}.${ext}`), urlMatch[1]],
        { stdio: 'ignore' }
      )
      downloaded++
      process.stdout.write(`  ✓ ${slug}.${ext}\n`)
    } catch {
      failed++
      console.warn(`  ✗ failed to download photo for ${name}`)
    }
  }

  const tags = []
  if (proteins >= 30) tags.push('high-protein')
  if (fats >= 55) tags.push('rich')
  if (category.startsWith('Fermented') || /kefir|leben/i.test(name)) tags.push('fermented')
  tags.push(storage === 'Refrigerated' ? 'fresh' : 'shelf-stable')

  const subtitle = `${storage === 'Refrigerated' ? 'Refrigerated' : 'Room temp'} · ${shelfLifeDays}-day shelf`

  products.push({
    id: `prod-${slug}`,
    slug,
    name,
    subtitle,
    description,
    category,
    ingredients,
    tags,
    image: { src: imageSrc, alt: `${name} — ${category}` },
    defaultUnitLabel: SLOT_UNIT[slotType],
    storage,
    shelfLifeDays,
    nutrition: { proteins, fats, carbs, summary: nutritionSummary },
    isAvailable: true,
    eligibleSlotTypes: [slotType],
    _order: categoryOrder.indexOf(category)
  })
}

// Group by category order, then name — tidy generated file + natural collection grouping.
products.sort((a, b) => a._order - b._order || a.name.localeCompare(b.name))
products.forEach(p => delete p._order)

const categories = categoryOrder.map(name => ({
  slug: CATEGORY_SLOT[name],
  name,
  blurb: SLOT_BLURB[CATEGORY_SLOT[name]]
}))

// --- Emit app/data/catalog.ts (unquoted keys, JSON-stringified values; lint --fix normalizes quotes). ---
const j = JSON.stringify
const arr = items => `[${items.map(j).join(', ')}]`

function emitProduct(p) {
  return `  {
    id: ${j(p.id)},
    slug: ${j(p.slug)},
    name: ${j(p.name)},
    subtitle: ${j(p.subtitle)},
    description: ${j(p.description)},
    category: ${j(p.category)},
    ingredients: ${arr(p.ingredients)},
    tags: ${arr(p.tags)},
    image: { src: ${j(p.image.src)}, alt: ${j(p.image.alt)} },
    defaultUnitLabel: ${j(p.defaultUnitLabel)},
    storage: ${j(p.storage)},
    shelfLifeDays: ${p.shelfLifeDays},
    nutrition: { proteins: ${p.nutrition.proteins}, fats: ${p.nutrition.fats}, carbs: ${p.nutrition.carbs}, summary: ${j(p.nutrition.summary)} },
    isAvailable: ${p.isAvailable},
    eligibleSlotTypes: ${arr(p.eligibleSlotTypes)}
  }`
}

function emitSlot(s) {
  return `      { id: ${j(s.id)}, slotType: ${j(s.slotType)}, label: ${j(s.label)}, description: ${j(s.description)}, minQuantity: ${s.minQuantity}, maxQuantity: ${s.maxQuantity}, required: ${s.required} }`
}

function emitPlan(p) {
  return `  {
    id: ${j(p.id)},
    slug: ${j(p.slug)},
    name: ${j(p.name)},
    cadence: ${j(p.cadence)},
    summary: ${j(p.summary)},
    price: { amount: ${p.price.amount}, currency: ${j(p.price.currency)} },
    includedSlots: [
${p.includedSlots.map(emitSlot).join(',\n')}
    ]
  }`
}

const out = `// AUTO-GENERATED by scripts/import-catalog.mjs from the CSV exports in /data.
// Do not edit by hand — re-run \`pnpm import:catalog\` to regenerate.
import type { CatalogProduct, ProductCategory, SubscriptionPlan } from '~/types/catalog'

export const productCategories: ProductCategory[] = [
${categories.map(c => `  { slug: ${j(c.slug)}, name: ${j(c.name)}, blurb: ${j(c.blurb)} }`).join(',\n')}
]

export const catalogProducts: CatalogProduct[] = [
${products.map(emitProduct).join(',\n')}
]

export const subscriptionPlans: SubscriptionPlan[] = [
${PLANS.map(emitPlan).join(',\n')}
]
`

writeFileSync(r('app/data/catalog.ts'), out)

console.log(`\nImported ${products.length} products in ${categories.length} categories, ${PLANS.length} plans.`)
console.log(`Photos: ${downloaded} downloaded, ${failed} failed.`)
console.log('Wrote app/data/catalog.ts')
