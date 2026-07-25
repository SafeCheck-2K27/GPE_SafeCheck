import { ScCard } from "@/components/safecheck/primitives"
import type { CategoryScore } from "../categoryScoring"

/*
   Ventilation du résultat par thème (SC-020). Rend le diagnostic
   actionnable : le score global dit « où j'en suis », cette liste dit
   « sur quoi agir ».
 */

function scoreColor(score: number): string {
  if (score >= 70) return "var(--sc-success)"
  if (score >= 50) return "var(--sc-warn)"
  return "var(--sc-danger)"
}

export function ResultsCategories({ scores }: { scores: CategoryScore[] }) {
  const evaluated = scores.filter((entry) => !entry.notEvaluated)
  const notEvaluated = scores.filter((entry) => entry.notEvaluated)

  if (evaluated.length === 0) return null

  return (
    <ScCard className="p-5">
      <h2 className="font-bold text-base text-[color:var(--sc-text)] mb-1 font-display">
        Ton niveau par thème
      </h2>
      <p className="text-sm text-[color:var(--sc-text-2)] mb-4">
        Le détail de tes réponses, thème par thème. Les scores les plus bas sont
        ceux sur lesquels agir en premier.
      </p>

      <ul className="flex flex-col gap-3">
        {[...evaluated]
          .sort((a, b) => a.score - b.score)
          .map((entry) => (
            <li key={entry.category}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-sm font-medium text-[color:var(--sc-text)]">
                  {entry.category}
                </span>
                <span className="text-xs text-[color:var(--sc-text-muted)] shrink-0">
                  <span className="font-bold text-sm" style={{ color: scoreColor(entry.score) }}>
                    {entry.score}%
                  </span>
                  <span className="ml-2">
                    {entry.answered}/{entry.total} question{entry.total > 1 ? "s" : ""}
                  </span>
                </span>
              </div>
              <div
                className="relative h-2 rounded-full overflow-hidden bg-[color:var(--sc-surface-2)]"
                role="meter"
                aria-valuenow={entry.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${entry.category} : ${entry.score} sur 100`}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{ width: `${entry.score}%`, backgroundColor: scoreColor(entry.score) }}
                />
              </div>
            </li>
          ))}
      </ul>

      {notEvaluated.length > 0 && (
        <p className="mt-4 pt-3 border-t border-[color:var(--sc-border)] text-xs text-[color:var(--sc-text-muted)]">
          Thèmes non évalués, faute de réponse :{" "}
          {notEvaluated.map((entry) => entry.category).join(", ")}. Reprends l&apos;audit
          pour compléter ton diagnostic.
        </p>
      )}
    </ScCard>
  )
}
