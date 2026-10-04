<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

const nav = [
  { label: 'Shop', to: '/catalog' },
  { label: 'Boxes', to: '/subscribe' },
  { label: 'Our story', to: '/#story' }
]

const { data: me } = useMe()
const { data: catalog } = await useCatalog()
const { count, isOpen: cartOpen } = useCart()
const menuOpen = ref(false)

const route = useRoute()
watch(() => route.fullPath, () => {
  menuOpen.value = false
})

async function signOut() {
  await authClient.signOut()
  await refreshNuxtData('me')
  await navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen bg-sand-100 text-stone-900">
    <div class="bg-olive-800 px-4 py-2 text-center text-xs font-medium tracking-wide text-sand-100 sm:text-sm">
      Made in small batches in Casablanca · Buy any jar on its own, or get a box on repeat
    </div>

    <header class="sticky top-0 z-40 border-b border-sand-200 bg-sand-100/90 backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <NuxtLink
          to="/"
          class="text-olive-800 text-[2.1rem] leading-none"
          aria-label="illi — home"
        >
          <BrandLogo />
        </NuxtLink>

        <nav class="hidden items-center gap-1 md:flex">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-sand-200 hover:text-stone-900"
            active-class="text-olive-700"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-1">
          <NuxtLink
            v-if="me?.user?.role === 'operator'"
            to="/manage"
            class="hidden rounded-full px-3 py-2 text-sm font-semibold text-saffron-700 transition hover:bg-saffron-50 sm:block"
          >
            Console
          </NuxtLink>
          <NuxtLink
            :to="me?.user ? '/account' : '/login'"
            class="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-sand-200 sm:flex"
          >
            <UIcon
              name="i-lucide-user-round"
              class="size-5"
            />
            {{ me?.user ? 'Account' : 'Sign in' }}
          </NuxtLink>
          <button
            type="button"
            class="relative flex items-center gap-2 rounded-full bg-olive-700 px-4 py-2.5 text-sm font-semibold text-sand-50 transition hover:bg-olive-800"
            aria-label="Open cart"
            @click="cartOpen = true"
          >
            <UIcon
              name="i-lucide-shopping-bag"
              class="size-5"
            />
            <span class="hidden sm:inline">Cart</span>
            <ClientOnly>
              <span
                v-if="count > 0"
                class="grid min-w-5 place-items-center rounded-full bg-saffron-400 px-1.5 text-xs font-bold text-olive-950"
              >{{ count }}</span>
            </ClientOnly>
          </button>
          <button
            type="button"
            class="grid size-11 place-items-center rounded-full text-stone-700 transition hover:bg-sand-200 md:hidden"
            :aria-expanded="menuOpen"
            aria-label="Menu"
            @click="menuOpen = !menuOpen"
          >
            <UIcon
              :name="menuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
              class="size-6"
            />
          </button>
        </div>
      </div>

      <nav
        v-if="menuOpen"
        class="border-t border-sand-200 bg-sand-50 px-5 py-3 md:hidden"
      >
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="block rounded-xl px-3 py-3 text-base font-semibold text-stone-800 hover:bg-sand-200"
        >
          {{ item.label }}
        </NuxtLink>
        <NuxtLink
          :to="me?.user ? '/account' : '/login'"
          class="block rounded-xl px-3 py-3 text-base font-semibold text-stone-800 hover:bg-sand-200"
        >
          {{ me?.user ? 'Account' : 'Sign in' }}
        </NuxtLink>
        <NuxtLink
          v-if="me?.user?.role === 'operator'"
          to="/manage"
          class="block rounded-xl px-3 py-3 text-base font-semibold text-saffron-700 hover:bg-sand-200"
        >
          Console
        </NuxtLink>
        <button
          v-if="me?.user"
          type="button"
          class="block w-full rounded-xl px-3 py-3 text-left text-base font-semibold text-stone-500 hover:bg-sand-200"
          @click="signOut"
        >
          Sign out
        </button>
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <footer class="mt-24 bg-olive-900 text-sand-200">
      <div class="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div class="space-y-5">
          <BrandLogo
            reversed
            class="text-[2.6rem] text-sand-50"
          />
          <p class="max-w-xs text-sm leading-7 text-sand-300">
            A small-batch Moroccan pantry. Ferments, nut butters, marinated fish and slow-cooked sauces —
            short ingredient lists, made in Casablanca.
          </p>
        </div>

        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-saffron-300">
            Shop
          </p>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li
              v-for="category in catalog.categories"
              :key="category.slug"
            >
              <NuxtLink
                :to="`/catalog?category=${category.slug}`"
                class="hover:text-sand-50"
              >
                {{ category.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-saffron-300">
            Boxes
          </p>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li
              v-for="plan in catalog.plans"
              :key="plan.id"
            >
              <NuxtLink
                to="/subscribe"
                class="hover:text-sand-50"
              >
                {{ plan.name }} · {{ plan.price.amount }} MAD
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-saffron-300">
            Account
          </p>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li>
              <NuxtLink
                :to="me?.user ? '/account' : '/login'"
                class="hover:text-sand-50"
              >{{ me?.user ? 'Your account' : 'Sign in' }}</NuxtLink>
            </li>
            <li v-if="!me?.user">
              <NuxtLink
                to="/join"
                class="hover:text-sand-50"
              >Create an account</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/cart"
                class="hover:text-sand-50"
              >Your cart</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
      <div class="border-t border-olive-800">
        <div class="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-sand-400 sm:flex-row sm:justify-between sm:px-8">
          <p>© {{ new Date().getFullYear() }} illi · Made in Casablanca</p>
          <p>Prices in Moroccan dirhams · Cash on delivery or secure online payment</p>
        </div>
      </div>
    </footer>

    <CartDrawer />
  </div>
</template>
