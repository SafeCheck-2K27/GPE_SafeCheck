"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import { ScButton, ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
import { useAuth } from "@/components/safecheck/AuthProvider"
import {
  Shield,
  ArrowRight,
  Target,
  Compass,
  ListChecks,
  Sparkles,
  Lock,
  Eye,
  Activity,
  CheckCircle2,
  KeyRound,
  Wifi,
  Fingerprint,
} from "lucide-react"

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

const finalHaloClassName =
  "pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[600px] h-[400px] sc-halo opacity-60"

const finalIconClassName =
  "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] mb-5"

const finalTitleClassName =
  "font-display text-3xl md:text-4xl font-bold text-[color:var(--sc-text)] mb-4 text-balance"

const finalCopyClassName =
  "text-base text-[color:var(--sc-text-2)] mb-8 max-w-xl mx-auto text-pretty"

const orbitRingOuterClassName =
  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-dashed border-[color:var(--sc-blue)]/30"

const orbitRingInnerClassName =
  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-[color:var(--sc-blue)]/15"

const shieldGlassCardClassName =
  "relative w-[200px] h-[200px] md:w-[220px] md:h-[220px] rounded-[28px] sc-glass flex items-center justify-center"

const shieldCoreClassName =
  "w-[110px] h-[110px] md:w-[120px] md:h-[120px] rounded-2xl flex items-center justify-center shadow-[0_20px_40px_-12px_rgba(37,99,235,0.55),inset_0_1px_0_rgba(255,255,255,0.35)]"

const verifiedPillClassName =
  "absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold text-white bg-[linear-gradient(135deg,#10B981,#059669)] shadow-[0_8px_18px_-6px_rgba(16,185,129,0.55)]"

const floatingIconShellClassName =
  "flex items-center gap-2 pl-2 pr-3 py-2 rounded-full sc-glass border border-white/60 text-[11.5px] font-semibold text-[color:var(--sc-text)]"

const floatingIconBaseClassName =
  "inline-flex items-center justify-center w-7 h-7 rounded-full text-white bg-gradient-to-br"

const valueCardClassName =
  "group relative rounded-[18px] p-6 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[color:var(--sc-blue)]/40 hover:shadow-[0_20px_40px_-16px_rgba(37,99,235,0.25),0_8px_16px_-8px_rgba(15,23,42,0.10)] shadow-[0_2px_6px_-2px_rgba(15,23,42,0.06)] sc-fade-in"

const valueIconClassName =
  "w-11 h-11 rounded-xl flex items-center justify-center mb-4 text-white bg-[linear-gradient(135deg,#3B82F6_0%,#2563EB_60%,#6366F1_100%)] shadow-[0_8px_18px_-6px_rgba(37,99,235,0.55)] group-hover:scale-105 transition-transform"

const reassureIconClassName =
  "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] text-[color:var(--sc-blue)]"

const loginCardClassName =
  "w-full max-w-sm rounded-2xl p-6 sc-fade-in bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.30)]"

const loginLogoClassName =
  "inline-flex items-center justify-center w-8 h-8 rounded-lg text-white bg-[linear-gradient(135deg,#3B82F6,#2563EB_60%,#6366F1)] shadow-[0_6px_16px_-6px_rgba(37,99,235,0.55)]"

const loginInputClassName =
  "sc-focus w-full px-3 py-2.5 rounded-lg text-sm bg-[color:var(--sc-surface)] text-[color:var(--sc-text)] border border-[color:var(--sc-border-strong)] focus:border-[color:var(--sc-blue)] outline-none transition-colors"

export default function PreHomePage() {
  const router = useRouter()
  const auth = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  // If a user is already logged in (e.g. came back to "/" via the logo),
  // skip the pre-home and send them straight to the real home.
  useEffect(() => {
    if (auth.isHydrated && auth.isLoggedIn) {
      router.replace("/accueil")
    }
  }, [auth.isHydrated, auth.isLoggedIn, router])

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[color:var(--sc-bg)]">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={() => router.push("/compte/creer")}
      />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden sc-mesh">
          {/* very faint grid overlay */}
          <div className="pointer-events-none absolute inset-0 sc-grid-overlay opacity-70" aria-hidden />

          {/* glow blobs */}
          <div
            className={heroLeftGlowClassName}
            style={{
              background:
                "radial-gradient(circle, rgba(37,99,235,0.30) 0%, rgba(99,102,241,0.18) 40%, transparent 70%)",
              filter: "blur(40px)",
            }}
            aria-hidden
          />
          <div
            className={heroRightGlowClassName}
            style={{
              background:
                "radial-gradient(circle, rgba(6,182,212,0.22) 0%, rgba(37,99,235,0.14) 45%, transparent 70%)",
              filter: "blur(50px)",
              animationDelay: "1.5s",
            }}
            aria-hidden
          />

          <div className={heroGridClassName}>
            {/* TEXT COLUMN */}
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
                <ScButton variant="primary" size="lg" onClick={() => router.push("/audit")}>
                  Commencer l&apos;audit de qualification
                  <ArrowRight className="w-4 h-4" />
                </ScButton>
                <ScButton variant="secondary" size="lg" onClick={() => setShowLogin(true)}>
                  Se connecter
                </ScButton>
                <ScButton variant="ghost" size="lg" onClick={() => router.push("/accueil")}>
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

            {/* VISUAL COLUMN - pseudo-3D shield composition */}
            <div className={heroVisualFrameClassName}>
              <HeroShieldComposition />
            </div>
          </div>
        </section>

        {/* POURQUOI UN AUDIT */}
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

        {/* REASSURANCE BAND */}
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

        {/* FINAL CTA */}
        <section className="relative overflow-hidden bg-[color:var(--sc-surface)]">
          <div
            className={finalHaloClassName}
            aria-hidden
          />
          <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
            <div className={finalIconClassName}>
              <Eye className="w-5 h-5 text-[color:var(--sc-blue)]" />
            </div>
            <h2 className={finalTitleClassName}>
              Prêt·e à voir où vous en êtes&nbsp;?
            </h2>
            <p className={finalCopyClassName}>
              Démarrez par l&apos;audit de qualification - c&apos;est rapide, gratuit, et c&apos;est la
              meilleure manière de tirer parti de SafeCheck.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <ScButton variant="primary" size="lg" onClick={() => router.push("/audit")}>
                Commencer l&apos;audit de qualification
                <ArrowRight className="w-4 h-4" />
              </ScButton>
              <ScButton variant="secondary" size="lg" onClick={() => router.push("/accueil")}>
                Découvrir la plateforme
              </ScButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={async (email, password) => {
            await auth.login(email, password)
            setShowLogin(false)
            router.push("/accueil")
          }}
        />
      )}
    </div>
  )
}

