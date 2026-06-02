import type { BundleSlotRule, CatalogProduct, SubscriptionPlan } from '~/types/catalog'
import { getEligibleProductsForSlot } from '~/utils/catalog'
import {
  createCheckoutHandoffPayload,
  createEmptyBundleSelection,
  createSubscriptionBundleSummary,
  toggleProductInSlot,
  validateBundleSelection
} from '~/utils/bundle'

// Products and plans are passed in (sourced from /api/catalog) so the builder is
// decoupled from any one data source — it just operates on whatever it's given.
export function useSubscriptionBuilder(products: CatalogProduct[], plans: SubscriptionPlan[]) {
  const selectedPlanId = useState('subscription-builder:selected-plan-id', () => plans[0]?.id ?? '')
  const selection = useState('subscription-builder:selection', () => {
    const initialPlan = plans[0]
    return initialPlan ? createEmptyBundleSelection(initialPlan) : { planId: '', selections: [] }
  })

  const selectedPlan = computed(() => plans.find(plan => plan.id === selectedPlanId.value) ?? plans[0])

  watch(selectedPlanId, (planId) => {
    const plan = plans.find(item => item.id === planId)
    if (!plan) {
      return
    }

    selection.value = createEmptyBundleSelection(plan)
  })

  function setPlan(planId: string) {
    if (selectedPlanId.value === planId) {
      return
    }

    selectedPlanId.value = planId
  }

  function getSelectedProductIds(slotId: string) {
    return selection.value.selections.find(item => item.slotId === slotId)?.productIds ?? []
  }

  function isSelected(slotId: string, productId: string) {
    return getSelectedProductIds(slotId).includes(productId)
  }

  function toggleProduct(slot: BundleSlotRule, productId: string) {
    const slotSelection = selection.value.selections.find(item => item.slotId === slot.id)
    if (!slotSelection) {
      return
    }

    slotSelection.productIds = toggleProductInSlot({
      slot,
      products,
      currentProductIds: slotSelection.productIds,
      productId
    })
  }

  function clearSlot(slotId: string) {
    const slotSelection = selection.value.selections.find(item => item.slotId === slotId)
    if (slotSelection) {
      slotSelection.productIds = []
    }
  }

  const validationIssues = computed(() => {
    if (!selectedPlan.value) {
      return []
    }

    return validateBundleSelection({
      plan: selectedPlan.value,
      products,
      selection: selection.value
    })
  })

  const bundleSummary = computed(() => {
    if (!selectedPlan.value) {
      return null
    }

    return createSubscriptionBundleSummary({
      plan: selectedPlan.value,
      products,
      selection: selection.value
    })
  })

  const checkoutPayload = computed(() => {
    return bundleSummary.value ? createCheckoutHandoffPayload(bundleSummary.value) : null
  })

  // Projected from the single bundle summary so the "required slots left"
  // header can never disagree with the summary's readiness signal.
  const remainingRequiredSlots = computed(() => {
    if (!bundleSummary.value) {
      return 0
    }

    return bundleSummary.value.requiredSlots - bundleSummary.value.completedRequiredSlots
  })

  return {
    products,
    plans,
    selectedPlan,
    selectedPlanId,
    selection,
    validationIssues,
    bundleSummary,
    checkoutPayload,
    remainingRequiredSlots,
    setPlan,
    getSelectedProductIds,
    isSelected,
    toggleProduct,
    clearSlot,
    getEligibleProductsForSlot
  }
}
