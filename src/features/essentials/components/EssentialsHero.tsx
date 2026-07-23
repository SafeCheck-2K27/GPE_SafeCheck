import { BookOpen, Cog, Heart, Sparkles, Target } from "lucide-react"
import { ScBadge } from "@/components/safecheck/primitives"

export function EssentialsHero() {
  return (
    <section className="relative overflow-hidden border-b border-[color:var(--sc-border)] sc-mesh-soft">
      <div
        className="pointer-events-none absolute inset-0 sc-dot-texture opacity-50"
        aria-hidden
      />
      <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-center">
        <div>
          <ScBadge tone="info" className="mb-4">
            <Sparkles className="w-3 h-3" /> Loi du 80/20
          </ScBadge>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-[color:var(--sc-text)] mb-4 text-balance leading-[1.08]">
            Les essentiels&nbsp;: 20% des efforts,{" "}
            <span className="sc-gradient-text">80% de la sécurité</span>.
          </h1>
          <p className="text-base text-[color:var(--sc-text-2)] leading-relaxed max-w-2xl text-pretty">
            Cette section regroupe les actions, guides, réflexes et paramètres
            les plus rentables. Pas seulement des tutos techniques&nbsp;: vous y
            trouverez aussi des notions clés, des habitudes à adopter et des
            réglages à activer pour une protection à fort impact.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-7">
            <KpiPill icon={<BookOpen className="w-4 h-4" />} label="Guides" />
            <KpiPill icon={<Cog className="w-4 h-4" />} label="Réglages" />
            <KpiPill icon={<Heart className="w-4 h-4" />} label="Habitudes" />
            <KpiPill icon={<Target className="w-4 h-4" />} label="Notions" />
          </div>
        </div>

        <div className="relative hidden md:flex items-center justify-center w-52 h-52">
          <div
            className="absolute inset-0 sc-halo opacity-70 sc-pulse-soft"
            aria-hidden
          />
          <div
            className="relative w-44 h-44 rounded-full flex items-center justify-center bg-[color:var(--sc-surface)] shadow-[0_22px_50px_-18px_rgb(var(--sc-blue-rgb)/0.45),inset_0_1px_0_rgb(var(--sc-white-rgb)/0.8)]"
            style={{
              background:
                "conic-gradient(from 220deg, var(--sc-blue) 0deg, var(--sc-indigo) 90deg, var(--sc-cyan) 180deg, transparent 220deg, transparent 360deg)",
            }}
            aria-hidden
          >
            <div className="w-[154px] h-[154px] rounded-full bg-[color:var(--sc-surface)] flex items-center justify-center border border-[color:var(--sc-border)] shadow-inner">
              <div className="text-center">
                <div className="font-display text-5xl font-bold sc-gradient-text leading-none">
                  80%
                </div>
                <div className="text-[11px] text-[color:var(--sc-text-muted)] mt-1.5 px-3 leading-tight">
                  de la sécurité atteinte
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function KpiPill({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] text-xs font-semibold text-[color:var(--sc-text)] shadow-[var(--sc-shadow-sm)]">
      <span className="text-[color:var(--sc-blue)]">{icon}</span>
      {label}
    </span>
  )
}
