"use client"

import type { ComponentType } from "react"
import { useRouter } from "next/navigation"
import { ScBadge, ScButton } from "@/components/safecheck/primitives"
import {
  Bell,
  Check,
  FileDown,
  Languages,
  Moon,
  Settings,
  Sun,
} from "lucide-react"
import type {
  NotificationPreferences,
  NotificationPreferencesSetter,
} from "../types"
import { AccountSectionCard } from "./AccountSectionCard"

export function AccountPreferences({
  theme,
  setTheme,
  notifs,
  setNotifs,
  langue,
}: {
  theme: string | undefined
  setTheme: (t: string) => void
  notifs: NotificationPreferences
  setNotifs: NotificationPreferencesSetter
  langue: string
}) {
  const router = useRouter()
  const isDark = theme === "dark"
  const isLight = theme === "light"

  return (
    <div className="grid gap-6 sc-fade-in">
      {/* Apparence */}
      <AccountSectionCard
        icon={Sun}
        title="Apparence"
        description="Choisis le thème qui t'est le plus confortable. SafeCheck s'adapte automatiquement."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ThemeOption
            label="Clair"
            description="Lumineux et net pour la journée."
            icon={Sun}
            active={isLight}
            onClick={() => setTheme("light")}
          />
          <ThemeOption
            label="Sombre"
            description="Doux pour les yeux le soir."
            icon={Moon}
            active={isDark}
            onClick={() => setTheme("dark")}
          />
          <ThemeOption
            label="Système"
            description="Suit les réglages de ton appareil."
            icon={Settings}
            active={!isDark && !isLight}
            onClick={() => setTheme("system")}
          />
        </div>
      </AccountSectionCard>

      {/* Langue */}
      <AccountSectionCard
        icon={Languages}
        title="Langue de l'interface"
        description="Le contenu pédagogique et les recommandations s'afficheront dans cette langue."
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] text-[color:var(--sc-blue)]">
              <Languages className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[color:var(--sc-text)]">{langue}</p>
              <p className="text-[12px] text-[color:var(--sc-text-muted)]">Langue actuellement sélectionnée</p>
            </div>
          </div>
          <ScButton
            variant="secondary"
            size="sm"
            onClick={() => router.push("/wip?feature=langue")}
          >
            Changer la langue
          </ScButton>
        </div>
      </AccountSectionCard>

      {/* Notifications */}
      <AccountSectionCard
        icon={Bell}
        title="Notifications &amp; alertes"
        description="Garde le contrôle sur ce que tu reçois - rien de spam, juste l'utile."
      >
        <div className="space-y-1">
          <NotifToggle
            title="Alertes de sécurité"
            desc="Fuites de données, vulnérabilités critiques te concernant."
            checked={notifs.alertesSecurite}
            onChange={(v) => setNotifs((p) => ({ ...p, alertesSecurite: v }))}
            recommended
          />
          <NotifToggle
            title="Actualités cyber"
            desc="Nouvelles arnaques en circulation, événements majeurs."
            checked={notifs.actualitesCyber}
            onChange={(v) => setNotifs((p) => ({ ...p, actualitesCyber: v }))}
          />
          <NotifToggle
            title="Rappels de progression"
            desc="Petits coups de pouce pour avancer dans tes tutos."
            checked={notifs.progressionRappels}
            onChange={(v) => setNotifs((p) => ({ ...p, progressionRappels: v }))}
          />
          <NotifToggle
            title="Nouveautés produit"
            desc="Nouvelles fonctionnalités et mises à jour SafeCheck."
            checked={notifs.nouveautesProduit}
            onChange={(v) => setNotifs((p) => ({ ...p, nouveautesProduit: v }))}
          />
          <NotifToggle
            title="Newsletter hebdomadaire"
            desc="Un récap par email tous les lundis."
            checked={notifs.emailHebdo}
            onChange={(v) => setNotifs((p) => ({ ...p, emailHebdo: v }))}
          />
        </div>
      </AccountSectionCard>

      {/* Export complet */}
      <AccountSectionCard
        icon={FileDown}
        title="Export de tes données"
        description="Récupère un récap complet de ton activité, à conserver hors ligne."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ExportTile title="Historique complet" desc="Audits, tutos, guides - tout ton parcours." />
          <ExportTile title="Résumé de progression" desc="Niveau, score, badges, prochains objectifs." />
          <ExportTile title="Tutos réalisés" desc="Récap PDF de chaque tuto suivi." />
        </div>
      </AccountSectionCard>
    </div>
  )
}

function ThemeOption({
  label,
  description,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer ${active ? "border-[color:var(--sc-blue)] bg-[color:var(--sc-bg-soft)] shadow-[var(--sc-shadow-blue-sm)] ring-1 ring-[color:var(--sc-blue)]/30" : "border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] hover:border-[color:var(--sc-blue)]/55 hover:-translate-y-0.5 hover:shadow-[var(--sc-shadow)]" }`}
      aria-pressed={active}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${active ? "bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] text-[color:var(--sc-text-on-strong)] shadow-[var(--sc-shadow-blue-sm)]" : "bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)] border border-[color:var(--sc-border)]" }`}
        >
          <Icon className="w-4 h-4" />
        </span>
        <span className="font-semibold text-[color:var(--sc-text)]">{label}</span>
        {active && (
          <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full bg-[color:var(--sc-blue)] text-[color:var(--sc-text-on-strong)]">
            <Check className="w-3 h-3" strokeWidth={3} />
          </span>
        )}
      </div>
      <p className="text-[12.5px] text-[color:var(--sc-text-muted)] leading-relaxed">{description}</p>
    </button>
  )
}

function NotifToggle({
  title,
  desc,
  checked,
  onChange,
  recommended,
}: {
  title: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
  recommended?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-[color:var(--sc-border)] last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[color:var(--sc-text)]">{title}</p>
          {recommended && <ScBadge tone="success">Recommandé</ScBadge>}
        </div>
        <p className="text-[12.5px] text-[color:var(--sc-text-muted)] mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sc-blue)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sc-surface)] ${checked ? "bg-[linear-gradient(180deg,var(--sc-blue-soft),var(--sc-blue))] shadow-[var(--sc-shadow-blue-sm)]" : "bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border-strong)]" }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-[color:var(--sc-surface)] shadow-[0_2px_6px_rgb(var(--sc-ink-rgb)/0.20)] transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  )
}

function ExportTile({ title, desc }: { title: string; desc: string }) {
  const router = useRouter()
  return (
    <div className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-4 hover:border-[color:var(--sc-blue)]/45 hover:shadow-[var(--sc-shadow)] hover:-translate-y-0.5 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)] border border-[color:var(--sc-border)]">
          <FileDown className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[color:var(--sc-text)] leading-tight">{title}</p>
          <p className="text-[12px] text-[color:var(--sc-text-muted)] mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
      <ScButton
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={() => router.push("/wip?feature=export-pdf")}
      >
        <FileDown className="w-3.5 h-3.5" />
        Télécharger PDF
      </ScButton>
    </div>
  )
}
