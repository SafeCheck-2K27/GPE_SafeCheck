import {
  AlertTriangle,
  HardDrive,
  Lock,
  Save,
  Shield,
  Wifi,
  type LucideIcon,
} from "lucide-react"
import type { ScoreRecommendationIconKey } from "./types"

const scoreRecommendationIconMap: Record<
  ScoreRecommendationIconKey,
  LucideIcon
> = {
  lock: Lock,
  shield: Shield,
  save: Save,
  "hard-drive": HardDrive,
  wifi: Wifi,
  "alert-triangle": AlertTriangle,
}

export function ScoreRecommendationIcon({
  icon,
  className,
}: {
  icon: ScoreRecommendationIconKey
  className?: string
}) {
  const Icon = scoreRecommendationIconMap[icon]

  return <Icon className={className} />
}
