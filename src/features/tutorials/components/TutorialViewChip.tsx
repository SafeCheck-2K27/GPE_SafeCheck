import type { ReactNode } from "react"

export function TutorialViewChip({
  children,
  active,
  onClick,
  size = "sm",
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  size?: "xs" | "sm"
}) {
  const sizeCls = size === "xs" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-all ${sizeCls} ${ active ? "text-white border border-transparent bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] shadow-[0_4px_12px_-3px_rgba(37,99,235,0.40)]" : "bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] border border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)]" }`}
    >
      {children}
    </button>
  )
}
