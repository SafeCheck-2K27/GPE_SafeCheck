import type { LucideIcon } from "lucide-react"
import {
  Check,
  HelpCircle,
  Monitor,
  SlidersHorizontal,
  Smartphone,
} from "lucide-react"
import { TECH_LABELS } from "../data"
import type {
  PersonalizationIconName,
  PersonalizationOption,
} from "../types"

const OPTION_ICONS: Record<PersonalizationIconName, LucideIcon> = {
  monitor: Monitor,
  smartphone: Smartphone,
  sliders: SlidersHorizontal,
  help: HelpCircle,
}

export function MultiChip({
  options,
  selected,
  onToggle,
  maxSelect,
}: {
  options: PersonalizationOption[]
  selected: string[]
  onToggle: (value: string) => void
  maxSelect?: number
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value)
        const isDisabled =
          !isSelected &&
          maxSelect !== undefined &&
          selected.length >= maxSelect
        const Icon = option.icon ? OPTION_ICONS[option.icon] : null

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !isDisabled && onToggle(option.value)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer select-none ${isSelected ? "border-[color:var(--sc-blue)] bg-[color:var(--sc-blue)] text-[color:var(--sc-text-on-strong)] shadow-[0_4px_12px_-4px_rgb(var(--sc-blue-rgb)/0.45)]" : isDisabled ? "border-[color:var(--sc-border)] bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-muted)] opacity-50 cursor-not-allowed" : "border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/60 hover:bg-[color:var(--sc-bg-soft)] hover:text-[color:var(--sc-blue)]"}`}
            aria-pressed={isSelected}
          >
            {Icon && (
              <span className="shrink-0">
                <Icon className="w-4 h-4" />
              </span>
            )}
            {isSelected && (
              <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={3} />
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function SingleChip({
  options,
  selected,
  onSelect,
}: {
  options: PersonalizationOption[]
  selected: string | null
  onSelect: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer select-none ${isSelected ? "border-[color:var(--sc-blue)] bg-[color:var(--sc-blue)] text-[color:var(--sc-text-on-strong)] shadow-[0_4px_12px_-4px_rgb(var(--sc-blue-rgb)/0.45)]" : "border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/60 hover:bg-[color:var(--sc-bg-soft)] hover:text-[color:var(--sc-blue)]"}`}
            aria-pressed={isSelected}
          >
            {isSelected && (
              <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={3} />
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function TechSlider({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onChange(number)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border transition-all duration-200 cursor-pointer ${value === number ? "border-[color:var(--sc-blue)] bg-[color:var(--sc-blue)] shadow-[0_4px_12px_-4px_rgb(var(--sc-blue-rgb)/0.45)]" : "border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] hover:border-[color:var(--sc-blue)]/60 hover:bg-[color:var(--sc-bg-soft)]"}`}
            aria-pressed={value === number}
          >
            <span
              className={`text-lg font-extrabold leading-none transition-colors ${value === number ? "text-[color:var(--sc-text-on-strong)]" : "text-[color:var(--sc-blue)]"}`}
            >
              {number}
            </span>
            {value === number && (
              <Check className="w-3 h-3 text-[color:var(--sc-text-on-strong)]" strokeWidth={3} />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs text-[color:var(--sc-text-muted)]">
          Peu à l&apos;aise
        </span>
        <span className="text-xs text-[color:var(--sc-text-muted)]">
          Très à l&apos;aise
        </span>
      </div>

      {value > 0 && (
        <div className="text-center py-1.5 px-3 rounded-lg text-xs font-semibold bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] text-[color:var(--sc-blue)]">
          {value} - {TECH_LABELS[value]}
        </div>
      )}
    </div>
  )
}
