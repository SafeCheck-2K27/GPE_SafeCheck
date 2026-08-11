import {
  Cloud,
  Eye,
  HardDrive,
  Key,
  Lock,
  Mail,
  Save,
  Shield,
  Smartphone,
  Wifi,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { EssentialIconKey } from "../types"

const ESSENTIAL_ICON_MAP: Record<EssentialIconKey, LucideIcon> = {
  cloud: Cloud,
  eye: Eye,
  "hard-drive": HardDrive,
  key: Key,
  lock: Lock,
  mail: Mail,
  save: Save,
  shield: Shield,
  smartphone: Smartphone,
  wifi: Wifi,
}

export function EssentialIcon({
  icon,
  className,
}: {
  icon: EssentialIconKey
  className?: string
}) {
  const Icon = ESSENTIAL_ICON_MAP[icon]

  return <Icon className={className} />
}
