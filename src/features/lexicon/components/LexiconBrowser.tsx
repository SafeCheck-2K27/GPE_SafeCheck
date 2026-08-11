import { ArrowLeft, Sparkles } from "lucide-react"
import { LEXICON_DOMAIN_ICONS, getLexiconDomain } from "../categories"
import { DOMAINS, getTerm, type DomainId, type LexiqueTerm } from "../data"
import { LexiconDomainCard } from "./LexiconDomainCard"
import { LexiconNoResults } from "./LexiconNoResults"
import { LexiconTermCard } from "./LexiconTermCard"

export function LexiconBrowser({
  search,
  searchResults,
  activeDomain,
  domainTerms,
  onSearchReset,
  onSelectDomain,
  onSelectTerm,
}: {
  search: string
  searchResults: LexiqueTerm[]
  activeDomain: DomainId | null
  domainTerms: LexiqueTerm[]
  onSearchReset: () => void
  onSelectDomain: (domain: DomainId | null) => void
  onSelectTerm: (term: LexiqueTerm) => void
}) {
  const isSearching = search.trim().length > 0

  if (isSearching) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-[color:var(--sc-text)]">
            Recherche : <span className="sc-gradient-text">{search}</span>
          </h2>
          <span className="text-sm text-[color:var(--sc-text-muted)]">
            {searchResults.length} résultat{searchResults.length > 1 ? "s" : ""}
          </span>
        </div>

        {searchResults.length === 0 ? (
          <LexiconNoResults query={search} onReset={onSearchReset} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {searchResults.map((term, index) => (
              <LexiconTermCard
                key={term.slug}
                term={term}
                delay={index * 40}
                onClick={() => onSelectTerm(term)}
              />
            ))}
          </div>
        )}
      </section>
    )
  }

  if (activeDomain) {
    const domain = getLexiconDomain(activeDomain)
    const Icon = LEXICON_DOMAIN_ICONS[activeDomain]

    return (
      <section className="max-w-6xl mx-auto px-4 py-10">
        <button
          onClick={() => onSelectDomain(null)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--sc-blue)] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Tous les domaines
        </button>

        <div className="mb-7">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)]">
              <Icon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold text-[color:var(--sc-text)]">
                {domain?.nom}
              </h2>
              <p className="text-sm text-[color:var(--sc-text-2)]">
                {domain?.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {domainTerms.map((term, index) => (
            <LexiconTermCard
              key={term.slug}
              term={term}
              delay={index * 40}
              onClick={() => onSelectTerm(term)}
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-4 h-4 text-[color:var(--sc-blue)]" />
        <h2 className="font-display text-xl font-bold text-[color:var(--sc-text)]">
          Choisissez un domaine pour commencer
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {DOMAINS.map((domain, index) => (
          <LexiconDomainCard
            key={domain.id}
            domainId={domain.id}
            delay={index * 40}
            onSelect={() => onSelectDomain(domain.id)}
            onTermClick={(slug) => {
              const term = getTerm(slug)
              if (term) onSelectTerm(term)
            }}
          />
        ))}
      </div>
    </section>
  )
}
