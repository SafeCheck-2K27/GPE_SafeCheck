import type { CSSProperties } from "react"
import { Crown, Microscope, ShieldCheck, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { AuditLevelIconKey } from "../types"

const AUDIT_LEVEL_ICON_MAP: Record<AuditLevelIconKey, LucideIcon> = {
  crown: Crown,
  microscope: Microscope,
  "shield-check": ShieldCheck,
  zap: Zap,
}

export function AuditLevelIcon({
  icon,
  className,
  style,
}: {
  icon: AuditLevelIconKey
  className?: string
  style?: CSSProperties
}) {
  const Icon = AUDIT_LEVEL_ICON_MAP[icon]

  return <Icon className={className} style={style} />
}
