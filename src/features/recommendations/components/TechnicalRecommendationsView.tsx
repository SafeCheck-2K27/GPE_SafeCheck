"use client"

import { useMemo, useState } from "react"
import type { MouseEvent } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Filter as FilterIcon,
} from "lucide-react"
import { ScBadge, ScChip } from "@/components/safecheck/primitives"
import { CATEGORY_LABELS, STATUS_LABELS, TECH } from "../data"
import { filterTechnicalRecommendations } from "../filters"
import type {
  HabitLevel,
  RecommendationStatus,
  TechnicalRecommendation,
  TechnicalUrgency,
} from "../types"
import { getNextRecommendationStatus } from "../utils"
import { TechnicalRecommendationDetail } from "./TechnicalRecommendationDetail"

export function TechnicalRecommendationsView({ onBack, initialCat }: { onBack: () => void; initialCat: string | null }) {
  const [cat, setCat] = useState<string>(initialCat ?? "all")
  const [levelFilter, setLevelFilter] = useState<"all" | HabitLevel>("all")
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | TechnicalUrgency>("all")
  const [selected, setSelected] = useState<TechnicalRecommendation | null>(null)
  const [statuses, setStatuses] = useState<Record<number, RecommendationStatus>>({})

  const filtered = useMemo(
    () =>
      filterTechnicalRecommendations(TECH, {
        category: cat,
        level: levelFilter,
        urgency: urgencyFilter,
      }),
    [cat, levelFilter, urgencyFilter],
  )

  const cycleStatus = (id: number, e: MouseEvent) => {
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
            <span className="text-[color:var(--sc-text-2)] font-semibold">Techniques</span>
          </nav>

          <h1 className="text-2xl md:text-4xl font-extrabold text-[color:var(--sc-text)] mb-2 text-balance">
            Les configurations et outils qui renforcent durablement votre posture.
          </h1>
          <p className="text-sm md:text-base text-[color:var(--sc-text)] max-w-3xl">
            {TECH.length} recommandations classées par catégorie, niveau et urgence. Cliquez sur une carte pour
            voir les étapes détaillées, les tutoriels liés et l&apos;explication complète.
          </p>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mt-5">
            {Object.entries(CATEGORY_LABELS).map(([key, { label, icon: Icon }]) => {
              const count = key === "all" ? TECH.length : TECH.filter((t) => t.category === key).length
              return (
                <ScChip
                  key={key}
                  onClick={() => setCat(key)}
                  active={cat === key}
                  className="px-3.5"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {key !== "all" && (
                    <span className={`ml-0.5 ${cat === key ? "opacity-75" : "opacity-50"}`}>({count})</span>
                  )}
                </ScChip>
              )
            })}
          </div>

          {/* Sub-filters */}
          <div className="space-y-3 mt-4">
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
                  {lvl === "all" ? "Tous" : lvl}
                </ScChip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[color:var(--sc-text-2)] uppercase tracking-wider mr-1 inline-flex items-center gap-1">
                <FilterIcon className="w-3 h-3" /> Urgence
              </span>
              {(["all", "Haute", "Moyenne", "Faible"] as const).map((u) => (
                <ScChip
                  size="xs"
                  key={u}
                  active={urgencyFilter === u}
                  onClick={() => setUrgencyFilter(u as typeof urgencyFilter)}
                >
                  {u === "all" ? "Toutes" : u}
                </ScChip>
              ))}
            </div>
          </div>

          <p className="text-xs text-[color:var(--sc-text-muted)] mt-4">
            {filtered.length} recommandation{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-10 text-center">
            <p className="text-sm text-[color:var(--sc-text-muted)]">
              Aucune recommandation ne correspond à vos filtres pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t, i) => {
              const Icon = t.icon
              const status = statuses[t.id] ?? "todo"
              const { label: statusLabel, color: statusColor } = STATUS_LABELS[status]
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className="text-left rounded-xl p-5 bg-[color:var(--sc-surface)] flex flex-col gap-3 sc-fade-in transition-all hover:-translate-y-1"
                  style={{
                    animationDelay: `${i * 40}ms`,
                    border: t.urgency === "Haute" ? "1px solid var(--sc-danger-border-strong)" : "1px solid var(--sc-border)",
                    boxShadow: t.urgency === "Haute" ? "var(--sc-shadow)" : "var(--sc-shadow)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-10 h-10 rounded-lg bg-[color:var(--sc-bg-soft)] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[color:var(--sc-blue)]" />
                      </div>
                      <ScBadge tone={t.urgency === "Haute" ? "warn" : t.urgency === "Moyenne" ? "info" : "muted"}>
                        {t.urgency === "Haute" && <AlertTriangle className="w-3 h-3" />}
                        {t.urgency}
                      </ScBadge>
                      <ScBadge tone={t.level === "Débutant" ? "success" : t.level === "Intermédiaire" ? "info" : "premium"}>
                        {t.level}
                      </ScBadge>
                    </div>
                    <button
                      onClick={(e) => cycleStatus(t.id, e)}
                      className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${statusColor}`}
                      title="Changer le statut"
                    >
                      {statusLabel}
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-[color:var(--sc-text)]">{t.title}</h3>
                  <p className="text-xs text-[color:var(--sc-text-muted)] italic">{t.subtitle}</p>
                  <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed line-clamp-2">{t.description}</p>

                  <div className="flex items-center gap-3 text-xs text-[color:var(--sc-text-muted)] mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {t.timeEstimate}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[color:var(--sc-text-muted)]">
                      {CATEGORY_LABELS[t.category].label}
                    </span>
                  </div>

                  <span className="text-xs text-[color:var(--sc-blue)] font-semibold mt-auto inline-flex items-center gap-1">
                    Voir les étapes <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {selected && (
        <TechnicalRecommendationDetail
          t={selected}
          onClose={() => setSelected(null)}
          status={statuses[selected.id] ?? "todo"}
          onStatusChange={(s) => setStatuses((prev) => ({ ...prev, [selected.id]: s }))}
        />
      )}
    </>
  )
}
