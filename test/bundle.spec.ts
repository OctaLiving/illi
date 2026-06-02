import { describe, expect, it } from 'vitest'
import type {
  BundleSelectionInput,
  BundleSlotType,
  CatalogProduct,
  SubscriptionPlan
} from '~/types/catalog'
import {
  createEmptyBundleSelection,
  createSubscriptionBundleSummary,
  toggleProductInSlot,
  validateBundleSelection
} from '~/utils/bundle'

// Fixtures — the bundle rules are generic over slot type, so the suite builds its
// own plan and products and never imports the seed catalog. This keeps the tests
// stable when the catalog data is re-imported.

function product(id: string, slotTypes: BundleSlotType[], isAvailable = true): CatalogProduct {
  return {
    id,
    slug: id,
    name: id,
    subtitle: '',
    description: '',
    category: '',
    ingredients: [],
    tags: [],
    image: { src: '', alt: '' },
    defaultUnitLabel: '',
    storage: 'Room Temp',
    shelfLifeDays: 0,
    nutrition: { proteins: 0, fats: 0, carbs: 0, summary: '' },
    isAvailable,
    eligibleSlotTypes: slotTypes
  }
}

const plan: SubscriptionPlan = {
  id: 'plan-test',
  slug: 'test-box',
  name: 'Test Box',
  cadence: 'weekly',
  summary: '',
  price: { amount: 50, currency: 'USDT' },
  includedSlots: [
    { id: 'slot-spread', slotType: 'spreads', label: 'Spread', description: '', minQuantity: 1, maxQuantity: 1, required: true },
    { id: 'slot-jam', slotType: 'jams', label: 'Jam', description: '', minQuantity: 1, maxQuantity: 1, required: true },
    { id: 'slot-extra', slotType: 'spreads', label: 'Extra spread', description: '', minQuantity: 1, maxQuantity: 2, required: false }
  ]
}

const products = [
  product('p-spread-a', ['spreads']),
  product('p-spread-b', ['spreads']),
  product('p-spread-c', ['spreads']),
  product('p-jam', ['jams']),
  product('p-veg', ['vegetables'])
]

const spreadSlot = plan.includedSlots[0]!
const extraSlot = plan.includedSlots[2]!

describe('createEmptyBundleSelection', () => {
  it('creates one empty entry per included slot', () => {
    const selection = createEmptyBundleSelection(plan)
    expect(selection.planId).toBe(plan.id)
    expect(selection.selections).toHaveLength(plan.includedSlots.length)
    expect(selection.selections.every(item => item.productIds.length === 0)).toBe(true)
  })
})

describe('toggleProductInSlot', () => {
  it('adds an eligible product to a single-capacity slot', () => {
    expect(toggleProductInSlot({ slot: spreadSlot, products, currentProductIds: [], productId: 'p-spread-a' }))
      .toEqual(['p-spread-a'])
  })

  it('removes a product when it is toggled again', () => {
    expect(toggleProductInSlot({ slot: spreadSlot, products, currentProductIds: ['p-spread-a'], productId: 'p-spread-a' }))
      .toEqual([])
  })

  it('replaces the selection in a max-quantity-1 slot', () => {
    expect(toggleProductInSlot({ slot: spreadSlot, products, currentProductIds: ['p-spread-a'], productId: 'p-spread-b' }))
      .toEqual(['p-spread-b'])
  })

  it('rejects an ineligible product, returning the selection unchanged', () => {
    const current = ['p-spread-a']
    // p-jam is a jam, not eligible for a spread slot
    expect(toggleProductInSlot({ slot: spreadSlot, products, currentProductIds: current, productId: 'p-jam' }))
      .toBe(current)
  })

  it('refuses to exceed a multi-capacity slot', () => {
    // extraSlot has maxQuantity 2
    expect(toggleProductInSlot({ slot: extraSlot, products, currentProductIds: ['p-spread-a', 'p-spread-b'], productId: 'p-spread-c' }))
      .toEqual(['p-spread-a', 'p-spread-b'])
  })
})

describe('validateBundleSelection', () => {
  it('flags an empty required slot as missing-required', () => {
    const selection = createEmptyBundleSelection(plan)
    const issues = validateBundleSelection({ plan, products, selection })
    expect(issues.some(issue => issue.type === 'missing-required')).toBe(true)
  })

  it('flags an ineligible product as invalid-product', () => {
    const selection: BundleSelectionInput = {
      planId: plan.id,
      selections: plan.includedSlots.map(slot => ({ slotId: slot.id, productIds: ['p-jam'] }))
    }
    const issues = validateBundleSelection({ plan, products, selection })
    expect(issues.some(issue => issue.slotId === spreadSlot.id && issue.type === 'invalid-product')).toBe(true)
  })
})

describe('createSubscriptionBundleSummary', () => {
  it('drops ineligible products from a slot summary', () => {
    const selection: BundleSelectionInput = {
      planId: plan.id,
      selections: [{ slotId: spreadSlot.id, productIds: ['p-jam'] }]
    }
    const summary = createSubscriptionBundleSummary({ plan, products, selection })
    const item = summary.selectionItems.find(s => s.slotId === spreadSlot.id)!
    expect(item.productIds).toEqual([])
    expect(item.isComplete).toBe(false)
  })
})

describe('readiness regression: header count cannot diverge from summary', () => {
  it('an ineligible product in a required slot leaves the bundle not-ready', () => {
    // Fill both required slots, but put an INELIGIBLE product (jam) in the spread slot.
    const selection: BundleSelectionInput = {
      planId: plan.id,
      selections: [
        { slotId: 'slot-spread', productIds: ['p-jam'] }, // ineligible for spreads
        { slotId: 'slot-jam', productIds: ['p-jam'] }
      ]
    }

    const summary = createSubscriptionBundleSummary({ plan, products, selection })

    // The OLD remainingRequiredSlots logic counted any non-empty required slot as
    // done, so it would have reported 0 slots left and a "ready" header...
    const requiredSlotIds = plan.includedSlots.filter(slot => slot.required).map(slot => slot.id)
    const naiveRemaining = requiredSlotIds.length
      - selection.selections.filter(item => requiredSlotIds.includes(item.slotId) && item.productIds.length > 0).length
    expect(naiveRemaining).toBe(0)

    // ...while the summary correctly sees the spread slot as unfilled.
    expect(summary.requiredSlots - summary.completedRequiredSlots).toBe(1)
    expect(summary.isReadyForCheckout).toBe(false)
  })
})
