import type { CSSProperties, ReactNode } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Fingerprint,
  KeyRound,
  Lock,
  Shield,
  Sparkles,
  Wifi,
} from "lucide-react"
import { ScBadge, ScButton } from "@/components/safecheck/primitives"

const heroLeftGlowClassName =
  "pointer-events-none absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full sc-pulse-soft"

const heroRightGlowClassName =
  "pointer-events-none absolute -bottom-40 -right-20 w-[520px] h-[520px] rounded-full sc-pulse-soft"

const heroGridClassName =
  "relative max-w-6xl mx-auto px-4 py-16 md:py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center"

const heroTitleClassName =
  "font-display text-4xl md:text-6xl lg:text-[68px] font-bold tracking-tight text-[color:var(--sc-text)] mt-5 mb-5 text-balance leading-[1.04] sc-fade-in-delay-1"

const heroCopyClassName =
  "text-base md:text-lg text-[color:var(--sc-text-2)] leading-relaxed mb-8 max-w-xl text-pretty sc-fade-in-delay-2"

const heroBulletsClassName =
  "mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[color:var(--sc-text-muted)] sc-fade-in-delay-4"

const heroVisualFrameClassName =
  "relative h-[420px] md:h-[480px] lg:h-[520px] flex items-center justify-center"

const orbitRingOuterClassName =
  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-dashed border-[color:var(--sc-blue)]/30"

const orbitRingInnerClassName =
  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-[color:var(--sc-blue)]/15"

const shieldGlassCardClassName =
  "relative w-[200px] h-[200px] md:w-[220px] md:h-[220px] rounded-[28px] sc-glass flex items-center justify-center"

const shieldCoreClassName =
  "w-[110px] h-[110px] md:w-[120px] md:h-[120px] rounded-2xl flex items-center justify-center shadow-[0_20px_40px_-12px_rgb(var(--sc-blue-rgb)/0.55),inset_0_1px_0_rgb(var(--sc-white-rgb)/0.35)]"

const verifiedPillClassName =
  "absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold text-[color:var(--sc-text-on-strong)] bg-[linear-gradient(135deg,var(--sc-success),var(--sc-success-strong))] shadow-[0_8px_18px_-6px_rgb(var(--sc-success-rgb)/0.55)]"

const floatingIconShellClassName =
  "flex items-center gap-2 pl-2 pr-3 py-2 rounded-full sc-glass border border-[rgb(var(--sc-white-rgb)/0.60)] text-[11.5px] font-semibold text-[color:var(--sc-text)]"

const floatingIconBaseClassName =
  "inline-flex items-center justify-center w-7 h-7 rounded-full text-[color:var(--sc-text-on-strong)] bg-gradient-to-br"

