import {
  Activity,
  AlertTriangle,
  CloudOff,
  Cog,
  Cpu,
  Download,
  Eye,
  Globe,
  HardDrive,
  Headphones,
  KeySquare,
  Layers,
  Lock,
  Mail,
  Monitor,
  Network,
  Package,
  RefreshCw,
  Repeat,
  Server,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Usb,
  Wifi,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { RecommendationIconKey } from "../types"

const RECOMMENDATION_ICON_MAP: Record<RecommendationIconKey, LucideIcon> = {
  activity: Activity,
  "alert-triangle": AlertTriangle,
  "cloud-off": CloudOff,
  cog: Cog,
  cpu: Cpu,
  download: Download,
  eye: Eye,
  globe: Globe,
  "hard-drive": HardDrive,
  headphones: Headphones,
  "key-square": KeySquare,
  layers: Layers,
  lock: Lock,
  mail: Mail,
  monitor: Monitor,
  network: Network,
  package: Package,
  "refresh-cw": RefreshCw,
  repeat: Repeat,
  server: Server,
  "shield-alert": ShieldAlert,
  "shield-check": ShieldCheck,
  smartphone: Smartphone,
  usb: Usb,
  wifi: Wifi,
}

export function RecommendationIcon({
  icon,
  className,
}: {
  icon: RecommendationIconKey
  className?: string
}) {
  const Icon = RECOMMENDATION_ICON_MAP[icon]

  return <Icon className={className} />
}
