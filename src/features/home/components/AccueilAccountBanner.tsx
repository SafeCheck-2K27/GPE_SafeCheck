import { ArrowRight, ShieldCheck } from "lucide-react"
import { ScBadge, ScButton } from "@/components/safecheck/primitives"

export function AccueilAccountBanner({
  isLoggedIn,
  firstName,
  onDashboard,
  onProfile,
  onSignup,
}: {
  isLoggedIn: boolean
  firstName?: string
  onDashboard: () => void
  onProfile: () => void
  onSignup: () => void
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 pb-12">
      <div
        className="relative overflow-hidden rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center border border-[color:var(--sc-border)]"
        style={{
          background:
            "linear-gradient(135deg, rgb(var(--sc-blue-rgb)/0.06) 0%, rgb(var(--sc-indigo-rgb)/0.06) 60%, rgb(var(--sc-cyan-rgb)/0.06) 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 w-72 h-72 sc-halo opacity-40"
          aria-hidden
        />

        {isLoggedIn ? (
          <>
            <div className="relative">
              <ScBadge tone="success" className="mb-2">
                <ShieldCheck className="w-3 h-3" />
                Espace personnel actif
              </ScBadge>
              <h2 className="font-display text-xl md:text-2xl font-semibold text-[color:var(--sc-text)] mb-2">
                {firstName ? `Bienvenue, ${firstName}\u00A0!` : "Bonne reprise\u00A0!"}
              </h2>
              <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed max-w-2xl">
                Continuez votre progression SafeCheck - consultez votre tableau de bord,
                reprenez là où vous en étiez ou lancez un nouveau diagnostic.
              </p>
            </div>
            <div className="relative shrink-0 flex flex-col sm:flex-row gap-2">
              <ScButton variant="primary" size="lg" onClick={onDashboard}>
                Mon tableau de bord
                <ArrowRight className="w-4 h-4" />
              </ScButton>
              <ScButton variant="secondary" size="md" onClick={onProfile}>
                Mon profil
              </ScButton>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <h2 className="font-display text-xl md:text-2xl font-semibold text-[color:var(--sc-text)] mb-2">
                Créez votre espace SafeCheck gratuit
              </h2>
              <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed max-w-2xl">
                Gardez votre progression, débloquez des badges, sauvegardez vos tutoriels
                préférés et accédez à votre tableau de bord personnalisé - le tout gratuitement.
              </p>
            </div>
            <div className="relative shrink-0">
              <ScButton variant="primary" size="lg" onClick={onSignup}>
                Créer mon espace
                <ArrowRight className="w-4 h-4" />
              </ScButton>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
