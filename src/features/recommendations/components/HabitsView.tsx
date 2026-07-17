"use client"

import { useMemo, useState } from "react"
import type { MouseEvent } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Filter as FilterIcon,
} from "lucide-react"
import { ScBadge } from "@/components/safecheck/primitives"
import { HABIT_TAGS, HABITUDES, STATUS_LABELS } from "../data"
import { filterHabits } from "../filters"
import type {
  Habit,
  HabitLevel,
  HabitTag,
  RecommendationStatus,
} from "../types"
import { getNextRecommendationStatus } from "../utils"
import { FilterChip } from "./FilterChip"
import { HabitDetail } from "./HabitDetail"

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
      <section className="bg-[#C3E8FF] border-b border-[#B3DBEF]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm mb-4">
            <button
              onClick={onBack}
              className="text-[#157FE2] hover:underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Recommandations
            </button>
            <span className="text-[#000]/40" aria-hidden="true">/</span>
            <span className="text-[#000]/70 font-semibold">Bonnes habitudes</span>
          </nav>

          <h1 className="text-2xl md:text-4xl font-extrabold text-[#000] mb-2 text-balance">
            Les réflexes qui changent tout, sans jargon.
          </h1>
          <p className="text-sm md:text-base text-[#000]/80 max-w-3xl">
            {HABITUDES.length} réflexes structurés par niveau et par thème. Intégrés au quotidien, ils suppriment une
            grande partie des risques sans rien avoir à installer.
          </p>

          {/* Filters */}
          <div className="space-y-3 mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[#000]/70 uppercase tracking-wider mr-1 inline-flex items-center gap-1">
                <FilterIcon className="w-3 h-3" /> Niveau
              </span>
              {(["all", "Débutant", "Intermédiaire", "Avancé"] as const).map((lvl) => (
                <FilterChip
                  key={lvl}
                  active={levelFilter === lvl}
                  onClick={() => setLevelFilter(lvl as "all" | HabitLevel)}
                >
                  {lvl === "all" ? "Tous niveaux" : lvl}
                </FilterChip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[#000]/70 uppercase tracking-wider mr-1 inline-flex items-center gap-1">
                <FilterIcon className="w-3 h-3" /> Thème
              </span>
              {HABIT_TAGS.map((tag) => (
                <FilterChip key={tag.key} active={tagFilter === tag.key} onClick={() => setTagFilter(tag.key)}>
                  {tag.label}
                </FilterChip>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#000]/60 mt-4">
            {filtered.length} habitude{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((h, i) => {
          const Icon = h.icon
          const status = statuses[h.id] ?? "todo"
          const { label: statusLabel, color: statusColor } = STATUS_LABELS[status]
          return (
            <button
              key={h.id}
              onClick={() => setSelected(h)}
              className="text-left rounded-xl p-5 bg-[#FFFFFF] flex flex-col gap-3 sc-fade-in transition-all hover:-translate-y-1"
              style={{
                animationDelay: `${i * 40}ms`,
                border: "1px solid #B3DBEF",
                boxShadow: "3px 3px 0px #C0DDF8",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-10 h-10 rounded-lg bg-[#C3E8FF] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#157FE2]" />
                  </div>
                  <ScBadge
                    tone={h.level === "Débutant" ? "success" : h.level === "Intermédiaire" ? "info" : "premium"}
                  >
                    {h.level}
                  </ScBadge>
                  <ScBadge tone="muted">{h.tag}</ScBadge>
                </div>
                <button
                  onClick={(e) => cycleStatus(h.id, e)}
                  className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${statusColor}`}
                  title="Changer le statut"
                >
                  {statusLabel}
                </button>
              </div>
              <h3 className="font-bold text-base text-[#000]">{h.title}</h3>
              <p className="text-sm text-[#000]/70 leading-relaxed">{h.pitch}</p>
              <div className="flex items-center gap-3 text-xs text-[#000]/55 mt-1">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {h.timeEstimate}
                </span>
              </div>
              <span className="text-xs text-[#157FE2] font-semibold mt-auto inline-flex items-center gap-1">
                En savoir plus <ArrowRight className="w-3 h-3" />
              </span>
            </button>
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
