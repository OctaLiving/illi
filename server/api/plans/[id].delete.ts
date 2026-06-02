export default defineEventHandler(async (event) => {
  await requireOperator(event)
  const id = getRouterParam(event, 'id') ?? ''
  if (!(await deletePlan(id))) {
    throw createError({ statusCode: 404, statusMessage: 'Plan not found.' })
  }
  return { ok: true }
})
