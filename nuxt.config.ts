// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n'
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
          href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..500&family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@500;600&display=swap'
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
  },

  // English at /, Arabic at /ar (right-to-left). The visitor's choice is
  // remembered in a cookie; Arabic browsers are sent to /ar on their first visit.
  i18n: {
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', language: 'en-GB', name: 'English', dir: 'ltr', file: 'en.json' },
      { code: 'ar', language: 'ar-MA', name: 'العربية', dir: 'rtl', file: 'ar.json' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'illi_lang',
      redirectOn: 'root'
    }
  }
})
