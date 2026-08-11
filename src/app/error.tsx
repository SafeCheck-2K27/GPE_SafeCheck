"use client"

import { House, RotateCcw } from "lucide-react"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import {
  SafeCheckMark,
  ScButton,
  ScLinkButton,
} from "@/components/safecheck/primitives"

interface AppErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AppError({ reset }: AppErrorProps) {
  return (
    <PageShell className="items-center justify-center px-4 py-10">
      <main className="w-full max-w-lg">
        <section
          role="alert"
          aria-labelledby="app-error-title"
          className="rounded-lg border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] px-6 py-8 text-center shadow-[0_12px_32px_-20px_rgb(var(--sc-ink-rgb)/0.3)] sm:px-10"
        >
          <SafeCheckMark className="mb-5 h-10 w-10" />
          <h1
            id="app-error-title"
            className="font-heading text-2xl font-bold text-[color:var(--sc-text)]"
          >
            Une erreur est survenue
          </h1>
          <p className="mt-3 text-sm leading-6 text-[color:var(--sc-text-muted)] sm:text-base">
            Cette page n&apos;a pas pu être affichée. Vous pouvez réessayer ou
            revenir à l&apos;accueil.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ScButton onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Réessayer
            </ScButton>
            <ScLinkButton href="/accueil" variant="secondary">
              <House className="h-4 w-4" aria-hidden="true" />
              Retour à l&apos;accueil
            </ScLinkButton>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
