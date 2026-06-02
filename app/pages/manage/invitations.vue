<script setup lang="ts">
import { invitationBadge, fmtDate } from '~/utils/manage'

definePageMeta({ layout: 'manage', middleware: 'operator' })

interface InvitationRow {
  id: string
  code: string
  email: string | null
  status: string
  expiresAt: string | null
  createdAt: string
}
const { data: invitations, refresh: refreshInvitations } = await useFetch<InvitationRow[]>('/api/invitations', {
  key: 'invitations',
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  default: () => []
})
const pendingInviteCount = computed(() => invitations.value.filter(i => i.status === 'pending').length)

const inviteEmail = ref('')
const inviteExpiry = ref<number | null>(null)
const issuing = ref(false)
const inviteError = ref('')

async function issueInvite() {
  issuing.value = true
  inviteError.value = ''
  try {
    await $fetch('/api/invitations', {
      method: 'POST',
      body: { email: inviteEmail.value.trim() || undefined, expiresInDays: inviteExpiry.value || undefined }
    })
    inviteEmail.value = ''
    inviteExpiry.value = null
    await refreshInvitations()
  } catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    inviteError.value = e?.data?.statusMessage ?? 'Could not issue invitation.'
  } finally {
    issuing.value = false
  }
}

async function revokeInvite(id: string) {
  if (!window.confirm('Delete this invitation?')) {
    return
  }
  await $fetch(`/api/invitations/${id}`, { method: 'DELETE' })
  await refreshInvitations()
}

useSeoMeta({ title: 'Invitations · illi ops', robots: 'noindex, nofollow' })
</script>

<template>
  <section>
    <div class="flex flex-wrap items-end justify-between gap-3 border-b border-amber-600/20 pb-4">
      <div>
        <p class="font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.24em] text-terra-600">
          {{ pendingInviteCount }} pending · invitation-only access
        </p>
        <h1 class="mt-1 font-[family:var(--font-serif)] text-3xl text-stone-900">
          Invitations
        </h1>
      </div>
    </div>

    <!-- Issue form -->
    <form
      class="mt-6 flex flex-wrap items-end gap-3 rounded-md border border-amber-600/25 bg-amber-50/50 p-4"
      @submit.prevent="issueInvite"
    >
      <div class="flex-1 basis-56">
        <label class="mb-1 block font-[family:var(--font-mono)] text-[0.56rem] uppercase tracking-[0.14em] text-stone-500">Email (optional — locks the code to one address)</label>
        <input
          v-model="inviteEmail"
          type="email"
          placeholder="guest@example.com"
          class="w-full rounded-sm border border-amber-600/30 bg-[#f4ecdd] px-3 py-2 text-sm text-stone-900 focus:border-indigo-600 focus:outline-none"
        >
      </div>
      <div class="w-28">
        <label class="mb-1 block font-[family:var(--font-mono)] text-[0.56rem] uppercase tracking-[0.14em] text-stone-500">Expires (days)</label>
        <input
          v-model.number="inviteExpiry"
          type="number"
          min="1"
          placeholder="∞"
          class="w-full rounded-sm border border-amber-600/30 bg-[#f4ecdd] px-3 py-2 text-sm text-stone-900 focus:border-indigo-600 focus:outline-none"
        >
      </div>
      <button
        type="submit"
        class="inline-flex items-center gap-2 rounded-sm bg-indigo-600 px-4 py-2.5 font-[family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-amber-50 transition hover:bg-indigo-700 disabled:opacity-50"
        :disabled="issuing"
      >
        <UIcon
          name="i-lucide-plus"
          class="size-3.5"
        />
        {{ issuing ? 'Issuing…' : 'Issue invitation' }}
      </button>
      <p
        v-if="inviteError"
        class="w-full font-[family:var(--font-mono)] text-[0.62rem] text-terra-700"
      >
        {{ inviteError }}
      </p>
    </form>

    <div class="mt-4 overflow-x-auto rounded-md border border-amber-600/25 bg-[#f4ecdd]">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr class="border-b border-amber-600/25 font-[family:var(--font-mono)] text-[0.56rem] uppercase tracking-[0.14em] text-stone-500">
            <th class="px-5 py-3 font-medium">
              Code
            </th>
            <th class="px-5 py-3 font-medium">
              Email
            </th>
            <th class="px-5 py-3 font-medium">
              Issued
            </th>
            <th class="px-5 py-3 font-medium">
              Status
            </th>
            <th class="px-5 py-3 text-right font-medium">
              Manage
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="invitations.length === 0">
            <td
              colspan="5"
              class="px-5 py-8 text-center font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.14em] text-stone-400"
            >
              No invitations yet — issue one above.
            </td>
          </tr>
          <tr
            v-for="invite in invitations"
            :key="invite.id"
            class="border-b border-amber-600/10 last:border-0"
          >
            <td class="px-5 py-3 font-[family:var(--font-mono)] text-sm text-stone-900">
              {{ invite.code }}
            </td>
            <td class="px-5 py-3 text-sm text-stone-600">
              {{ invite.email || '—' }}
            </td>
            <td class="px-5 py-3 font-[family:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.1em] text-stone-500">
              {{ fmtDate(invite.createdAt) }}
            </td>
            <td class="px-5 py-3">
              <span
                class="rounded-sm px-2 py-0.5 font-[family:var(--font-mono)] text-[0.56rem] uppercase tracking-[0.1em]"
                :class="invitationBadge[invite.status]"
              >
                {{ invite.status }}
              </span>
            </td>
            <td class="px-5 py-3 text-right">
              <button
                v-if="invite.status !== 'redeemed'"
                type="button"
                class="rounded-sm p-1.5 text-stone-500 transition hover:bg-terra-600/10 hover:text-terra-700"
                title="Delete"
                @click="revokeInvite(invite.id)"
              >
                <UIcon
                  name="i-lucide-trash-2"
                  class="size-4"
                />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
