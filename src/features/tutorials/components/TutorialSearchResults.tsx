import { Layers, Search } from "lucide-react"
import type { Tutoriel } from "@/lib/tutoriels-data"
import { POPULAR_IDS, SEARCH_SUGGESTIONS, mockTutoStatus } from "../data"
import { TutorialCard } from "./TutorialCards"

export function TutorialSearchResults({
  visible,
  query,
  results,
  hasActiveFilters,
  onOpenTutorial,
  onSearchChange,
  onReset,
}: {
  visible: boolean
  query: string
  results: Tutoriel[]
  hasActiveFilters: boolean
  onOpenTutorial: (tutorial: Tutoriel) => void
  onSearchChange: (query: string) => void
  onReset: () => void
}) {
  if (!visible) return null

  return (
    <section aria-label="Resultats de recherche">
      {results.length > 0 ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[color:var(--sc-blue)]/10 border border-[color:var(--sc-blue)]/20 text-[color:var(--sc-blue)]">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base md:text-lg text-[color:var(--sc-text)] font-display">
                  Resultats pour {'"'}{query.trim()}{'"'}
                </h2>
                <p className="text-xs text-[color:var(--sc-text-muted)]">
                  {results.length} tutoriel{results.length > 1 ? "s" : ""} pertinent
                  {results.length > 1 ? "s" : ""}
                  {hasActiveFilters ? " (filtres appliques)" : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="inline-flex items-center gap-1.5 self-start text-xs font-semibold px-3 py-1.5 rounded-lg border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/40 hover:text-[color:var(--sc-blue)] transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              Revenir a l&apos;exploration par categorie
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((tutorial) => (
              <TutorialCard
                key={tutorial.id}
                tuto={tutorial}
                onStart={() => onOpenTutorial(tutorial)}
                status={mockTutoStatus[tutorial.id] || "todo"}
                showPopularBadge={POPULAR_IDS.has(tutorial.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-8 md:p-10 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-2xl bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-text-muted)]">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-base md:text-lg text-[color:var(--sc-text)] font-display mb-1.5">
            Aucun tutoriel trouve pour {'"'}{query.trim()}{'"'}
          </h2>
          <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed max-w-md mx-auto mb-5">
            Essayez : mot de passe, phishing, Wi-Fi, sauvegarde, telephone.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6">
            {SEARCH_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSearchChange(suggestion)}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)] transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-[color:var(--sc-blue)] text-white hover:opacity-90 transition-opacity"
          >
            <Layers className="w-3.5 h-3.5" />
            Voir les categories principales
          </button>
        </div>
      )}
    </section>
  )
}
