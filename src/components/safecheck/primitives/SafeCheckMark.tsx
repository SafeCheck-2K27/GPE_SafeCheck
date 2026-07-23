import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export function SafeCheckMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-lg text-[color:var(--sc-text-on-strong)] bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue)_60%,var(--sc-indigo))] shadow-[0_6px_16px_-6px_rgb(var(--sc-blue-rgb)/0.55)]",
        className,
      )}
    >
      <Shield className="w-4 h-4" strokeWidth={2.5} />
    </span>
  )
}
