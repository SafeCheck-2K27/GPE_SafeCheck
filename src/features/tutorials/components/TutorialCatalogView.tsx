"use client"

import { useMemo, useState } from "react"
import { tutoriels } from "../data/catalog"
import type { Category, Niveau, Tutoriel } from "../data/catalog"
import { mockTutoStatus, RECOMMENDED_IDS } from "../data"
import {
  DEFAULT_TUTORIAL_FILTERS,
  hasActiveTutorialFilters,
  matchesTutorialFilters,
} from "../filters"
import { normalizeSearch, searchTutorials } from "../search"
import { sortTutorials } from "../sorting"
import type {
  DurationFilter,
  SortOption,
  StatusFilter,
  TutorialFilters,
  TypeFilter,
} from "../types"
import { TutorialCatalogToolbar } from "./TutorialCatalogToolbar"
import { TutorialFeaturedSections } from "./TutorialFeaturedSections"
import { TutorialLibrarySection } from "./TutorialLibrarySection"
import { TutorialSearchResults } from "./TutorialSearchResults"

export function TutorialCatalogView({
  catFilter,
  setCatFilter,
  levelFilter,
  setLevelFilter,
  openTuto,
}: {
  catFilter: "all" | Category
  setCatFilter: (category: "all" | Category) => void
  levelFilter: "all" | Niveau
  setLevelFilter: (level: "all" | Niveau) => void
  openTuto: (tutorial: Tutoriel) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [durationFilter, setDurationFilter] =
    useState<DurationFilter>("all")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("recommended")

  const filters = useMemo<TutorialFilters>(
    () => ({
      catFilter,
      levelFilter,
      statusFilter,
      durationFilter,
      typeFilter,
    }),
    [
      catFilter,
      durationFilter,
      levelFilter,
      statusFilter,
      typeFilter,
    ],
  )

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

  const applyFilters = (nextFilters: TutorialFilters) => {
    setCatFilter(nextFilters.catFilter)
    setLevelFilter(nextFilters.levelFilter)
    setStatusFilter(nextFilters.statusFilter)
    setDurationFilter(nextFilters.durationFilter)
    setTypeFilter(nextFilters.typeFilter)
  }

  const resetFilters = () => applyFilters(DEFAULT_TUTORIAL_FILTERS)
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
        onFiltersChange={applyFilters}
        onSortChange={setSortBy}
      />

      <TutorialSearchResults
        visible={isSearching}
        query={searchQuery}
        results={searchResults}
        hasActiveFilters={hasActiveFilters}
        onOpenTutorial={openTuto}
        onSearchChange={setSearchQuery}
        onReset={resetSearchAndFilters}
      />

      <TutorialFeaturedSections
        visible={!isSearching && !hasActiveFilters}
        recommendedTutorials={recommendedTutorials}
        inProgressTutorials={inProgressTutorials}
        onOpenTutorial={openTuto}
      />

      <TutorialLibrarySection
        visible={!isSearching}
        tutorials={catalogTutorials}
        hasActiveFilters={hasActiveFilters}
        onOpenTutorial={openTuto}
        onResetFilters={resetFilters}
      />
    </>
  )
}
