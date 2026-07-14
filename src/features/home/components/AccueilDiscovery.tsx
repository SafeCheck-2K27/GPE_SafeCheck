"use client"

import { useState, type ComponentType, type FormEvent, type ReactNode } from "react"
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  ListChecks,
  Search,
  Sliders,
  Sparkles,
  Trophy,
} from "lucide-react"
import { ScBadge, ScButton } from "@/components/safecheck/primitives"
import { homeExplorationModules } from "../data"
import type { HomeModuleIcon, HomeModuleTone } from "../types"

const iconMap: Record<HomeModuleIcon, ComponentType<{ className?: string }>> = {
  "book-open": BookOpen,
  sliders: Sliders,
  "list-checks": ListChecks,
  sparkles: Sparkles,
  trophy: Trophy,
  "book-marked": BookMarked,
}

export function AccueilDiscovery({
  onSearch,
  onNavigate,
}: {
  onSearch: (query: string) => void
  onNavigate: (href: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const query = searchQuery.trim()
    if (query) onSearch(query)
  }

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <div className="max-w-xl mx-auto">
          <p className="text-xs font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wide mb-2 text-center">
            Vous cherchez déjà quelque chose&nbsp;?
          </p>
          <form onSubmit={handleSearch} className="flex items-stretch gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-4 py-2.5 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border-strong)] focus-within:border-[color:var(--sc-blue)] focus-within:ring-2 focus-within:ring-[color:var(--sc-blue)]/25 transition-all">
              <Search className="w-4 h-4 text-[color:var(--sc-text-muted)]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher un tutoriel, un essentiel, une recommandation…"
                className="min-w-0 flex-1 text-sm bg-transparent outline-none text-[color:var(--sc-text)] placeholder:text-[color:var(--sc-text-muted)]"
              />
            </div>
            <ScButton variant="secondary" size="md" type="submit">
              Rechercher
            </ScButton>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pt-10 pb-12">
        <div className="mb-6">
          <h2 className="font-display text-lg md:text-xl font-semibold text-[color:var(--sc-text)]">
            Modules d&apos;exploration
          </h2>
          <p className="mt-1 text-sm text-[color:var(--sc-text-muted)] text-pretty">
            Une fois votre parcours lancé, explorez ces ressources à votre rythme.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {homeExplorationModules.map((module, index) => {
            const Icon = iconMap[module.icon]
            return (
              <ModuleCard
                key={module.href}
                index={index}
                icon={<Icon className="w-5 h-5" />}
                tone={module.tone}
                badge={module.badge}
                title={module.title}
                description={module.description}
                buttonLabel={module.buttonLabel}
                onClick={() => onNavigate(module.href)}
              />
            )
          })}
        </div>
      </section>
    </>
  )
}

function ModuleCard({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
  index,
  tone,
  badge,
}: {
  icon: ReactNode
  title: string
  description: string
  buttonLabel: string
  onClick: () => void
  index: number
  tone: HomeModuleTone
  badge?: string
}) {
  const toneGradient = {
    blue: "from-[#3B82F6] to-[#2563EB] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.45)]",
    indigo: "from-[#6366F1] to-[#4F46E5] shadow-[0_8px_20px_-6px_rgba(99,102,241,0.45)]",
    cyan: "from-[#06B6D4] to-[#0891B2] shadow-[0_8px_20px_-6px_rgba(6,182,212,0.45)]",
  } as const

  return (
    <article
      className="group relative flex flex-col rounded-2xl p-5 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[0_1px_3px_-1px_rgba(15,23,42,0.05)] hover:shadow-[0_16px_32px_-12px_rgba(37,99,235,0.16),0_6px_14px_-6px_rgba(15,23,42,0.08)] hover:border-[color:var(--sc-blue)]/30 hover:-translate-y-0.5 transition-all duration-300 ease-out sc-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-white bg-gradient-to-br ${toneGradient[tone]} group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
        {badge && <ScBadge tone="muted">{badge}</ScBadge>}
      </div>

      <h3 className="font-display font-semibold text-base text-[color:var(--sc-text)] mb-1.5">
        {title}
      </h3>
      <p
        className="text-sm text-[color:var(--sc-text-2)] leading-relaxed flex-1 text-pretty"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      <button
        onClick={onClick}
        className="mt-4 inline-flex items-center justify-between gap-2 w-full px-4 py-2 rounded-lg text-sm font-semibold text-[color:var(--sc-blue)] bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] hover:bg-[color:var(--sc-blue)] hover:text-white hover:border-[color:var(--sc-blue)] transition-colors"
      >
        {buttonLabel}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </button>

      <span
        className="pointer-events-none absolute inset-x-6 top-0 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(37,99,235,0.5), rgba(99,102,241,0.5), transparent)",
        }}
        aria-hidden
      />
    </article>
  )
}
