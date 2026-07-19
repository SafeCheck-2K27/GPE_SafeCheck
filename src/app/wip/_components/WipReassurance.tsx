import type { ReactNode } from "react"
import { Cone, Hammer, HardHat } from "lucide-react"

const REASSURANCE_ITEMS = [
  {
    icon: HardHat,
    title: "Conçu sérieusement",
    text: "Cette fonctionnalité est priorisée sur la roadmap produit.",
  },
  {
    icon: Hammer,
    title: "Bientôt disponible",
    text: "Une version beta sera ouverte aux comptes inscrits en premier.",
  },
  {
    icon: Cone,
    title: "Pas de blocage",
    text: "Vous pouvez continuer à utiliser tout le reste du site sans interruption.",
  },
]

export function WipReassurance() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
      {REASSURANCE_ITEMS.map(({ icon: Icon, title, text }) => (
        <ReassureCard key={title} icon={<Icon className="w-5 h-5 text-[color:var(--sc-blue)]" />} title={title} text={text} />
      ))}
    </div>
  )
}

function ReassureCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="sc-tile rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="font-semibold text-sm text-[color:var(--sc-text)]">{title}</span>
      </div>
      <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed">{text}</p>
    </div>
  )
}
