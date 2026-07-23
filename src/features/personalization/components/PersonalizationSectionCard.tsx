import type { ReactNode } from "react"

export function PersonalizationSectionCard({
  number,
  label,
  question,
  optional = true,
  children,
}: {
  number: number
  label: string
  question: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl p-5 md:p-6 flex flex-col gap-4 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-sm)]">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-[color:var(--sc-text-on-strong)] mt-0.5 bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] shadow-[var(--sc-shadow-blue-sm)]">
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sc-blue)]">
              {label}
            </span>
            {optional && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)] text-[color:var(--sc-text-muted)]">
                Optionnel
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm md:text-[15px] font-semibold text-[color:var(--sc-text)] leading-snug text-pretty">
            {question}
          </p>
        </div>
      </div>

      <div className="pl-0 md:pl-10">{children}</div>
    </div>
  )
}
