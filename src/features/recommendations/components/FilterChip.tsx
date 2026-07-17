import type { ReactNode } from "react"

export function FilterChip({
  children,
  active,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${ active ? "text-white border border-transparent bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] shadow-[0_4px_12px_-3px_rgba(37,99,235,0.40)]" : "bg-[#FFFFFF] text-[#000]/70 border border-[#B3DBEF] hover:border-[#157FE2] hover:text-[#157FE2]" }`}
    >
      {children}
    </button>
  )
}
