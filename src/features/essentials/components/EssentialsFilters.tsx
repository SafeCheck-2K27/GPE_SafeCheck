import { Search, Sliders } from "lucide-react"
import { ScChip } from "@/components/safecheck/primitives"
import { ESSENTIAL_CATEGORY_LABELS } from "../categories"
import { ESSENTIAL_FILTER_OPTIONS } from "../data"
import type {
  EssentialFilterOption,
  EssentialSort,
} from "../types"

interface EssentialsFiltersProps {
  search: string
  priority: string
  os: string
  difficulty: string
  type: string
  category: string
  sortBy: EssentialSort
  onSearchChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onOsChange: (value: string) => void
  onDifficultyChange: (value: string) => void
  onTypeChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSortChange: (value: EssentialSort) => void
}

export function EssentialsFilters({
  search,
  priority,
  os,
  difficulty,
  type,
  category,
  sortBy,
  onSearchChange,
  onPriorityChange,
  onOsChange,
  onDifficultyChange,
  onTypeChange,
  onCategoryChange,
  onSortChange,
}: EssentialsFiltersProps) {
  return (
    <section className="border-b border-[color:var(--sc-border)] bg-[color:var(--sc-surface-2)]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[color:var(--sc-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              aria-label="Rechercher un essentiel"
              placeholder="Rechercher un essentiel…"
              className="sc-input w-full pl-9 pr-3 py-2.5 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[color:var(--sc-blue)]" />
            <span className="text-sm font-semibold text-[color:var(--sc-text)]">
              Trier par
            </span>
            <select
              value={sortBy}
              onChange={(event) =>
                onSortChange(event.target.value as EssentialSort)
              }
              className="sc-input px-3 py-2 text-sm"
            >
              <option value="priority">Priorité absolue</option>
              <option value="popularity">Popularité</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <FilterRow
            label="Priorité"
            value={priority}
            onChange={onPriorityChange}
            options={ESSENTIAL_FILTER_OPTIONS.priority}
          />
          <FilterRow
            label="OS"
            value={os}
            onChange={onOsChange}
            options={ESSENTIAL_FILTER_OPTIONS.os}
          />
          <FilterRow
            label="Difficulté"
            value={difficulty}
            onChange={onDifficultyChange}
            options={ESSENTIAL_FILTER_OPTIONS.difficulty}
          />
          <FilterRow
            label="Type"
            value={type}
            onChange={onTypeChange}
            options={ESSENTIAL_FILTER_OPTIONS.type}
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          {Object.entries(ESSENTIAL_CATEGORY_LABELS).map(([key, label]) => (
            <ScChip
              key={key}
              onClick={() => onCategoryChange(key)}
              active={category === key}
              className="px-3.5"
            >
              {label}
            </ScChip>
          ))}
        </div>
      </div>
    </section>
  )
}

function FilterRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: EssentialFilterOption[]
}) {
  return (
    <div>
      <span className="block text-xs font-semibold text-[color:var(--sc-text-muted)] mb-1.5 uppercase tracking-wider">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="sc-input w-full px-3 py-2 text-sm"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
