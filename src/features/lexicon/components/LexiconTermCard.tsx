import { ArrowRight, GraduationCap } from "lucide-react"
import { ScBadge } from "@/components/safecheck/primitives"
import { NIVEAU_TONE, type LexiqueTerm } from "../data"

export function LexiconTermCard({
  term,
  delay,
  onClick,
}: {
  term: LexiqueTerm
  delay: number
  onClick: () => void
}) {
  const hasTutorials = term.tutoriels.length > 0

  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl p-5 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] flex flex-col gap-3 sc-fade-in transition-all hover:-translate-y-1 hover:shadow-[var(--sc-shadow-md)] hover:border-[color:var(--sc-blue)]/45"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <ScBadge tone={NIVEAU_TONE[term.niveau]}>{term.niveau}</ScBadge>
        {hasTutorials && (
          <ScBadge tone="info">
            <GraduationCap className="w-3 h-3" /> {term.tutoriels.length} tuto
            {term.tutoriels.length > 1 ? "s" : ""}
          </ScBadge>
        )}
      </div>
      <div>
        <h3 className="font-bold text-base text-[color:var(--sc-text)] leading-tight">
          {term.nom}
        </h3>
        {term.equivalentFr && term.equivalentFr !== term.nom && (
          <p className="text-xs text-[color:var(--sc-text-muted)] mt-0.5">
            {term.equivalentFr}
          </p>
        )}
      </div>
      <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed flex-1">
        {term.definitionCourte}
      </p>
      <span className="inline-flex items-center gap-1 text-xs text-[color:var(--sc-blue)] font-semibold pt-2 border-t border-[color:var(--sc-border)]">
        Voir la fiche <ArrowRight className="w-3 h-3" />
      </span>
    </button>
  )
}
