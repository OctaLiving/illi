// Shared presentation vocabulary for the operator console (/manage/*).
// These are referenced across several console pages — keeping them in one
// module means a styling or status-mapping change lands in a single place.

// Form field + label styling, reused by the catalog, plans, and settings forms.
export const field = 'w-full rounded-sm border border-sand-600/30 bg-sand-50/50 px-3 py-2 text-sm text-stone-900 transition focus:border-olive-600 focus:outline-none focus:ring-1 focus:ring-olive-600/30'
export const labelText = 'mb-1 block font-[family:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-500'

// Status → badge classes. Indigo = healthy/settled, terra = needs attention,
// stone = inert/terminal. Shared by subscriptions and orders.
export const statusBadge: Record<string, string> = {
  active: 'bg-olive-600/10 text-olive-700',
  paid: 'bg-olive-600/10 text-olive-700',
  pending: 'bg-saffron-600/10 text-saffron-700',
  cod_pending: 'bg-saffron-600/10 text-saffron-700',
  past_due: 'bg-saffron-600/10 text-saffron-700',
  paused: 'bg-stone-400/15 text-stone-500',
  canceled: 'bg-stone-400/15 text-stone-500',
  failed: 'bg-stone-400/15 text-stone-500',
  expired: 'bg-stone-400/15 text-stone-500'
}

export const invitationBadge: Record<string, string> = {
  redeemed: 'bg-olive-600/10 text-olive-700',
  pending: 'bg-saffron-600/10 text-saffron-700',
  expired: 'bg-stone-400/15 text-stone-500',
  revoked: 'bg-stone-400/15 text-stone-500'
}

// ISO timestamp → YYYY-MM-DD for compact table cells.
export function fmtDate(iso: string) {
  return new Date(iso).toISOString().slice(0, 10)
}

// Best-effort extraction of a human message from a failed $fetch.
export function errMessage(err: unknown) {
  const e = err as { data?: { statusMessage?: string, message?: string }, statusMessage?: string }
  return e?.data?.statusMessage ?? e?.data?.message ?? e?.statusMessage ?? 'Something went wrong.'
}
