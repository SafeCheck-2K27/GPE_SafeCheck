"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { ScButton, ScBadge } from "@/components/safecheck/primitives"
import { TutorialModal } from "@/features/tutorials/components/TutorialModal"
import { TutorialPrecisionModal } from "@/features/tutorials/components/TutorialPrecisionModal"
import { tutoriels, CATEGORY_LABEL } from "@/lib/tutoriels-data"
import type { Tutoriel } from "@/lib/tutoriels-data"
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  BookOpen,
  CheckCircle2,
  Zap,
  Sparkles,
  Shield,
  Target,
  ListChecks,
  GraduationCap,
  Flame,
  Users,
  ThumbsUp,
  MessageSquare,
  AlertCircle,
  Flag,
  Send,
  ChevronDown,
  ChevronUp,
  Bookmark,
  RotateCcw,
  ArrowRight,
  BookText,
  Hash,
} from "lucide-react"

/* LEXIQUE - mots cles avec mini-définitions */
const lexiqueTerms: Record<string, string> = {
  "double authentification": "Methode de securite qui exige deux preuves d'identite : ton mot de passe + un code temporaire envoye sur un autre appareil.",
  "2FA": "Two-Factor Authentication. Voir 'double authentification'. Protege ton compte meme si ton mot de passe est compromis.",
  "phishing": "Tentative de fraude par email, SMS ou faux site imitant une organisation de confiance pour voler tes identifiants.",
  "mot de passe": "Sequence secrete permettant d'acceder a un compte. Doit etre long, complexe et unique par service.",
  "compte Google": "Identifiant centralise donnant acces a tous les services Google : Gmail, Drive, YouTube, etc.",
  "appareil de confiance": "Appareil reconnu par un service qui n'exige plus la double authentification a chaque connexion.",
  "codes de secours": "Codes a usage unique generes lors de l'activation de la 2FA. Permettent d'acceder au compte si tu perds ton telephone.",
  "authentificateur": "Application (Google Authenticator, Authy...) qui genere des codes temporaires a 6 chiffres pour la 2FA.",
  "VPN": "Reseau prive virtuel qui chiffre ta connexion et masque ton adresse IP. Ne rend pas anonyme.",
  "chiffrement": "Transformation des donnees en code illisible sans la cle adequate. Protege les fichiers et les communications.",
  "ransomware": "Logiciel malveillant qui chiffre tes fichiers et exige une rancon pour les restituer.",
  "Wi-Fi": "Reseau sans fil. Un Wi-Fi public ou mal securise peut etre intercepte par des attaquants.",
  "DNS": "Systeme de noms de domaine. Traduit les adresses web (google.com) en adresses IP numeriques.",
}

/* MOCK DATA - commentaires et feedback */
interface MockComment {
  id: number
  author: string
  date: string
  text: string
  helpful: boolean
}

const getMockComments = (tutoId: number): MockComment[] => {
  if (tutoId === 1) {
    return [
      {
        id: 1,
        author: "Marie T.",
        date: "il y a 3 jours",
        text: "Super clair, j'ai pu activer la 2FA en moins de 5 minutes. Le conseil sur Google Authenticator plutot que le SMS est tres pertinent.",
        helpful: true,
      },
      {
        id: 2,
        author: "Paul R.",
        date: "il y a 1 semaine",
        text: "Attention : depuis la derniere mise a jour de Google, l'interface a legerement change. La validation en deux etapes se trouve maintenant sous 'Comment vous vous connectez a Google'.",
        helpful: false,
      },
      {
        id: 3,
        author: "Sophie M.",
        date: "il y a 2 semaines",
        text: "Tres bien explique, meme pour une debutante comme moi. J'avais peur que ce soit complique mais non !",
        helpful: true,
      },
    ]
  }
  if (tutoId === 6) {
    return [
      {
        id: 1,
        author: "David L.",
        date: "il y a 5 jours",
        text: "Tutoriel essentiel. J'ajoute : attention aux emails qui utilisent votre prenom - ca ne veut pas dire que l'expediteur est legitime.",
        helpful: true,
      },
      {
        id: 2,
        author: "Celine B.",
        date: "il y a 2 semaines",
        text: "Le conseil de ne jamais cliquer sur un lien dans un email de banque est d'or. J'ai failli me faire avoir.",
        helpful: true,
      },
    ]
  }
  return [
    {
      id: 1,
      author: "Utilisateur anonyme",
      date: "il y a 4 jours",
      text: "Tutoriel bien structure et actionnable. Merci a l'equipe SafeCheck.",
      helpful: true,
    },
  ]
}

