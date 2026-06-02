<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

const nav = [
  { label: 'Overview', to: '/manage', icon: 'i-lucide-layout-dashboard' },
  { label: 'Catalog', to: '/manage/catalog', icon: 'i-lucide-package' },
  { label: 'Plans', to: '/manage/plans', icon: 'i-lucide-box' },
  { label: 'Subscriptions', to: '/manage/subscriptions', icon: 'i-lucide-repeat' },
  { label: 'Invitations', to: '/manage/invitations', icon: 'i-lucide-ticket' },
  { label: 'Checkout', to: '/manage/checkout', icon: 'i-lucide-wallet' },
  { label: 'Settings', to: '/manage/settings', icon: 'i-lucide-settings' }
]

const route = useRoute()
// Overview lives at /manage exactly; the rest match their own path.
const isActive = (to: string) => (to === '/manage' ? route.path === '/manage' : route.path === to)

const { data: me } = useMe()

async function signOut() {
  await authClient.signOut()
  await refreshNuxtData('me')
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#f4ecdd] text-stone-900">
    <!-- Desktop sidebar -->
    <aside class="hidden bg-indigo-950 text-amber-50 lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div class="border-b border-amber-50/10 px-6 py-6">
        <p class="font-[family:var(--font-serif)] text-2xl lowercase">
          illi
        </p>
        <p class="mt-1 font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.26em] text-amber-200/60">
          Operator console
        </p>
      </div>

      <nav class="flex-1 space-y-1 px-3 py-4">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition"
          :class="isActive(item.to) ? 'bg-amber-50/12 text-amber-50' : 'text-amber-50/70 hover:bg-amber-50/8 hover:text-amber-50'"
        >
          <UIcon
            :name="item.icon"
            class="size-4 shrink-0"
            :class="isActive(item.to) ? 'text-terra-200' : 'text-terra-300'"
          />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="space-y-3 border-t border-amber-50/10 px-6 py-5">
        <p
          v-if="me?.user"
          class="truncate font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.14em] text-amber-200/50"
        >
          {{ me.user.email }}
        </p>
        <div class="flex items-center justify-between gap-3">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] text-amber-200/60 transition hover:text-amber-50"
          >
            <UIcon
              name="i-lucide-arrow-left"
              class="size-3.5"
            />
            Storefront
          </NuxtLink>
          <button
            type="button"
            class="flex items-center gap-2 font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] text-terra-300 transition hover:text-terra-200"
            @click="signOut"
          >
            <UIcon
              name="i-lucide-log-out"
              class="size-3.5"
            />
            Sign out
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile top bar -->
    <header class="sticky top-0 z-40 bg-indigo-950 text-amber-50 lg:hidden">
      <div class="flex items-center justify-between px-5 py-3">
        <p class="font-[family:var(--font-serif)] text-xl lowercase">
          illi
          <span class="font-[family:var(--font-mono)] text-[0.56rem] uppercase tracking-[0.2em] text-amber-200/60">ops</span>
        </p>
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/"
            class="font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.14em] text-amber-200/70"
          >
            Storefront
          </NuxtLink>
          <button
            type="button"
            class="font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.14em] text-terra-300"
            @click="signOut"
          >
            Sign out
          </button>
        </div>
      </div>
      <nav class="flex gap-1 overflow-x-auto px-3 pb-2">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="whitespace-nowrap rounded-sm px-3 py-1.5 font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] transition"
          :class="isActive(item.to) ? 'bg-amber-50/12 text-amber-50' : 'text-amber-50/70'"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </header>

    <div class="lg:pl-64">
      <main class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <slot />
      </main>
    </div>
  </div>
</template>
