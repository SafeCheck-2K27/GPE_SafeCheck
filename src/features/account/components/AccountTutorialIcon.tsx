import { KeyRound, Mail, Smartphone, Wifi } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { AccountTutorialIconKey } from "@/lib/account-data"

const ACCOUNT_TUTORIAL_ICON_MAP: Record<AccountTutorialIconKey, LucideIcon> = {
  "key-round": KeyRound,
  mail: Mail,
  smartphone: Smartphone,
  wifi: Wifi,
}

export function AccountTutorialIcon({
  icon,
  className,
}: {
  icon: AccountTutorialIconKey
  className?: string
}) {
  const Icon = ACCOUNT_TUTORIAL_ICON_MAP[icon]

  return <Icon className={className} />
}
