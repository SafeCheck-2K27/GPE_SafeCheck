import { ArrowRight, TrendingUp } from "lucide-react"
import { ScBadge } from "@/components/safecheck/primitives"
import type { Essential } from "../types"
import { ESSENTIAL_STATUS_LABEL, type EssentialStatus } from "../status"
import { EssentialIcon } from "./EssentialIcon"

export function EssentialCard({
  essential,
  status,
  delay,
  onClick,
}: {
  essential: Essential
  status: EssentialStatus
  delay: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative text-left rounded-xl p-5 bg-[color:var(--sc-surface)] flex flex-col gap-3 sc-fade-in transition-all hover:-translate-y-1"
      style={{
        animationDelay: `${delay}ms`,
        border: "1px solid var(--sc-border)",
        boxShadow: "var(--sc-shadow)",
      }}
    >
      {status !== "a_faire" && (
        <ScBadge
          tone={status === "fait" ? "success" : "warn"}
          className="absolute top-3 right-3"
        >
          {ESSENTIAL_STATUS_LABEL[status]}
        </ScBadge>
      )}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-[color:var(--sc-bg-soft)] flex items-center justify-center">
          <EssentialIcon icon={essential.icon} className="w-5 h-5 text-[color:var(--sc-blue)]" />
        </div>
        <ScBadge
          tone={
            essential.importance === "Critique"
              ? "warn"
              : essential.importance === "Important"
                ? "info"
                : "muted"
          }
        >
          {essential.importance}
        </ScBadge>
        <ScBadge tone="muted">{essential.type}</ScBadge>
      </div>
      <h3 className="font-bold text-base text-[color:var(--sc-text)]">
        {essential.title}
      </h3>
      <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed flex-1">
        {essential.description}
      </p>
      <div className="flex items-center justify-between text-xs text-[color:var(--sc-text-muted)] pt-2 border-t border-[color:var(--sc-border)]">
        <span className="inline-flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {essential.popularity}% utile
        </span>
        <span className="inline-flex items-center gap-1 text-[color:var(--sc-blue)] font-semibold">
          Lire <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </button>
  )
}
