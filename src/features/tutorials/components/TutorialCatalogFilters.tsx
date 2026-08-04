"use client"

import { useState } from "react"
import { CATEGORY_LABEL } from "@/lib/tutoriels-data"
import type { Category, Niveau } from "@/lib/tutoriels-data"
import {
  ChevronDown,
  ChevronUp,
  Filter as FilterIcon,
  SortAsc,
} from "lucide-react"
import {
  DEFAULT_TUTORIAL_FILTERS,
  hasActiveTutorialFilters,
} from "../filters"
import type {
  DurationFilter,
  SortOption,
  StatusFilter,
  TutorialFilters,
  TypeFilter,
} from "../types"
import { TutorialViewChip } from "./TutorialViewChip"

const CATEGORIES: Array<"all" | Category> = [
  "all",
  "comptes",
  "motsdepasse",
  "phishing",
  "donnees",
  "sauvegardes",
  "reseau",
  "navigateur",
  "mobile",
  "os",
]

export function TutorialCatalogFilters({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
}: {
  filters: TutorialFilters
  sortBy: SortOption
  onFiltersChange: (filters: TutorialFilters) => void
  onSortChange: (sort: SortOption) => void
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const hasActiveFilters = hasActiveTutorialFilters(filters)
  const updateFilter = <Key extends keyof TutorialFilters>(
    key: Key,
    value: TutorialFilters[Key],
  ) => onFiltersChange({ ...filters, [key]: value })

  return (
    <div className="pt-3 border-t border-[color:var(--sc-border)]">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)] transition-colors"
        >
          <FilterIcon className="w-3.5 h-3.5" />
          Filtres &amp; tri
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[color:var(--sc-blue)] text-white text-[9px] font-bold">
              !
            </span>
          )}
          {filtersOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <SortAsc className="w-3.5 h-3.5 text-[color:var(--sc-text-muted)]" />
          <select
            value={sortBy}
            onChange={(event) =>
              onSortChange(event.target.value as SortOption)
            }
            className="text-xs font-medium text-[color:var(--sc-text-2)] bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[color:var(--sc-blue)]/60 cursor-pointer"
          >
            <option value="recommended">Recommandes d&apos;abord</option>
            <option value="fastest">Les plus rapides</option>
            <option value="popular">Les plus populaires</option>
            <option value="level_asc">Niveau croissant</option>
            <option value="newest">Derniers ajoutes</option>
          </select>
        </div>
      </div>

      {filtersOpen && (
        <div className="space-y-3 pb-1">
          <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wider inline-flex items-center gap-1">
                Niveau
              </span>
              {(["all", "Debutant", "Intermediaire", "Avance"] as const).map(
                (level) => (
                  <TutorialViewChip
                    key={level}
                    size="xs"
                    active={filters.levelFilter === level}
                    onClick={() =>
                      updateFilter(
                        "levelFilter",
                        level as "all" | Niveau,
                      )
                    }
                  >
                    {level === "all" ? "Tous" : level}
                  </TutorialViewChip>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wider inline-flex items-center gap-1">
              Categorie
            </span>
            {CATEGORIES.map((category) => (
              <TutorialViewChip
                key={category}
                size="xs"
                active={filters.catFilter === category}
                onClick={() => updateFilter("catFilter", category)}
              >
                {category === "all" ? "Toutes" : CATEGORY_LABEL[category]}
              </TutorialViewChip>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <span className="block text-[11px] font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wider mb-1.5">
                Statut
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "todo", "inprogress", "done"] as StatusFilter[]).map(
                  (status) => (
                    <TutorialViewChip
                      key={status}
                      size="xs"
                      active={filters.statusFilter === status}
                      onClick={() => updateFilter("statusFilter", status)}
                    >
                      {status === "all"
                        ? "Tous"
                        : status === "todo"
                          ? "A faire"
                          : status === "inprogress"
                            ? "En cours"
                            : "Termine"}
                    </TutorialViewChip>
                  ),
                )}
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wider mb-1.5">
                Duree
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "quick", "medium", "long"] as DurationFilter[]).map(
                  (duration) => (
                    <TutorialViewChip
                      key={duration}
                      size="xs"
                      active={filters.durationFilter === duration}
                      onClick={() => updateFilter("durationFilter", duration)}
                    >
                      {duration === "all"
                        ? "Toutes"
                        : duration === "quick"
                          ? "Rapide"
                          : duration === "medium"
                            ? "10-20 min"
                            : "20 min+"}
                    </TutorialViewChip>
                  ),
                )}
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wider mb-1.5">
                Type
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    "all",
                    "essentiel",
                    "recommande",
                    "populaire",
                    "technique",
                  ] as TypeFilter[]
                ).map((type) => (
                  <TutorialViewChip
                    key={type}
                    size="xs"
                    active={filters.typeFilter === type}
                    onClick={() => updateFilter("typeFilter", type)}
                  >
                    {type === "all"
                      ? "Tous"
                      : type === "essentiel"
                        ? "Essentiel"
                        : type === "recommande"
                          ? "Recommande"
                          : type === "populaire"
                            ? "Populaire"
                            : "Technique"}
                  </TutorialViewChip>
                ))}
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => onFiltersChange(DEFAULT_TUTORIAL_FILTERS)}
              className="text-xs text-[color:var(--sc-danger)] hover:underline font-medium"
            >
              Reinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  )
}
