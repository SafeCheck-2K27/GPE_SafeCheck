import type { ComponentType } from "react"
import { ScBadge, ScCard } from "@/components/safecheck/primitives"
import {
  Camera,
  GraduationCap,
  ShieldCheck,
  Trophy,
} from "lucide-react"
import type { AccountForm } from "../types"

function StatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: ComponentType<{ className?: string }>
  value: string
  label: string
}) {
  return (
    <ScCard className="flex min-w-[68px] flex-col items-center justify-center px-3 py-2.5">
      <Icon className="w-4 h-4 text-[color:var(--sc-blue)] mb-1" />
      <span className="font-display font-bold text-base text-[color:var(--sc-text)] leading-none tabular-nums">
        {value}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-[color:var(--sc-text-muted)] mt-0.5">
        {label}
      </span>
    </ScCard>
  )
}

export function AccountHero({
  form,
  onAvatarClick,
}: {
  form: AccountForm
  onAvatarClick: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--sc-border)] sc-mesh-soft p-6 md:p-8 mb-6">
      <div
        className="pointer-events-none absolute inset-0 sc-dot-texture opacity-50"
        aria-hidden
      />
      <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
        <div className="flex items-center gap-5 shrink-0">
          <div className="relative">
            <div
              className="absolute inset-0 -m-3 rounded-full sc-halo opacity-50 sc-pulse-soft pointer-events-none"
              aria-hidden
            />
            <div className="relative w-24 h-24 rounded-full p-[3px] bg-[linear-gradient(135deg,#3B82F6,#6366F1_50%,#06B6D4)] shadow-[0_18px_40px_-14px_rgba(37,99,235,0.50)]">
              <div className="w-full h-full rounded-full sc-avatar-gradient flex items-center justify-center text-white font-display text-3xl font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.30)]">
                {form.pseudo[0]}
              </div>
            </div>
            <button
              type="button"
              onClick={onAvatarClick}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] border-2 border-[color:var(--sc-surface)] shadow-[0_6px_14px_-4px_rgba(37,99,235,0.55)] hover:scale-105 transition-transform cursor-pointer"
              aria-label="Changer la photo de profil"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="md:hidden">
            <h1 className="font-display text-xl font-bold text-[color:var(--sc-text)] tracking-tight">
              {form.pseudo}
            </h1>
            <p className="text-sm text-[color:var(--sc-text-muted)]">
              {form.email}
            </p>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="hidden md:flex items-baseline gap-3 flex-wrap mb-1">
            <h1 className="font-display text-2xl font-bold text-[color:var(--sc-text)] tracking-tight">
              {form.pseudo}
            </h1>
            <span className="text-sm text-[color:var(--sc-text-muted)]">
              {form.prenom} {form.nom} · {form.email}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sc-text-muted)]">
              Ton niveau actuel
            </span>
            <ScBadge tone="info">{form.score}/100</ScBadge>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold sc-gradient-text leading-tight mb-3">
            {form.niveau}
          </h2>

          <div className="max-w-md">
            <div className="flex items-center justify-between text-[11.5px] mb-1.5">
              <span className="text-[color:var(--sc-text-2)] font-medium">
                Progression vers Luciole
              </span>
              <span className="font-bold text-[color:var(--sc-blue)] tabular-nums">
                {form.score}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)]">
              <div
                className="h-full rounded-full transition-all duration-500 bg-[linear-gradient(90deg,var(--sc-blue-soft),var(--sc-blue),var(--sc-indigo))] shadow-[0_0_12px_rgba(37,99,235,0.45)]"
                style={{ width: `${form.score}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 shrink-0">
          <StatPill icon={ShieldCheck} value="1" label="Audit" />
          <StatPill icon={GraduationCap} value="3" label="Tutos" />
          <StatPill
            icon={Trophy}
            value={String(form.badges.length)}
            label="Badges"
          />
        </div>
      </div>
    </div>
  )
}
