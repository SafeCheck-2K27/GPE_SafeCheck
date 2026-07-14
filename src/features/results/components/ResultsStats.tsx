import { Clock, Target, TrendingUp } from "lucide-react"
import type { ResultMetrics } from "../types"

const statCardClassName =
  "rounded-xl p-4 flex items-start gap-3 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-sm)]"

const statIconClassName =
  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white mt-0.5"

export function ResultsStats({ metrics }: { metrics: ResultMetrics }) {
  const items = [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Gain estimé",
      value: `+${metrics.gainPoints} pts`,
      sub: "après les premières actions",
      color: "var(--sc-success)",
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: "Actions prioritaires",
      value: `${metrics.gainActions} actions`,
      sub: "pour réduire les risques immédiats",
      color: "var(--sc-blue)",
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Temps estimé",
      value: metrics.gainTime,
      sub: "pour les premières étapes",
      color: "var(--sc-warn)",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {items.map((item) => (
        <div key={item.label} className={statCardClassName}>
          <span
            className={statIconClassName}
            style={{ background: item.color }}
          >
            {item.icon}
          </span>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[color:var(--sc-text-muted)] mb-0.5">
              {item.label}
            </p>
            <p className="text-base font-extrabold text-[color:var(--sc-text)] leading-tight">
              {item.value}
            </p>
            <p className="text-[11px] text-[color:var(--sc-text-muted)] leading-tight mt-0.5">
              {item.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
