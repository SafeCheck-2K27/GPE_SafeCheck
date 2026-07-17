import { Suspense } from "react"
import { RecommendationsContent } from "@/features/recommendations/components/RecommendationsContent"

export default function RecommandationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
          <div className="w-8 h-8 border-2 border-[#157FE2] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  )
}
