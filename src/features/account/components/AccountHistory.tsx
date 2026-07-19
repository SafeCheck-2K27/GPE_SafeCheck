"use client"

import type { ComponentType } from "react"
import { useRouter } from "next/navigation"
import { ScBadge, ScButton, ScCard } from "@/components/safecheck/primitives"
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileDown,
  GraduationCap,
  History as HistoryIcon,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import {
  mockAudits,
  mockGuides,
  mockTutos,
} from "@/lib/account-data"
import type { AuditStatus } from "@/lib/account-data"
import { AccountSectionCard } from "./AccountSectionCard"

export function AccountHistory() {
  const router = useRouter()
  const auditsCommences = mockAudits.filter((a) => a.status === "en-cours")
  const auditsTermines = mockAudits.filter((a) => a.status === "termine")
  const auditsDispo = mockAudits.filter((a) => a.status === "disponible")
  const tutosTermines = mockTutos.filter((t) => t.status === "termine")
  const tutosEnCours = mockTutos.filter((t) => t.status === "en-cours")

  return (
    <div className="grid gap-6 sc-fade-in">
      {/* Résumé activité + export PDF */}
      <AccountSectionCard
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
      </AccountSectionCard>

      {/* Audits */}
      <AccountSectionCard
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
      </AccountSectionCard>

      {/* Tutos réalisés */}
      <AccountSectionCard
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
      </AccountSectionCard>

      {/* Guides / essentiels consultés */}
      <AccountSectionCard
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
      </AccountSectionCard>
    </div>
  )
}

function SummaryTile({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: ComponentType<{ className?: string }>
  value: string
  label: string
  tone: "success" | "info" | "muted"
}) {
  const palette: Record<string, string> = {
    success:
      "bg-[rgb(var(--sc-success-rgb)/0.08)] border-[rgb(var(--sc-success-rgb)/0.25)] text-[color:var(--sc-success)] " +
      "dark:bg-[rgb(var(--sc-success-rgb)/0.12)] dark:border-[rgb(var(--sc-success-rgb)/0.30)] dark:text-[color:var(--sc-success-text)]",
    info:
      "bg-[color:var(--sc-bg-soft)] border-[color:var(--sc-border)] text-[color:var(--sc-blue)]",
    muted:
      "bg-[color:var(--sc-surface-2)]/60 border-[color:var(--sc-border)] text-[color:var(--sc-text-2)]",
  }
  return (
    <ScCard className="p-4">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${palette[tone]} mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="font-display font-bold text-2xl text-[color:var(--sc-text)] leading-none tabular-nums">{value}</div>
      <div className="text-[12px] text-[color:var(--sc-text-muted)] mt-1">{label}</div>
    </ScCard>
  )
}

function AuditRow({ audit }: { audit: typeof mockAudits[number] }) {
  const router = useRouter()
  const statusMeta: Record<
    AuditStatus,
    {
      label: string
      tone: "success" | "info" | "muted"
      icon: ComponentType<{ className?: string }>
    }
  > = {
    "termine": { label: "Terminé", tone: "success", icon: CheckCircle2 },
    "en-cours": { label: "En cours", tone: "info", icon: PlayCircle },
    "disponible": { label: "Disponible", tone: "muted", icon: Sparkles },
  }
  const meta = statusMeta[audit.status]
  const StatusIcon = meta.icon

  return (
    <ScCard className="flex items-center justify-between gap-4 p-3.5 shadow-none hover:border-[color:var(--sc-border-strong)] hover:shadow-[var(--sc-shadow-sm)] transition-all">
      <div className="flex items-start gap-3 min-w-0">
        <span className={`shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg ${audit.status === "termine" ? "bg-[rgb(var(--sc-success-rgb)/0.10)] text-[color:var(--sc-success)] border border-[rgb(var(--sc-success-rgb)/0.25)] dark:bg-[rgb(var(--sc-success-rgb)/0.14)] dark:text-[color:var(--sc-success-text)] dark:border-[rgb(var(--sc-success-rgb)/0.32)]" : audit.status === "en-cours" ? "bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)] border border-[color:var(--sc-border)]" : "bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-muted)] border border-[color:var(--sc-border)]" }`}
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
    </ScCard>
  )
}

function TutoRow({ tuto }: { tuto: typeof mockTutos[number] }) {
  const router = useRouter()
  const Icon = tuto.icon
  const isDone = tuto.status === "termine"
  return (
    <ScCard className="flex items-center justify-between gap-4 p-3.5 shadow-none hover:border-[color:var(--sc-border-strong)] hover:shadow-[var(--sc-shadow-sm)] transition-all">
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
    </ScCard>
  )
}
