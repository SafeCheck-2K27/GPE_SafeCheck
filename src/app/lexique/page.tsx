"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import { ScButton, ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
import { AccessibleModal } from "@/components/safecheck/layout/AccessibleModal"
import { PageSuspenseFallback } from "@/components/safecheck/layout/PageSuspenseFallback"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import {
  Search,
  X,
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Lightbulb,
  Quote,
  Link2,
  Clock,
  Hash,
  ShieldCheck,
  Globe,
  Network,
  Bug,
  Database,
  Cpu,
  KeyRound,
  Lock,
} from "lucide-react"
import {
  DOMAINS,
  TERMS,
  getTerm,
  getTermsByDomain,
  countTermsByDomain,
  searchTerms,
  NIVEAU_TONE,
  type DomainId,
  type LexiqueTerm,
} from "@/lib/lexique-data"

/* Icône par domaine */
const DOMAIN_ICON: Record<DomainId, React.ComponentType<{ className?: string }>> = {
  cybersecurite: ShieldCheck,
  comptes: KeyRound,
  donnees: Lock,
  web: Globe,
  reseau: Network,
  logiciels: Bug,
  hardware: Cpu,
  "data-ia": Database,
}

function LexiqueContent() {
  const router = useRouter()
  const params = useSearchParams()

  const initialDomain = (params.get("domaine") as DomainId) || null
  const initialTermSlug = params.get("terme")

  const [search, setSearch] = useState("")
  const [activeDomain, setActiveDomain] = useState<DomainId | null>(initialDomain)
  const [selected, setSelected] = useState<LexiqueTerm | null>(
    initialTermSlug ? getTerm(initialTermSlug) ?? null : null,
  )

  const isSearching = search.trim().length > 0
  const searchResults = useMemo(() => (isSearching ? searchTerms(search) : []), [search, isSearching])

  const domainTerms = useMemo(
    () => (activeDomain ? getTermsByDomain(activeDomain) : []),
    [activeDomain],
  )

  const activeDomainMeta = DOMAINS.find((d) => d.id === activeDomain)

  return (
    <PageShell>
      <Navbar onSignupClick={() => router.push("/compte/creer")} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[color:var(--sc-border)] sc-mesh-soft">
          <div className="pointer-events-none absolute inset-0 sc-dot-texture opacity-50" aria-hidden />
          <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
            <ScBadge tone="info" className="mb-4">
              <BookOpen className="w-3 h-3" /> Base de connaissance
            </ScBadge>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-[color:var(--sc-text)] mb-4 text-balance leading-[1.08]">
              Lexique <span className="sc-gradient-text">SafeCheck</span>
            </h1>
            <p className="text-base text-[color:var(--sc-text-2)] leading-relaxed max-w-2xl mx-auto text-pretty">
              Comprenez les mots techniques de la cybersécurité, sans jargon inutile. Chaque terme est
              expliqué simplement, avec un exemple concret et les tutoriels SafeCheck pour passer à l'action.
            </p>
            <div className="mt-6 flex items-center justify-center">
              <ScButton variant="ghost" size="sm" onClick={() => router.push("/tutoriels")}>
                <GraduationCap className="w-4 h-4" /> Explorer les tutoriels liés
              </ScButton>
            </div>

            {/* Barre de recherche globale */}
            <div className="relative max-w-xl mx-auto mt-8">
              <Search className="w-4 h-4 text-[color:var(--sc-text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un terme : phishing, 2FA, VPN, cookie…"
                aria-label="Rechercher un terme dans le lexique"
                className="sc-input w-full pl-11 pr-10 py-3 text-sm shadow-[var(--sc-shadow-sm)]"
              />
              {isSearching && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-text)] hover:bg-[color:var(--sc-bg-soft)] transition-colors"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {!isSearching && (
              <p className="text-xs text-[color:var(--sc-text-muted)] mt-3">
                {TERMS.length} termes · {DOMAINS.length} domaines
              </p>
            )}
          </div>
        </section>

        {/* Résultats de recherche */}
        {isSearching ? (
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
              <NoResult query={search} onReset={() => setSearch("")} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResults.map((t, i) => (
                  <TermCard key={t.slug} term={t} delay={i * 40} onClick={() => setSelected(t)} />
                ))}
              </div>
            )}
          </section>
        ) : activeDomain ? (
          /* Termes d'un domaine sélectionné */
          <section className="max-w-6xl mx-auto px-4 py-10">
            <button
              onClick={() => setActiveDomain(null)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--sc-blue)] hover:underline mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Tous les domaines
            </button>

            <div className="mb-7">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)]">
                  {(() => {
                    const Icon = DOMAIN_ICON[activeDomain]
                    return <Icon className="w-5 h-5" />
                  })()}
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-[color:var(--sc-text)]">
                    {activeDomainMeta?.nom}
                  </h2>
                  <p className="text-sm text-[color:var(--sc-text-2)]">{activeDomainMeta?.description}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {domainTerms.map((t, i) => (
                <TermCard key={t.slug} term={t} delay={i * 40} onClick={() => setSelected(t)} />
              ))}
            </div>
          </section>
        ) : (
          /* Navigation par domaines (état initial) */
          <section className="max-w-6xl mx-auto px-4 py-10">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-[color:var(--sc-blue)]" />
              <h2 className="font-display text-xl font-bold text-[color:var(--sc-text)]">
                Choisissez un domaine pour commencer
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {DOMAINS.map((d, i) => (
                <DomainCard
                  key={d.id}
                  domainId={d.id}
                  delay={i * 40}
                  onSelect={() => setActiveDomain(d.id)}
                  onTermClick={(slug) => {
                    const term = getTerm(slug)
                    if (term) setSelected(term)
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {selected && (
        <TermDetailPanel
          term={selected}
          onClose={() => setSelected(null)}
          onRelatedTerm={(slug) => {
            const term = getTerm(slug)
            if (term) setSelected(term)
          }}
          onTutoriel={(id) => router.push(`/tutoriels/${id}`)}
        />
      )}
    </PageShell>
  )
}

export default function LexiquePage() {
  return (
    <Suspense fallback={<PageSuspenseFallback />}>
      <LexiqueContent />
    </Suspense>
  )
}

/* Carte domaine */
function DomainCard({
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
  const d = DOMAINS.find((x) => x.id === domainId)!
  const Icon = DOMAIN_ICON[domainId]
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
      <h3 className="font-bold text-base text-[color:var(--sc-text)]">{d.nom}</h3>
      <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed flex-1">{d.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {d.populaires.map((slug) => {
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

/* Carte terme */
function TermCard({ term, delay, onClick }: { term: LexiqueTerm; delay: number; onClick: () => void }) {
  const hasTutos = term.tutoriels.length > 0
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl p-5 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] flex flex-col gap-3 sc-fade-in transition-all hover:-translate-y-1 hover:shadow-[var(--sc-shadow-md)] hover:border-[color:var(--sc-blue)]/45"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <ScBadge tone={NIVEAU_TONE[term.niveau]}>{term.niveau}</ScBadge>
        {hasTutos && (
          <ScBadge tone="info">
            <GraduationCap className="w-3 h-3" /> {term.tutoriels.length} tuto{term.tutoriels.length > 1 ? "s" : ""}
          </ScBadge>
        )}
      </div>
      <div>
        <h3 className="font-bold text-base text-[color:var(--sc-text)] leading-tight">{term.nom}</h3>
        {term.equivalentFr && term.equivalentFr !== term.nom && (
          <p className="text-xs text-[color:var(--sc-text-muted)] mt-0.5">{term.equivalentFr}</p>
        )}
      </div>
      <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed flex-1">{term.definitionCourte}</p>
      <span className="inline-flex items-center gap-1 text-xs text-[color:var(--sc-blue)] font-semibold pt-2 border-t border-[color:var(--sc-border)]">
        Voir la fiche <ArrowRight className="w-3 h-3" />
      </span>
    </button>
  )
}

/* Aucun résultat */
function NoResult({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-text-muted)] mb-4">
        <Search className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-lg text-[color:var(--sc-text)] mb-1">Aucun résultat pour « {query} »</h3>
      <p className="text-sm text-[color:var(--sc-text-2)] max-w-md mx-auto mb-5">
        Vérifiez l'orthographe ou essayez un terme plus général comme « mot de passe », « réseau » ou
        « phishing ».
      </p>
      <ScButton variant="secondary" size="sm" onClick={onReset}>
        Réinitialiser la recherche
      </ScButton>
    </div>
  )
}

/* Panneau de détail d'un terme */
function TermDetailPanel({
  term,
  onClose,
  onRelatedTerm,
  onTutoriel,
}: {
  term: LexiqueTerm
  onClose: () => void
  onRelatedTerm: (slug: string) => void
  onTutoriel: (id: number) => void
}) {
  const domainMeta = DOMAINS.find((d) => d.id === term.domain)
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
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête sticky */}
        <div className="sticky top-0 z-10 bg-[color:var(--sc-surface)]/95 backdrop-blur border-b border-[color:var(--sc-border)] px-6 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <ScBadge tone={NIVEAU_TONE[term.niveau]}>{term.niveau}</ScBadge>
              {domainMeta && <ScBadge tone="muted">{domainMeta.nom}</ScBadge>}
            </div>
            <h2 className="font-display text-xl font-bold text-[color:var(--sc-text)] leading-tight">{term.nom}</h2>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-[color:var(--sc-text-muted)]">
              {term.equivalentFr && term.equivalentFr !== term.nom && <span>FR · {term.equivalentFr}</span>}
              {term.equivalentEn && term.equivalentEn !== term.nom && <span>EN · {term.equivalentEn}</span>}
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
          {/* Définition simple */}
          <div>
            <SectionLabel icon={<BookOpen className="w-3.5 h-3.5" />}>Définition simple</SectionLabel>
            <p className="text-sm text-[color:var(--sc-text)] leading-relaxed font-medium">
              {term.definitionCourte}
            </p>
          </div>

          {/* Explication */}
          <div>
            <SectionLabel icon={<GraduationCap className="w-3.5 h-3.5" />}>En clair</SectionLabel>
            <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">{term.explication}</p>
          </div>

          {/* Exemple concret */}
          <div className="rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] p-4">
            <SectionLabel icon={<Quote className="w-3.5 h-3.5" />}>Exemple concret</SectionLabel>
            <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">{term.exemple}</p>
          </div>

          {/* Fun fact */}
          <div className="rounded-xl border border-[color:var(--sc-blue)]/25 bg-[color:var(--sc-blue)]/8 p-4">
            <SectionLabel icon={<Lightbulb className="w-3.5 h-3.5" />}>Le saviez-vous ?</SectionLabel>
            <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">{term.funFact}</p>
          </div>

          {/* Mots liés */}
          {term.motsLies.length > 0 && (
            <div>
              <SectionLabel icon={<Link2 className="w-3.5 h-3.5" />}>Mots liés</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {term.motsLies.map((slug) => {
                  const t = getTerm(slug)
                  if (!t) return null
                  return (
                    <button
                      key={slug}
                      onClick={() => onRelatedTerm(slug)}
                      className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-2)] border border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)] transition-colors"
                    >
                      {t.nom}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tutoriels liés */}
          <div>
            <SectionLabel icon={<GraduationCap className="w-3.5 h-3.5" />}>Tutoriels liés</SectionLabel>
            {term.tutoriels.length === 0 ? (
              <p className="text-sm text-[color:var(--sc-text-muted)] italic">
                Aucun tutoriel n'est encore associé à ce terme. De nouveaux contenus arrivent bientôt.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {term.tutoriels.map((tuto) => (
                  <div
                    key={tuto.id}
                    className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-3.5 flex items-start gap-3 hover:border-[color:var(--sc-blue)]/45 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[color:var(--sc-text)] leading-tight">
                        {tuto.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5">
                        <ScBadge tone={NIVEAU_TONE[tuto.difficulty]}>{tuto.difficulty}</ScBadge>
                        <span className="inline-flex items-center gap-1 text-xs text-[color:var(--sc-text-muted)]">
                          <Clock className="w-3 h-3" /> {tuto.duration}
                        </span>
                      </div>
                    </div>
                    <ScButton variant="ghost" size="sm" onClick={() => onTutoriel(tuto.id)}>
                      Voir <ArrowRight className="w-3 h-3" />
                    </ScButton>
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

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 text-[color:var(--sc-blue)]">
      {icon}
      <span className="text-[11px] font-bold uppercase tracking-wider">{children}</span>
    </div>
  )
}
