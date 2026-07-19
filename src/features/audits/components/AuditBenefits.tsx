import { Clock, Layers, Target } from "lucide-react"

export function AuditBenefits() {
  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
      <InfoCard
        icon={<Clock className="w-5 h-5 text-[color:var(--sc-blue)]" />}
        title="À votre rythme"
        text="Chaque audit s'adapte à votre disponibilité. Lancez, mettez en pause, reprenez."
      />
      <InfoCard
        icon={<Target className="w-5 h-5 text-[color:var(--sc-blue)]" />}
        title="Un plan d'action"
        text="Chaque audit débouche sur des recommandations concrètes et priorisées."
      />
      <InfoCard
        icon={<Layers className="w-5 h-5 text-[color:var(--sc-blue)]" />}
        title="Évolutif"
        text="Refaites un audit régulièrement pour suivre vos progrès."
      />
    </div>
  )
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div
      className="rounded-lg p-4 bg-[color:var(--sc-surface)]"
      style={{
        border: "1px solid var(--sc-border)",
        boxShadow: "var(--sc-shadow-sm)",
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="font-semibold text-sm text-[color:var(--sc-text)]">
          {title}
        </span>
      </div>
      <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed">
        {text}
      </p>
    </div>
  )
}
