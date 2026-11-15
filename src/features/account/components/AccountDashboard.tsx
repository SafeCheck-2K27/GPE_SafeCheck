import Link from "next/link"
import { History, ShieldCheck } from "lucide-react"
import { AccountSectionCard } from "./AccountSectionCard"
import type { AccountAuditCountsDto } from "@/lib/contracts/audit"

export function AccountDashboard({ counts, error, loading, onRetry }: { counts: AccountAuditCountsDto | null; error: boolean; loading: boolean; onRetry: () => void }) {

  return (
    <AccountSectionCard icon={ShieldCheck} title="Mes audits" description="Retrouve tes audits et reprends ceux en cours.">
      {error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--sc-text-muted)]">
          <span>Les audits n’ont pas pu être chargés.</span>
          <button type="button" onClick={onRetry} className="font-semibold text-[color:var(--sc-blue)] hover:underline focus-visible:underline">Réessayer</button>
        </div>
      ) : loading ? (
        <p role="status" className="text-sm text-[color:var(--sc-text-muted)]">Chargement des audits…</p>
      ) : (
        <div className="space-y-4 text-sm text-[color:var(--sc-text)]">
          {counts?.total === 0 ? <p>Aucun audit pour le moment.</p> : (
            <div className="flex flex-wrap gap-5">
              <span><strong>{counts?.completed}</strong> terminés</span>
              <span><strong>{counts?.inProgress}</strong> en cours</span>
            </div>
          )}
          <Link href={counts?.total === 0 ? "/audit" : "/compte?tab=historique"} className="inline-flex items-center gap-1 font-semibold text-[color:var(--sc-blue)] hover:underline focus-visible:underline">
            <History className="w-4 h-4" /> {counts?.total === 0 ? "Commencer un audit" : "Voir l’historique"}
          </Link>
        </div>
      )}
    </AccountSectionCard>
  )
}
