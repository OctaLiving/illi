import type { CatalogProduct, ProductCategory, SubscriptionPlan } from '~/types/catalog'

export interface CatalogData {
  categories: ProductCategory[]
  products: CatalogProduct[]
  plans: SubscriptionPlan[]
}

// Single read seam for the live catalog. Storefront pages await this; the
// dashboard also uses `refresh()` after a mutation. Keyed so all callers in a
// request share one payload.
export function useCatalog() {
  return useFetch<CatalogData>('/api/catalog', {
    key: 'catalog',
    default: () => ({ categories: [], products: [], plans: [] })
  })
}
