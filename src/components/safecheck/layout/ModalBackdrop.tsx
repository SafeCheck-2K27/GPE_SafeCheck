import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

export type ModalBackdropProps = ComponentPropsWithoutRef<"div">

export function ModalBackdrop({ className, ...props }: ModalBackdropProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--sc-text)]/40 backdrop-blur-sm px-4",
        className,
      )}
      {...props}
    />
  )
}
