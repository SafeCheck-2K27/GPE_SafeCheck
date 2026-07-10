"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { ScButton, ScBadge } from "@/components/safecheck/primitives"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { mockUser, mockAudits, mockTutos, mockGuides } from "@/lib/account-data"
import type { AuditStatus } from "@/lib/account-data"
import { Camera, Edit2, Lock, AlertTriangle, Check, Trash2, LayoutDashboard, History as HistoryIcon, ShieldCheck, GraduationCap, Settings, Bell, FileDown, TrendingUp, Users, Sparkles, PlayCircle, CheckCircle2, Clock, Sun, Moon, Languages, ChevronRight, Trophy, Target, BookOpen } from "lucide-react"


type TabId = "dashboard" | "historique" | "profil" | "preferences"

/* Page */
export default function MonComptePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const auth = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>("dashboard")
  const [editMode, setEditMode] = useState(false)
  // Seed the form with the mock data, but overlay the live session info
  // (pseudo/email/etc.) so what's displayed reflects the real logged-in user.
  const [form, setForm] = useState({
    ...mockUser,
    ...(auth.user
      ? {
          pseudo: auth.user.pseudo || mockUser.pseudo,
          email: auth.user.email || mockUser.email,
          prenom: auth.user.prenom || mockUser.prenom,
          nom: auth.user.nom || mockUser.nom,
          pays: auth.user.pays || mockUser.pays,
          age: auth.user.age || mockUser.age,
        }
      : {}),
  })
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // If the user lands here without a session (e.g. opened the URL directly,
  // or has logged out in another tab), bounce them back to the public home.
  useEffect(() => {
    if (auth.isHydrated && !auth.isLoggedIn) {
      router.replace("/")
    }
  }, [auth.isHydrated, auth.isLoggedIn, router])

  // Re-sync the form when auth.user becomes available after hydration.
  useEffect(() => {
    if (!auth.user) return
    const user = auth.user
    queueMicrotask(() => {
      setForm((prev) => ({
        ...prev,
        pseudo: user.pseudo || prev.pseudo,
        email: user.email || prev.email,
        prenom: user.prenom || prev.prenom,
        nom: user.nom || prev.nom,
        pays: user.pays || prev.pays,
        age: user.age || prev.age,
      }))
    })
  }, [auth.user])

  // Notification preferences (local state, mock)
  const [notifs, setNotifs] = useState({
    alertesSecurite: true,
    actualitesCyber: true,
    progressionRappels: false,
    nouveautesProduit: true,
    emailHebdo: false,
  })

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "historique", label: "Historique & activité", icon: HistoryIcon },
    { id: "profil", label: "Profil & sécurité", icon: ShieldCheck },
    { id: "preferences", label: "Préférences", icon: Settings },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--sc-bg)] font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">
        {/* Bandeau hero - identité + niveau */}
        <div className="relative overflow-hidden rounded-2xl border border-[color:var(--sc-border)] sc-mesh-soft p-6 md:p-8 mb-6">
          <div className="pointer-events-none absolute inset-0 sc-dot-texture opacity-50" aria-hidden />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            {/* Avatar */}
            <div className="flex items-center gap-5 shrink-0">
              <div className="relative">
                <div className="absolute inset-0 -m-3 rounded-full sc-halo opacity-50 sc-pulse-soft pointer-events-none" aria-hidden />
                <div className="relative w-24 h-24 rounded-full p-[3px] bg-[linear-gradient(135deg,#3B82F6,#6366F1_50%,#06B6D4)] shadow-[0_18px_40px_-14px_rgba(37,99,235,0.50)]">
                  <div className="w-full h-full rounded-full sc-avatar-gradient flex items-center justify-center text-white font-display text-3xl font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.30)]">
                    {form.pseudo[0]}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/wip?feature=avatar")}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] border-2 border-[color:var(--sc-surface)] shadow-[0_6px_14px_-4px_rgba(37,99,235,0.55)] hover:scale-105 transition-transform cursor-pointer"
                  aria-label="Changer la photo de profil"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="md:hidden">
                <h1 className="font-display text-xl font-bold text-[color:var(--sc-text)] tracking-tight">{form.pseudo}</h1>
                <p className="text-sm text-[color:var(--sc-text-muted)]">{form.email}</p>
              </div>
            </div>

            {/* Identité + niveau */}
            <div className="flex-1 min-w-0">
              <div className="hidden md:flex items-baseline gap-3 flex-wrap mb-1">
                <h1 className="font-display text-2xl font-bold text-[color:var(--sc-text)] tracking-tight">{form.pseudo}</h1>
                <span className="text-sm text-[color:var(--sc-text-muted)]">{form.prenom} {form.nom} · {form.email}</span>
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

              {/* Progression bar */}
              <div className="max-w-md">
                <div className="flex items-center justify-between text-[11.5px] mb-1.5">
                  <span className="text-[color:var(--sc-text-2)] font-medium">Progression vers Luciole</span>
                  <span className="font-bold text-[color:var(--sc-blue)] tabular-nums">{form.score}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)]">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-[linear-gradient(90deg,var(--sc-blue-soft),var(--sc-blue),var(--sc-indigo))] shadow-[0_0_12px_rgba(37,99,235,0.45)]"
                    style={{ width: `${form.score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 shrink-0">
              <StatPill icon={ShieldCheck} value="1" label="Audit" />
              <StatPill icon={GraduationCap} value="3" label="Tutos" />
              <StatPill icon={Trophy} value={String(form.badges.length)} label="Badges" />
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mb-6 sticky top-16 z-30 -mx-4 md:mx-0 px-4 md:px-0">
          <div className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[color:var(--sc-surface)]/70 shadow-[var(--sc-shadow-sm)] p-1 flex items-center gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon
              const active = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${active ? "bg-[linear-gradient(180deg,var(--sc-blue-soft),var(--sc-blue))] text-white shadow-[var(--sc-shadow-blue-sm)]" : "text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)] hover:bg-[color:var(--sc-bg-soft)]" }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Panels */}
        {activeTab === "dashboard" && (
          <DashboardPanel form={form} />
        )}

        {activeTab === "historique" && (
          <HistoriquePanel />
        )}

        {activeTab === "profil" && (
          <ProfilPanel
            form={form}
            setForm={setForm}
            editMode={editMode}
            setEditMode={setEditMode}
            showPasswordChange={showPasswordChange}
            setShowPasswordChange={setShowPasswordChange}
            onDeleteRequest={() => setShowDeleteConfirm(true)}
          />
        )}

        {activeTab === "preferences" && (
          <PreferencesPanel
            theme={theme}
            setTheme={setTheme}
            notifs={notifs}
            setNotifs={setNotifs}
            langue={form.langue}
          />
        )}
      </main>

      <Footer />

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--sc-text)]/40 backdrop-blur-sm px-4"
          onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="w-full max-w-sm rounded-2xl p-6 sc-fade-in bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[rgba(239,68,68,0.12)] text-[color:var(--sc-danger)]">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <h2 className="font-display font-semibold text-base text-[color:var(--sc-text)]">Confirmer la suppression</h2>
            </div>
            <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed mb-5">
              Es-tu vraiment sûr·e de vouloir supprimer ton compte&nbsp;? Cette action est irréversible et tu perdras toute ta progression.
            </p>
            <div className="flex gap-3">
              <ScButton
                variant="danger"
                size="md"
                onClick={() => {
                  auth.logout()
                  router.push("/")
                }}
                className="flex-1"
              >
                Oui, supprimer
              </ScButton>
              <ScButton variant="secondary" size="md" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                Annuler
              </ScButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* Reusable pieces */
function StatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
}) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-2.5 rounded-xl bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-sm)] min-w-[68px]">
      <Icon className="w-4 h-4 text-[color:var(--sc-blue)] mb-1" />
      <span className="font-display font-bold text-base text-[color:var(--sc-text)] leading-none tabular-nums">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-[color:var(--sc-text-muted)] mt-0.5">{label}</span>
    </div>
  )
}

function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
}: {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl overflow-hidden border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-sm)]">
      <header className="flex items-start justify-between gap-4 px-5 md:px-6 py-4 bg-[color:var(--sc-bg-soft)] border-b border-[color:var(--sc-border)]">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] text-white shadow-[var(--sc-shadow-blue-sm)]">
              <Icon className="w-4 h-4" />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="font-display font-bold text-[15px] text-[color:var(--sc-text)] tracking-tight">{title}</h3>
            {description && (
              <p className="text-[12.5px] text-[color:var(--sc-text-muted)] mt-0.5 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  )
}

/* Dashboard panel */
function DashboardPanel({ form }: { form: typeof mockUser }) {
  const router = useRouter()
  return (
    <div className="grid gap-6 sc-fade-in">
      {/* Top row : progression + comparaison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progression détaillée */}
        <div className="lg:col-span-2">
          <SectionCard
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
                    Termine le tutoriel <span className="font-medium text-[color:var(--sc-blue)]">Sécuriser son réseau Wi-Fi</span> pour gagner ~15&nbsp;points.
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
          </SectionCard>
        </div>

        {/* Comparaison anonymisée */}
        <SectionCard
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
        </SectionCard>
      </div>

      {/* Badges */}
      <SectionCard
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
      </SectionCard>
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

/* Historique panel */
function HistoriquePanel() {
  const router = useRouter()
  const auditsCommences = mockAudits.filter((a) => a.status === "en-cours")
  const auditsTermines = mockAudits.filter((a) => a.status === "termine")
  const auditsDispo = mockAudits.filter((a) => a.status === "disponible")
  const tutosTermines = mockTutos.filter((t) => t.status === "termine")
  const tutosEnCours = mockTutos.filter((t) => t.status === "en-cours")

  return (
    <div className="grid gap-6 sc-fade-in">
      {/* Résumé activité + export PDF */}
      <SectionCard
        icon={HistoryIcon}
        title="Mémoire d'usage"
        description="Tout ton parcours SafeCheck en un coup d'œil. Exportable à tout moment."
        action={
          <ScButton
            variant="primary"
            size="sm"
            onClick={() => router.push("/wip?feature=export-pdf")}
          >
            <FileDown className="w-3.5 h-3.5" />
            Exporter en PDF
          </ScButton>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryTile icon={CheckCircle2} value={String(auditsTermines.length)} label="Audits terminés" tone="success" />
          <SummaryTile icon={PlayCircle} value={String(auditsCommences.length)} label="Audits en cours" tone="info" />
          <SummaryTile icon={GraduationCap} value={String(tutosTermines.length)} label="Tutos réalisés" tone="info" />
          <SummaryTile icon={BookOpen} value={String(mockGuides.length)} label="Guides consultés" tone="muted" />
        </div>
      </SectionCard>

      {/* Audits */}
      <SectionCard
        icon={ShieldCheck}
        title="Mes audits"
        description="Audits commencés, terminés ou disponibles. Reprends là où tu t'es arrêté."
        action={
          <ScButton
            variant="ghost"
            size="sm"
            onClick={() => router.push("/wip?feature=export-pdf")}
          >
            <FileDown className="w-3.5 h-3.5" />
            Export
          </ScButton>
        }
      >
        <div className="space-y-2.5">
          {/* En cours en premier */}
          {auditsCommences.map((a) => (
            <AuditRow key={a.id} audit={a} />
          ))}
          {auditsTermines.map((a) => (
            <AuditRow key={a.id} audit={a} />
          ))}
          {auditsDispo.map((a) => (
            <AuditRow key={a.id} audit={a} />
          ))}
        </div>
      </SectionCard>

      {/* Tutos réalisés */}
      <SectionCard
        icon={GraduationCap}
        title="Tutos techniques réalisés"
        description="Liste détaillée avec catégorie, durée et difficulté."
        action={
          <ScButton
            variant="ghost"
            size="sm"
            onClick={() => router.push("/wip?feature=export-pdf")}
          >
            <FileDown className="w-3.5 h-3.5" />
            Export
          </ScButton>
        }
      >
        <div className="space-y-2.5">
          {[...tutosEnCours, ...tutosTermines].map((t) => (
            <TutoRow key={t.id} tuto={t} />
          ))}
        </div>
      </SectionCard>

      {/* Guides / essentiels consultés */}
      <SectionCard
        icon={BookOpen}
        title="Guides &amp; essentiels consultés"
        description="Les ressources que tu as déjà parcourues."
      >
        <ul className="divide-y divide-[color:var(--sc-border)]">
          {mockGuides.map((g) => (
            <li key={g.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3 min-w-0">
                <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)] border border-[color:var(--sc-border)]">
                  <BookOpen className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[color:var(--sc-text)] leading-tight truncate">{g.titre}</p>
                  <p className="text-[12px] text-[color:var(--sc-text-muted)] mt-0.5 flex items-center gap-2">
                    <ScBadge tone="muted" className="!py-0.5 !text-[10.5px]">{g.categorie}</ScBadge>
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{g.date}</span>
                  </p>
                </div>
              </div>
              <ScButton
                variant="ghost"
                size="sm"
                onClick={() => router.push("/essentiels")}
              >
                Relire
                <ChevronRight className="w-3.5 h-3.5" />
              </ScButton>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}

function SummaryTile({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  tone: "success" | "info" | "muted"
}) {
  const palette: Record<string, string> = {
    success:
      "bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.25)] text-[color:var(--sc-success)] " +
      "dark:bg-[rgba(16,185,129,0.12)] dark:border-[rgba(16,185,129,0.30)] dark:text-[#6EE7B7]",
    info:
      "bg-[color:var(--sc-bg-soft)] border-[color:var(--sc-border)] text-[color:var(--sc-blue)]",
    muted:
      "bg-[color:var(--sc-surface-2)]/60 border-[color:var(--sc-border)] text-[color:var(--sc-text-2)]",
  }
  return (
    <div className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-4 shadow-[var(--sc-shadow-sm)]">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${palette[tone]} mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="font-display font-bold text-2xl text-[color:var(--sc-text)] leading-none tabular-nums">{value}</div>
      <div className="text-[12px] text-[color:var(--sc-text-muted)] mt-1">{label}</div>
    </div>
  )
}

function AuditRow({ audit }: { audit: typeof mockAudits[number] }) {
  const router = useRouter()
  const statusMeta: Record<AuditStatus, { label: string; tone: "success" | "info" | "muted"; icon: React.ComponentType<{ className?: string }> }> = {
    "termine": { label: "Terminé", tone: "success", icon: CheckCircle2 },
    "en-cours": { label: "En cours", tone: "info", icon: PlayCircle },
    "disponible": { label: "Disponible", tone: "muted", icon: Sparkles },
  }
  const meta = statusMeta[audit.status]
  const StatusIcon = meta.icon

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-3.5 hover:border-[color:var(--sc-border-strong)] hover:shadow-[var(--sc-shadow-sm)] transition-all">
      <div className="flex items-start gap-3 min-w-0">
        <span className={`shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg ${audit.status === "termine" ? "bg-[rgba(16,185,129,0.10)] text-[color:var(--sc-success)] border border-[rgba(16,185,129,0.25)] dark:bg-[rgba(16,185,129,0.14)] dark:text-[#6EE7B7] dark:border-[rgba(16,185,129,0.32)]" : audit.status === "en-cours" ? "bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)] border border-[color:var(--sc-border)]" : "bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-muted)] border border-[color:var(--sc-border)]" }`}
        >
          <StatusIcon className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[color:var(--sc-text)] leading-tight">{audit.nom}</p>
            <ScBadge tone={meta.tone}>{meta.label}</ScBadge>
            {audit.score !== undefined && <ScBadge tone="info">Score {audit.score}/100</ScBadge>}
          </div>
          <p className="text-[12px] text-[color:var(--sc-text-muted)] mt-0.5 flex items-center gap-3 flex-wrap">
            <span>{audit.type}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{audit.duree}</span>
            {audit.date && audit.date !== "-" && (
              <>
                <span aria-hidden>·</span>
                <span>{audit.date}</span>
              </>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {audit.status === "termine" && (
          <>
            <ScButton
              variant="ghost"
              size="sm"
              onClick={() => router.push("/wip?feature=export-pdf")}
            >
              <FileDown className="w-3.5 h-3.5" /> PDF
            </ScButton>
            <ScButton
              variant="secondary"
              size="sm"
              onClick={() => router.push("/resultats")}
            >
              Revoir
            </ScButton>
          </>
        )}
        {audit.status === "en-cours" && (
          <ScButton
            variant="primary"
            size="sm"
            onClick={() => router.push("/audit")}
          >
            Reprendre
            <ChevronRight className="w-3.5 h-3.5" />
          </ScButton>
        )}
        {audit.status === "disponible" && (
          <ScButton
            variant="ghost"
            size="sm"
            onClick={() => router.push("/audits")}
          >
            Commencer
            <ChevronRight className="w-3.5 h-3.5" />
          </ScButton>
        )}
      </div>
    </div>
  )
}

function TutoRow({ tuto }: { tuto: typeof mockTutos[number] }) {
  const router = useRouter()
  const Icon = tuto.icon
  const isDone = tuto.status === "termine"
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-3.5 hover:border-[color:var(--sc-border-strong)] hover:shadow-[var(--sc-shadow-sm)] transition-all">
      <div className="flex items-start gap-3 min-w-0">
        <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)] border border-[color:var(--sc-border)]">
          <Icon className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[color:var(--sc-text)] leading-tight">{tuto.nom}</p>
            <ScBadge tone={isDone ? "success" : "info"}>
              {isDone ? "Réalisé" : "En cours"}
            </ScBadge>
          </div>
          <p className="text-[12px] text-[color:var(--sc-text-muted)] mt-0.5 flex items-center gap-3 flex-wrap">
            <ScBadge tone="muted" className="!py-0.5 !text-[10.5px]">{tuto.categorie}</ScBadge>
            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{tuto.duree}</span>
            <span aria-hidden>·</span>
            <span>{tuto.difficulte}</span>
            {isDone && (
              <>
                <span aria-hidden>·</span>
                <span>{tuto.date}</span>
              </>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isDone ? (
          <>
            <ScButton
              variant="ghost"
              size="sm"
              onClick={() => router.push("/wip?feature=export-pdf")}
            >
              <FileDown className="w-3.5 h-3.5" /> PDF
            </ScButton>
            <ScButton
              variant="secondary"
              size="sm"
              onClick={() => router.push("/tutoriels")}
            >
              Revoir
            </ScButton>
          </>
        ) : (
          <ScButton
            variant="primary"
            size="sm"
            onClick={() => router.push("/tutoriels")}
          >
            Reprendre
            <ChevronRight className="w-3.5 h-3.5" />
          </ScButton>
        )}
      </div>
    </div>
  )
}

/* Profil panel - informations + mot de passe + suppression */
function ProfilPanel({
  form,
  setForm,
  editMode,
  setEditMode,
  showPasswordChange,
  setShowPasswordChange,
  onDeleteRequest,
}: {
  form: typeof mockUser
  setForm: React.Dispatch<React.SetStateAction<typeof mockUser>>
  editMode: boolean
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>
  showPasswordChange: boolean
  setShowPasswordChange: React.Dispatch<React.SetStateAction<boolean>>
  onDeleteRequest: () => void
}) {
  return (
    <div className="grid gap-6 sc-fade-in">
      <SectionCard
        icon={Edit2}
        title="Informations personnelles"
        description="Ces informations restent privées et ne sont jamais partagées."
        action={
          !editMode ? (
            <ScButton variant="primary" size="sm" onClick={() => setEditMode(true)}>
              <Edit2 className="w-3.5 h-3.5" />
              Modifier
            </ScButton>
          ) : (
            <div className="flex gap-2">
              <ScButton variant="primary" size="sm" onClick={() => setEditMode(false)}>
                <Check className="w-3.5 h-3.5" /> Sauvegarder
              </ScButton>
              <ScButton variant="secondary" size="sm" onClick={() => setEditMode(false)}>
                Annuler
              </ScButton>
            </div>
          )
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {[
            { label: "Nom de famille", value: form.nom, field: "nom" },
            { label: "Profession", value: form.profession, field: "profession" },
            { label: "Prénom", value: form.prenom, field: "prenom" },
            { label: "Langue", value: form.langue, field: "langue" },
            { label: "Email", value: form.email, field: "email" },
            { label: "Pays", value: form.pays, field: "pays" },
            { label: "Âge", value: form.age, field: "age" },
            { label: "Mot de passe", value: form.motDePasse, field: "motDePasse" },
          ].map((item) => (
            <div key={item.field} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--sc-text-muted)]">
                {item.label}
              </label>
              {editMode && item.field !== "motDePasse" ? (
                <input
                  type="text"
                  value={(form as unknown as Record<string, string>)[item.field]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [item.field]: e.target.value }))}
                  className="sc-input px-3 py-2 text-sm"
                />
              ) : (
                <span className="text-sm text-[color:var(--sc-text)] py-2">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        icon={Lock}
        title="Sécurité du compte"
        description="Mets à jour ton mot de passe régulièrement pour renforcer ta sécurité."
        action={
          !showPasswordChange && (
            <ScButton variant="primary" size="sm" onClick={() => setShowPasswordChange(true)}>
              Changer de mot de passe
            </ScButton>
          )
        }
      >
        {showPasswordChange ? (
          <div className="flex flex-col gap-2.5 max-w-md">
            <input type="password" placeholder="Mot de passe actuel" className="sc-input px-3 py-2.5 text-sm" />
            <input type="password" placeholder="Nouveau mot de passe" className="sc-input px-3 py-2.5 text-sm" />
            <input type="password" placeholder="Confirmer le nouveau mot de passe" className="sc-input px-3 py-2.5 text-sm" />
            <div className="flex gap-2 mt-1">
              <ScButton variant="primary" size="sm" onClick={() => setShowPasswordChange(false)}>
                <Check className="w-3.5 h-3.5" /> Confirmer
              </ScButton>
              <ScButton variant="secondary" size="sm" onClick={() => setShowPasswordChange(false)}>Annuler</ScButton>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
            Ton mot de passe a été modifié pour la dernière fois il y a <span className="font-semibold text-[color:var(--sc-text)]">3 mois</span>. Pense à le renouveler régulièrement.
          </p>
        )}
      </SectionCard>

      <section className="rounded-2xl overflow-hidden border border-[color:var(--sc-danger)]/30 bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-sm)]">
        <header className="flex items-start justify-between gap-4 px-5 md:px-6 py-4 bg-[rgba(239,68,68,0.06)] border-b border-[color:var(--sc-danger)]/20">
          <div className="flex items-start gap-3">
            <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[rgba(239,68,68,0.12)] text-[color:var(--sc-danger)] border border-[color:var(--sc-danger)]/25">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display font-bold text-[15px] text-[color:var(--sc-danger)] tracking-tight">Zone dangereuse</h3>
              <p className="text-[12.5px] text-[color:var(--sc-text-muted)] mt-0.5">Cette action est irréversible.</p>
            </div>
          </div>
          <ScButton variant="danger" size="sm" onClick={onDeleteRequest}>
            <Trash2 className="w-3.5 h-3.5" /> Supprimer mon compte
          </ScButton>
        </header>
        <div className="p-5 md:p-6">
          <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
            En supprimant ton compte, toutes tes données, badges, audits et progression seront définitivement effacés. Tu peux également exporter tes données avant suppression depuis l&apos;onglet Historique &amp; activité.
          </p>
        </div>
      </section>
    </div>
  )
}

/* Préférences panel - thème + langue + notifications */
type NotifPrefs = {
  alertesSecurite: boolean
  actualitesCyber: boolean
  progressionRappels: boolean
  nouveautesProduit: boolean
  emailHebdo: boolean
}

function PreferencesPanel({
  theme,
  setTheme,
  notifs,
  setNotifs,
  langue,
}: {
  theme: string | undefined
  setTheme: (t: string) => void
  notifs: NotifPrefs
  setNotifs: React.Dispatch<React.SetStateAction<NotifPrefs>>
  langue: string
}) {
  const router = useRouter()
  const isDark = theme === "dark"
  const isLight = theme === "light"

  return (
    <div className="grid gap-6 sc-fade-in">
      {/* Apparence */}
      <SectionCard
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
      </SectionCard>

      {/* Langue */}
      <SectionCard
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
      </SectionCard>

      {/* Notifications */}
      <SectionCard
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
      </SectionCard>

      {/* Export complet */}
      <SectionCard
        icon={FileDown}
        title="Export de tes données"
        description="Récupère un récap complet de ton activité, à conserver hors ligne."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ExportTile title="Historique complet" desc="Audits, tutos, guides - tout ton parcours." />
          <ExportTile title="Résumé de progression" desc="Niveau, score, badges, prochains objectifs." />
          <ExportTile title="Tutos réalisés" desc="Récap PDF de chaque tuto suivi." />
        </div>
      </SectionCard>
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
  icon: React.ComponentType<{ className?: string }>
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
          className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${active ? "bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] text-white shadow-[var(--sc-shadow-blue-sm)]" : "bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)] border border-[color:var(--sc-border)]" }`}
        >
          <Icon className="w-4 h-4" />
        </span>
        <span className="font-semibold text-[color:var(--sc-text)]">{label}</span>
        {active && (
          <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full bg-[color:var(--sc-blue)] text-white">
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
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(15,23,42,0.20)] transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0.5"}`}
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
