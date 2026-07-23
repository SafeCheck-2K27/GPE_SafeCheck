"use client"

import { useMemo, useState } from "react"
import type { MouseEvent } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Filter as FilterIcon,
} from "lucide-react"
import { ScBadge, ScChip } from "@/components/safecheck/primitives"
import { HABIT_TAGS, HABITUDES, STATUS_LABELS } from "../data"
import { filterHabits } from "../filters"
import type {
  Habit,
  HabitLevel,
  HabitTag,
  RecommendationStatus,
} from "../types"
import { getNextRecommendationStatus } from "../utils"
import { HabitDetail } from "./HabitDetail"
import { RecommendationIcon } from "./RecommendationIcon"

export function HabitsView({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<Habit | null>(null)
  const [levelFilter, setLevelFilter] = useState<"all" | HabitLevel>("all")
  const [tagFilter, setTagFilter] = useState<"all" | HabitTag>("all")
  const [statuses, setStatuses] = useState<Record<string, RecommendationStatus>>({})

  const filtered = useMemo(
    () => filterHabits(HABITUDES, { level: levelFilter, tag: tagFilter }),
    [levelFilter, tagFilter],
  )

  const cycleStatus = (id: string, e: MouseEvent) => {
    e.stopPropagation()
    const current = statuses[id] ?? "todo"
    setStatuses((currentStatuses) => ({
      ...currentStatuses,
      [id]: getNextRecommendationStatus(current),
    }))
  }

  return (
    <>
      <section className="bg-[color:var(--sc-bg-soft)] border-b border-[color:var(--sc-border)]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm mb-4">
            <button
              onClick={onBack}
              className="text-[color:var(--sc-blue)] hover:underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Recommandations
            </button>
            <span className="text-[color:var(--sc-text-muted)]" aria-hidden="true">/</span>
            <span className="text-[color:var(--sc-text-2)] font-semibold">Bonnes habitudes</span>
          </nav>

          <h1 className="text-2xl md:text-4xl font-extrabold text-[color:var(--sc-text)] mb-2 text-balance">
            Les réflexes qui changent tout, sans jargon.
          </h1>
          <p className="text-sm md:text-base text-[color:var(--sc-text)] max-w-3xl">
            {`${HABITUDES.length} réflexes structurés par niveau et par thème. Intégrés au quotidien, ils suppriment une grande partie des risques sans rien avoir à installer.`}
          </p>

          {/* Filters */}
          <div className="space-y-3 mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[color:var(--sc-text-2)] uppercase tracking-wider mr-1 inline-flex items-center gap-1">
                <FilterIcon className="w-3 h-3" /> Niveau
              </span>
              {(["all", "Débutant", "Intermédiaire", "Avancé"] as const).map((lvl) => (
                <ScChip
                  size="xs"
                  key={lvl}
                  active={levelFilter === lvl}
                  onClick={() => setLevelFilter(lvl as "all" | HabitLevel)}
                >
                  {lvl === "all" ? "Tous niveaux" : lvl}
                </ScChip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[color:var(--sc-text-2)] uppercase tracking-wider mr-1 inline-flex items-center gap-1">
                <FilterIcon className="w-3 h-3" /> Thème
              </span>
              {HABIT_TAGS.map((tag) => (
                <ScChip size="xs" key={tag.key} active={tagFilter === tag.key} onClick={() => setTagFilter(tag.key)}>
                  {tag.label}
                </ScChip>
              ))}
            </div>
          </div>

          <p className="text-xs text-[color:var(--sc-text-muted)] mt-4">
            {filtered.length} habitude{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((h, i) => {
          const status = statuses[h.id] ?? "todo"
          const { label: statusLabel, color: statusColor } = STATUS_LABELS[status]
          return (
            <article
              key={h.id}
              className="relative rounded-xl p-5 bg-[color:var(--sc-surface)] flex flex-col gap-3 sc-fade-in transition-all hover:-translate-y-1 focus-within:-translate-y-1 focus-within:ring-2 focus-within:ring-[color:var(--sc-blue)]/45 focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--sc-bg)]"
              style={{
                animationDelay: `${i * 40}ms`,
                border: "1px solid var(--sc-border)",
                boxShadow: "var(--sc-shadow)",
              }}
            >
              <button
                type="button"
                onClick={() => setSelected(h)}
                className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none"
                aria-label={`En savoir plus sur ${h.title}`}
              />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-10 h-10 rounded-lg bg-[color:var(--sc-bg-soft)] flex items-center justify-center shrink-0">
                    <RecommendationIcon icon={h.icon} className="w-5 h-5 text-[color:var(--sc-blue)]" />
                  </div>
                  <ScBadge
                    tone={h.level === "Débutant" ? "success" : h.level === "Intermédiaire" ? "info" : "premium"}
                  >
                    {h.level}
                  </ScBadge>
                  <ScBadge tone="muted">{h.tag}</ScBadge>
                </div>
                <button
                  type="button"
                  onClick={(e) => cycleStatus(h.id, e)}
                  className={`relative z-20 shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${statusColor}`}
                  title="Changer le statut"
                  aria-label={`Changer le statut de ${h.title}. Statut actuel : ${statusLabel}`}
                >
                  {statusLabel}
                </button>
              </div>
              <h3 className="font-bold text-base text-[color:var(--sc-text)]">{h.title}</h3>
              <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">{h.pitch}</p>
              <div className="flex items-center gap-3 text-xs text-[color:var(--sc-text-muted)] mt-1">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {h.timeEstimate}
                </span>
              </div>
              <span className="text-xs text-[color:var(--sc-blue)] font-semibold mt-auto inline-flex items-center gap-1">
                En savoir plus <ArrowRight className="w-3 h-3" />
              </span>
            </article>
          )
        })}
      </section>

      {selected && (
        <HabitDetail
          h={selected}
          onClose={() => setSelected(null)}
          status={statuses[selected.id] ?? "todo"}
          onStatusChange={(s) => setStatuses((prev) => ({ ...prev, [selected.id]: s }))}
        />
      )}
    </>
  )
}
