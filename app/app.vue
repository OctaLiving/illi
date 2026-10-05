<script setup lang="ts">
const { t } = useI18n()
const localeHead = useLocaleHead()

useHead(() => ({
  htmlAttrs: {
    lang: localeHead.value.htmlAttrs.lang,
    dir: localeHead.value.htmlAttrs.dir
  },
  link: [...(localeHead.value.link ?? [])],
  meta: [...(localeHead.value.meta ?? [])]
}))

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
  ],
  bodyAttrs: {
    class: 'bg-sand-100 text-stone-900 antialiased'
  }
})

const title = computed(() => t('meta.title'))
const description = computed(() => t('meta.description'))

useHead({ titleTemplate: s => (!s ? title.value : /illi/i.test(s) ? s : `${s} · Maison Illi`) })

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
