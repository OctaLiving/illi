import type { ProductInput } from '../utils/catalog-store'

export default defineEventHandler(async (event) => {
  await requireOperator(event)
  const body = await readBody<ProductInput>(event)
  return await createProduct(body)
})
