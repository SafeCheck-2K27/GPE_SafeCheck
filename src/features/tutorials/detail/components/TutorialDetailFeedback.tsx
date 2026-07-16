"use client"

import { useState } from "react"
import { ScBadge, ScButton } from "@/components/safecheck/primitives"
import type { Tutoriel } from "../../data/catalog"
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flag,
  MessageSquare,
  Send,
  ThumbsUp,
} from "lucide-react"
import { getMockTutorialComments } from "../data"

export function TutorialDetailFeedback({
  tutorial,
  onOpenPrecision,
}: {
  tutorial: Tutoriel
  onOpenPrecision: (stepTitle?: string) => void
}) {
  const [helpfulCount, setHelpfulCount] = useState(
    tutorial.id === 1 ? 47 : tutorial.id === 6 ? 31 : 12,
  )
  const [hasVoted, setHasVoted] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [commentSent, setCommentSent] = useState(false)
  const [expandComments, setExpandComments] = useState(false)

  const comments = getMockTutorialComments(tutorial.id)
  const displayedComments = expandComments ? comments : comments.slice(0, 2)

  const handleVote = () => {
    if (!hasVoted) {
      setHelpfulCount((count) => count + 1)
      setHasVoted(true)
    }
  }

  const handleSendComment = () => {
    if (!newComment.trim()) return
    setCommentSent(true)
  }

  return (
    <section className="mt-8 rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] overflow-hidden">
      <div className="p-5 border-b border-[color:var(--sc-border)] bg-[color:var(--sc-bg-soft)]">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-[color:var(--sc-blue)]" />
          <h2 className="font-bold text-base text-[color:var(--sc-text)]">
            Commentaires et precisions
          </h2>
        </div>
        <p className="text-xs text-[color:var(--sc-text-muted)]">
          Espace modere. Les contributions sont relues avant publication.
        </p>
      </div>

      <div className="p-5 space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)]">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[color:var(--sc-text)] mb-0.5">
              Ce tutoriel vous a aide ?
            </p>
            <p className="text-xs text-[color:var(--sc-text-muted)]">
              <span className="font-bold text-[color:var(--sc-blue)]">
                {helpfulCount} personnes
              </span>{" "}
              ont trouve ce tutoriel utile.
            </p>
          </div>
          <ScButton
            variant={hasVoted ? "secondary" : "primary"}
            size="sm"
            onClick={handleVote}
            disabled={hasVoted}
          >
            <ThumbsUp
              className={`w-3.5 h-3.5 ${hasVoted ? "fill-current" : ""}`}
            />
            {hasVoted ? "Merci !" : "Ce tutoriel m'a aide"}
          </ScButton>
        </div>

        {comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[color:var(--sc-border)] p-8 text-center">
            <MessageSquare className="w-8 h-8 text-[color:var(--sc-text-muted)] mx-auto mb-3 opacity-40" />
            <p className="text-sm text-[color:var(--sc-text-muted)]">
              Aucun commentaire pour le moment. Soyez le premier a partager votre experience.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedComments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-xl p-4 border ${comment.helpful ? "bg-[color:var(--sc-bg-soft)] border-[color:var(--sc-border)]" : "bg-[color:var(--sc-surface-2)] border-[color:var(--sc-border)]"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[color:var(--sc-blue)]/10 border border-[color:var(--sc-blue)]/20 flex items-center justify-center text-[10px] font-bold text-[color:var(--sc-blue)]">
                      {comment.author.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-[color:var(--sc-text)]">
                      {comment.author}
                    </span>
                    {!comment.helpful && (
                      <ScBadge tone="warn">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Precision
                      </ScBadge>
                    )}
                  </div>
                  <span className="text-[10px] text-[color:var(--sc-text-muted)]">
                    {comment.date}
                  </span>
                </div>
                <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
                  {comment.text}
                </p>
              </div>
            ))}

            {comments.length > 2 && (
              <button
                type="button"
                onClick={() => setExpandComments(!expandComments)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--sc-blue)] hover:underline"
              >
                {expandComments ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" /> Reduire les commentaires
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" /> Voir les{" "}
                    {comments.length - 2} autres commentaire
                    {comments.length - 2 > 1 ? "s" : ""}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <div className="border-t border-[color:var(--sc-border)] pt-5 space-y-3">
          {commentSent ? (
            <div className="flex items-center gap-2 rounded-xl bg-[color:var(--sc-success)]/10 border border-[color:var(--sc-success)]/30 p-4">
              <CheckCircle2 className="w-4 h-4 text-[color:var(--sc-success)]" />
              <p className="text-sm text-[color:var(--sc-success)] font-medium">
                Commentaire envoye. Il sera relu avant publication.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)] border border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/40 bg-[color:var(--sc-bg-soft)] rounded-lg px-3 py-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Ajouter un commentaire
                </button>
                <ScButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onOpenPrecision()}
                  className="border-[color:var(--sc-blue)]/40 text-[color:var(--sc-blue)] hover:bg-[color:var(--sc-blue)]/5"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Apporter une precision
                </ScButton>
              </div>

              {showCommentForm && (
                <div className="space-y-3 pt-1">
                  <textarea
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder="Partagez votre experience avec ce tutoriel..."
                    rows={3}
                    className="w-full rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-bg-soft)] px-3 py-2 text-sm text-[color:var(--sc-text)] placeholder:text-[color:var(--sc-text-muted)] focus:outline-none focus:border-[color:var(--sc-blue)]/60 focus:ring-1 focus:ring-[color:var(--sc-blue)]/20 resize-none"
                  />
                  <div className="flex gap-2">
                    <ScButton
                      variant="primary"
                      size="sm"
                      onClick={handleSendComment}
                      disabled={!newComment.trim()}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Envoyer
                    </ScButton>
                    <ScButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCommentForm(false)
                        setNewComment("")
                      }}
                    >
                      Annuler
                    </ScButton>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
