import Link from "next/link"
import { ScButton } from "@/components/safecheck/primitives"
import { CATEGORY_LABEL } from "../data/catalog"
import type { Niveau, Tutoriel } from "../data/catalog"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react"
import type { TutoStatus } from "../types"
import { TutorialIcon } from "./TutorialIcon"

export function TutorialRow({
  tuto,
  onStart,
  status,
  showPopularBadge,
}: {
  tuto: Tutoriel
  onStart: () => void
  status?: TutoStatus
  showPopularBadge?: boolean
}) {
  const levelStyles: Record<Niveau, { bg: string; label: string }> = {
    Debutant: { bg: "var(--sc-success)", label: "Debutant" },
    Intermediaire: { bg: "var(--sc-warn)", label: "Intermediaire" },
    Avance: { bg: "var(--sc-violet-soft)", label: "Avance" },
  }
  const style = levelStyles[tuto.level]
  const isDone = status === "done"
  const isInProgress = status === "inprogress"

  return (
    <div
      className={cn(
        "group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl border bg-[color:var(--sc-surface)] p-3 sm:p-4 transition-all hover:shadow-[var(--sc-shadow-sm)]",
        isDone
          ? "border-[color:var(--sc-success)]/30 hover:border-[color:var(--sc-success)]/50"
          : isInProgress
            ? "border-[color:var(--sc-blue)]/30 hover:border-[color:var(--sc-blue)]/50"
            : "border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/30",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
          isDone
            ? "bg-[color:var(--sc-success)]/10 text-[color:var(--sc-success)]"
            : "bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)]",
        )}
      >
        <div className="scale-110">
          <TutorialIcon icon={tuto.icon} />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h4 className="font-semibold text-sm text-[color:var(--sc-text)] font-display truncate max-w-full">
            {tuto.title}
          </h4>
          {isDone && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[color:var(--sc-success)] text-[color:var(--sc-text-on-strong)]">
              <Check className="w-2.5 h-2.5" /> Termine
            </span>
          )}
          {isInProgress && !isDone && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[color:var(--sc-blue)] text-[color:var(--sc-text-on-strong)]">
              <Play className="w-2.5 h-2.5 fill-white" /> En cours
            </span>
          )}
          {!isDone && tuto.isEssential && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[color:var(--sc-warn)] text-[color:var(--sc-text-on-strong)]">
              <Star className="w-2.5 h-2.5 fill-white" /> Essentiel
            </span>
          )}
          {!isDone && !tuto.isEssential && tuto.isRecommended && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[color:var(--sc-blue)] text-[color:var(--sc-text-on-strong)]">
              <Sparkles className="w-2.5 h-2.5" /> Recommande
            </span>
          )}
          {!isDone && showPopularBadge && !tuto.isEssential && !tuto.isRecommended && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[color:var(--sc-violet-soft)] text-[color:var(--sc-text-on-strong)]">
              <TrendingUp className="w-2.5 h-2.5" /> Populaire
            </span>
          )}
        </div>

        <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed line-clamp-1 sm:line-clamp-2 mb-1.5">
          {tuto.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] text-[color:var(--sc-text-muted)] font-medium">
            <Clock className="w-3 h-3" /> {tuto.duration}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-[color:var(--sc-text-on-strong)]"
            style={{ background: style.bg }}
          >
            {style.label}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-2 sm:flex-col sm:items-stretch lg:flex-row">
        <ScButton
          variant={isDone ? "secondary" : "primary"}
          size="sm"
          onClick={onStart}
          className="flex-1 sm:flex-none whitespace-nowrap"
        >
          {isDone ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" /> Revoir
            </>
          ) : isInProgress ? (
            <>
              <Play className="w-3.5 h-3.5" /> Reprendre
            </>
          ) : (
            <>
              <BookOpen className="w-3.5 h-3.5" /> Commencer
            </>
          )}
        </ScButton>
        <Link
          href={`/tutoriels/${tuto.id}`}
          className="inline-flex items-center justify-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/40 hover:text-[color:var(--sc-blue)] transition-all whitespace-nowrap"
          aria-label={`Voir le detail du tutoriel : ${tuto.title}`}
        >
          Voir
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}

