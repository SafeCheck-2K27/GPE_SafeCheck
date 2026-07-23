import * as React from "react"
import { cn } from "@/lib/utils"

/* Reusable badge component (V2) */
export function ScBadge({
  children,
  tone = "info",
  className = "",
}: {
  children: React.ReactNode
  tone?: "info" | "success" | "warn" | "muted" | "premium" | "danger"
  className?: string
}) {
  const tones: Record<string, string> = {
    info:
      "bg-[color:var(--sc-info-soft)] text-[color:var(--sc-info-text)] border-[color:var(--sc-info-border)]",
    success:
      "bg-[color:var(--sc-success-soft)] text-[color:var(--sc-success-text)] border-[color:var(--sc-success-border)]",
    warn:
      "bg-[color:var(--sc-warn-soft)] text-[color:var(--sc-warn-text)] border-[color:var(--sc-warn-border)]",
    danger:
      "bg-[color:var(--sc-danger-soft)] text-[color:var(--sc-danger-text)] border-[color:var(--sc-danger-border)]",
    muted:
      "bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-2)] border-[color:var(--sc-border)]",
    premium:
      "bg-[linear-gradient(135deg,var(--sc-indigo),var(--sc-blue))] text-[color:var(--sc-text-on-strong)] border-transparent shadow-[0_4px_14px_-4px_rgb(var(--sc-indigo-rgb)/0.55)]",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-semibold tracking-wide border",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
