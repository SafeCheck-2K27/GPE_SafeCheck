import { Moon, Sun, Settings } from "lucide-react"
import { AccountSectionCard } from "./AccountSectionCard"

export function AccountPreferences({ theme, setTheme }: { theme: string | undefined; setTheme: (theme: string) => void }) {
  return (
    <AccountSectionCard icon={Settings} title="Apparence" description="Choisis le thème de l’interface sur cet appareil.">
      <div className="flex flex-wrap gap-3">
        {([
          { value: "light", label: "Clair", Icon: Sun },
          { value: "dark", label: "Sombre", Icon: Moon },
          { value: "system", label: "Système", Icon: Settings },
        ] as const).map(({ value, label, Icon }) => (
          <button key={value} type="button" onClick={() => setTheme(value)} aria-pressed={(theme ?? "system") === value}
            className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] px-4 py-3 text-sm text-[color:var(--sc-text)] hover:border-[color:var(--sc-blue)] aria-pressed:border-[color:var(--sc-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sc-blue)]">
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>
    </AccountSectionCard>
  )
}
