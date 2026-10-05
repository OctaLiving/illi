<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()
const { tr, price } = useLocalized()

const nav = computed(() => [
  { label: t('nav.shop'), to: '/catalog' },
  { label: t('nav.boxes'), to: '/subscribe' },
  { label: t('nav.story'), to: '/#story' }
])
// The other languages, for one-tap switching in the header (short labels on phones).
const shortNames: Record<string, string> = { en: 'EN', fr: 'FR', ar: 'ع' }
const otherLocales = computed(() => locales.value.filter(l => l.code !== locale.value))

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
  await navigateTo(localePath('/'))
}
</script>

<template>
  <div class="min-h-screen bg-sand-100 text-stone-900">
    <div class="bg-terra-800 px-4 py-2 text-center text-xs font-medium tracking-wide text-sand-100 sm:text-sm">
      {{ $t('layout.announcement') }}
    </div>

    <header class="sticky top-0 z-40 border-b border-sand-200 bg-sand-100/90 backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <NuxtLinkLocale
          to="/"
          class="text-[1.7rem] leading-none sm:text-[2rem]"
          :aria-label="$t('nav.home')"
        >
          <BrandLogo />
        </NuxtLinkLocale>

        <nav class="hidden items-center gap-1 md:flex">
          <NuxtLinkLocale
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-sand-200 hover:text-stone-900"
            active-class="text-terra-700"
          >
            {{ item.label }}
          </NuxtLinkLocale>
        </nav>

        <div class="flex items-center gap-1">
          <NuxtLink
            v-if="me?.user?.role === 'operator'"
            to="/manage"
            class="hidden rounded-full px-3 py-2 text-sm font-semibold text-sage-700 transition hover:bg-sage-50 sm:block"
          >
            {{ $t('nav.console') }}
          </NuxtLink>
          <NuxtLinkLocale
            :to="me?.user ? '/account' : '/login'"
            class="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-sand-200 sm:flex"
          >
            <UIcon
              name="i-lucide-user-round"
              class="size-5"
            />
            {{ me?.user ? $t('nav.account') : $t('nav.signIn') }}
          </NuxtLinkLocale>
          <nav
            class="flex items-center"
            :aria-label="$t('nav.language')"
          >
            <NuxtLink
              v-for="l in otherLocales"
              :key="l.code"
              :to="switchLocalePath(l.code)"
              class="rounded-full px-2 py-2 text-sm font-semibold text-stone-700 transition hover:bg-sand-200 sm:px-3"
              :lang="l.code"
              :title="l.name"
            >
              <span class="sm:hidden">{{ shortNames[l.code] ?? l.code }}</span>
              <span class="hidden sm:inline">{{ l.name }}</span>
            </NuxtLink>
          </nav>
          <button
            type="button"
            class="relative flex items-center gap-2 rounded-full bg-terra-700 px-4 py-2.5 text-sm font-semibold text-sand-50 transition hover:bg-terra-800"
            :aria-label="$t('nav.openCart')"
            @click="cartOpen = true"
          >
            <UIcon
              name="i-lucide-shopping-bag"
              class="size-5"
            />
            <span class="hidden sm:inline">{{ $t('nav.cart') }}</span>
            <ClientOnly>
              <span
                v-if="count > 0"
                class="grid min-w-5 place-items-center rounded-full bg-sage-400 px-1.5 text-xs font-bold text-terra-950"
              >{{ count }}</span>
            </ClientOnly>
          </button>
          <button
            type="button"
            class="grid size-11 place-items-center rounded-full text-stone-700 transition hover:bg-sand-200 md:hidden"
            :aria-expanded="menuOpen"
            :aria-label="$t('nav.menu')"
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
        <NuxtLinkLocale
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="block rounded-xl px-3 py-3 text-base font-semibold text-stone-800 hover:bg-sand-200"
        >
          {{ item.label }}
        </NuxtLinkLocale>
        <NuxtLinkLocale
          :to="me?.user ? '/account' : '/login'"
          class="block rounded-xl px-3 py-3 text-base font-semibold text-stone-800 hover:bg-sand-200"
        >
          {{ me?.user ? $t('nav.account') : $t('nav.signIn') }}
        </NuxtLinkLocale>
        <NuxtLink
          v-if="me?.user?.role === 'operator'"
          to="/manage"
          class="block rounded-xl px-3 py-3 text-base font-semibold text-sage-700 hover:bg-sand-200"
        >
          {{ $t('nav.console') }}
        </NuxtLink>
        <button
          v-if="me?.user"
          type="button"
          class="block w-full rounded-xl px-3 py-3 text-left text-base font-semibold text-stone-500 hover:bg-sand-200"
          @click="signOut"
        >
          {{ $t('nav.signOut') }}
        </button>
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <footer class="mt-24 bg-terra-900 text-sand-200">
      <div class="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div class="space-y-5">
          <BrandLogo
            variant="lockup"
            reversed
            class="text-[2.6rem]"
          />
          <p class="max-w-xs text-sm leading-7 text-sand-300">
            {{ $t('footer.about') }}
          </p>
        </div>

        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-sage-300">
            {{ $t('footer.shop') }}
          </p>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li
              v-for="category in catalog.categories"
              :key="category.slug"
            >
              <NuxtLinkLocale
                :to="`/catalog?category=${category.slug}`"
                class="hover:text-sand-50"
              >
                {{ tr(category, 'name') }}
              </NuxtLinkLocale>
            </li>
          </ul>
        </div>

        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-sage-300">
            {{ $t('footer.boxes') }}
          </p>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li
              v-for="plan in catalog.plans"
              :key="plan.id"
            >
              <NuxtLinkLocale
                to="/subscribe"
                class="hover:text-sand-50"
              >
                {{ tr(plan, 'name') }} · {{ price(plan.price.amount) }}
              </NuxtLinkLocale>
            </li>
          </ul>
        </div>

        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-sage-300">
            {{ $t('footer.account') }}
          </p>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li>
              <NuxtLinkLocale
                :to="me?.user ? '/account' : '/login'"
                class="hover:text-sand-50"
              >
                {{ me?.user ? $t('footer.yourAccount') : $t('nav.signIn') }}
              </NuxtLinkLocale>
            </li>
            <li v-if="!me?.user">
              <NuxtLinkLocale
                to="/join"
                class="hover:text-sand-50"
              >
                {{ $t('footer.createAccount') }}
              </NuxtLinkLocale>
            </li>
            <li>
              <NuxtLinkLocale
                to="/cart"
                class="hover:text-sand-50"
              >
                {{ $t('footer.yourCart') }}
              </NuxtLinkLocale>
            </li>
          </ul>
        </div>
      </div>
      <div class="border-t border-terra-800">
        <div class="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-sand-400 sm:flex-row sm:justify-between sm:px-8">
          <p>{{ $t('footer.copyright', { year: new Date().getFullYear() }) }}</p>
          <p>{{ $t('footer.payments') }}</p>
        </div>
      </div>
    </footer>

    <CartDrawer />
  </div>
</template>
