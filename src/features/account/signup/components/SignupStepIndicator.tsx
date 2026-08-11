import { Check } from "lucide-react"
import type { SignupStep } from "../types"

const SIGNUP_STEPS: SignupStep[] = [1, 2]

export function SignupStepIndicator({ step }: { step: SignupStep }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {SIGNUP_STEPS.map((item) => (
        <div key={item} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= item ? "text-[color:var(--sc-text-on-strong)]" : "text-[color:var(--sc-text-muted)] bg-[color:var(--sc-control-disabled)]"}`}
            style={
              step >= item
                ? {
                    background:
                      "linear-gradient(to right, var(--sc-blue-pale), var(--sc-blue))",
                  }
                : {}
            }
          >
            {step > item ? <Check className="w-3.5 h-3.5" /> : item}
          </div>
          {item < 2 && (
            <div
              className={`h-0.5 w-16 ${step > item ? "bg-[color:var(--sc-blue)]" : "bg-[color:var(--sc-control-disabled)]"}`}
            />
          )}
        </div>
      ))}
      <span className="text-xs text-[color:var(--sc-text-muted)] ml-2">
        Étape {step}/2
      </span>
    </div>
  )
}
