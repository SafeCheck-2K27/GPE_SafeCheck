"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* Reusable SafeCheck button (V2 premium) */
export type ScButtonProps = Omit<
  React.ComponentPropsWithRef<"button">,
  "children" | "size"
> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "destructive"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

export function ScButton({
  variant = "primary",
  size = "md",
  children,
  onClick,
  className = "",
  type = "button",
  disabled,
  ...buttonProps
}: ScButtonProps) {
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-sm rounded-lg",
    md: "px-5 py-2.5 text-[15px] rounded-lg",
    lg: "px-7 py-3.5 text-base rounded-xl",
  }

  // V2 styles: soft shadows, gentle gradient, slight elevation on hover.
  // No more skeuomorphic 3px 3px offset shadows.
  const variantClass: Record<string, string> = {
    primary:
      "text-[color:var(--sc-text-on-strong)] border border-[color:var(--sc-blue-hover)] " +
      "bg-[linear-gradient(180deg,var(--sc-blue-soft)_0%,var(--sc-blue)_100%)] " +
      "hover:bg-[linear-gradient(180deg,var(--sc-blue)_0%,var(--sc-blue-hover)_100%)] " +
      "shadow-[0_6px_18px_-6px_rgb(var(--sc-blue-rgb)/0.55),inset_0_1px_0_rgb(var(--sc-white-rgb)/0.20)] " +
      "hover:shadow-[0_12px_28px_-8px_rgb(var(--sc-blue-rgb)/0.55),inset_0_1px_0_rgb(var(--sc-white-rgb)/0.25)] " +
      "hover:-translate-y-0.5",
    secondary:
      "text-[color:var(--sc-text)] border border-[color:var(--sc-border-strong)] " +
      "bg-[color:var(--sc-surface)] " +
      "hover:border-[color:var(--sc-blue)] hover:text-[color:var(--sc-blue)] " +
      "shadow-[0_2px_6px_-2px_rgb(var(--sc-ink-rgb)/0.08)] " +
      "hover:shadow-[0_8px_22px_-8px_rgb(var(--sc-blue-rgb)/0.30)] " +
      "hover:-translate-y-0.5",
    ghost:
      "text-[color:var(--sc-blue)] " +
      "border border-[color:var(--sc-blue)]/25 " +
      "bg-[color:var(--sc-bg-soft)]/60 " +
      "hover:bg-[color:var(--sc-bg-soft)] hover:border-[color:var(--sc-blue)]/45 " +
      "shadow-[0_2px_6px_-2px_rgb(var(--sc-blue-rgb)/0.18)] " +
      "hover:shadow-[0_8px_22px_-8px_rgb(var(--sc-blue-rgb)/0.30)] " +
      "hover:-translate-y-0.5",
    danger:
      "text-[color:var(--sc-text-on-strong)] border border-[color:var(--sc-danger-strong)] " +
      "bg-[linear-gradient(180deg,var(--sc-danger-light)_0%,var(--sc-danger-deep)_100%)] " +
      "hover:bg-[linear-gradient(180deg,var(--sc-danger)_0%,var(--sc-danger-strong)_100%)] " +
      "shadow-[0_6px_18px_-6px_rgb(var(--sc-danger-strong-rgb)/0.55)] " +
      "hover:shadow-[0_12px_28px_-8px_rgb(var(--sc-danger-strong-rgb)/0.55)] " +
      "hover:-translate-y-0.5",
    destructive:
      "text-[color:var(--sc-text)] border border-[color:var(--sc-border-strong)] " +
      "bg-[color:var(--sc-surface)] " +
      "hover:border-[color:var(--sc-danger-deep)] hover:text-[color:var(--sc-text-on-strong)] hover:bg-[linear-gradient(180deg,var(--sc-danger-light)_0%,var(--sc-danger-deep)_100%)] " +
      "focus-visible:ring-[color:var(--sc-danger-deep)]/45 " +
      "shadow-[0_2px_6px_-2px_rgb(var(--sc-ink-rgb)/0.08)] " +
      "hover:shadow-[0_8px_22px_-8px_rgb(var(--sc-danger-strong-rgb)/0.55)] " +
      "hover:-translate-y-0.5",
  }

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-[transform,box-shadow,background,color,border-color] duration-200 ease-out active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sc-blue)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sc-bg)]",
        sizeClasses[size],
        variantClass[variant],
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className,
      )}
    >
      {children}
    </button>
  )
}
