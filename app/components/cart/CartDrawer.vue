<script setup lang="ts">
const { lines, count, subtotal, isOpen } = useCart()
const { price } = useLocalized()
const localePath = useLocalePath()

const route = useRoute()
watch(() => route.fullPath, () => {
  isOpen.value = false
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') isOpen.value = false
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function startCheckout() {
  isOpen.value = false
  navigateTo(localePath('/cart'))
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-200"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-[2px]"
        @click="isOpen = false"
      />
    </Transition>
    <Transition
      enter-from-class="translate-x-full rtl:-translate-x-full"
      leave-to-class="translate-x-full rtl:-translate-x-full"
      enter-active-class="transition duration-300 ease-out"
      leave-active-class="transition duration-200 ease-in"
    >
      <aside
        v-if="isOpen"
        class="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-sand-50 shadow-2xl"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('cart.title')"
      >
        <header class="flex items-center justify-between border-b border-sand-200 px-6 py-5">
          <h2 class="font-serif text-2xl text-stone-900">
            {{ $t('cart.title') }} <span class="font-sans text-base text-stone-500">({{ count }})</span>
          </h2>
          <button
            type="button"
            class="grid size-10 place-items-center rounded-full text-stone-600 transition hover:bg-sand-200"
            :aria-label="$t('cart.close')"
            @click="isOpen = false"
          >
            <UIcon
              name="i-lucide-x"
              class="size-5"
            />
          </button>
        </header>

        <div
          v-if="lines.length === 0"
          class="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center"
        >
          <BrandLogo
            variant="mark"
            class="text-6xl opacity-80"
          />
          <p class="font-serif text-2xl text-stone-900">
            {{ $t('cart.empty') }}
          </p>
          <p class="text-sm text-stone-600">
            {{ $t('cart.emptyBody') }}
          </p>
          <NuxtLinkLocale
            to="/catalog"
            class="mt-2 rounded-full bg-olive-700 px-6 py-3 text-sm font-semibold text-sand-50 transition hover:bg-olive-800"
          >
            {{ $t('cart.shop') }}
          </NuxtLinkLocale>
        </div>

        <template v-else>
          <div class="flex-1 overflow-y-auto px-6">
            <CartLines />
          </div>

          <footer class="space-y-4 border-t border-sand-200 bg-white px-6 py-5">
            <div class="flex items-baseline justify-between">
              <span class="text-stone-600">{{ $t('cart.subtotal') }}</span>
              <span class="font-serif text-3xl text-stone-900">{{ price(subtotal) }}</span>
            </div>
            <button
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-full bg-olive-700 py-4 text-base font-semibold text-sand-50 transition hover:bg-olive-800 disabled:opacity-60"
              @click="startCheckout"
            >
              <UIcon
                name="i-lucide-lock"
                class="size-4"
              />
              {{ $t('cart.checkout') }}
            </button>
            <p class="text-center text-xs text-stone-500">
              {{ $t('cart.payNote') }}
            </p>
          </footer>
        </template>
      </aside>
    </Transition>
  </Teleport>
</template>
