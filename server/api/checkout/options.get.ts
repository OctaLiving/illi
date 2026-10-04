// Payment methods and delivery countries the checkout form offers.
export default defineEventHandler(async () => ({
  methods: await getPaymentOptions(),
  countries: Object.entries(deliveryCountries).map(([code, name]) => ({ code, name })),
  codCountries: COD_COUNTRIES
}))
