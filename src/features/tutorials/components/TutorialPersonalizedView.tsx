"use client"

import { useRouter } from "next/navigation"
import { ScBadge, ScButton } from "@/components/safecheck/primitives"
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
import { mockTutoStatus, userProgress } from "../data"
import { getPersonalizedTutorialGroups } from "../personalization"
import { TutorialCard } from "./TutorialCards"
import { TutorialProgressionHero } from "./TutorialProgressionHero"
import { TutorialViewChip } from "./TutorialViewChip"

export function TutorialPersonalizedView({
  openTuto,
}: {
  openTuto: (t: Tutoriel) => void
}) {
  const router = useRouter()
  // Personalize content based on user level (here: Debutant)
  const userLevel = userProgress.levelKey

  // Pick recommended tuto
  const recommendedTuto =
    tutoriels.find((t) => t.isRecommended && t.level === userLevel) ||
    tutoriels.find((t) => t.level === userLevel) ||
    tutoriels[0]

  const grouped = getPersonalizedTutorialGroups(userLevel, tutoriels)

  return (
    <>
      {/* Hero + progression banner */}
      <TutorialProgressionHero recommendedTuto={recommendedTuto} openTuto={openTuto} />

      {/* Quick switcher */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wider mr-1">
          Vue
        </span>
        <TutorialViewChip active onClick={() => {}}>
          <Sparkles className="w-3.5 h-3.5" /> Mes tutoriels
        </TutorialViewChip>
        <TutorialViewChip onClick={() => router.push("/tutoriels?vue=tous")}>
          <BookOpen className="w-3.5 h-3.5" /> Tous les tutoriels
        </TutorialViewChip>
        <TutorialViewChip onClick={() => router.push("/tutoriels?niveau=debutant")}>
          <GraduationCap className="w-3.5 h-3.5" /> Debutant
        </TutorialViewChip>
        <TutorialViewChip onClick={() => router.push("/tutoriels?niveau=intermediaire")}>
          <Flame className="w-3.5 h-3.5" /> Intermediaire
        </TutorialViewChip>
        <TutorialViewChip onClick={() => router.push("/tutoriels?niveau=avance")}>
          <Zap className="w-3.5 h-3.5" /> Avance
        </TutorialViewChip>
      </div>

      {/* Grouped sections */}
      {Object.entries(grouped).map(
        ([sectionTitle, { tutos, description, priority }], sectionIndex) =>
          tutos.length > 0 && (
            <section key={sectionTitle} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-[linear-gradient(135deg,#3B82F6,#2563EB)] text-white font-bold text-sm shadow-[var(--sc-shadow-blue-sm)]">
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
                    status={mockTutoStatus[tuto.id] || "todo"}
                  />
                ))}
              </div>
            </section>
          ),
      )}
    </>
  )
}
