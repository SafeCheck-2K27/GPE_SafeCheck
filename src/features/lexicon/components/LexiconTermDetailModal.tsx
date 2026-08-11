import {
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  Lightbulb,
  Link2,
  Quote,
  X,
} from "lucide-react"
import { AccessibleModal } from "@/components/safecheck/layout/AccessibleModal"
import {
  ScBadge,
  ScLinkButton,
} from "@/components/safecheck/primitives"
import { getLexiconDomain } from "../categories"
import { NIVEAU_TONE, getTerm, type LexiqueTerm } from "../data"

export function LexiconTermDetailModal({
  term,
  onClose,
  onRelatedTerm,
}: {
  term: LexiqueTerm
  onClose: () => void
  onRelatedTerm: (slug: string) => void
}) {
  const domain = getLexiconDomain(term.domain)

  return (
    <AccessibleModal
      open
      onClose={onClose}
      zIndex={60}
      aria-label={`Définition de ${term.nom}`}
      className="items-stretch justify-end px-0 backdrop-blur-none sc-fade-in"
    >
      <div
        className="w-full max-w-md h-full bg-[color:var(--sc-surface)] overflow-y-auto shadow-[var(--sc-shadow-lg)] border-l border-[color:var(--sc-border)] sc-fade-in"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-[color:var(--sc-surface)]/95 backdrop-blur border-b border-[color:var(--sc-border)] px-6 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <ScBadge tone={NIVEAU_TONE[term.niveau]}>{term.niveau}</ScBadge>
              {domain && <ScBadge tone="muted">{domain.nom}</ScBadge>}
            </div>
            <h2 className="font-display text-xl font-bold text-[color:var(--sc-text)] leading-tight">
              {term.nom}
            </h2>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-[color:var(--sc-text-muted)]">
              {term.equivalentFr && term.equivalentFr !== term.nom && (
                <span>FR · {term.equivalentFr}</span>
              )}
              {term.equivalentEn && term.equivalentEn !== term.nom && (
                <span>EN · {term.equivalentEn}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-text)] hover:bg-[color:var(--sc-bg-soft)] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          <div>
            <SectionLabel icon={<BookOpen className="w-3.5 h-3.5" />}>
              Définition simple
            </SectionLabel>
            <p className="text-sm text-[color:var(--sc-text)] leading-relaxed font-medium">
              {term.definitionCourte}
            </p>
          </div>

          <div>
            <SectionLabel icon={<GraduationCap className="w-3.5 h-3.5" />}>
              En clair
            </SectionLabel>
            <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
              {term.explication}
            </p>
          </div>

          <div className="rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] p-4">
            <SectionLabel icon={<Quote className="w-3.5 h-3.5" />}>
              Exemple concret
            </SectionLabel>
            <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
              {term.exemple}
            </p>
          </div>

          <div className="rounded-xl border border-[color:var(--sc-blue)]/25 bg-[color:var(--sc-blue)]/8 p-4">
            <SectionLabel icon={<Lightbulb className="w-3.5 h-3.5" />}>
              Le saviez-vous ?
            </SectionLabel>
            <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
              {term.funFact}
            </p>
          </div>

          {term.motsLies.length > 0 && (
            <div>
              <SectionLabel icon={<Link2 className="w-3.5 h-3.5" />}>
                Mots liés
              </SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {term.motsLies.map((slug) => {
                  const relatedTerm = getTerm(slug)
                  if (!relatedTerm) return null
                  return (
                    <button
                      key={slug}
                      onClick={() => onRelatedTerm(slug)}
                      className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-2)] border border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)] transition-colors"
                    >
                      {relatedTerm.nom}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <SectionLabel icon={<GraduationCap className="w-3.5 h-3.5" />}>
              Tutoriels liés
            </SectionLabel>
            {term.tutoriels.length === 0 ? (
              <p className="text-sm text-[color:var(--sc-text-muted)] italic">
                Aucun tutoriel n'est encore associé à ce terme. De nouveaux
                contenus arrivent bientôt.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {term.tutoriels.map((tutorial) => (
                  <div
                    key={tutorial.id}
                    className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-3.5 flex items-start gap-3 hover:border-[color:var(--sc-blue)]/45 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[color:var(--sc-text)] leading-tight">
                        {tutorial.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5">
                        <ScBadge tone={NIVEAU_TONE[tutorial.difficulty]}>
                          {tutorial.difficulty}
                        </ScBadge>
                        <span className="inline-flex items-center gap-1 text-xs text-[color:var(--sc-text-muted)]">
                          <Clock className="w-3 h-3" /> {tutorial.duration}
                        </span>
                      </div>
                    </div>
                    <ScLinkButton
                      variant="ghost"
                      size="sm"
                      href={`/tutoriels/${tutorial.id}`}
                    >
                      Voir <ArrowRight className="w-3 h-3" />
                    </ScLinkButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AccessibleModal>
  )
}

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-1.5 mb-2 text-[color:var(--sc-blue)]">
      {icon}
      <span className="text-[11px] font-bold uppercase tracking-wider">
        {children}
      </span>
    </div>
  )
}
