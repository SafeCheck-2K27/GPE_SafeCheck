import { ShieldCheck } from "lucide-react"
import type { SafeCheckUser } from "@/components/safecheck/AuthProvider"
import { ScCard } from "@/components/safecheck/primitives"
import type { AccountAudit } from "../api"
import { calculateAuditCounters } from "../audit-summary"

export function AccountHero({ user, audits }: { user: SafeCheckUser; audits: AccountAudit[] | null }) {
  const total = audits === null ? "—" : calculateAuditCounters(audits).total
  return (
    <div className="rounded-2xl border border-[color:var(--sc-border)] sc-mesh-soft p-6 md:p-8 mb-6 flex items-center gap-5">
      <div className="w-20 h-20 shrink-0 rounded-full sc-avatar-gradient flex items-center justify-center text-[color:var(--sc-text-on-strong)] font-display text-3xl font-bold" aria-hidden="true">
        {user.pseudo.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-bold text-[color:var(--sc-text)] break-words">{user.pseudo}</h1>
        <p className="text-sm text-[color:var(--sc-text-muted)] break-all">{user.email}</p>
      </div>
      <ScCard className="flex min-w-20 flex-col items-center px-3 py-2 sm:min-w-24 sm:px-4 sm:py-3">
        <ShieldCheck className="w-5 h-5 text-[color:var(--sc-blue)] mb-1" />
        <span className="font-display font-bold text-xl text-[color:var(--sc-text)] tabular-nums">{total}</span>
        <span className="text-xs text-[color:var(--sc-text-muted)]">Audits</span>
      </ScCard>
    </div>
  )
}
