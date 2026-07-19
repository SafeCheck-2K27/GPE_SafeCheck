import type { ReactNode } from "react"
import {
  Activity,
  ArrowRight,
  Compass,
  Eye,
  ListChecks,
  Lock,
  Shield,
  Target,
} from "lucide-react"
import { ScBadge, ScButton } from "@/components/safecheck/primitives"

const finalHaloClassName =
  "pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[600px] h-[400px] sc-halo opacity-60"

const finalIconClassName =
  "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] mb-5"

const finalTitleClassName =
  "font-display text-3xl md:text-4xl font-bold text-[color:var(--sc-text)] mb-4 text-balance"

const finalCopyClassName =
  "text-base text-[color:var(--sc-text-2)] mb-8 max-w-xl mx-auto text-pretty"

const valueCardClassName =
  "group relative rounded-[18px] p-6 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[color:var(--sc-blue)]/40 hover:shadow-[0_20px_40px_-16px_rgb(var(--sc-blue-rgb)/0.25),0_8px_16px_-8px_rgb(var(--sc-ink-rgb)/0.10)] shadow-[0_2px_6px_-2px_rgb(var(--sc-ink-rgb)/0.06)] sc-fade-in"

const valueIconClassName =
  "w-11 h-11 rounded-xl flex items-center justify-center mb-4 text-[color:var(--sc-text-on-strong)] bg-[linear-gradient(135deg,var(--sc-blue-soft)_0%,var(--sc-blue)_60%,var(--sc-indigo)_100%)] shadow-[0_8px_18px_-6px_rgb(var(--sc-blue-rgb)/0.55)] group-hover:scale-105 transition-transform"

const reassureIconClassName =
  "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] text-[color:var(--sc-blue)]"

export function AuditBenefitsSection() {
  return (
    <section className="relative bg-[color:var(--sc-surface)] border-y border-[color:var(--sc-border)]">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <ScBadge tone="muted" className="mb-4">
            <Target className="w-3 h-3" />
            Pourquoi commencer par un audit
          </ScBadge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[color:var(--sc-text)] mb-3 text-balance">
            Quelques minutes pour un parcours{" "}
            <span className="sc-gradient-text">vraiment adapté</span>.
          </h2>
          <p className="text-base text-[color:var(--sc-text-2)] text-pretty">
            SafeCheck commence par comprendre votre niveau, votre contexte et vos usages.
            Tout le reste de la plateforme s&apos;adapte ensuite à vous, pas l&apos;inverse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ValueCard
            index={0}
            icon={<Target className="w-5 h-5" />}
            title="Comprendre votre profil"
            text="Néophyte, intermédiaire ou avancé ? L'audit identifie votre niveau réel pour ne pas vous perdre."
          />
          <ValueCard
            index={1}
            icon={<Compass className="w-5 h-5" />}
            title="Suivre le bon parcours"
            text="Tutoriels, essentiels, recommandations : tout est priorisé selon vos besoins, pas dans le désordre."
          />
          <ValueCard
            index={2}
            icon={<ListChecks className="w-5 h-5" />}
            title="Passer à l'action"
            text="Pas seulement de la théorie : un plan d'action clair, étape par étape, avec un suivi de progression."
          />
        </div>
      </div>
    </section>
  )
}

export function ReassuranceBand() {
  return (
    <section className="bg-[color:var(--sc-bg-soft)]">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <ReassureItem
          icon={<Shield className="w-5 h-5" />}
          title="Pédagogique avant tout"
          text="Pas de jargon inutile. Des explications claires, à votre rythme."
        />
        <ReassureItem
          icon={<Lock className="w-5 h-5" />}
          title="Confidentiel"
          text="Aucune donnée personnelle requise pour démarrer l'audit. Compte facultatif."
        />
        <ReassureItem
          icon={<Activity className="w-5 h-5" />}
          title="Évolutif"
          text="Refaites l'audit régulièrement pour mesurer vos progrès et ajuster vos priorités."
        />
      </div>
    </section>
  )
}

export function PreHomeFinalCta({
  onStartAudit,
  onExplore,
}: {
  onStartAudit: () => void
  onExplore: () => void
}) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--sc-surface)]">
      <div className={finalHaloClassName} aria-hidden />
      <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
        <div className={finalIconClassName}>
          <Eye className="w-5 h-5 text-[color:var(--sc-blue)]" />
        </div>
        <h2 className={finalTitleClassName}>Prêt·e à voir où vous en êtes&nbsp;?</h2>
        <p className={finalCopyClassName}>
          Démarrez par l&apos;audit de qualification - c&apos;est rapide, gratuit, et c&apos;est la
          meilleure manière de tirer parti de SafeCheck.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <ScButton variant="primary" size="lg" onClick={onStartAudit}>
            Commencer l&apos;audit de qualification
            <ArrowRight className="w-4 h-4" />
          </ScButton>
          <ScButton variant="secondary" size="lg" onClick={onExplore}>
            Découvrir la plateforme
          </ScButton>
        </div>
      </div>
    </section>
  )
}

function ValueCard({
  icon,
  title,
  text,
  index,
}: {
  icon: ReactNode
  title: string
  text: string
  index: number
}) {
  return (
    <div className={valueCardClassName} style={{ animationDelay: `${index * 90}ms` }}>
      <span
        className="absolute inset-x-6 top-0 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(var(--sc-blue-rgb)/0.7), rgb(var(--sc-indigo-rgb)/0.7), transparent)",
        }}
        aria-hidden
      />
      <div className={valueIconClassName}>{icon}</div>
      <h3 className="font-display font-semibold text-lg text-[color:var(--sc-text)] mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">{text}</p>
    </div>
  )
}

function ReassureItem({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={reassureIconClassName}>{icon}</div>
      <div>
        <h3 className="font-semibold text-sm text-[color:var(--sc-text)] mb-0.5">{title}</h3>
        <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
