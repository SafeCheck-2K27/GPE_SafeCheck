import { ArrowRight, Hash } from "lucide-react"
import { ScBadge } from "@/components/safecheck/primitives"
import { LEXICON_DOMAIN_ICONS, getLexiconDomain } from "../categories"
import {
  countTermsByDomain,
  getTerm,
  type DomainId,
} from "../data"

export function LexiconDomainCard({
  domainId,
  delay,
  onSelect,
  onTermClick,
}: {
  domainId: DomainId
  delay: number
  onSelect: () => void
  onTermClick: (slug: string) => void
}) {
  const domain = getLexiconDomain(domainId)!
  const Icon = LEXICON_DOMAIN_ICONS[domainId]
  const count = countTermsByDomain(domainId)

  return (
    <div
      className="rounded-xl p-5 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] flex flex-col gap-3 sc-fade-in transition-all hover:-translate-y-1 hover:shadow-[var(--sc-shadow-md)] hover:border-[color:var(--sc-blue)]/45"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)]">
          <Icon className="w-5 h-5" />
        </span>
        <ScBadge tone="muted">
          <Hash className="w-3 h-3" /> {count} terme{count > 1 ? "s" : ""}
        </ScBadge>
      </div>
      <h3 className="font-bold text-base text-[color:var(--sc-text)]">
        {domain.nom}
      </h3>
      <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed flex-1">
        {domain.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {domain.populaires.map((slug) => {
          const term = getTerm(slug)
          if (!term) return null
          return (
            <button
              key={slug}
              onClick={() => onTermClick(slug)}
              className="text-[11.5px] px-2.5 py-1 rounded-full font-semibold bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-text-2)] border border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)] transition-colors"
            >
              {term.nom}
            </button>
          )
        })}
      </div>

      <button
        onClick={onSelect}
        className="inline-flex items-center justify-center gap-1.5 mt-1 text-sm font-semibold text-[color:var(--sc-blue)] hover:text-[color:var(--sc-blue-hover)] transition-colors"
      >
        Explorer le domaine <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
