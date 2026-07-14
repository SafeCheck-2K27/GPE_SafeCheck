import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

export type PageShellProps = ComponentPropsWithoutRef<"div">

export function PageShell({ className, ...props }: PageShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col bg-[color:var(--sc-bg)] font-sans",
        className,
      )}
      {...props}
    />
  )
}
