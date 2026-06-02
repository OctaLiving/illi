import type {
  BundleSelectionInput,
  BundleSlotRule,
  BundleValidationIssue,
  CatalogProduct,
  CheckoutHandoffPayload,
  SubscriptionBundleSummary,
  SubscriptionPlan
} from '~/types/catalog'
import { getEligibleProductsForSlot, isProductEligibleForSlot } from '~/utils/catalog'

// The Bundle rules: one module owning how a subscription bundle is assembled,
// changed, validated, and summarised. Every rule about slots — eligibility,
// capacity, required/optional, readiness — lives here so callers never
// re-derive it. All functions are pure: the reactive composable is a thin
// wrapper over these, and the interface below is the test surface.

export function createEmptyBundleSelection(plan: SubscriptionPlan): BundleSelectionInput {
  return {
    planId: plan.id,
    selections: plan.includedSlots.map(slot => ({
      slotId: slot.id,
      productIds: []
    }))
  }
}

/**
 * The single rule for changing one slot's selection. Given the current product
 * ids for a slot, returns the next ids after toggling `productId`, enforcing
 * eligibility and the slot's max-quantity capacity. Returns the current ids
 * unchanged when the toggle is not allowed (ineligible product, or a
 * multi-select slot already at capacity).
 */
export function toggleProductInSlot(options: {
  slot: BundleSlotRule
  products: CatalogProduct[]
  currentProductIds: string[]
  productId: string
}): string[] {
  const { slot, products, currentProductIds, productId } = options

  const isEligible = getEligibleProductsForSlot(products, slot).some(product => product.id === productId)
  if (!isEligible) {
    return currentProductIds
  }

  if (currentProductIds.includes(productId)) {
    return currentProductIds.filter(id => id !== productId)
  }

  if (slot.maxQuantity === 1) {
    return [productId]
  }

  if (currentProductIds.length >= slot.maxQuantity) {
    return currentProductIds
  }

  return [...currentProductIds, productId]
}

export function validateBundleSelection(options: {
  plan: SubscriptionPlan
  products: CatalogProduct[]
  selection: BundleSelectionInput
}): BundleValidationIssue[] {
  const { plan, products, selection } = options

  const productMap = new Map(products.map(product => [product.id, product]))
  const selectionMap = new Map(selection.selections.map(item => [item.slotId, item.productIds]))
  const issues: BundleValidationIssue[] = []

  for (const slot of plan.includedSlots) {
    const selectedProductIds = selectionMap.get(slot.id) ?? []
    const invalidProductIds = selectedProductIds.filter((productId) => {
      const product = productMap.get(productId)
      return product ? !isProductEligibleForSlot(product, slot) : true
    })

    if (invalidProductIds.length > 0) {
      issues.push({
        slotId: slot.id,
        type: 'invalid-product',
        message: `${slot.label} contains products that are not valid for this slot.`
      })
    }

    if (selectedProductIds.length > slot.maxQuantity) {
      issues.push({
        slotId: slot.id,
        type: 'too-many-products',
        message: `${slot.label} allows up to ${slot.maxQuantity} product${slot.maxQuantity === 1 ? '' : 's'}.`
      })
    }

    if (slot.required && selectedProductIds.length === 0) {
      issues.push({
        slotId: slot.id,
        type: 'missing-required',
        message: `${slot.label} is required before checkout can continue.`
      })
    }

    if (selectedProductIds.length > 0 && selectedProductIds.length < slot.minQuantity) {
      issues.push({
        slotId: slot.id,
        type: 'below-minimum',
        message: `${slot.label} needs at least ${slot.minQuantity} product${slot.minQuantity === 1 ? '' : 's'}.`
      })
    }
  }

  return issues
}

export function createSubscriptionBundleSummary(options: {
  plan: SubscriptionPlan
  products: CatalogProduct[]
  selection: BundleSelectionInput
}): SubscriptionBundleSummary {
  const { plan, products, selection } = options

  const productMap = new Map(products.map(product => [product.id, product]))
  const selectionMap = new Map(selection.selections.map(item => [item.slotId, item.productIds]))

  const selectionItems = plan.includedSlots.map((slot) => {
    const selectedProductIds = selectionMap.get(slot.id) ?? []
    const eligibleProductIds = selectedProductIds.filter((productId) => {
      const product = productMap.get(productId)
      return product ? isProductEligibleForSlot(product, slot) : false
    })

    const productNames = eligibleProductIds
      .map(productId => productMap.get(productId)?.name)
      .filter((name): name is string => Boolean(name))

    const isComplete = slot.required
      ? eligibleProductIds.length >= slot.minQuantity
      : eligibleProductIds.length === 0 || eligibleProductIds.length >= slot.minQuantity

    return {
      slotId: slot.id,
      slotLabel: slot.label,
      slotType: slot.slotType,
      required: slot.required,
      productIds: eligibleProductIds,
      productNames,
      isComplete
    }
  })

  const requiredSlots = selectionItems.filter(item => item.required).length
  const completedRequiredSlots = selectionItems.filter(item => item.required && item.isComplete).length
  const totalSelectedProducts = selectionItems.reduce((count, item) => count + item.productIds.length, 0)

  return {
    planId: plan.id,
    planName: plan.name,
    cadence: plan.cadence,
    currency: plan.price.currency,
    basePriceAmount: plan.price.amount,
    selectionItems,
    totalSelectedProducts,
    requiredSlots,
    completedRequiredSlots,
    isReadyForCheckout: requiredSlots === completedRequiredSlots
  }
}

export function createCheckoutHandoffPayload(summary: SubscriptionBundleSummary): CheckoutHandoffPayload {
  return {
    planId: summary.planId,
    planName: summary.planName,
    cadence: summary.cadence,
    currency: summary.currency,
    basePriceAmount: summary.basePriceAmount,
    selections: summary.selectionItems.map(item => ({
      slotId: item.slotId,
      slotType: item.slotType,
      productIds: item.productIds
    })),
    totalSelectedProducts: summary.totalSelectedProducts,
    isReadyForCheckout: summary.isReadyForCheckout
  }
}
