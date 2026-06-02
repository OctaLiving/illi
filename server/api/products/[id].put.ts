import type { ProductInput } from '../../utils/catalog-store'

export default defineEventHandler(async (event) => {
  await requireOperator(event)
  const id = getRouterParam(event, 'id') ?? ''
  const body = await readBody<ProductInput>(event)
  const updated = await updateProduct(id, body)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found.' })
  }
  return updated
})
