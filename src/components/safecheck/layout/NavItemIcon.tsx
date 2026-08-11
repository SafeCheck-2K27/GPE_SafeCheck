import { BookOpen, BookText, Gamepad2, ShieldAlert, Trophy } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { NavIconKey } from "./nav-data"

const NAV_ICON_MAP: Record<NavIconKey, LucideIcon> = {
  "book-open": BookOpen,
  "book-text": BookText,
  "gamepad-2": Gamepad2,
  "shield-alert": ShieldAlert,
  trophy: Trophy,
}

export function NavItemIcon({
  icon,
  className,
}: {
  icon: NavIconKey
  className?: string
}) {
  const Icon = NAV_ICON_MAP[icon]

  return <Icon className={className} />
}
