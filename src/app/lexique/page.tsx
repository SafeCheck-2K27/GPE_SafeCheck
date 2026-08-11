import { Suspense } from "react"
import { PageSuspenseFallback } from "@/components/safecheck/layout/PageSuspenseFallback"
import { LexiconContent } from "@/features/lexicon/components/LexiconContent"

export default function LexiquePage() {
  return (
    <Suspense fallback={<PageSuspenseFallback />}>
      <LexiconContent />
    </Suspense>
  )
}
