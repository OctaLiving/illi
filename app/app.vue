<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
  ],
  htmlAttrs: {
    lang: 'en'
  },
  bodyAttrs: {
    class: 'bg-sand-100 text-stone-900 antialiased'
  }
})

const title = 'illi — Small-batch Moroccan pantry'
const description = 'Ferments, nut butters, marinated fish and slow-cooked sauces, made in small batches in Casablanca. Buy a jar or build a box.'

useHead({ titleTemplate: t => (!t ? title : t.includes('illi') ? t : `${t} · illi`) })

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
