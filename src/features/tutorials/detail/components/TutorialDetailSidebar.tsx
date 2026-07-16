import Link from "next/link"
import { CATEGORY_LABEL } from "../../data/catalog"
import type { Tutoriel } from "../../data/catalog"
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react"
import { TutorialDetailLevelBadge } from "./TutorialDetailLevelBadge"

export function TutorialDetailSidebar({
  tutorial,
  relatedTutorials,
}: {
  tutorial: Tutoriel
  relatedTutorials: Tutoriel[]
}) {
  return (
    <aside className="space-y-4">
      {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
        <div className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-[color:var(--sc-blue)]" />
            <span className="text-xs font-bold text-[color:var(--sc-text)] uppercase tracking-wider">
              Prerequis
            </span>
          </div>
          <ul className="space-y-2">
            {tutorial.prerequisites.map((requirement, index) => (
              <li key={index} className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 text-[color:var(--sc-blue)] mt-0.5 shrink-0" />
                <span className="text-xs text-[color:var(--sc-text-2)] leading-relaxed">
                  {requirement}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-4">
        <h3 className="text-xs font-bold text-[color:var(--sc-text)] uppercase tracking-wider mb-3">
          Informations
        </h3>
        <dl className="space-y-2.5">
          <div className="flex justify-between items-center">
            <dt className="text-xs text-[color:var(--sc-text-muted)]">Niveau</dt>
            <dd>
              <TutorialDetailLevelBadge level={tutorial.level} />
            </dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-xs text-[color:var(--sc-text-muted)]">Duree</dt>
            <dd className="text-xs font-semibold text-[color:var(--sc-text)]">
              {tutorial.duration}
            </dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-xs text-[color:var(--sc-text-muted)]">Categorie</dt>
            <dd className="text-xs font-semibold text-[color:var(--sc-text)]">
              {CATEGORY_LABEL[tutorial.category]}
            </dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-xs text-[color:var(--sc-text-muted)]">Etapes</dt>
            <dd className="text-xs font-semibold text-[color:var(--sc-text)]">
              {tutorial.steps.length}
            </dd>
          </div>
          {tutorial.platform && (
            <div className="flex justify-between items-start gap-2">
              <dt className="text-xs text-[color:var(--sc-text-muted)] shrink-0">
                Plateforme
              </dt>
              <dd className="text-xs font-semibold text-[color:var(--sc-text)] text-right">
                {tutorial.platform}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-xl border border-[color:var(--sc-blue)]/20 bg-[color:var(--sc-blue)]/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-3.5 h-3.5 text-[color:var(--sc-blue)]" />
          <span className="text-xs font-bold text-[color:var(--sc-blue)]">
            Lexique SafeCheck
          </span>
        </div>
        <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed">
          Les mots{" "}
          <span className="underline decoration-dotted underline-offset-2 text-[color:var(--sc-blue)]">
            soulignés en bleu
          </span>{" "}
          sont des termes du lexique. Survolez-les pour afficher leur definition.
        </p>
      </div>

      {tutorial.tags.length > 0 && (
        <div className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-4">
          <span className="text-xs font-bold text-[color:var(--sc-text)] uppercase tracking-wider block mb-2">
            Tags
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tutorial.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-muted)] border border-[color:var(--sc-border)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {relatedTutorials.length > 0 && (
        <div className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-3.5 h-3.5 text-[color:var(--sc-blue)]" />
            <span className="text-xs font-bold text-[color:var(--sc-text)] uppercase tracking-wider">
              Tutoriels lies
            </span>
          </div>
          <ul className="space-y-2">
            {relatedTutorials.map((relatedTutorial) => (
              <li key={relatedTutorial.id}>
                <Link
                  href={`/tutoriels/${relatedTutorial.id}`}
                  className="flex items-start gap-2 group"
                >
                  <ArrowRight className="w-3 h-3 text-[color:var(--sc-blue)] mt-1 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span className="text-xs text-[color:var(--sc-text-2)] group-hover:text-[color:var(--sc-blue)] transition-colors leading-relaxed">
                    {relatedTutorial.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-[color:var(--sc-border)]">
            <Link
              href="/tutoriels"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--sc-blue)] hover:underline"
            >
              <BookOpen className="w-3 h-3" />
              Tous les tutoriels
            </Link>
          </div>
        </div>
      )}
    </aside>
  )
}
