import { ScCard } from '@/components/safecheck/primitives'
import type { ScoreCategorie } from '../categoryScoring'

/*
   Ventilation du résultat par catégorie (SC-020).

   C'est la partie qui rend le résultat actionnable : le score global dit
   « où j'en suis », cette liste dit « sur quoi agir ».
 */

function couleurScore(score: number): string {
  if (score >= 70) return 'var(--sc-success)'
  if (score >= 50) return 'var(--sc-warn)'
  return 'var(--sc-danger)'
}

export function ResultsCategories({ scores }: { scores: ScoreCategorie[] }) {
  const evaluees = scores.filter((s) => !s.nonEvaluee)
  const nonEvaluees = scores.filter((s) => s.nonEvaluee)

  if (evaluees.length === 0) return null

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
        {[...evaluees]
          .sort((a, b) => a.score - b.score)
          .map((s) => (
            <li key={s.categorie}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-sm font-medium text-[color:var(--sc-text)]">
                  {s.categorie}
                </span>
                <span className="text-xs text-[color:var(--sc-text-muted)] shrink-0">
                  <span
                    className="font-bold text-sm"
                    style={{ color: couleurScore(s.score) }}
                  >
                    {s.score}%
                  </span>
                  <span className="ml-2">
                    {s.repondues}/{s.total} question{s.total > 1 ? 's' : ''}
                  </span>
                </span>
              </div>
              <div
                className="relative h-2 rounded-full overflow-hidden bg-[color:var(--sc-surface-2)]"
                role="meter"
                aria-valuenow={s.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${s.categorie} : ${s.score} sur 100`}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{ width: `${s.score}%`, backgroundColor: couleurScore(s.score) }}
                />
              </div>
            </li>
          ))}
      </ul>

      {nonEvaluees.length > 0 && (
        <p className="mt-4 pt-3 border-t border-[color:var(--sc-border)] text-xs text-[color:var(--sc-text-muted)]">
          Thèmes non évalués, faute de réponse :{' '}
          {nonEvaluees.map((s) => s.categorie).join(', ')}. Reprends l&apos;audit pour
          compléter ton diagnostic.
        </p>
      )}
    </ScCard>
  )
}
