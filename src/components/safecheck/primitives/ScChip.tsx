import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

export type ScChipProps = Omit<ComponentPropsWithRef<"button">, "children"> & {
  active?: boolean
  children: ReactNode
  size?: "xs" | "sm"
}

const sizeClasses = {
  xs: "px-2.5 py-1 text-[11px]",
  sm: "px-3 py-1.5 text-xs",
}

export function ScChip({
  active,
  children,
  className,
  size = "sm",
  type = "button",
  ...buttonProps
}: ScChipProps) {
  return (
    <button
      {...buttonProps}
      type={type}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sc-blue)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sc-bg)]",
        sizeClasses[size],
        active
          ? "border-transparent bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] text-[color:var(--sc-text-on-strong)] shadow-[0_4px_12px_-3px_rgb(var(--sc-blue-rgb)/0.40)]"
          : "border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)]",
        className,
      )}
    >
      {children}
    </button>
  )
}
