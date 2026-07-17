"use client"

import { useMemo, useState } from "react"
import { tutoriels } from "../data/catalog"
import type { Tutoriel } from "../data/catalog"
import { mockTutoStatus, RECOMMENDED_IDS } from "../data"
import {
  DEFAULT_TUTORIAL_FILTERS,
  hasActiveTutorialFilters,
  matchesTutorialFilters,
} from "../filters"
import { normalizeSearch, searchTutorials } from "../search"
import { sortTutorials } from "../sorting"
import type {
  SortOption,
  TutorialFilters,
} from "../types"
import { TutorialCatalogToolbar } from "./TutorialCatalogToolbar"
import { TutorialFeaturedSections } from "./TutorialFeaturedSections"
import { TutorialLibrarySection } from "./TutorialLibrarySection"
import { TutorialSearchResults } from "./TutorialSearchResults"

export function TutorialCatalogView({
  openTuto,
}: {
  openTuto: (tutorial: Tutoriel) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<TutorialFilters>(() => ({
    ...DEFAULT_TUTORIAL_FILTERS,
  }))
  const [sortBy, setSortBy] = useState<SortOption>("recommended")

  const isSearching = normalizeSearch(searchQuery).length > 0
  const hasActiveFilters = hasActiveTutorialFilters(filters)
  const recommendedTutorials = RECOMMENDED_IDS.map((id) =>
    tutoriels.find((tutorial) => tutorial.id === id),
  ).filter((tutorial): tutorial is Tutoriel => Boolean(tutorial))
  const inProgressTutorials = useMemo(
    () =>
      tutoriels.filter(
        (tutorial) => mockTutoStatus[tutorial.id] === "inprogress",
      ),
    [],
  )
  const catalogTutorials = useMemo(
    () =>
      sortTutorials(
        tutoriels.filter((tutorial) =>
          matchesTutorialFilters(tutorial, filters),
        ),
        sortBy,
      ),
    [filters, sortBy],
  )
  const searchResults = useMemo(
    () =>
      isSearching
        ? searchTutorials(tutoriels, searchQuery, filters)
        : [],
    [filters, isSearching, searchQuery],
  )

  const resetFilters = () => setFilters({ ...DEFAULT_TUTORIAL_FILTERS })
  const resetSearchAndFilters = () => {
    setSearchQuery("")
    resetFilters()
  }

  return (
    <>
      <TutorialCatalogToolbar
        searchQuery={searchQuery}
        filters={filters}
        sortBy={sortBy}
        onSearchChange={setSearchQuery}
        onFiltersChange={setFilters}
        onSortChange={setSortBy}
      />

      {isSearching && (
        <TutorialSearchResults
          query={searchQuery}
          results={searchResults}
          hasActiveFilters={hasActiveFilters}
          onOpenTutorial={openTuto}
          onSearchChange={setSearchQuery}
          onReset={resetSearchAndFilters}
        />
      )}

      {!isSearching && !hasActiveFilters && (
        <TutorialFeaturedSections
          recommendedTutorials={recommendedTutorials}
          inProgressTutorials={inProgressTutorials}
          onOpenTutorial={openTuto}
        />
      )}

      <div hidden={isSearching}>
        <TutorialLibrarySection
          tutorials={catalogTutorials}
          hasActiveFilters={hasActiveFilters}
          onOpenTutorial={openTuto}
          onResetFilters={resetFilters}
        />
      </div>
    </>
  )
}
