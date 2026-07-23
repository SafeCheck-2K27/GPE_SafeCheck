import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

export type ScCardProps = ComponentPropsWithoutRef<"div">

export function ScCard({ className, ...props }: ScCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-sm)]",
        className,
      )}
      {...props}
    />
  )
}
