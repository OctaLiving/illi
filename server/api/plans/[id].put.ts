import type { PlanInput } from '../../utils/catalog-store'

export default defineEventHandler(async (event) => {
  await requireOperator(event)
  const id = getRouterParam(event, 'id') ?? ''
  const body = await readBody<PlanInput>(event)
  const updated = await updatePlan(id, body)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Plan not found.' })
  }
  return updated
})
