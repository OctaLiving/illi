export default defineEventHandler(async (event) => {
  await requireOperator(event)
  const id = getRouterParam(event, 'id') ?? ''
  if (!(await deleteProduct(id))) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found.' })
  }
  return { ok: true }
})
