// Picks catalog text in the visitor's language. Catalog rows carry optional
// translations ({ ar: { name, description, … } }); anything missing falls back
// to the English original.
type Translatable = { translations?: Partial<Record<string, Record<string, unknown>>> | null }

export function useLocalized() {
  const { locale, t } = useI18n()

  function tr<T extends Translatable, K extends keyof T & string>(item: T | null | undefined, field: K): T[K] {
    if (!item) return '' as T[K]
    const value = item.translations?.[locale.value]?.[field]
    const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
    return (empty ? item[field] : value) as T[K]
  }

  /** A translated value stored under a key that isn't a top-level field (e.g. nutritionSummary). */
  function trKey(item: Translatable | null | undefined, key: string, fallback: string): string {
    const value = item?.translations?.[locale.value]?.[key]
    return typeof value === 'string' && value ? value : fallback
  }

  /** "170 MAD" / "170 درهم" */
  const price = (amount: number) => t('common.price', { amount })

  return { tr, trKey, price, locale }
}

// Names for catalog items referenced by id (in carts, orders and box summaries),
// in the visitor's language. Falls back to the stored English name.
export function useCatalogText() {
  const { data: catalog } = useCatalog()
  const { tr } = useLocalized()

  const productName = (id: string | undefined, fallback: string) => {
    const product = catalog.value.products.find(p => p.id === id)
    return product ? tr(product, 'name') : fallback
  }
  const plan = (id: string | undefined) => catalog.value.plans.find(p => p.id === id)
  const planName = (id: string | undefined, fallback: string) => {
    const found = plan(id)
    return found ? tr(found, 'name') : fallback
  }
  const slotLabel = (planId: string | undefined, slotId: string, fallback: string) => {
    const slot = plan(planId)?.includedSlots.find(s => s.id === slotId)
    return slot ? tr(slot, 'label') : fallback
  }

  return { productName, planName, slotLabel }
}
