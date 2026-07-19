import { AlertTriangle, ArrowRight, Lock, ShieldCheck, Sparkles, Wifi } from "lucide-react"
import { ScBadge, ScButton } from "@/components/safecheck/primitives"

export function AccueilHero({
  onStartAudit,
  onViewAudits,
}: {
  onStartAudit: () => void
  onViewAudits: () => void
}) {
  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-4 pt-8 md:pt-12">
        <div className="relative overflow-hidden rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[0_2px_6px_-2px_rgb(var(--sc-ink-rgb)/0.06),0_10px_30px_-12px_rgb(var(--sc-ink-rgb)/0.10)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(at 0% 0%, rgb(var(--sc-blue-rgb)/0.10), transparent 50%), radial-gradient(at 100% 100%, rgb(var(--sc-indigo-rgb)/0.10), transparent 50%)",
            }}
            aria-hidden
          />
          <div className="relative p-6 md:p-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div className="sc-fade-in">
              <ScBadge tone="info" className="mb-3">
                <Sparkles className="w-3 h-3" />
                Bienvenue sur la plateforme
              </ScBadge>
              <h1 className="font-display text-2xl md:text-4xl font-bold text-[color:var(--sc-text)] mb-3 text-balance leading-tight">
                La cybersécurité, <span className="sc-gradient-text">pour tous</span>, à votre rythme.
              </h1>
              <p className="text-sm md:text-base text-[color:var(--sc-text-2)] leading-relaxed mb-5 max-w-xl text-pretty">
                Apprenez les bonnes pratiques sur Internet et sur votre ordinateur, à votre niveau.
                Pour commencer, passez le petit questionnaire de qualification&nbsp;: nous adapterons
                ensuite la plateforme à votre profil et à vos priorités.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <ScButton variant="primary" size="md" onClick={onStartAudit}>
                  Passer le questionnaire
                  <ArrowRight className="w-4 h-4" />
                </ScButton>
                <ScButton variant="secondary" size="md" onClick={onViewAudits}>
                  Voir tous les audits
                </ScButton>
              </div>
            </div>

            <DiagnosticCard />
          </div>
        </div>
      </div>
    </section>
  )
}

function DiagnosticCard() {
  const priorities = [
    { icon: <Lock className="w-3.5 h-3.5" />, label: "Mots de passe faibles", level: "Critique" },
    { icon: <Wifi className="w-3.5 h-3.5" />, label: "Réseau Wi-Fi non sécurisé", level: "Moyen" },
    { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Mises à jour manquantes", level: "Faible" },
  ]

  return (
    <div
      className="lg:w-64 shrink-0 rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[0_4px_16px_-6px_rgb(var(--sc-blue-rgb)/0.14),0_2px_6px_-2px_rgb(var(--sc-ink-rgb)/0.06)] overflow-hidden"
      aria-label="Aperçu d'un diagnostic SafeCheck"
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, var(--sc-blue) 0%, var(--sc-indigo-strong) 100%)" }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[rgb(var(--sc-white-rgb)/0.90)]" />
          <span className="text-xs font-semibold text-[color:var(--sc-text-on-strong)]">Diagnostic SafeCheck</span>
        </div>
        <span className="text-[10px] text-[rgb(var(--sc-white-rgb)/0.70)] font-medium">Exemple</span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-14 h-14 shrink-0 rounded-full flex items-center justify-center border-[3px] border-[color:var(--sc-blue)] bg-[color:var(--sc-blue)]/8">
            <span className="font-display font-bold text-lg text-[color:var(--sc-blue)] leading-none">
              62
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[color:var(--sc-text)]">Score de sécurité</p>
            <p className="text-[11px] text-[color:var(--sc-text-muted)] mt-0.5">3 priorités détectées</p>
            <div className="mt-1.5 h-1.5 w-28 rounded-full bg-[color:var(--sc-border)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: "62%", background: "linear-gradient(90deg, var(--sc-blue-soft), var(--sc-indigo))" }}
              />
            </div>
          </div>
        </div>

        <ul className="space-y-2 mb-4">
          {priorities.map((priority) => (
            <li
              key={priority.label}
              className="flex items-center gap-2 text-[11px] text-[color:var(--sc-text-2)]"
            >
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg text-[color:var(--sc-blue)] bg-[color:var(--sc-blue)]/10">
                {priority.icon}
              </span>
              <span className="flex-1 leading-tight">{priority.label}</span>
              <span
                className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${priority.level === "Critique" ? "bg-[color:var(--sc-danger-soft)] text-[color:var(--sc-danger-text)] dark:bg-[color:var(--sc-danger-soft)] dark:text-[color:var(--sc-danger-text)]" : priority.level === "Moyen" ? "bg-[color:var(--sc-warn-soft)] text-[color:var(--sc-warn-text)] dark:bg-[color:var(--sc-warn-soft)] dark:text-[color:var(--sc-warn-text)]" : "bg-[color:var(--sc-border)] text-[color:var(--sc-text-muted)]"}`}
              >
                {priority.level}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-[10px] text-center text-[color:var(--sc-text-muted)] italic leading-snug">
          Plan d&apos;action en 5 minutes &mdash; résultats immédiats
        </p>
      </div>
    </div>
  )
}
