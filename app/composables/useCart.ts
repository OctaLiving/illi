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

// Starts payment for the given items (the cart, or a single "Buy now" item).
// Signed-out shoppers are sent to sign in first and come back to /cart.
export function useCheckout() {
  const { data: me } = useMe()
  const pending = ref(false)
  const error = ref('')

  async function checkout(items: CartItem[], onStarted?: () => void) {
    if (!me.value?.user) {
      await navigateTo('/login?next=/cart')
      return
    }
    pending.value = true
    error.value = ''
    try {
      const { payUrl } = await $fetch<{ payUrl: string }>('/api/checkout/cart', {
        method: 'POST',
        body: { items }
      })
      onStarted?.()
      if (/^https?:\/\//.test(payUrl)) {
        window.location.href = payUrl // external hosted page (NOWPayments)
      } else {
        await navigateTo(payUrl) // internal simulated page
      }
    } catch (err) {
      const e = err as { data?: { statusMessage?: string } }
      error.value = e?.data?.statusMessage ?? 'Could not start checkout.'
      pending.value = false
    }
  }

  return { checkout, pending, error }
}