export function PreHomeHero({
  onStartAudit,
  onLogin,
  onExplore,
}: {
  onStartAudit: () => void
  onLogin: () => void
  onExplore: () => void
}) {
  return (
    <section className="relative overflow-hidden sc-mesh">
      <div className="pointer-events-none absolute inset-0 sc-grid-overlay opacity-70" aria-hidden />

      <div
        className={heroLeftGlowClassName}
        style={{
          background:
            "radial-gradient(circle, rgb(var(--sc-blue-rgb)/0.30) 0%, rgb(var(--sc-indigo-rgb)/0.18) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />
      <div
        className={heroRightGlowClassName}
        style={{
          background:
            "radial-gradient(circle, rgb(var(--sc-cyan-rgb)/0.22) 0%, rgb(var(--sc-blue-rgb)/0.14) 45%, transparent 70%)",
          filter: "blur(50px)",
          animationDelay: "1.5s",
        }}
        aria-hidden
      />

      <div className={heroGridClassName}>
        <div>
          <div className="sc-fade-in">
            <ScBadge tone="info">
              <Sparkles className="w-3 h-3" />
              Bienvenue sur SafeCheck
            </ScBadge>
          </div>

          <h1 className={heroTitleClassName}>
            Reprenez la main sur votre{" "}
            <span className="sc-gradient-text">sécurité numérique</span>.
          </h1>

          <p className={heroCopyClassName}>
            SafeCheck vous aide à comprendre votre niveau de sécurité, à identifier vos points
            faibles et à appliquer des actions concrètes pour mieux vous protéger en ligne.
            Pas de jargon, pas d&apos;alarme. Juste un parcours clair, adapté à vous.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sc-fade-in-delay-3">
            <ScButton variant="primary" size="lg" onClick={onStartAudit}>
              Commencer l&apos;audit de qualification
              <ArrowRight className="w-4 h-4" />
            </ScButton>
            <ScButton variant="secondary" size="lg" onClick={onLogin}>
              Se connecter
            </ScButton>
            <ScButton variant="ghost" size="lg" onClick={onExplore}>
              Découvrir la plateforme
            </ScButton>
          </div>

          <ul className={heroBulletsClassName}>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[color:var(--sc-success)]" />
              Moins de 10 minutes
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[color:var(--sc-success)]" />
              Sans installation
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[color:var(--sc-success)]" />
              100% confidentiel
            </li>
          </ul>
        </div>

        <div className={heroVisualFrameClassName}>
          <HeroShieldComposition />
        </div>
      </div>
    </section>
  )
}

function HeroShieldComposition() {
  return (
    <div className="relative w-full h-full sc-zoom-in">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] sc-halo"
        aria-hidden
      />
      <div className={orbitRingOuterClassName} aria-hidden />
      <div className={orbitRingInnerClassName} aria-hidden />

      <div className="relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sc-float">
        <div className="relative inline-block">
          <div
            className="absolute -inset-3 rounded-[28px]"
            style={{
              background:
                "linear-gradient(135deg, rgb(var(--sc-blue-rgb)/0.40), rgb(var(--sc-indigo-rgb)/0.30) 50%, rgb(var(--sc-cyan-rgb)/0.30))",
              filter: "blur(18px)",
              opacity: 0.7,
            }}
            aria-hidden
          />
          <div
            className={shieldGlassCardClassName}
            style={{
              boxShadow:
                "0 30px 60px -20px rgb(var(--sc-blue-rgb)/0.45), 0 12px 28px -10px rgb(var(--sc-indigo-rgb)/0.35), inset 0 1px 0 rgb(var(--sc-white-rgb)/0.6)",
            }}
          >
            <div
              className={shieldCoreClassName}
              style={{
                background: "linear-gradient(140deg, var(--sc-blue-soft) 0%, var(--sc-blue) 45%, var(--sc-indigo) 100%)",
              }}
            >
              <Shield className="w-12 h-12 md:w-14 md:h-14 text-[color:var(--sc-text-on-strong)]" strokeWidth={2.2} />
            </div>

            <span className={verifiedPillClassName}>
              <CheckCircle2 className="w-3 h-3" />
              Niveau évalué
            </span>
          </div>
        </div>
      </div>

      <FloatingIcon
        className="left-[8%] top-[18%] sc-fade-in-delay-2"
        style={{ animationDelay: "0.4s" }}
        icon={<KeyRound className="w-4 h-4" />}
        label="Mot de passe"
        tone="indigo"
      />
      <FloatingIcon
        className="right-[6%] top-[12%] sc-fade-in-delay-3"
        style={{ animationDelay: "0.9s" }}
        icon={<Wifi className="w-4 h-4" />}
        label="Wi-Fi sécurisé"
        tone="cyan"
      />
      <FloatingIcon
        className="left-[6%] bottom-[14%] sc-fade-in-delay-3"
        style={{ animationDelay: "1.4s" }}
        icon={<Fingerprint className="w-4 h-4" />}
        label="Authentification"
        tone="blue"
      />
      <FloatingIcon
        className="right-[10%] bottom-[18%] sc-fade-in-delay-4"
        style={{ animationDelay: "1.9s" }}
        icon={<Lock className="w-4 h-4" />}
        label="Données chiffrées"
        tone="indigo"
      />
    </div>
  )
}

function FloatingIcon({
  className = "",
  style,
  icon,
  label,
  tone,
}: {
  className?: string
  style?: CSSProperties
  icon: ReactNode
  label: string
  tone: "blue" | "cyan" | "indigo"
}) {
  const toneMap = {
    blue: "from-[var(--sc-blue-soft)] to-[var(--sc-blue)] shadow-[0_10px_24px_-8px_rgb(var(--sc-blue-rgb)/0.55)]",
    cyan: "from-[var(--sc-cyan)] to-[var(--sc-cyan-strong)] shadow-[0_10px_24px_-8px_rgb(var(--sc-cyan-rgb)/0.55)]",
    indigo: "from-[var(--sc-indigo)] to-[var(--sc-indigo-strong)] shadow-[0_10px_24px_-8px_rgb(var(--sc-indigo-rgb)/0.55)]",
  } as const

  return (
    <div
      className={`absolute sc-float ${className}`}
      style={{ animationDuration: "5.5s", ...style }}
    >
      <div className={floatingIconShellClassName}>
        <span className={`${floatingIconBaseClassName} ${toneMap[tone]}`}>
          {icon}
        </span>
        <span className="whitespace-nowrap">{label}</span>
      </div>
    </div>
  )
}
