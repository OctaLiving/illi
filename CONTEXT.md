# Context

The domain language for **illi** — an invitation-only, additive-free food
subscription store with USDT-only checkout (planned). Use these terms exactly
in code and conversation. Architecture terms (module, seam, depth, locality)
follow the deepening skill's vocabulary.

## Domain glossary

- **Catalog** — the set of products that may be included in a subscription. The
  runtime source of truth is the JSON store at `.data/catalog.json`, served by
  `GET /api/catalog` and read through the `useCatalog()` composable. It is
  **seeded** from `app/data/catalog.ts`, which is itself **generated** from the
  CSV exports in `/data` by `scripts/import-catalog.mjs` (`pnpm import:catalog`).
  So: CSV → generated seed module → JSON store (live, editable). Operators edit
  the store via the `/manage` dashboard (`server/api` product/plan CRUD).
- **Product** (`CatalogProduct`) — a catalog item: name, subtitle, description,
  category, ingredients, imagery, storage, shelf life, a macro `nutrition`
  split, availability, and the **slot type** it is eligible to fill.
- **Category** (`ProductCategory`) — one of the 7 real categories (Fermented
  Beverages, Cheeses & Dairy, Fermented Vegetables, Spreads & Nut Butters, Jams &
  Fruit Products, Fish & Seafood, Sauces & Condiments). Groups the collection.
- **Slot type** (`BundleSlotType`) — a category slug: `beverages`, `dairy`,
  `vegetables`, `spreads`, `jams`, `seafood`, `sauces`. **Slot type = category** —
  a product fills slots of its own category.
- **Plan** (`SubscriptionPlan`) — a base subscription. Defines cadence, a price
  anchor (in USDT), and the **slots** it includes.
- **Slot** (`BundleSlotRule`) — a fillable position in a plan, with a slot type,
  required/optional flag, and min/max quantity.
- **Eligibility** — whether a product may fill a slot: it must be available and
  its slot types must include the slot's type. The single predicate is
  `isProductEligibleForSlot` in `app/utils/catalog.ts`.
- **Bundle** — a customer's chosen products filling a plan's slots
  (`BundleSelectionInput`).
- **Subscription summary** (`SubscriptionBundleSummary`) — the live, UI-shaped
  view of a bundle: per-slot completion, required-slot counts, and a
  `isReadyForCheckout` signal.
- **Checkout handoff payload** (`CheckoutHandoffPayload`) — the durable,
  checkout-facing projection of the summary. Kept deliberately separate from the
  summary (summary = UI shape, payload = the contract a future checkout
  consumes).
- **Product–plan fit** (`ProductPlanFit`) — for one product, the plans it fits
  and the slots it can fill within each. Powers the catalog views.

## Where the rules live

- **Catalog eligibility** — `app/utils/catalog.ts`. Owns "may this product fill
  this slot" and the product/plan fit derivations.
- **Bundle rules** — `app/utils/bundle.ts`. The deep module owning how a bundle
  is created, changed (`toggleProductInSlot`), validated, summarised, and handed
  off to checkout. Pure functions; this interface is the test surface
  (`test/bundle.spec.ts`).
- **Subscription builder** — `app/composables/useSubscriptionBuilder.ts`. A thin
  reactive wrapper over the bundle rules. It holds state and delegates every
  rule; it derives no rule of its own (e.g. `remainingRequiredSlots` is a
  projection of the bundle summary, not a separate computation).

## Decisions

See `.omni/DECISIONS.md`. Notably: no catalog data-source abstraction until
invitation-gated visibility is built (one adapter is not yet a real seam).
