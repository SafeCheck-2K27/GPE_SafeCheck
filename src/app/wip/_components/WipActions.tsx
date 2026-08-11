"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, CheckCircle2 } from "lucide-react"
import { ScButton } from "@/components/safecheck/primitives"

export function WipActions() {
  const router = useRouter()
  const [notified, setNotified] = useState(false)

  return (
    <div className="relative mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
      <ScButton variant="secondary" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-1" />
        Retour
      </ScButton>
      {notified ? (
        <ScButton variant="primary" disabled>
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Vous serez prévenu·e
        </ScButton>
      ) : (
        <ScButton variant="primary" onClick={() => setNotified(true)}>
          <Bell className="w-4 h-4 mr-1" />
          M&apos;avertir au lancement
        </ScButton>
      )}
    </div>
  )
}
