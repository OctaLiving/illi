// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..500&family=DM+Serif+Display:ital@0;1&display=swap'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  // The brand is a committed light aesthetic — lock the color mode.
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  compatibilityDate: '2025-01-15',

  // The home page reads live catalog data from /api/catalog, so it is rendered
  // per-request (SSR) rather than prerendered — edits show up immediately.

  // Recurring renewals run on a schedule (long-running host only, e.g. Fly).
  // On serverless, drive POST /api/admin/run-renewals from the platform's cron.
  nitro: {
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      '0 * * * *': ['renewals']
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
