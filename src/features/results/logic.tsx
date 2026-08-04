import { Shield, AlertTriangle, TrendingUp, Bug } from "lucide-react"
import type { ReactNode } from "react"

export function getLevel(score: number): {
  labelKey: string
  descKey: string
  colorVar: string
  bgClass: string
  icon: ReactNode
} {
  if (score >= 80)
    return {
      labelKey: "level.sentinelle",
      descKey: "level.sentinelle.desc",
      colorVar: "var(--sc-blue)",
      bgClass: "bg-[rgba(37,99,235,0.08)] border-[rgba(37,99,235,0.20)]",
      icon: <Shield className="w-8 h-8" />,
    }
  if (score >= 60)
    return {
      labelKey: "level.gardien",
      descKey: "level.gardien.desc",
      colorVar: "var(--sc-blue-soft)",
      bgClass: "bg-[rgba(59,130,246,0.08)] border-[rgba(59,130,246,0.20)]",
      icon: <TrendingUp className="w-8 h-8" />,
    }
  if (score >= 35)
    return {
      labelKey: "level.scarabee",
      descKey: "level.scarabee.desc",
      colorVar: "var(--sc-warn)",
      bgClass: "bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.20)]",
      icon: <Bug className="w-8 h-8" />,
    }
  return {
    labelKey: "level.novice",
    descKey: "level.novice.desc",
    colorVar: "var(--sc-danger)",
    bgClass: "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.20)]",
    icon: <AlertTriangle className="w-8 h-8" />,
  }
}

export function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 80) return "low"
  if (score >= 60) return "medium"
  if (score >= 35) return "high"
  return "critical"
}

export const riskColors = {
  low: { text: "text-[color:var(--sc-success)]", bg: "bg-[rgba(16,185,129,0.10)]", border: "border-[rgba(16,185,129,0.25)]", dot: "#10B981" },
  medium: { text: "text-[color:var(--sc-blue)]", bg: "bg-[rgba(37,99,235,0.08)]", border: "border-[rgba(37,99,235,0.20)]", dot: "#2563EB" },
  high: { text: "text-[color:var(--sc-warn)]", bg: "bg-[rgba(245,158,11,0.10)]", border: "border-[rgba(245,158,11,0.25)]", dot: "#F59E0B" },
  critical: { text: "text-[color:var(--sc-danger)]", bg: "bg-[rgba(239,68,68,0.10)]", border: "border-[rgba(239,68,68,0.20)]", dot: "#EF4444" },
}
