import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Globe,
  Key,
  Save,
  Settings,
  Smartphone,
  Terminal,
  Wifi,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Niveau, Tutoriel } from "../data/catalog"
import { mockTutoStatus, POPULAR_IDS } from "../data"
import { parseDuration } from "../sorting"
import type {
  LibraryCategoryDefinition,
  LibraryCategoryIcon,
} from "../types"
import { TutorialRow } from "./TutorialCards"

const LIBRARY_CATEGORY_ICONS: Record<LibraryCategoryIcon, LucideIcon> = {
  key: Key,
  alert: AlertTriangle,
  eye: Eye,
  wifi: Wifi,
  settings: Settings,
  smartphone: Smartphone,
  save: Save,
  globe: Globe,
  terminal: Terminal,
}

export function TutorialLibraryCategory({
  category,
  tutorials,
  open,
  forcedOpen,
  onToggle,
  onOpenTutorial,
}: {
  category: LibraryCategoryDefinition
  tutorials: Tutoriel[]
  open: boolean
  forcedOpen: boolean
  onToggle: () => void
  onOpenTutorial: (tutorial: Tutoriel) => void
}) {
  const Icon = LIBRARY_CATEGORY_ICONS[category.icon]
  const levelsPresent = (
    ["Debutant", "Intermediaire", "Avance"] as Niveau[]
  ).filter((level) => tutorials.some((tutorial) => tutorial.level === level))
  const durations = tutorials
    .map((tutorial) => parseDuration(tutorial.duration))
    .filter((duration): duration is number => duration !== null)
  const minimumDuration = Math.min(...durations)
  const maximumDuration = Math.max(...durations)
  const durationLabel =
    durations.length === 0
      ? "Duree indisponible"
      : minimumDuration === maximumDuration
        ? `${minimumDuration} min`
        : `${minimumDuration}-${maximumDuration} min`
  const doneCount = tutorials.filter(
    (tutorial) => (mockTutoStatus[tutorial.id] || "todo") === "done",
  ).length

  return (
    <div
      className={`rounded-xl border bg-[color:var(--sc-surface)] overflow-hidden transition-all ${open ? "border-[color:var(--sc-blue)]/40 shadow-[var(--sc-shadow-sm)]" : "border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/30"}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        disabled={forcedOpen}
        className="w-full flex items-center gap-3 sm:gap-4 p-4 text-left transition-colors hover:bg-[color:var(--sc-bg-soft)] disabled:cursor-default disabled:hover:bg-transparent"
      >
        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-[color:var(--sc-blue)]/10 text-[color:var(--sc-blue)]">
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm md:text-base text-[color:var(--sc-text)] font-display">
              {category.label}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)] text-[color:var(--sc-text-2)]">
              {tutorials.length} tuto{tutorials.length > 1 ? "s" : ""}
            </span>
            {doneCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--sc-success)]/10 text-[color:var(--sc-success)]">
                <Check className="w-2.5 h-2.5" />
                {doneCount} fait{doneCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed line-clamp-1 sm:line-clamp-none mt-0.5">
            {category.description}
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] text-[color:var(--sc-text-muted)] font-medium">
              <Clock className="w-3 h-3" /> {durationLabel}
            </span>
            {levelsPresent.map((level) => (
              <span
                key={level}
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-[color:var(--sc-text-on-strong)]"
                style={{
                  background:
                    level === "Debutant"
                      ? "var(--sc-success)"
                      : level === "Intermediaire"
                        ? "var(--sc-warn)"
                        : "var(--sc-violet-soft)",
                }}
              >
                {level}
              </span>
            ))}
          </div>
        </div>

        {!forcedOpen && (
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-[color:var(--sc-text-muted)]">
            {open ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        )}
      </button>

      {open && (
        <div className="px-3 sm:px-4 pb-4 pt-1 flex flex-col gap-2.5 border-t border-[color:var(--sc-border)]">
          {tutorials.map((tutorial) => (
            <TutorialRow
              key={tutorial.id}
              tuto={tutorial}
              onStart={() => onOpenTutorial(tutorial)}
              status={mockTutoStatus[tutorial.id] || "todo"}
              showPopularBadge={POPULAR_IDS.has(tutorial.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
