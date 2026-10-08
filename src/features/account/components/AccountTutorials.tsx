import Link from "next/link"
import { BookOpen, CheckCircle2, PlayCircle } from "lucide-react"
import { ScBadge, ScButton, ScCard } from "@/components/safecheck/primitives"
import { CATEGORY_LABEL } from "@/features/tutorials/data/catalog"
import { calculateTutorialCounters, type AccountTutorial } from "../tutorial-summary"
import { AccountSectionCard } from "./AccountSectionCard"

const percentFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 })

export function AccountTutorials({ items, error, saveError = false, onRetry }: {
  items: AccountTutorial[] | null
  error: boolean
  saveError?: boolean
  onRetry: () => void
}) {
  const counters = items === null ? null : calculateTutorialCounters(items)
  return (
    <AccountSectionCard icon={BookOpen} title="Mes tutoriels" description="Tes tutoriels commencés, du plus récemment actif au plus ancien.">
      {error || saveError ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--sc-text)]">
          <span>{saveError
            ? "La sauvegarde de ta progression a échoué. Elle reste disponible pour réessayer avant de charger tes tutoriels."
            : "Impossible de charger tes tutoriels."}</span>
          <ScButton variant="secondary" size="sm" onClick={onRetry}>Réessayer</ScButton>
        </div>
      ) : items === null ? (
        <p role="status" className="text-sm text-[color:var(--sc-text-muted)]">Chargement des tutoriels…</p>
      ) : items.length === 0 ? (
        <div className="space-y-3 text-sm text-[color:var(--sc-text-2)]">
          <p>Aucun tutoriel commencé pour le moment.</p>
          <Link href="/tutoriels" className="font-semibold text-[color:var(--sc-blue)] hover:underline focus-visible:underline">Voir les tutoriels</Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-5 text-sm text-[color:var(--sc-text)]">
            <span>Tutoriels en cours : <strong>{counters?.inProgress}</strong></span>
            <span>Tutoriels terminés : <strong>{counters?.completed}</strong></span>
          </div>
          <ul className="space-y-3" aria-label="Tutoriels commencés">
            {items.map((item) => <li key={item.tutorialId}><TutorialRow item={item} /></li>)}
          </ul>
        </div>
      )}
    </AccountSectionCard>
  )
}

function TutorialRow({ item }: { item: AccountTutorial }) {
  const completed = item.status === "COMPLETED"
  const Icon = completed ? CheckCircle2 : PlayCircle
  return (
    <ScCard className="flex flex-wrap items-center justify-between gap-4 p-4">
      <div className="min-w-0 flex-1 basis-56">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-sm text-[color:var(--sc-text)]">{item.title}</p>
          <ScBadge tone={completed ? "success" : "info"}>
            <Icon className="w-3 h-3 mr-1" aria-hidden="true" />{completed ? "Terminé" : "En cours"}
          </ScBadge>
        </div>
        <p className="text-xs text-[color:var(--sc-text-muted)] mt-1">{CATEGORY_LABEL[item.category]} · {item.level} · {item.duration}</p>
        <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-[color:var(--sc-text-2)]">
          <span>{item.completedSteps.length} / {item.totalSteps} étapes validées</span>
          <span className="font-semibold tabular-nums">{percentFormat.format(item.percentage)} %</span>
        </div>
        <div role="progressbar" aria-label={`Progression de ${item.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.percentage}
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--sc-bg-soft)]">
          <div className="h-full rounded-full bg-[color:var(--sc-blue)]" style={{ width: `${item.percentage}%` }} />
        </div>
      </div>
      <Link href={item.action.href} aria-label={`${item.action.label} le tutoriel : ${item.title}`}
        className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold bg-[color:var(--sc-blue)] text-[color:var(--sc-text-on-strong)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sc-blue)] focus-visible:ring-offset-2">
        {item.action.label}
      </Link>
    </ScCard>
  )
}
