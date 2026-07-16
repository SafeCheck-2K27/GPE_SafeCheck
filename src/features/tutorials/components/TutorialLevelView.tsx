"use client"

import { useMemo } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ScBadge } from "@/components/safecheck/primitives"
import { tutoriels } from "../data/catalog"
import type { Niveau, Tutoriel } from "../data/catalog"
import {
  BookOpen,
  Flame,
  GraduationCap,
  Sparkles,
  Zap,
} from "lucide-react"
import { mockTutoStatus } from "../data"
import { TutorialCard } from "./TutorialCards"
import { TutorialViewChip } from "./TutorialViewChip"

export function TutorialLevelView({
  niveau,
  openTuto,
}: {
  niveau: Niveau
  openTuto: (t: Tutoriel) => void
}) {
  const router = useRouter()
  const list = useMemo(() => tutoriels.filter((t) => t.level === niveau), [niveau])

  const meta: Record<
    Niveau,
    { title: string; subtitle: string; tone: "success" | "warn" | "premium"; icon: ReactNode; description: string }
  > = {
    Debutant: {
      title: "Tutoriels pour debuter",
      subtitle: "Niveau Debutant",
      tone: "success",
      icon: <GraduationCap className="w-4 h-4" />,
      description:
        "Les fondamentaux : mots de passe, comptes, phishing, Wi-Fi, sauvegardes. Tout le monde devrait maitriser ces gestes.",
    },
    Intermediaire: {
      title: "Aller plus loin",
      subtitle: "Niveau Intermediaire",
      tone: "warn",
      icon: <Flame className="w-4 h-4" />,
      description:
        "Confidentialite, extensions, permissions, sauvegardes structurees, VPN, phishing avance. Pour ceux qui veulent prendre le controle.",
    },
    Avance: {
      title: "Approche experte",
      subtitle: "Niveau Avance",
      tone: "premium",
      icon: <Zap className="w-4 h-4" />,
      description:
        "Durcissement systeme, reseau, telemetrie, pare-feu, manifestes Android, DNS chiffre, navigation cloisonnee. Tutoriels longs et techniques.",
    },
  }

  const cur = meta[niveau]

  return (
    <>
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-md)] mb-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              niveau === "Debutant"
                ? "radial-gradient(at 0% 0%, rgba(16,185,129,0.12), transparent 50%), radial-gradient(at 100% 50%, rgba(37,99,235,0.10), transparent 50%)"
                : niveau === "Intermediaire"
                  ? "radial-gradient(at 0% 0%, rgba(245,158,11,0.14), transparent 50%), radial-gradient(at 100% 50%, rgba(37,99,235,0.10), transparent 50%)"
                  : "radial-gradient(at 0% 0%, rgba(139,92,246,0.16), transparent 50%), radial-gradient(at 100% 50%, rgba(37,99,235,0.10), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <ScBadge tone={cur.tone}>
              {cur.icon}
              {cur.subtitle}
            </ScBadge>
            <span className="text-xs text-[color:var(--sc-text-muted)]">
              {list.length} tutoriels disponibles
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--sc-text)] font-display mb-2 text-balance">
            {cur.title}
          </h1>
          <p className="text-sm md:text-base text-[color:var(--sc-text-2)] leading-relaxed max-w-3xl text-pretty mb-5">
            {cur.description}
          </p>

          {/* Quick switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <TutorialViewChip onClick={() => router.push("/tutoriels")}>
              <Sparkles className="w-3.5 h-3.5" /> Mes tutoriels
            </TutorialViewChip>
            <TutorialViewChip onClick={() => router.push("/tutoriels?vue=tous")}>
              <BookOpen className="w-3.5 h-3.5" /> Tous
            </TutorialViewChip>
            <TutorialViewChip
              active={niveau === "Debutant"}
              onClick={() => router.push("/tutoriels?niveau=debutant")}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Debutant
            </TutorialViewChip>
            <TutorialViewChip
              active={niveau === "Intermediaire"}
              onClick={() => router.push("/tutoriels?niveau=intermediaire")}
            >
              <Flame className="w-3.5 h-3.5" /> Intermediaire
            </TutorialViewChip>
            <TutorialViewChip
              active={niveau === "Avance"}
              onClick={() => router.push("/tutoriels?niveau=avance")}
            >
              <Zap className="w-3.5 h-3.5" /> Avance
            </TutorialViewChip>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((tuto) => (
          <TutorialCard
            key={tuto.id}
            tuto={tuto}
            onStart={() => openTuto(tuto)}
            status={mockTutoStatus[tuto.id] || "todo"}
          />
        ))}
      </div>
    </>
  )
}
