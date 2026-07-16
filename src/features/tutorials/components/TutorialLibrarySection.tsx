"use client"

import { useState } from "react"
import { BookOpen, Layers } from "lucide-react"
import type { Tutoriel } from "../data/catalog"
import { LIBRARY_CATEGORIES, mockTutoStatus, POPULAR_IDS } from "../data"
import { matchesLibraryCategory } from "../filters"
import { TutorialCard } from "./TutorialCards"
import { TutorialLibraryCategory } from "./TutorialLibraryCategory"

export function TutorialLibrarySection({
  visible,
  tutorials,
  hasActiveFilters,
  onOpenTutorial,
  onResetFilters,
}: {
  visible: boolean
  tutorials: Tutoriel[]
  hasActiveFilters: boolean
  onOpenTutorial: (tutorial: Tutoriel) => void
  onResetFilters: () => void
}) {
  const [libraryView, setLibraryView] = useState<"organized" | "full">(
    "organized",
  )
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set([LIBRARY_CATEGORIES[0].id]),
  )

  if (!visible) return null

  const toggleCategory = (id: string) => {
    setOpenCategories((previousCategories) => {
      const nextCategories = new Set(previousCategories)
      if (nextCategories.has(id)) nextCategories.delete(id)
      else nextCategories.add(id)
      return nextCategories
    })
  }

  return (
    <section aria-label="Explorer la bibliotheque">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)] text-[color:var(--sc-text-muted)]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base md:text-lg text-[color:var(--sc-text)] font-display">
              {hasActiveFilters
                ? "Resultats filtres"
                : libraryView === "organized"
                  ? "Explorer par categorie"
                  : "Toute la bibliotheque"}
            </h2>
            <p className="text-xs text-[color:var(--sc-text-muted)]">
              {tutorials.length} tutoriel{tutorials.length > 1 ? "s" : ""} disponible
              {tutorials.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center rounded-lg border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-0.5 self-start">
          <button
            type="button"
            onClick={() => setLibraryView("organized")}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${libraryView === "organized" ? "bg-[color:var(--sc-blue)] text-white shadow-sm" : "text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)]"}`}
            aria-pressed={libraryView === "organized"}
          >
            <Layers className="w-3.5 h-3.5" />
            Vue organisee
          </button>
          <button
            type="button"
            onClick={() => setLibraryView("full")}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${libraryView === "full" ? "bg-[color:var(--sc-blue)] text-white shadow-sm" : "text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)]"}`}
            aria-pressed={libraryView === "full"}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Vue complete
          </button>
        </div>
      </div>

      {tutorials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--sc-border)] p-10 text-center">
          <p className="text-sm text-[color:var(--sc-text-muted)] mb-3">
            Aucun tutoriel ne correspond a tes filtres pour le moment.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-semibold text-[color:var(--sc-blue)] hover:underline"
          >
            Reinitialiser les filtres
          </button>
        </div>
      ) : libraryView === "organized" ? (
        <div className="flex flex-col gap-3">
          {LIBRARY_CATEGORIES.map((category) => {
            const categoryTutorials = tutorials.filter((tutorial) =>
              matchesLibraryCategory(tutorial, category),
            )
            if (categoryTutorials.length === 0) return null

            const isOpen =
              hasActiveFilters || openCategories.has(category.id)

            return (
              <TutorialLibraryCategory
                key={category.id}
                category={category}
                tutorials={categoryTutorials}
                open={isOpen}
                forcedOpen={hasActiveFilters}
                onToggle={() => toggleCategory(category.id)}
                onOpenTutorial={onOpenTutorial}
              />
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tutorials.map((tutorial) => (
            <TutorialCard
              key={tutorial.id}
              tuto={tutorial}
              onStart={() => onOpenTutorial(tutorial)}
              status={mockTutoStatus[tutorial.id] || "todo"}
              showPopularBadge={POPULAR_IDS.has(tutorial.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
