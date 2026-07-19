import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock } from "lucide-react"
import { scButtonClassName } from "@/components/safecheck/primitives"
import { getAuditStatusPresentation } from "../status"
import type { AuditLevel } from "../types"
import { AuditLevelTag } from "./AuditLevelTag"
import { AuditStatusBadge } from "./AuditStatusBadge"

export function AuditLevelCard({
  audit,
  index,
}: {
  audit: AuditLevel
  index: number
}) {
  const Icon = audit.icon
  const status = getAuditStatusPresentation(audit.status)

  return (
    <article
      className="relative rounded-xl bg-[color:var(--sc-surface)] sc-fade-in cursor-pointer group shadow-[var(--sc-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--sc-shadow-lg)] focus-within:-translate-y-0.5 focus-within:shadow-[var(--sc-shadow-lg)]"
      style={{
        animationDelay: `${index * 60}ms`,
        border: "1px solid var(--sc-border)",
      }}
    >
      <Link
        href={audit.href}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sc-blue)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sc-bg)]"
        aria-label={`${status.accessibleAction} ${audit.title}`}
      />
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-5 p-5 md:p-6 items-center">
        <div
          className="w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
          style={{
            background: `${audit.accent}15`,
            border: `1px solid ${audit.accent}40`,
          }}
        >
          <Icon
            className="w-7 h-7 md:w-8 md:h-8"
            style={{ color: audit.accent }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <AuditLevelTag level={audit.level} />
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--sc-text-2)]">
              <Clock className="w-3 h-3" />
              {audit.durationShort}
            </span>
            <span className="ml-auto md:hidden">
              <AuditStatusBadge status={audit.status} />
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-[color:var(--sc-text)] mb-1.5 text-balance">
            {audit.title}
          </h2>
          <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed mb-3 text-pretty">
            {audit.goal}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {audit.outputs.map((output) => (
              <span
                key={output}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)] text-[color:var(--sc-text)]"
              >
                <CheckCircle2 className="w-3 h-3 text-[color:var(--sc-blue)]" />
                {output}
              </span>
            ))}
          </div>

          <p className="text-xs text-[color:var(--sc-text-muted)] mt-3 italic">
            {audit.audience}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="hidden md:block">
            <AuditStatusBadge status={audit.status} />
          </div>
          <span
            aria-hidden="true"
            className={scButtonClassName({
              variant: status.actionVariant,
              size: "md",
            })}
          >
            {status.actionLabel}
            <ArrowRight className="w-4 h-4 ml-1" />
          </span>
        </div>
      </div>
    </article>
  )
}