/* HERO VISUAL - pseudo-3D shield, glass card, orbiting icons */
function HeroShieldComposition() {
  return (
    <div className="relative w-full h-full sc-zoom-in">
      {/* Halo */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] sc-halo"
        aria-hidden
      />

      {/* Outer rotating-ish ring (static, but elegant dashes) */}
      <div
        className={orbitRingOuterClassName}
        aria-hidden
      />
      <div
        className={orbitRingInnerClassName}
        aria-hidden
      />

      {/* Central shield card */}
      <div className="relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sc-float">
        <div className="relative inline-block">
          {/* Outer card glow */}
          <div
            className="absolute -inset-3 rounded-[28px]"
            style={{
              background:
                "linear-gradient(135deg, rgba(37,99,235,0.40), rgba(99,102,241,0.30) 50%, rgba(6,182,212,0.30))",
              filter: "blur(18px)",
              opacity: 0.7,
            }}
            aria-hidden
          />
          {/* Glass card */}
          <div
            className={shieldGlassCardClassName}
            style={{
              boxShadow:
                "0 30px 60px -20px rgba(37,99,235,0.45), 0 12px 28px -10px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            {/* Inner gradient shield */}
            <div
              className={shieldCoreClassName}
              style={{
                background: "linear-gradient(140deg, #3B82F6 0%, #2563EB 45%, #6366F1 100%)",
              }}
            >
              <Shield className="w-12 h-12 md:w-14 md:h-14 text-white" strokeWidth={2.2} />
            </div>

            {/* Top corner: "Verified" pill */}
            <span
              className={verifiedPillClassName}
            >
              <CheckCircle2 className="w-3 h-3" />
              Niveau évalué
            </span>
          </div>
        </div>
      </div>

      {/* Orbiting icons */}
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
  style?: React.CSSProperties
  icon: React.ReactNode
  label: string
  tone: "blue" | "cyan" | "indigo"
}) {
  const toneMap = {
    blue: "from-[#3B82F6] to-[#2563EB] shadow-[0_10px_24px_-8px_rgba(37,99,235,0.55)]",
    cyan: "from-[#06B6D4] to-[#0891B2] shadow-[0_10px_24px_-8px_rgba(6,182,212,0.55)]",
    indigo: "from-[#6366F1] to-[#4F46E5] shadow-[0_10px_24px_-8px_rgba(99,102,241,0.55)]",
  } as const
  return (
    <div
      className={`absolute sc-float ${className}`}
      style={{ animationDuration: "5.5s", ...style }}
    >
      <div className={floatingIconShellClassName}>
        <span
          className={`${floatingIconBaseClassName} ${toneMap[tone]}`}
        >
          {icon}
        </span>
        <span className="whitespace-nowrap">{label}</span>
      </div>
    </div>
  )
}

/*
   Cards
 ��� */
function ValueCard({
  icon,
  title,
  text,
  index,
}: {
  icon: React.ReactNode
  title: string
  text: string
  index: number
}) {
  return (
    <div
      className={valueCardClassName}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* gradient accent line on hover */}
      <span
        className="absolute inset-x-6 top-0 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(37,99,235,0.7), rgba(99,102,241,0.7), transparent)",
        }}
        aria-hidden
      />
      <div className={valueIconClassName}>
        {icon}
      </div>
      <h3 className="font-display font-semibold text-lg text-[color:var(--sc-text)] mb-1.5">{title}</h3>
      <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">{text}</p>
    </div>
  )
}

function ReassureItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={reassureIconClassName}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-sm text-[color:var(--sc-text)] mb-0.5">{title}</h3>
        <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

/* Login modal - V2 */
function LoginModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (email: string, password: string) => void | Promise<void>
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await onSuccess(email.trim(), password)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--sc-text)]/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className={loginCardClassName}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className={loginLogoClassName}>
            <Shield className="w-4 h-4" strokeWidth={2.5} />
          </span>
          <h2 className="font-display text-xl font-semibold text-[color:var(--sc-text)]">Connexion</h2>
        </div>
        <p className="text-xs text-[color:var(--sc-text-muted)] mb-5">
          Heureux de vous retrouver sur SafeCheck.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--sc-text)] mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@mail.com"
              className={loginInputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--sc-text)] mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={loginInputClassName}
            />
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <ScButton
            variant="primary"
            size="md"
            className="w-full"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? "Connexion…" : "Se connecter"}
          </ScButton>
          <button
            onClick={onClose}
            className="text-sm text-center text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-blue)] transition-colors mt-1"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
