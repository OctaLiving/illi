// Scheduled renewal run. Cron is configured in nuxt.config (nitro.scheduledTasks).
// Note: scheduled tasks need a long-running host (Fly); on serverless use the
// platform's cron to POST /api/admin/run-renewals instead.
export default defineTask({
  meta: { name: 'renewals', description: 'Invoice due subscriptions and run dunning.' },
  async run() {
    return { result: await runRenewals() }
  }
})
