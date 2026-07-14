import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export function SafeCheckMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-lg text-white bg-[linear-gradient(135deg,#3B82F6,#2563EB_60%,#6366F1)] shadow-[0_6px_16px_-6px_rgba(37,99,235,0.55)]",
        className,
      )}
    >
      <Shield className="w-4 h-4" strokeWidth={2.5} />
    </span>
  )
}
