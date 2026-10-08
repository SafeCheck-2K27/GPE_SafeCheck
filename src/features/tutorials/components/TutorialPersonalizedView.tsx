"use client"

import { getTutorialCardStatus, type TutorialProgressById } from "../session"

import { useRouter } from "next/navigation"
import { ScBadge, ScButton, ScChip } from "@/components/safecheck/primitives"
import { tutoriels } from "../data/catalog"
import type { Tutoriel } from "../data/catalog"
import {
  ArrowRight,
  BookOpen,
  Flame,
  GraduationCap,
  Sparkles,
  Zap,
} from "lucide-react"
import { getPersonalizedTutorialGroups } from "../personalization"
import { TutorialCard } from "./TutorialCards"

export function TutorialPersonalizedView({
  progressById,
  openTuto,
}: {
  progressById: TutorialProgressById
  openTuto: (t: Tutoriel) => void
}) {
  const router = useRouter()
  const grouped = getPersonalizedTutorialGroups("Debutant", tutoriels)

  return (
    <>
      <header className="rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-6 md:p-8 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--sc-text)] font-display mb-2">
          Sélection pour débuter
        </h1>
        <p className="text-sm md:text-base text-[color:var(--sc-text-2)] leading-relaxed max-w-3xl">
          Une sélection éditoriale de tutoriels de niveau débutant pour protéger vos comptes,
          reconnaître les menaces et sécuriser vos données. Explorez aussi la bibliothèque
          complète ou choisissez un autre niveau.
        </p>
      </header>

      {/* Quick switcher */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wider mr-1">
          Vue
        </span>
        <ScChip active>
          <Sparkles className="w-3.5 h-3.5" /> Sélection pour débuter
        </ScChip>
        <ScChip onClick={() => router.push("/tutoriels?vue=tous")}>
          <BookOpen className="w-3.5 h-3.5" /> Tous les tutoriels
        </ScChip>
        <ScChip onClick={() => router.push("/tutoriels?niveau=debutant")}>
          <GraduationCap className="w-3.5 h-3.5" /> Debutant
        </ScChip>
        <ScChip onClick={() => router.push("/tutoriels?niveau=intermediaire")}>
          <Flame className="w-3.5 h-3.5" /> Intermediaire
        </ScChip>
        <ScChip onClick={() => router.push("/tutoriels?niveau=avance")}>
          <Zap className="w-3.5 h-3.5" /> Avance
        </ScChip>
      </div>

      {/* Grouped sections */}
      {Object.entries(grouped).map(
        ([sectionTitle, { tutos, description, priority }], sectionIndex) =>
          tutos.length > 0 && (
            <section key={sectionTitle} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] text-[color:var(--sc-text-on-strong)] font-bold text-sm shadow-[var(--sc-shadow-blue-sm)]">
                    {sectionIndex + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h2 className="font-bold text-base md:text-lg text-[color:var(--sc-text)] font-display">
                        {sectionTitle}
                      </h2>
                      <ScBadge tone={sectionIndex === 0 ? "info" : sectionIndex === 1 ? "warn" : "muted"}>
                        {priority}
                      </ScBadge>
                    </div>
                    <p className="text-xs text-[color:var(--sc-text-muted)]">{description}</p>
                  </div>
                </div>
                <ScButton
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/tutoriels?vue=tous")}
                >
                  Voir tout
                  <ArrowRight className="w-3.5 h-3.5" />
                </ScButton>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutos.map((tuto) => (
                  <TutorialCard
                    key={tuto.id}
                    tuto={tuto}
                    onStart={() => openTuto(tuto)}
                    status={getTutorialCardStatus(tuto, progressById)}
                  />
                ))}
              </div>
            </section>
          ),
      )}
    </>
  )
}
