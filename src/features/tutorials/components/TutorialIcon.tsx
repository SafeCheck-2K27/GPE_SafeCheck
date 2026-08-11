import {
  Activity,
  AlertTriangle,
  Compass,
  Cpu,
  Eye,
  Globe,
  HardDrive,
  Key,
  Layers,
  Lock,
  Save,
  Server,
  Settings,
  Shield,
  Smartphone,
  Terminal,
  Users,
  Wifi,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { TutorialIconKey } from "../data/catalog"

const TUTORIAL_ICON_MAP: Record<TutorialIconKey, LucideIcon> = {
  activity: Activity,
  "alert-triangle": AlertTriangle,
  compass: Compass,
  cpu: Cpu,
  eye: Eye,
  globe: Globe,
  "hard-drive": HardDrive,
  key: Key,
  layers: Layers,
  lock: Lock,
  save: Save,
  server: Server,
  settings: Settings,
  shield: Shield,
  smartphone: Smartphone,
  terminal: Terminal,
  users: Users,
  wifi: Wifi,
}

export function TutorialIcon({ icon }: { icon: TutorialIconKey }) {
  const Icon = TUTORIAL_ICON_MAP[icon]

  return <Icon className="w-5 h-5" />
}
