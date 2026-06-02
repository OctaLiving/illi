import type { PlanInput } from '../utils/catalog-store'

export default defineEventHandler(async (event) => {
  await requireOperator(event)
  const body = await readBody<PlanInput>(event)
  return await createPlan(body)
})
