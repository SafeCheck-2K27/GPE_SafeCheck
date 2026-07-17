import { Suspense } from "react"
import { PageSuspenseFallback } from "@/components/safecheck/layout/PageSuspenseFallback"
import { RecommendationsContent } from "@/features/recommendations/components/RecommendationsContent"

export default function RecommandationsPage() {
  return (
    <Suspense fallback={<PageSuspenseFallback />}>
      <RecommendationsContent />
    </Suspense>
  )
}
