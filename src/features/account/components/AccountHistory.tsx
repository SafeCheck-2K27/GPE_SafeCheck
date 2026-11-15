import Link from "next/link"
import { CheckCircle2, History, PlayCircle, ShieldCheck } from "lucide-react"
import { ScBadge, ScCard } from "@/components/safecheck/primitives"
import type { AccountAudit } from "../api"
import { formatAnsweredCount, getAuditAccountAction } from "../audit-summary"
import { AccountSectionCard } from "./AccountSectionCard"

export function AccountHistory({
  audits,
  error,
  onRetry,
  hasMore,
  loadingMore,
  loadMoreError,
  onLoadMore,
}: {
  audits: AccountAudit[] | null
  error: boolean
  onRetry: () => void
  hasMore: boolean
  loadingMore: boolean
  loadMoreError: boolean
  onLoadMore: () => void
}) {
  return (
    <AccountSectionCard icon={History} title="Mes audits" description="Audits du plus récent au plus ancien.">
      {error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--sc-text)]">
          <span>Impossible de charger l’historique.</span>
          <button type="button" onClick={onRetry} className="font-semibold text-[color:var(--sc-blue)] hover:underline focus-visible:underline">Réessayer</button>
        </div>
      ) : audits === null ? (
        <p role="status" className="text-sm text-[color:var(--sc-text-muted)]">Chargement de l’historique…</p>
      ) : audits.length === 0 ? (
        <div className="flex flex-col gap-3 text-sm text-[color:var(--sc-text-2)]">
          <p>Aucun audit pour le moment.</p>
          <Link href="/audit" className="font-semibold text-[color:var(--sc-blue)] hover:underline focus-visible:underline">Commencer un audit</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map((audit) => <AuditRow key={audit.id} audit={audit} />)}
          {hasMore && (
            <div className="space-y-2">
              {loadMoreError && <p role="alert" className="text-center text-sm text-[color:var(--sc-text-muted)]">La suite de l’historique n’a pas pu être chargée.</p>}
              <button type="button" onClick={onLoadMore} disabled={loadingMore} className="w-full rounded-lg border border-[color:var(--sc-border)] px-4 py-3 text-sm font-semibold text-[color:var(--sc-blue)] hover:bg-[color:var(--sc-surface)] disabled:opacity-60">
                {loadingMore ? "Chargement…" : loadMoreError ? "Réessayer" : "Charger la suite"}
              </button>
            </div>
          )}
        </div>
      )}
    </AccountSectionCard>
  )
}

function AuditRow({ audit }: { audit: AccountAudit }) {
  const completed = audit.status === "completed"
  const action = getAuditAccountAction(audit)
  const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(audit.createdAt))
  const Icon = completed ? CheckCircle2 : PlayCircle

  return (
    <ScCard className="flex flex-wrap items-center justify-between gap-4 p-4">
      <div className="flex items-start gap-3 min-w-0">
        <ShieldCheck className="w-5 h-5 shrink-0 text-[color:var(--sc-blue)] mt-0.5" aria-hidden="true" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm text-[color:var(--sc-text)]">Audit de qualification rapide</p>
            <ScBadge tone={completed ? "success" : "info"}>
              <Icon className="w-3 h-3 mr-1" />{completed ? "Terminé" : "En cours"}
            </ScBadge>
          </div>
          <p className="text-xs text-[color:var(--sc-text-muted)] mt-1">
            Créé le {date}
            {!completed && ` · ${formatAnsweredCount(audit.answeredCount)}`}
          </p>
        </div>
      </div>
      <Link href={action.href} className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold bg-[color:var(--sc-blue)] text-[color:var(--sc-text-on-strong)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sc-blue)] focus-visible:ring-offset-2">
        {action.label}
      </Link>
    </ScCard>
  )
}
