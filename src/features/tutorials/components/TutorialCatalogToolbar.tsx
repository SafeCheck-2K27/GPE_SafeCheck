"use client"

import { useRouter } from "next/navigation"
import {
  BookOpen,
  Flame,
  GraduationCap,
  Search,
  Sparkles,
  X,
  Zap,
} from "lucide-react"
import { ScBadge, ScChip } from "@/components/safecheck/primitives"
import { tutoriels } from "../data/catalog"
import { SEARCH_SUGGESTIONS } from "../data"
import { normalizeSearch } from "../search"
import type { SortOption, TutorialFilters } from "../types"
import { TutorialCatalogFilters } from "./TutorialCatalogFilters"

export function TutorialCatalogToolbar({
  searchQuery,
  filters,
  sortBy,
  onSearchChange,
  onFiltersChange,
  onSortChange,
}: {
  searchQuery: string
  filters: TutorialFilters
  sortBy: SortOption
  onSearchChange: (query: string) => void
  onFiltersChange: (filters: TutorialFilters) => void
  onSortChange: (sort: SortOption) => void
}) {
  const router = useRouter()

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-md)] mb-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(at 0% 0%, rgb(var(--sc-blue-rgb)/0.12), transparent 50%), radial-gradient(at 100% 50%, rgb(var(--sc-indigo-rgb)/0.10), transparent 50%)",
        }}
        aria-hidden
      />
      <div className="relative p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <ScBadge tone="info">
            <BookOpen className="w-3.5 h-3.5" />
            Bibliotheque complete
          </ScBadge>
          <span className="text-xs text-[color:var(--sc-text-muted)]">
            {tutoriels.length} tutoriels disponibles
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--sc-text)] font-display mb-2 text-balance">
          Tous les tutoriels
        </h1>
        <p className="text-sm md:text-base text-[color:var(--sc-text-2)] leading-relaxed max-w-3xl text-pretty mb-5">
          Du plus accessible au plus technique. Commence par ce qui est recommande, reprends la ou tu en etais, puis explore toute la bibliotheque.
        </p>

        <div className="mb-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--sc-text-muted)]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              aria-label="Rechercher un tutoriel"
              placeholder="Rechercher un tutoriel : mot de passe, phishing, Wi-Fi, telephone..."
              className="w-full rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] py-3.5 pl-12 pr-11 text-sm md:text-base text-[color:var(--sc-text)] placeholder:text-[color:var(--sc-text-muted)] shadow-[var(--sc-shadow-sm)] focus:outline-none focus:border-[color:var(--sc-blue)]/60 focus:ring-2 focus:ring-[color:var(--sc-blue)]/15 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Effacer la recherche"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full text-[color:var(--sc-text-muted)] hover:bg-[color:var(--sc-bg-soft)] hover:text-[color:var(--sc-text)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {!normalizeSearch(searchQuery) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[color:var(--sc-text-muted)]">
                Suggestions :
              </span>
              {SEARCH_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onSearchChange(suggestion)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)] transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <ScChip onClick={() => router.push("/tutoriels")}>
            <Sparkles className="w-3.5 h-3.5" /> Mes tutoriels
          </ScChip>
          <ScChip active>
            <BookOpen className="w-3.5 h-3.5" /> Tous
          </ScChip>
          <ScChip
            onClick={() => router.push("/tutoriels?niveau=debutant")}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Debutant
          </ScChip>
          <ScChip
            onClick={() => router.push("/tutoriels?niveau=intermediaire")}
          >
            <Flame className="w-3.5 h-3.5" /> Intermediaire
          </ScChip>
          <ScChip
            onClick={() => router.push("/tutoriels?niveau=avance")}
          >
            <Zap className="w-3.5 h-3.5" /> Avance
          </ScChip>
        </div>

        <TutorialCatalogFilters
          filters={filters}
          sortBy={sortBy}
          onFiltersChange={onFiltersChange}
          onSortChange={onSortChange}
        />
      </div>
    </div>
  )
}
