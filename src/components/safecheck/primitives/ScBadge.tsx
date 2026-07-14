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
      "bg-[#EEF4FF] text-[#1D4ED8] border-[#DBEAFE] " +
      "dark:bg-[rgba(59,130,246,0.14)] dark:text-[#93C5FD] dark:border-[rgba(59,130,246,0.32)]",
    success:
      "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] " +
      "dark:bg-[rgba(16,185,129,0.12)] dark:text-[#6EE7B7] dark:border-[rgba(16,185,129,0.30)]",
    warn:
      "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] " +
      "dark:bg-[rgba(245,158,11,0.14)] dark:text-[#FCD34D] dark:border-[rgba(245,158,11,0.30)]",
    danger:
      "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA] " +
      "dark:bg-[rgba(239,68,68,0.14)] dark:text-[#FCA5A5] dark:border-[rgba(239,68,68,0.30)]",
    muted:
      "bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-2)] border-[color:var(--sc-border)]",
    premium:
      "bg-[linear-gradient(135deg,#6366F1,#2563EB)] text-white border-transparent shadow-[0_4px_14px_-4px_rgba(99,102,241,0.55)]",
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
