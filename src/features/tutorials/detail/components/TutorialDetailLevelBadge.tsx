import { ScBadge } from "@/components/safecheck/primitives"
import type { Tutoriel } from "@/lib/tutoriels-data"
import { Flame, GraduationCap, Zap } from "lucide-react"

export function TutorialDetailLevelBadge({
  level,
}: {
  level: Tutoriel["level"]
}) {
  const levelMeta = {
    Debutant: {
      tone: "success" as const,
      icon: <GraduationCap className="w-3 h-3" />,
    },
    Intermediaire: {
      tone: "warn" as const,
      icon: <Flame className="w-3 h-3" />,
    },
    Avance: {
      tone: "premium" as const,
      icon: <Zap className="w-3 h-3" />,
    },
  }
  const { tone, icon } = levelMeta[level]

  return (
    <ScBadge tone={tone}>
      {icon}
      {level}
    </ScBadge>
  )
}
