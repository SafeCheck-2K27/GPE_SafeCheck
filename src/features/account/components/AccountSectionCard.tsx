import type { ComponentType, ReactNode } from "react"

export function AccountSectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
}: {
  title: string
  description?: string
  icon?: ComponentType<{ className?: string }>
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl overflow-hidden border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-sm)]">
      <header className="flex items-start justify-between gap-4 px-5 md:px-6 py-4 bg-[color:var(--sc-bg-soft)] border-b border-[color:var(--sc-border)]">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] text-[color:var(--sc-text-on-strong)] shadow-[var(--sc-shadow-blue-sm)]">
              <Icon className="w-4 h-4" />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="font-display font-bold text-[15px] text-[color:var(--sc-text)] tracking-tight">{title}</h3>
            {description && (
              <p className="text-[12.5px] text-[color:var(--sc-text-muted)] mt-0.5 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  )
}
