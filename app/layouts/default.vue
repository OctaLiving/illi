<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

const nav = [
  { label: 'Collection', to: '/catalog' },
  { label: 'Subscription', to: '/subscribe' }
]

const { data: me } = useMe()

async function signOut() {
  await authClient.signOut()
  await refreshNuxtData('me')
  await navigateTo('/')
}
</script>

<template>
  <div class="maghreb-lattice min-h-screen bg-[#f4ecdd] text-stone-900">
    <header class="sticky top-0 z-40 border-b border-amber-600/15 bg-[#f4ecdd]/85 backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <NuxtLink
          to="/"
          class="group flex items-baseline gap-3"
        >
          <span class="font-[family:var(--font-serif)] text-2xl font-medium lowercase tracking-tight text-stone-900">illi</span>
          <span class="hidden h-3 w-px bg-amber-600/40 sm:block" />
          <span class="hidden font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.28em] text-stone-500 sm:inline">Worth preserving</span>
        </NuxtLink>

        <div class="flex items-center gap-1 sm:gap-3">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="rounded-sm px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-600/8 hover:text-indigo-900"
          >
            {{ item.label }}
          </NuxtLink>

          <NuxtLink
            v-if="me?.user?.role === 'operator'"
            to="/manage"
            class="rounded-sm px-3 py-2 text-sm font-medium text-terra-700 transition hover:bg-terra-600/8"
          >
            Console
          </NuxtLink>

          <template v-if="me?.user">
            <NuxtLink
              to="/account"
              class="rounded-sm px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-600/8 hover:text-indigo-900"
            >
              Account
            </NuxtLink>
            <span class="ml-1 hidden font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.2em] text-stone-500 sm:inline">{{ me.user.name }}</span>
            <button
              type="button"
              class="rounded-sm px-3 py-2 text-sm font-medium text-stone-500 transition hover:bg-amber-600/10 hover:text-stone-800"
              @click="signOut"
            >
              Sign out
            </button>
          </template>
          <NuxtLink
            v-else
            to="/login"
            class="rounded-sm px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-600/8 hover:text-indigo-900"
          >
            Sign in
          </NuxtLink>
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="border-t border-amber-600/15 bg-amber-50/50">
      <div class="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[auto_1fr_auto] md:items-start">
        <div class="wax-seal stamp-in shrink-0">
          <span>illi<br>·<br>by<br>invitation</span>
        </div>

        <div class="space-y-3">
          <p class="font-[family:var(--font-serif)] text-3xl lowercase text-stone-900">
            illi
          </p>
          <p class="max-w-md text-sm leading-7 text-stone-600">
            Small-batch foods for the season. Short ingredient lists, reusable glass,
            and a subscription you shape yourself — made in Casablanca, sent by invitation.
          </p>
        </div>

        <div class="space-y-2 font-[family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.16em] text-stone-500 md:text-right">
          <p>Invitation-only storefront</p>
          <p>USDT checkout · catalog first</p>
          <p>© {{ new Date().getFullYear() }} illi</p>
        </div>
      </div>
    </footer>
  </div>
</template>