/* TOOLTIP COMPONENT */
function LexiqueTooltip({ text, term }: { text: string; term: string }) {
  const [open, setOpen] = useState(false)
  const def = lexiqueTerms[term.toLowerCase()] || lexiqueTerms[term]

  if (!def) return <span>{text}</span>

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="underline decoration-dotted underline-offset-2 decoration-[color:var(--sc-blue)]/60 text-[color:var(--sc-blue)] hover:decoration-solid cursor-help transition-all"
        aria-label={`Definition de ${term}`}
      >
        {text}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-0 mb-2 z-50 w-64 rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-md)] p-3 text-left pointer-events-none"
        >
          <span className="block text-[10px] font-bold text-[color:var(--sc-blue)] uppercase tracking-wider mb-1">
            Lexique SafeCheck
          </span>
          <span className="block text-xs text-[color:var(--sc-text-2)] leading-relaxed">{def}</span>
        </span>
      )}
    </span>
  )
}

/* REPLACE LEXIQUE TERMS IN TEXT */
function TextWithLexique({ text }: { text: string }) {
  const terms = Object.keys(lexiqueTerms)
  // Sort by length descending so longer terms match first
  const sorted = [...terms].sort((a, b) => b.length - a.length)

  // Build a regex alternation
  const pattern = sorted.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")
  const regex = new RegExp(`(${pattern})`, "gi")
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) => {
        const matchedTerm = sorted.find((t) => t.toLowerCase() === part.toLowerCase())
        if (matchedTerm) {
          return <LexiqueTooltip key={i} text={part} term={matchedTerm} />
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

/*
   TAGS LEXIQUE - mots-clés cliquables qui renvoient vers /lexique
   Intégration visuelle légère : détecte les termes du lexique présents
   dans le tutoriel et propose un raccourci vers la fiche correspondante.
 */
const LEXIQUE_TAG_MAP: { label: string; slug: string; patterns: string[] }[] = [
  { label: "2FA", slug: "2fa", patterns: ["double authentification", "2fa", "validation en deux"] },
  { label: "Mot de passe", slug: "mot-de-passe", patterns: ["mot de passe"] },
  { label: "Gestionnaire de mots de passe", slug: "gestionnaire-mdp", patterns: ["bitwarden", "gestionnaire"] },
  { label: "Phishing", slug: "phishing", patterns: ["phishing", "hameçonnage", "faux lien", "url spoofing"] },
  { label: "Fuite de données", slug: "fuite-de-donnees", patterns: ["compromis", "fuite", "pwned"] },
  { label: "Chiffrement", slug: "chiffrement", patterns: ["chiffr"] },
  { label: "Ransomware", slug: "ransomware", patterns: ["ransomware", "rançongiciel"] },
  { label: "VPN", slug: "vpn", patterns: ["vpn"] },
  { label: "Pare-feu", slug: "pare-feu", patterns: ["pare-feu", "firewall"] },
  { label: "Adresse IP", slug: "adresse-ip", patterns: ["adresse ip", "ports ouverts", "reseau a domicile"] },
  { label: "Cookie", slug: "cookie", patterns: ["cookie", "navigateur"] },
  { label: "Malware", slug: "malware", patterns: ["malware", "apps a risque", "permissions"] },
  { label: "Software", slug: "software", patterns: ["mise a jour", "extension", "logiciel"] },
]

function LexiqueTags({ text }: { text: string }) {
  const haystack = text.toLowerCase()
  const matches = LEXIQUE_TAG_MAP.filter((tag) =>
    tag.patterns.some((p) => haystack.includes(p)),
  ).slice(0, 5)

  if (matches.length === 0) return null

  return (
    <div className="mt-4 pt-4 border-t border-[color:var(--sc-border)]">
      <div className="flex items-center gap-1.5 mb-2.5">
        <BookText className="w-3.5 h-3.5 text-[color:var(--sc-blue)]" />
        <span className="text-[11px] font-bold text-[color:var(--sc-blue)] uppercase tracking-wider">
          Termes du lexique
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {matches.map((tag) => (
          <Link
            key={tag.slug}
            href={`/lexique?terme=${tag.slug}`}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-text-2)] border border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)] transition-colors"
          >
            <Hash className="w-3 h-3 opacity-60" />
            {tag.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

/* FEEDBACK SECTION */
function FeedbackSection({
  tuto,
  onOpenPrecision,
}: {
  tuto: Tutoriel
  onOpenPrecision: (stepTitle?: string) => void
}) {
  const [helpfulCount, setHelpfulCount] = useState(tuto.id === 1 ? 47 : tuto.id === 6 ? 31 : 12)
  const [hasVoted, setHasVoted] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [commentSent, setCommentSent] = useState(false)
  const [expandComments, setExpandComments] = useState(false)

  const comments = getMockComments(tuto.id)
  const displayedComments = expandComments ? comments : comments.slice(0, 2)

  const handleVote = () => {
    if (!hasVoted) {
      setHelpfulCount((c) => c + 1)
      setHasVoted(true)
    }
  }

  const handleSendComment = () => {
    if (!newComment.trim()) return
    setCommentSent(true)
  }

  return (
    <section className="mt-8 rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] overflow-hidden">
      {/* Section header */}
      <div className="p-5 border-b border-[color:var(--sc-border)] bg-[color:var(--sc-bg-soft)]">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-[color:var(--sc-blue)]" />
          <h2 className="font-bold text-base text-[color:var(--sc-text)]">Commentaires et precisions</h2>
        </div>
        <p className="text-xs text-[color:var(--sc-text-muted)]">
          Espace modere. Les contributions sont relues avant publication.
        </p>
      </div>

      <div className="p-5 space-y-6">
        {/* Helpful vote */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)]">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[color:var(--sc-text)] mb-0.5">
              Ce tutoriel vous a aide ?
            </p>
            <p className="text-xs text-[color:var(--sc-text-muted)]">
              <span className="font-bold text-[color:var(--sc-blue)]">{helpfulCount} personnes</span> ont trouve ce tutoriel utile.
            </p>
          </div>
          <ScButton
            variant={hasVoted ? "secondary" : "primary"}
            size="sm"
            onClick={handleVote}
            disabled={hasVoted}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? "fill-current" : ""}`} />
            {hasVoted ? "Merci !" : "Ce tutoriel m'a aide"}
          </ScButton>
        </div>

        {/* Comments list */}
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
                className={`rounded-xl p-4 border ${ comment.helpful ? "bg-[color:var(--sc-bg-soft)] border-[color:var(--sc-border)]" : "bg-[color:var(--sc-surface-2)] border-[color:var(--sc-border)]" }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[color:var(--sc-blue)]/10 border border-[color:var(--sc-blue)]/20 flex items-center justify-center text-[10px] font-bold text-[color:var(--sc-blue)]">
                      {comment.author.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-[color:var(--sc-text)]">{comment.author}</span>
                    {!comment.helpful && (
                      <ScBadge tone="warn">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Precision
                      </ScBadge>
                    )}
                  </div>
                  <span className="text-[10px] text-[color:var(--sc-text-muted)]">{comment.date}</span>
                </div>
                <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">{comment.text}</p>
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
                    <ChevronDown className="w-3.5 h-3.5" /> Voir les {comments.length - 2} autres commentaire{comments.length - 2 > 1 ? "s" : ""}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Comment form */}
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
                    onChange={(e) => setNewComment(e.target.value)}
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

/* LEVEL BADGE HELPER */
function LevelBadge({ level }: { level: Tutoriel["level"] }) {
  const map = {
    Debutant: { tone: "success" as const, icon: <GraduationCap className="w-3 h-3" /> },
    Intermediaire: { tone: "warn" as const, icon: <Flame className="w-3 h-3" /> },
    Avance: { tone: "premium" as const, icon: <Zap className="w-3 h-3" /> },
  }
  const { tone, icon } = map[level]
  return (
    <ScBadge tone={tone}>
      {icon}
      {level}
    </ScBadge>
  )
}

/* MAIN DETAIL PAGE */
export default function TutorielDetailPage() {
  const params = useParams()
  const router = useRouter()
  // The dynamic segment accepts either a slug ("phishing") or a numeric id
  // ("6"). Slugs are the canonical URLs; numeric ids are kept for backward
  // compatibility with older links.
  const routeParam = Array.isArray(params.id) ? params.id[0] : params.id
  const tuto = tutoriels.find(
    (t) => t.slug === routeParam || t.id === Number(routeParam)
  )

  const [readerOpen, setReaderOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [saved, setSaved] = useState(false)
  const [markedDone, setMarkedDone] = useState(false)

  const [precisionOpen, setPrecisionOpen] = useState(false)
  const [precisionStepTitle, setPrecisionStepTitle] = useState<string | undefined>(undefined)

  const openPrecision = (stepTitle?: string) => {
    setPrecisionStepTitle(stepTitle)
    setPrecisionOpen(true)
  }

  const markStep = (i: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const openReader = () => {
    setReaderOpen(true)
    setCurrentStep(0)
    if (!markedDone) setCompletedSteps(new Set())
  }

  if (!tuto) {
    return (
      <PageShell>
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center text-center">
          <Shield className="w-12 h-12 text-[color:var(--sc-text-muted)] mb-4 opacity-40" />
          <h1 className="text-2xl font-bold text-[color:var(--sc-text)] mb-2">Tutoriel introuvable</h1>
          <p className="text-sm text-[color:var(--sc-text-muted)] mb-6">
            Ce tutoriel n&apos;existe pas ou a ete deplace.
          </p>
          <ScButton variant="primary" size="sm" onClick={() => router.push("/tutoriels")}>
            <ChevronLeft className="w-3.5 h-3.5" />
            Retour aux tutoriels
          </ScButton>
        </main>
        <Footer />
      </PageShell>
    )
  }

  const progressPercent =
    completedSteps.size > 0 ? Math.round((completedSteps.size / tuto.steps.length) * 100) : 0

  // Determine tutorial state
  const tutoState: "not_started" | "in_progress" | "done" =
    markedDone ? "done" : completedSteps.size > 0 ? "in_progress" : "not_started"

  const relatedTutos = tutoriels
    .filter(
      (t) => t.id !== tuto.id && (t.category === tuto.category || t.level === tuto.level),
    )
    .slice(0, 3)

  return (
    <PageShell>
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-[color:var(--sc-text-muted)] mb-5">
          <Link href="/tutoriels" className="hover:text-[color:var(--sc-blue)] transition-colors">
            Tutoriels
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[color:var(--sc-text-2)] truncate max-w-xs">{tuto.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* LEFT COLUMN */}
          <div className="min-w-0">
            {/* Hero card */}
            <div className="relative overflow-hidden rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-md)] mb-6">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(at 0% 0%, rgba(37,99,235,0.10), transparent 50%), radial-gradient(at 100% 100%, rgba(99,102,241,0.08), transparent 50%)",
                }}
                aria-hidden
              />
              <div className="relative p-6">
                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <LevelBadge level={tuto.level} />
                  <ScBadge tone="muted">
                    <Clock className="w-3 h-3" />
                    {tuto.duration}
                  </ScBadge>
                  <ScBadge tone="info">
                    {CATEGORY_LABEL[tuto.category]}
                  </ScBadge>
                  {tuto.platform && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--sc-text-muted)] bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] rounded-full px-2.5 py-0.5 font-medium">
                      {tuto.platform}
                    </span>
                  )}
                  {/* State indicator */}
                  {tutoState === "in_progress" && (
                    <ScBadge tone="warn">
                      <Flame className="w-3 h-3" />
                      En cours ({progressPercent}%)
                    </ScBadge>
                  )}
                  {tutoState === "done" && (
                    <ScBadge tone="success">
                      <CheckCircle2 className="w-3 h-3" />
                      Termine
                    </ScBadge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--sc-text)] font-display mb-3 text-balance">
                  {tuto.title}
                </h1>

                {/* Description */}
                <p className="text-sm md:text-base text-[color:var(--sc-text-2)] leading-relaxed mb-4 text-pretty">
                  <TextWithLexique text={tuto.description} />
                </p>

                {/* Objective */}
                {tuto.objective && (
                  <div className="flex items-start gap-3 rounded-xl bg-[color:var(--sc-blue)]/5 border border-[color:var(--sc-blue)]/20 p-4 mb-5">
                    <Target className="w-4 h-4 text-[color:var(--sc-blue)] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-[color:var(--sc-blue)] uppercase tracking-wider mb-1">
                        Objectif concret
                      </p>
                      <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
                        <TextWithLexique text={tuto.objective} />
                      </p>
                    </div>
                  </div>
                )}

                {/* CTA buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <ScButton variant="primary" onClick={openReader} className="gap-2">
                    <Zap className="w-4 h-4" />
                    Lancer le tutoriel guide
                  </ScButton>
                  <ScButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setSaved(!saved)}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
                    {saved ? "Sauvegarde" : "Sauvegarder"}
                  </ScButton>
                  {tutoState === "in_progress" && (
                    <ScButton
                      variant="ghost"
                      size="sm"
                      onClick={openReader}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reprendre
                    </ScButton>
                  )}
                  <ScButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setMarkedDone(!markedDone)}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${markedDone ? "text-[color:var(--sc-success)]" : ""}`} />
                    {markedDone ? "Marque comme termine" : "Marquer comme termine"}
                  </ScButton>
                </div>

                {/* Tags Lexique - intégration légère vers la page Lexique */}
                <LexiqueTags text={`${tuto.title} ${tuto.description} ${tuto.objective ?? ""}`} />

                {/* Progress bar if in progress */}
                {tutoState === "in_progress" && (
                  <div className="mt-4 pt-4 border-t border-[color:var(--sc-border)]">
                    <div className="flex justify-between text-xs text-[color:var(--sc-text-2)] mb-1.5">
                      <span>{completedSteps.size} etape{completedSteps.size > 1 ? "s" : ""} sur {tuto.steps.length} completee{completedSteps.size > 1 ? "s" : ""}</span>
                      <span className="font-bold text-[color:var(--sc-blue)]">{progressPercent}%</span>
                    </div>
                    <div className="relative h-1.5 bg-[color:var(--sc-surface-2)] rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#3B82F6,#2563EB)] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ce que vous allez apprendre */}
            {tuto.learns && tuto.learns.length > 0 && (
              <section className="rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[color:var(--sc-blue)]" />
                  <h2 className="font-bold text-base text-[color:var(--sc-text)]">
                    Ce que vous allez apprendre
                  </h2>
                </div>
                <ul className="space-y-2.5">
                  {tuto.learns.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[color:var(--sc-blue)]/10 border border-[color:var(--sc-blue)]/25 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-[color:var(--sc-blue)]" />
                      </span>
                      <span className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
                        <TextWithLexique text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Etapes du tutoriel (checklist preview) */}
            <section className="rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ListChecks className="w-4 h-4 text-[color:var(--sc-blue)]" />
                <h2 className="font-bold text-base text-[color:var(--sc-text)]">
                  Apercu des etapes
                </h2>
                <span className="ml-auto text-xs text-[color:var(--sc-text-muted)]">
                  {tuto.steps.length} etape{tuto.steps.length > 1 ? "s" : ""}
                </span>
              </div>
              <ol className="space-y-2">
                {tuto.steps.map((step, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 rounded-xl p-3 border transition-all ${ completedSteps.has(i) ? "bg-[color:var(--sc-success)]/6 border-[color:var(--sc-success)]/25" : "bg-[color:var(--sc-bg-soft)] border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/25" }`}
                  >
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${ completedSteps.has(i) ? "bg-[color:var(--sc-success)] border-[color:var(--sc-success)] text-white" : "border-[color:var(--sc-border-strong)] text-[color:var(--sc-text-muted)]" }`}
                    >
                      {completedSteps.has(i) ? <Check className="w-3 h-3" /> : i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold leading-snug ${ completedSteps.has(i) ? "text-[color:var(--sc-success)] line-through decoration-[color:var(--sc-success)]/40" : "text-[color:var(--sc-text)]" }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-[color:var(--sc-text-muted)] mt-0.5 leading-relaxed line-clamp-1">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-4 pt-4 border-t border-[color:var(--sc-border)]">
                <ScButton variant="primary" size="sm" onClick={openReader} className="w-full">
                  <Zap className="w-3.5 h-3.5" />
                  {tutoState === "in_progress" ? "Reprendre le tutoriel guide" : "Lancer le tutoriel guide"}
                </ScButton>
              </div>
            </section>

            {/* Feedback & comments */}
            <FeedbackSection tuto={tuto} onOpenPrecision={openPrecision} />
          </div>

          {/* RIGHT COLUMN (sidebar) */}
          <aside className="space-y-4">
            {/* Prerequisites */}
            {tuto.prerequisites && tuto.prerequisites.length > 0 && (
              <div className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-[color:var(--sc-blue)]" />
                  <span className="text-xs font-bold text-[color:var(--sc-text)] uppercase tracking-wider">
                    Prerequis
                  </span>
                </div>
                <ul className="space-y-2">
                  {tuto.prerequisites.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-[color:var(--sc-blue)] mt-0.5 shrink-0" />
                      <span className="text-xs text-[color:var(--sc-text-2)] leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tutorial info summary */}
            <div className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-4">
              <h3 className="text-xs font-bold text-[color:var(--sc-text)] uppercase tracking-wider mb-3">
                Informations
              </h3>
              <dl className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-[color:var(--sc-text-muted)]">Niveau</dt>
                  <dd><LevelBadge level={tuto.level} /></dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-[color:var(--sc-text-muted)]">Duree</dt>
                  <dd className="text-xs font-semibold text-[color:var(--sc-text)]">{tuto.duration}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-[color:var(--sc-text-muted)]">Categorie</dt>
                  <dd className="text-xs font-semibold text-[color:var(--sc-text)]">{CATEGORY_LABEL[tuto.category]}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-[color:var(--sc-text-muted)]">Etapes</dt>
                  <dd className="text-xs font-semibold text-[color:var(--sc-text)]">{tuto.steps.length}</dd>
                </div>
                {tuto.platform && (
                  <div className="flex justify-between items-start gap-2">
                    <dt className="text-xs text-[color:var(--sc-text-muted)] shrink-0">Plateforme</dt>
                    <dd className="text-xs font-semibold text-[color:var(--sc-text)] text-right">{tuto.platform}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Lexique hint */}
            <div className="rounded-xl border border-[color:var(--sc-blue)]/20 bg-[color:var(--sc-blue)]/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-[color:var(--sc-blue)]" />
                <span className="text-xs font-bold text-[color:var(--sc-blue)]">Lexique SafeCheck</span>
              </div>
              <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed">
                Les mots{" "}
                <span className="underline decoration-dotted underline-offset-2 text-[color:var(--sc-blue)]">
                  soulignés en bleu
                </span>{" "}
                sont des termes du lexique. Survolez-les pour afficher leur definition.
              </p>
            </div>

            {/* Tags */}
            {tuto.tags.length > 0 && (
              <div className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-4">
                <span className="text-xs font-bold text-[color:var(--sc-text)] uppercase tracking-wider block mb-2">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tuto.tags.map((tag) => (
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

            {/* Related tutorials */}
            {relatedTutos.length > 0 && (
              <div className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-3.5 h-3.5 text-[color:var(--sc-blue)]" />
                  <span className="text-xs font-bold text-[color:var(--sc-text)] uppercase tracking-wider">
                    Tutoriels lies
                  </span>
                </div>
                <ul className="space-y-2">
                  {relatedTutos.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/tutoriels/${t.id}`}
                        className="flex items-start gap-2 group"
                      >
                        <ArrowRight className="w-3 h-3 text-[color:var(--sc-blue)] mt-1 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        <span className="text-xs text-[color:var(--sc-text-2)] group-hover:text-[color:var(--sc-blue)] transition-colors leading-relaxed">
                          {t.title}
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
        </div>
      </main>

      <Footer />

      {/* Guided reader modal */}
      {readerOpen && (
        <TutorialModal
          tuto={tuto}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={setCurrentStep}
          onMarkStep={markStep}
          onClose={() => setReaderOpen(false)}
          onOpenPrecision={openPrecision}
          renderStepDescription={(description) => <TextWithLexique text={description} />}
          precisionLinkPosition="after-completion"
        />
      )}

      {/* Precision modal */}
      {precisionOpen && (
        <TutorialPrecisionModal
          onClose={() => setPrecisionOpen(false)}
          stepTitle={precisionStepTitle}
          submitIcon={<Send className="w-3.5 h-3.5" />}
        />
      )}
    </PageShell>
  )
}
