import type { CatalogProduct } from '~/types/catalog'

export interface CartItem {
  productId: string
  quantity: number
}

export interface CartLine extends CartItem {
  product: CatalogProduct
  lineTotal: number
}

const STORAGE_KEY = 'illi-cart'
export const MAX_QUANTITY = 20

// One-time purchases. The cart lives in shared state and is mirrored to
// localStorage so it survives reloads and the sign-in round trip. Prices are
// always read from the live catalog (and re-checked by the server at checkout).
export function useCart() {
  const items = useState<CartItem[]>('cart-items', () => [])
  const isOpen = useState('cart-open', () => false)
  const loaded = useState('cart-loaded', () => false)
  const { data: catalog } = useCatalog()

  if (import.meta.client && !loaded.value) {
    loaded.value = true
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as CartItem[]
      if (Array.isArray(saved)) {
        items.value = saved.filter(i => typeof i?.productId === 'string' && i.quantity > 0)
      }
    } catch {
      // Unreadable storage — start with an empty cart.
    }
    watch(items, (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        // Private mode / storage full — the cart still works for this visit.
      }
    }, { deep: true })
  }

  const lines = computed<CartLine[]>(() =>
    items.value.flatMap((item) => {
      const product = catalog.value.products.find(p => p.id === item.productId)
      return product ? [{ ...item, product, lineTotal: product.price.amount * item.quantity }] : []
    })
  )
  const count = computed(() => lines.value.reduce((sum, l) => sum + l.quantity, 0))
  const subtotal = computed(() => lines.value.reduce((sum, l) => sum + l.lineTotal, 0))

  function setQuantity(productId: string, quantity: number) {
    const q = Math.min(MAX_QUANTITY, Math.max(0, Math.round(quantity)))
    if (q === 0) {
      items.value = items.value.filter(i => i.productId !== productId)
      return
    }
    const existing = items.value.find(i => i.productId === productId)
    if (existing) {
      existing.quantity = q
    } else {
      items.value = [...items.value, { productId, quantity: q }]
    }
  }

  function add(productId: string, quantity = 1, open = true) {
    const current = items.value.find(i => i.productId === productId)?.quantity ?? 0
    setQuantity(productId, current + quantity)
    if (open) {
      isOpen.value = true
    }
  }

  function clear() {
    items.value = []
  }

  return { items, lines, count, subtotal, isOpen, add, setQuantity, clear }
}

export type PaymentMethod = 'card' | 'crypto' | 'cod'

export interface ShippingDetails {
  name: string
  phone: string
  address: string
  city: string
  country: string
  notes: string
}

export interface CheckoutDetails {
  method: PaymentMethod
  shipping: ShippingDetails
}

// Places an order at a checkout endpoint (the cart or a box), then sends the
// shopper on: to the payment page for online methods, or to the order page for
// cash on delivery.
export function useCheckout(endpoint: '/api/checkout/cart' | '/api/checkout') {
  const { t, te } = useI18n()
  const localePath = useLocalePath()
  const pending = ref(false)
  const error = ref('')

  async function submit(body: Record<string, unknown>, onPlaced?: () => void) {
    pending.value = true
    error.value = ''
    try {
      const { nextUrl } = await $fetch<{ nextUrl: string }>(endpoint, { method: 'POST', body })
      onPlaced?.()
      if (/^https?:\/\//.test(nextUrl)) {
        window.location.href = nextUrl // external hosted payment page
      } else {
        await navigateTo(localePath(nextUrl))
      }
    } catch (err) {
      // Server errors carry a code (data.data.code) so they can be shown in the
      // shopper's language; anything unexpected falls back to a generic message.
      const e = err as { data?: { statusMessage?: string, data?: { code?: string, product?: string, max?: number } } }
      const info = e?.data?.data
      const key = `checkout.errors.${info?.code}`
      error.value = info?.code && te(key) ? t(key, { product: info.product ?? '', max: info.max ?? 20 }) : t('checkout.errors.generic')
      pending.value = false
    }
  }

  return { submit, pending, error }
}
