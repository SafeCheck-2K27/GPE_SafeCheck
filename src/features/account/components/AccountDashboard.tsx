"use client"

import { useRouter } from "next/navigation"
import { ScButton } from "@/components/safecheck/primitives"
import {
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react"
import type { AccountForm } from "../types"
import { AccountSectionCard } from "./AccountSectionCard"

export function AccountDashboard({ form }: { form: AccountForm }) {
  const router = useRouter()
  return (
    <div className="grid gap-6 sc-fade-in">
      {/* Top row : progression + comparaison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progression détaillée */}
        <div className="lg:col-span-2">
          <AccountSectionCard
            icon={TrendingUp}
            title="Ta progression"
            description="Suivi de ta montée en compétence cyber, étape par étape."
          >
            {/* Niveaux */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--sc-text-muted)] mb-2.5">
                <span>Parcours de niveaux</span>
                <span className="text-[color:var(--sc-blue)] normal-case tracking-normal text-[12px]">
                  {form.score}% jusqu&apos;au prochain niveau
                </span>
              </div>
              <div className="relative">
                <div className="h-2 rounded-full overflow-hidden bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)]">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-[linear-gradient(90deg,var(--sc-blue-soft),var(--sc-blue),var(--sc-indigo))] shadow-[0_0_12px_rgba(37,99,235,0.45)]"
                    style={{ width: `${form.score}%` }}
                  />
                </div>
                <div className="grid grid-cols-5 mt-3 gap-1 text-[10.5px] font-semibold text-center">
                  {[
                    { label: "Petit Scarabée", reached: true, current: true },
                    { label: "Luciole", reached: false, current: false },
                    { label: "Renard", reached: false, current: false },
                    { label: "Hibou", reached: false, current: false },
                    { label: "Dragon", reached: false, current: false },
                  ].map((lv, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${lv.current ? "bg-[color:var(--sc-blue)] ring-4 ring-[color:var(--sc-blue)]/20" : lv.reached ? "bg-[color:var(--sc-success)]" : "bg-[color:var(--sc-border-strong)]" }`}
                      />
                      <span
                        className={lv.current ? "text-[color:var(--sc-blue)]" : "text-[color:var(--sc-text-muted)]"}
                      >
                        {lv.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prochain objectif */}
            <div className="rounded-xl p-4 border border-[color:var(--sc-border)] bg-[color:var(--sc-bg-soft)]/50">
              <div className="flex items-start gap-3">
                <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[color:var(--sc-surface)] border border-[color:var(--sc-blue)]/30 text-[color:var(--sc-blue)] shadow-[var(--sc-shadow-sm)]">
                  <Target className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--sc-text-muted)] mb-0.5">
                    Prochain objectif
                  </p>
                  <p className="text-sm font-semibold text-[color:var(--sc-text)] leading-snug">
                    Sécurise tes comptes &amp; ton Wi-Fi pour atteindre le niveau Luciole.
                  </p>
                  <p className="text-[12.5px] text-[color:var(--sc-text-2)] mt-1 leading-relaxed">
                    Termine le tutoriel{" "}
                    <span className="font-medium text-[color:var(--sc-blue)]">
                      Sécuriser son réseau Wi-Fi{" "}
                    </span>
                    pour gagner ~15&nbsp;points.
                  </p>
                </div>
                <ScButton
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => router.push("/tutoriels?niveau=intermediaire")}
                >
                  Reprendre
                  <ChevronRight className="w-3.5 h-3.5" />
                </ScButton>
              </div>
            </div>
          </AccountSectionCard>
        </div>

        {/* Comparaison anonymisée */}
        <AccountSectionCard
          icon={Users}
          title="Comparaison anonymisée"
          description="Repères motivants - pas de classement public."
        >
          <div className="space-y-3">
            <ComparePill
              tone="success"
              text="Ton score est dans le top 30 % des utilisateurs de ta tranche d'âge."
            />
            <ComparePill
              tone="info"
              text="Les profils similaires commencent souvent par sécuriser leurs comptes et leur Wi-Fi."
            />
            <ComparePill
              tone="info"
              text="42 % des utilisateurs SafeCheck ont déjà activé la double authentification."
            />
          </div>
          <p className="text-[11.5px] text-[color:var(--sc-text-muted)] mt-4 leading-relaxed">
            Données agrégées et anonymisées. Aucune donnée personnelle n&apos;est jamais partagée.
          </p>
        </AccountSectionCard>
      </div>

      {/* Badges */}
      <AccountSectionCard
        icon={Trophy}
        title="Tes badges débloqués"
        description="Chaque action sécurisée te rapproche du niveau supérieur."
        action={
          <ScButton
            variant="ghost"
            size="sm"
            onClick={() => router.push("/wip?feature=badges")}
          >
            Voir tous les badges
            <ChevronRight className="w-3.5 h-3.5" />
          </ScButton>
        }
      >
        <div className="flex gap-5 flex-wrap">
          {form.badges.map((badge, idx) => {
            const tones = [
              "bg-[linear-gradient(135deg,#3B82F6,#2563EB)]",
              "bg-[linear-gradient(135deg,#06B6D4,#0891B2)]",
              "bg-[linear-gradient(135deg,#6366F1,#4F46E5)]",
            ]
            return (
              <div key={badge.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[color:var(--sc-bg-soft)]/60 border border-[color:var(--sc-border)]">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-[color:var(--sc-surface)] shadow-[0_8px_18px_-6px_rgba(15,23,42,0.20)] ${tones[idx % tones.length]}`}
                  title={badge.desc}
                >
                  {badge.id}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[color:var(--sc-text)] leading-tight">{badge.label}</div>
                  <div className="text-[11.5px] text-[color:var(--sc-text-muted)]">{badge.desc}</div>
                </div>
              </div>
            )
          })}
          {/* Locked badges */}
          {[1, 2].map((n) => (
            <div key={`lock-${n}`} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[color:var(--sc-surface-2)]/50 border border-dashed border-[color:var(--sc-border-strong)]">
              <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] text-[color:var(--sc-text-muted)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[color:var(--sc-text-muted)] leading-tight">À débloquer</div>
                <div className="text-[11.5px] text-[color:var(--sc-text-muted)]">Continue ta progression</div>
              </div>
            </div>
          ))}
        </div>
      </AccountSectionCard>
    </div>
  )
}

function ComparePill({ tone, text }: { tone: "info" | "success"; text: string }) {
  const palette =
    tone === "success"
      ? "bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.30)] text-[color:var(--sc-text)] dark:bg-[rgba(16,185,129,0.12)] dark:border-[rgba(16,185,129,0.32)]"
      : "bg-[color:var(--sc-bg-soft)] border-[color:var(--sc-border)] text-[color:var(--sc-text)]"
  const dot = tone === "success" ? "bg-[color:var(--sc-success)]" : "bg-[color:var(--sc-blue)]"
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 ${palette}`}>
      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <p className="text-[13px] leading-relaxed">{text}</p>
    </div>
  )
}
