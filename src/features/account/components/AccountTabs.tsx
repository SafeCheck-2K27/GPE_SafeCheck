import type { ComponentType } from "react"
import {
  History as HistoryIcon,
  LayoutDashboard,
  Settings,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AccountTabId } from "../types"

const ACCOUNT_TABS: Array<{
  id: AccountTabId
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "historique", label: "Historique & activité", icon: HistoryIcon },
  { id: "profil", label: "Profil & sécurité", icon: ShieldCheck },
  { id: "preferences", label: "Préférences", icon: Settings },
]

export function AccountTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: AccountTabId
  onTabChange: (tab: AccountTabId) => void
}) {
  return (
    <div className="mb-6 sticky top-16 z-30 -mx-4 md:mx-0 px-4 md:px-0">
      <div className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[color:var(--sc-surface)]/70 shadow-[var(--sc-shadow-sm)] p-1 flex items-center gap-1 overflow-x-auto">
        {ACCOUNT_TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer",
                active
                  ? "bg-[linear-gradient(180deg,var(--sc-blue-soft),var(--sc-blue))] text-white shadow-[var(--sc-shadow-blue-sm)]"
                  : "text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)] hover:bg-[color:var(--sc-bg-soft)]",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
