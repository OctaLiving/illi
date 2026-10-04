<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: me } = useMe()
const firstName = computed(() => me.value?.user?.name?.split(' ')[0] ?? '')
const { data: catalog } = await useCatalog()
const { bundleSummary, selection } = useSubscriptionBuilder(catalog.value.products, catalog.value.plans)

const paying = ref(false)
const payError = ref('')

async function pay() {
  paying.value = true
  payError.value = ''
  try {
    const { payUrl } = await $fetch<{ payUrl: string }>('/api/checkout', {
      method: 'POST',
      body: { selection: selection.value }
    })
    if (/^https?:\/\//.test(payUrl)) {
      window.location.href = payUrl // external hosted page (NOWPayments)
    } else {
      await navigateTo(payUrl) // internal simulated page
    }
  } catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    payError.value = e?.data?.statusMessage ?? 'Could not start checkout.'
    paying.value = false
  }
}

useSeoMeta({ title: 'Checkout · illi', robots: 'noindex' })
</script>

<template>
  <div class="maghreb-wash">
    <div class="mx-auto max-w-2xl px-5 py-16 sm:py-20">
      <AppBreadcrumbs
        class="mb-10 justify-center"
        :items="[{ label: 'Home', to: '/' }, { label: 'Build your box', to: '/subscribe' }, { label: 'Checkout' }]"
      />
      <div class="reveal text-center">
        <BrandLogo
          variant="mark"
          class="text-6xl"
        />
        <p class="mt-6 font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.3em] text-saffron-600">
          You're in{{ firstName ? `, ${firstName}` : '' }}
        </p>
        <h1 class="mt-3 font-[family:var(--font-serif)] text-4xl leading-tight text-stone-900 sm:text-5xl">
          Your box is ready.
        </h1>
        <p class="mx-auto mt-4 max-w-md text-base leading-7 text-stone-600">
          Check your picks below, then pay securely in crypto. We'll prepare your box and send you a
          payment link before each renewal.
        </p>
      </div>

      <div
        v-if="bundleSummary"
        class="reveal mt-10 rounded-3xl bg-white ring-1 ring-sand-200 p-7"
        style="animation-delay:.1s"
      >
        <div class="flex items-center justify-between border-b border-sand-600/15 pb-4">
          <div>
            <p class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.18em] text-stone-500">
              {{ bundleSummary.cadence }}
            </p>
            <p class="mt-1 font-[family:var(--font-serif)] text-2xl text-stone-900">
              {{ bundleSummary.planName }}
            </p>
          </div>
          <p class="font-[family:var(--font-mono)] text-lg text-olive-700">
            {{ bundleSummary.basePriceAmount }} {{ bundleSummary.currency }}
          </p>
        </div>

        <ul class="mt-4 space-y-2">
          <li
            v-for="item in bundleSummary.selectionItems"
            :key="item.slotId"
            class="flex items-start justify-between gap-3 text-sm leading-7"
          >
            <span class="font-[family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.12em] text-stone-500">
              {{ item.slotLabel }}
            </span>
            <span class="text-right text-stone-700">
              {{ item.productNames.length ? item.productNames.join(', ') : '—' }}
            </span>
          </li>
        </ul>

        <div class="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-saffron-600 px-5 py-3 text-sm font-semibold text-sand-50 transition hover:bg-saffron-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="paying || !bundleSummary?.isReadyForCheckout"
            @click="pay"
          >
            <UIcon
              name="i-lucide-wallet"
              class="size-4"
            />
            {{ paying ? 'Starting checkout…' : 'Pay with crypto' }}
          </button>
          <NuxtLink
            to="/subscribe"
            class="inline-flex items-center gap-2 rounded-full border border-olive-600 px-5 py-3 text-sm font-semibold text-olive-700 transition hover:bg-olive-600/8"
          >
            Adjust the bundle
          </NuxtLink>
        </div>
        <p
          v-if="payError"
          class="mt-3 rounded-lg bg-saffron-600/10 px-3 py-2 text-sm text-saffron-700"
        >
          {{ payError }}
        </p>
      </div>
    </div>
  </div>
</template>
