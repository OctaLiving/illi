// Slot types ARE the product categories — a product fills a slot of its category.
export const bundleSlotTypes = [
  'beverages',
  'dairy',
  'vegetables',
  'spreads',
  'jams',
  'seafood',
  'sauces'
] as const
export type BundleSlotType = typeof bundleSlotTypes[number]

export const subscriptionCadences = ['weekly', 'biweekly', 'monthly'] as const
export type SubscriptionCadence = typeof subscriptionCadences[number]

export type PaymentCurrency = 'USDT'

export interface ProductImage {
  src: string
  alt: string
}

/** Macro split (percent of energy) plus the imported nutritional sheet text. */
export interface ProductNutrition {
  proteins: number
  fats: number
  carbs: number
  summary: string
}

export interface CatalogProduct {
  id: string
  slug: string
  name: string
  subtitle: string
  description: string
  category: string
  ingredients: string[]
  tags: string[]
  image: ProductImage
  defaultUnitLabel: string
  storage: string
  shelfLifeDays: number
  nutrition: ProductNutrition
  isAvailable: boolean
  eligibleSlotTypes: BundleSlotType[]
}

/** A product category, used to group the collection. The slug is a slot type. */
export interface ProductCategory {
  slug: BundleSlotType
  name: string
  blurb: string
}

export interface BundleSlotRule {
  id: string
  slotType: BundleSlotType
  label: string
  description: string
  minQuantity: number
  maxQuantity: number
  required: boolean
}

export interface SubscriptionPlanPrice {
  amount: number
  currency: PaymentCurrency
}

export interface SubscriptionPlan {
  id: string
  slug: string
  name: string
  cadence: SubscriptionCadence
  summary: string
  price: SubscriptionPlanPrice
  includedSlots: BundleSlotRule[]
}

/** How a single product fits a plan: the plan plus every slot it is eligible to fill. */
export interface ProductPlanFit {
  plan: SubscriptionPlan
  matchingSlots: BundleSlotRule[]
}

export interface BundleSelection {
  slotId: string
  productIds: string[]
}

export interface BundleSelectionInput {
  planId: string
  selections: BundleSelection[]
}

export interface BundleSelectionItem {
  slotId: string
  slotLabel: string
  slotType: BundleSlotType
  required: boolean
  productIds: string[]
  productNames: string[]
  isComplete: boolean
}

export interface SubscriptionBundleSummary {
  planId: string
  planName: string
  cadence: SubscriptionCadence
  currency: PaymentCurrency
  basePriceAmount: number
  selectionItems: BundleSelectionItem[]
  totalSelectedProducts: number
  requiredSlots: number
  completedRequiredSlots: number
  isReadyForCheckout: boolean
}

export interface BundleValidationIssue {
  slotId: string
  type: 'missing-required' | 'too-many-products' | 'invalid-product' | 'below-minimum'
  message: string
}

export interface CheckoutHandoffSelection {
  slotId: string
  slotType: BundleSlotType
  productIds: string[]
}

export interface CheckoutHandoffPayload {
  planId: string
  planName: string
  cadence: SubscriptionCadence
  currency: PaymentCurrency
  basePriceAmount: number
  selections: CheckoutHandoffSelection[]
  totalSelectedProducts: number
  isReadyForCheckout: boolean
}
