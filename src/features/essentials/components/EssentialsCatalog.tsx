"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ESSENTIALS } from "../data"
import { ESSENTIAL_CATEGORY_LABELS } from "../categories"
import { filterEssentials } from "../filters"
import type { Essential, EssentialSort } from "../types"
import { EssentialCard } from "./EssentialCard"
import { EssentialDetailModal } from "./EssentialDetailModal"
import { EssentialsFilters } from "./EssentialsFilters"

export function EssentialsCatalog() {
  const params = useSearchParams()
  const queryParam = params.get("q") ?? ""
  const categoryParam = params.get("cat") ?? "all"
  const normalizedCategory = Object.hasOwn(ESSENTIAL_CATEGORY_LABELS, categoryParam)
    ? categoryParam
    : "all"
  return (
    <EssentialsCatalogView
      key={JSON.stringify([queryParam, normalizedCategory])}
      initialSearch={queryParam}
      initialCategory={normalizedCategory}
    />
  )
}

function EssentialsCatalogView({
  initialSearch,
  initialCategory,
}: {
  initialSearch: string
  initialCategory: string
}) {
  const [search, setSearch] = useState(initialSearch)
  const [priority, setPriority] = useState("all")
  const [os, setOs] = useState("all")
  const [difficulty, setDifficulty] = useState("all")
  const [type, setType] = useState("all")
  const [sortBy, setSortBy] = useState<EssentialSort>("priority")
  const [category, setCategory] = useState(initialCategory)
  const [selected, setSelected] = useState<Essential | null>(null)

  const filteredEssentials = useMemo(
    () =>
      filterEssentials(ESSENTIALS, {
        search,
        priority,
        os,
        difficulty,
        type,
        category,
        sortBy,
      }),
    [search, priority, os, difficulty, type, category, sortBy],
  )

  return (
    <>
      <EssentialsFilters
        search={search}
        priority={priority}
        os={os}
        difficulty={difficulty}
        type={type}
        category={category}
        sortBy={sortBy}
        onSearchChange={setSearch}
        onPriorityChange={setPriority}
        onOsChange={setOs}
        onDifficultyChange={setDifficulty}
        onTypeChange={setType}
        onCategoryChange={setCategory}
        onSortChange={setSortBy}
      />

      <section className="max-w-6xl mx-auto px-4 py-10">
        {filteredEssentials.length === 0 ? (
          <div className="text-center py-16 text-[color:var(--sc-text-muted)]">
            <p className="text-sm">
              Aucun essentiel ne correspond à vos critères.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEssentials.map((essential, index) => (
              <EssentialCard
                key={essential.id}
                essential={essential}
                delay={index * 40}
                onClick={() => setSelected(essential)}
              />
            ))}
          </div>
        )}
      </section>

      {selected && (
        <EssentialDetailModal
          essential={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