export function TutorialCard({
  tuto,
  onStart,
  status,
  recommendationReason,
  showPopularBadge,
}: {
  tuto: Tutoriel
  onStart: () => void
  status?: TutoStatus
  recommendationReason?: string
  showPopularBadge?: boolean
}) {
  const levelStyles: Record<Niveau, { bg: string; label: string }> = {
    Debutant: { bg: "var(--sc-success)", label: "Debutant" },
    Intermediaire: { bg: "var(--sc-warn)", label: "Intermediaire" },
    Avance: { bg: "var(--sc-violet-soft)", label: "Avance" },
  }
  const style = levelStyles[tuto.level]
  const isDone = status === "done"
  const isInProgress = status === "inprogress"

  return (
    <article
      className={cn(
        "group relative rounded-xl overflow-hidden flex flex-col bg-[color:var(--sc-surface)] border shadow-[var(--sc-shadow-sm)] hover:shadow-[var(--sc-shadow-md)] hover:-translate-y-1 transition-all duration-300 ease-out",
        isDone
          ? "border-[color:var(--sc-success)]/40 hover:border-[color:var(--sc-success)]/60"
          : isInProgress
            ? "border-[color:var(--sc-blue)]/40 hover:border-[color:var(--sc-blue)]/60"
            : "border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/40",
      )}
    >
      {/* Status stripe at top */}
      {isDone && (
        <div className="h-0.5 bg-[color:var(--sc-success)] w-full" />
      )}
      {isInProgress && (
        <div className="h-0.5 bg-[linear-gradient(90deg,var(--sc-blue),var(--sc-indigo))] w-full" />
      )}

      {/* Badges top-right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
        {isDone && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[color:var(--sc-success)] text-[color:var(--sc-text-on-strong)] shadow-sm">
            <Check className="w-2.5 h-2.5" />
            Termine
          </span>
        )}
        {isInProgress && !isDone && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[color:var(--sc-blue)] text-[color:var(--sc-text-on-strong)] shadow-sm">
            <Play className="w-2.5 h-2.5 fill-white" />
            En cours
          </span>
        )}
        {!isDone && !isInProgress && tuto.isRecommended && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[color:var(--sc-blue)] text-[color:var(--sc-text-on-strong)] shadow-sm">
            <Sparkles className="w-2.5 h-2.5" />
            Recommande
          </span>
        )}
        {!isDone && tuto.isEssential && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[color:var(--sc-warn)] text-[color:var(--sc-text-on-strong)] shadow-sm">
            <Star className="w-2.5 h-2.5 fill-white" />
            Essentiel
          </span>
        )}
        {!isDone && showPopularBadge && !tuto.isRecommended && !tuto.isEssential && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[color:var(--sc-violet-soft)] text-[color:var(--sc-text-on-strong)] shadow-sm">
            <TrendingUp className="w-2.5 h-2.5" />
            Populaire
          </span>
        )}
        {!isDone && tuto.isNextStep && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[color:var(--sc-violet-soft)] text-[color:var(--sc-text-on-strong)] shadow-sm">
            <ArrowRight className="w-2.5 h-2.5" />
            Prochaine etape
          </span>
        )}
      </div>

      <div
        className={cn(
          "h-24 flex items-center justify-center text-[color:var(--sc-blue)] relative overflow-hidden",
          isDone
            ? "bg-[color:var(--sc-success)]/8"
            : "bg-[color:var(--sc-bg-soft)]",
        )}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: isDone
              ? "radial-gradient(circle at 50% 120%, rgb(var(--sc-success-rgb)/0.20), transparent 60%)"
              : "radial-gradient(circle at 50% 120%, rgb(var(--sc-blue-rgb)/0.25), transparent 60%)",
          }}
        />
        <div
          className={cn(
            "relative scale-[2.5] transition-transform group-hover:scale-[2.8]",
            isDone && "text-[color:var(--sc-success)]",
          )}
        >
          <TutorialIcon icon={tuto.icon} />
        </div>
        {isDone && (
          <div className="absolute bottom-2 right-2">
            <CheckCircle2 className="w-4 h-4 text-[color:var(--sc-success)]" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Recommendation reason */}
        {recommendationReason && !isDone && (
          <div className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold text-[color:var(--sc-blue)] bg-[color:var(--sc-blue)]/8 rounded-lg px-2 py-1">
            <Lightbulb className="w-3 h-3 shrink-0" />
            {recommendationReason}
          </div>
        )}

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] text-[color:var(--sc-text-muted)] font-medium">
            <Clock className="w-3 h-3" /> {tuto.duration}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-[color:var(--sc-text-on-strong)]"
            style={{ background: style.bg }}
          >
            {style.label}
          </span>
          <span className="text-[10px] font-medium text-[color:var(--sc-text-2)] bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] rounded-full px-2 py-0.5">
            {CATEGORY_LABEL[tuto.category]}
          </span>
        </div>

        <h3 className="font-bold text-sm text-[color:var(--sc-text)] mb-2 leading-tight line-clamp-2 font-display">
          {tuto.title}
        </h3>

        <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed mb-3 flex-1 line-clamp-3">
          {tuto.description}
        </p>

        {/* Tags row */}
        {tuto.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tuto.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-muted)] border border-[color:var(--sc-border)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <ScButton
            variant={isDone ? "secondary" : "primary"}
            size="sm"
            onClick={onStart}
            className="flex-1"
          >
            {isDone ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                Revoir
              </>
            ) : isInProgress ? (
              <>
                <Play className="w-3.5 h-3.5" />
                Reprendre
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                Commencer
              </>
            )}
          </ScButton>
          <Link
            href={`/tutoriels/${tuto.id}`}
            className="inline-flex items-center justify-center gap-1 shrink-0 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/40 hover:text-[color:var(--sc-blue)] transition-all"
            aria-label={`Voir le detail du tutoriel : ${tuto.title}`}
          >
            Voir
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  )
}
