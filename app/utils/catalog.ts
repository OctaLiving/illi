import type {
  BundleSlotRule,
  CatalogProduct,
  ProductPlanFit,
  SubscriptionPlan
} from '~/types/catalog'

/**
 * Catalog eligibility — the single source of truth for whether a product may
 * fill a given slot. The bundle rules build on top of this predicate.
 */
export function isProductEligibleForSlot(product: CatalogProduct, slot: BundleSlotRule): boolean {
  return product.isAvailable && product.eligibleSlotTypes.includes(slot.slotType)
}

export function getEligiblePlansForProduct(product: CatalogProduct, plans: SubscriptionPlan[]): ProductPlanFit[] {
  return plans
    .map((plan) => {
      const matchingSlots = plan.includedSlots.filter(slot => isProductEligibleForSlot(product, slot))

      return matchingSlots.length > 0
        ? {
            plan,
            matchingSlots
          }
        : null
    })
    .filter((entry): entry is ProductPlanFit => Boolean(entry))
}

export function getEligibleProductsForSlot(products: CatalogProduct[], slot: BundleSlotRule) {
  return products.filter(product => isProductEligibleForSlot(product, slot))
}
