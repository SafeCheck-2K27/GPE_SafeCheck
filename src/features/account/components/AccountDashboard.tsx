import Link from "next/link"
import { History, ShieldCheck } from "lucide-react"
import { AccountSectionCard } from "./AccountSectionCard"
import type { AccountAudit } from "../api"
import { calculateAuditCounters } from "../audit-summary"

export function AccountDashboard({ audits, error, onRetry }: { audits: AccountAudit[] | null; error: boolean; onRetry: () => void }) {
  const counters = audits === null ? null : calculateAuditCounters(audits)

  return (
    <AccountSectionCard icon={ShieldCheck} title="Mes audits" description="Retrouve tes audits et reprends ceux en cours.">
      {error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--sc-text-muted)]">
          <span>Les audits n’ont pas pu être chargés.</span>
          <button type="button" onClick={onRetry} className="font-semibold text-[color:var(--sc-blue)] hover:underline focus-visible:underline">Réessayer</button>
        </div>
      ) : audits === null ? (
        <p role="status" className="text-sm text-[color:var(--sc-text-muted)]">Chargement des audits…</p>
      ) : (
        <div className="space-y-4 text-sm text-[color:var(--sc-text)]">
          {counters?.total === 0 ? <p>Aucun audit pour le moment.</p> : (
            <div className="flex flex-wrap gap-5">
              <span><strong>{counters?.completed}</strong> terminés</span>
              <span><strong>{counters?.inProgress}</strong> en cours</span>
            </div>
          )}
          <Link href={counters?.total === 0 ? "/audit" : "/compte?tab=historique"} className="inline-flex items-center gap-1 font-semibold text-[color:var(--sc-blue)] hover:underline focus-visible:underline">
            <History className="w-4 h-4" /> {counters?.total === 0 ? "Commencer un audit" : "Voir l’historique"}
          </Link>
        </div>
      )}
    </AccountSectionCard>
  )
}
