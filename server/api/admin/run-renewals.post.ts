// Run the renewal cycle on demand (operator). The same logic runs on a schedule
// via server/tasks/renewals.ts, but this lets an operator trigger it now.
export default defineEventHandler(async (event) => {
  await requireOperator(event)
  return runRenewals()
})
