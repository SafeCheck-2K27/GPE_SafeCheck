"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { ScButton } from "@/components/safecheck/primitives"
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react"

interface Question {
  id: number
  category: string
  text: string
  options: { label: string; value: string; score: number }[]
}

const questions: Question[] = [
  {
    id: 1,
    category: "Connaissances générales",
    text: "La cybersécurité, tu t'y connais ou pas ?",
    options: [
      { label: "Je maîtrise bien, je sais ce qu'est un pare-feu, un VPN, le chiffrement.", value: "a", score: 10 },
      { label: "J'ai quelques bases, je connais les mots de passe et les antivirus.", value: "b", score: 6 },
      { label: "Pas vraiment, j'ai entendu parler mais ça reste vague pour moi.", value: "c", score: 3 },
      { label: "C'est quoi la cybersécurité ? Je ne connais pas du tout.", value: "d", score: 0 },
    ],
  },
  {
    id: 2,
    category: "Navigation sur internet",
    text: "Tu sais comment aller sur internet ou tu t'es retrouvé là par hasard ?",
    options: [
      { label: "Oui, j'utilise internet tous les jours sans problème.", value: "a", score: 10 },
      { label: "Oui, mais j'ai parfois du mal à trouver ce que je cherche.", value: "b", score: 7 },
      { label: "Un peu, j'ai besoin d'aide parfois.", value: "c", score: 3 },
      { label: "Non, c'est encore un grand mystère pour moi.", value: "d", score: 0 },
    ],
  },
  {
    id: 3,
    category: "Mots de passe",
    text: "Sinon, tu n'as jamais entendu parler d'un film de gladiateurs ? (Est-ce que tu utilises le même mot de passe partout ?)",
    options: [
      { label: "Non, j'utilise un gestionnaire de mots de passe avec des mots de passe uniques.", value: "a", score: 10 },
      { label: "J'ai quelques variations, mais certains sont réutilisés.", value: "b", score: 5 },
      { label: "Souvent oui, c'est plus simple à retenir.", value: "c", score: 2 },
      { label: "J'utilise le même partout, toujours le même depuis des années.", value: "d", score: 0 },
    ],
  },
  {
    id: 4,
    category: "Appareils",
    text: "C'est la question à poser avant les autres ? Est-ce que tu as déjà touché à un ordinateur ?",
    options: [
      { label: "Oui, j'utilise un ordinateur et un smartphone tous les jours.", value: "a", score: 10 },
      { label: "Oui, mais je préfère le téléphone.", value: "b", score: 7 },
      { label: "Rarement, seulement quand c'est vraiment nécessaire.", value: "c", score: 3 },
      { label: "Non, c'est la première fois que j'utilise un appareil numérique.", value: "d", score: 0 },
    ],
  },
  {
    id: 5,
    category: "Double authentification",
    text: "As-tu activé la double authentification (2FA) sur tes comptes importants (email, banque, réseaux sociaux) ?",
    options: [
      { label: "Oui, sur tous mes comptes importants.", value: "a", score: 10 },
      { label: "Sur quelques-uns, mais pas tous.", value: "b", score: 6 },
      { label: "Non, je ne sais pas comment faire.", value: "c", score: 2 },
      { label: "Je ne sais même pas ce qu'est la double authentification.", value: "d", score: 0 },
    ],
  },
  {
    id: 6,
    category: "Mises à jour",
    text: "Fais-tu régulièrement les mises à jour de ton ordinateur, téléphone et applications ?",
    options: [
      { label: "Toujours, dès qu'une mise à jour est disponible.", value: "a", score: 10 },
      { label: "Souvent, mais parfois je les reporte.", value: "b", score: 7 },
      { label: "Parfois, seulement quand l'appareil m'y force.", value: "c", score: 3 },
      { label: "Jamais, ça ralentit l'ordinateur.", value: "d", score: 0 },
    ],
  },
  {
    id: 7,
    category: "Sauvegardes",
    text: "As-tu une sauvegarde récente de tes fichiers importants (photos, documents, contacts) ?",
    options: [
      { label: "Oui, sauvegarde automatique sur le cloud et disque dur externe.", value: "a", score: 10 },
      { label: "Oui, mais c'est manuel et pas très régulier.", value: "b", score: 6 },
      { label: "Non, je n'ai jamais fait de sauvegarde.", value: "c", score: 1 },
      { label: "Je ne sais pas ce qu'est une sauvegarde.", value: "d", score: 0 },
    ],
  },
  {
    id: 8,
    category: "Phishing",
    text: "Sais-tu reconnaître un email de phishing (tentative d'arnaque par mail) ?",
    options: [
      { label: "Oui, je vérifie toujours l'expéditeur, les liens et les demandes suspectes.", value: "a", score: 10 },
      { label: "Je suis vigilant(e) mais j'ai parfois un doute.", value: "b", score: 7 },
      { label: "Pas vraiment, je ne sais pas quoi chercher.", value: "c", score: 2 },
      { label: "J'ai déjà cliqué sur des liens suspects sans m'en rendre compte.", value: "d", score: 0 },
    ],
  },
  {
    id: 9,
    category: "Wi-Fi",
    text: "Ton réseau Wi-Fi à la maison est-il protégé par un mot de passe robuste ?",
    options: [
      { label: "Oui, avec un long mot de passe unique que j'ai personnalisé.", value: "a", score: 10 },
      { label: "Oui, avec le mot de passe par défaut de la box.", value: "b", score: 5 },
      { label: "Je crois, mais je n'ai jamais vérifié.", value: "c", score: 2 },
      { label: "Non, mon Wi-Fi est ouvert pour tout le monde.", value: "d", score: 0 },
    ],
  },
  {
    id: 10,
    category: "Données personnelles",
    text: "As-tu déjà vérifié si tes identifiants ont été compromis dans une fuite de données en ligne ?",
    options: [
      { label: "Oui, j'utilise des outils comme HaveIBeenPwned régulièrement.", value: "a", score: 10 },
      { label: "Une fois, mais pas récemment.", value: "b", score: 6 },
      { label: "Non, je ne savais pas que c'était possible.", value: "c", score: 2 },
      { label: "Non, et je ne vois pas l'intérêt.", value: "d", score: 0 },
    ],
  },
]

export default function AuditPage() {
  const router = useRouter()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const question = questions[currentQ]
  const isLast = currentQ === questions.length - 1
  const progress = ((currentQ + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  const handleSelect = (value: string) => {
    setSelectedOption(value)
    setAnswers((prev) => ({ ...prev, [question.id]: value }))
  }

  const goNext = () => {
    if (isLast) {
      let totalScore = 0
      questions.forEach((q) => {
        const answerValue = answers[q.id]
        const opt = q.options.find((o) => o.value === answerValue)
        if (opt) totalScore += opt.score
      })
      const maxScore = questions.length * 10
      const percent = Math.round((totalScore / maxScore) * 100)
      router.push(`/personalisation?score=${percent}&answers=${encodeURIComponent(JSON.stringify(answers))}`)
    } else {
      setCurrentQ((q) => q + 1)
      setSelectedOption(answers[questions[currentQ + 1]?.id] || null)
    }
  }

  const goPrev = () => {
    if (currentQ > 0) {
      setCurrentQ((q) => q - 1)
      setSelectedOption(answers[questions[currentQ - 1]?.id] || null)
    }
  }

  const goToQuestion = (i: number) => {
    setCurrentQ(i)
    setSelectedOption(answers[questions[i].id] || null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--sc-bg)] font-sans">
      <Navbar />

      <main className="flex-1 flex relative">
        {/* Ambient background - subtle, premium, dark-mode aware */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(at 18% 12%, rgba(37,99,235,0.10) 0px, transparent 45%), radial-gradient(at 82% 88%, rgba(99,102,241,0.10) 0px, transparent 45%)",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 sc-grid-overlay opacity-30" />

        {/* Sidebar - progression */}
        <aside
          className={`relative z-10 transition-[width] duration-300 ease-out shrink-0
            ${sidebarOpen ? "w-72" : "w-0 overflow-hidden"}`}
        >
          <div
            className="h-full flex flex-col
              bg-[color:var(--sc-surface)]
              border-r border-[color:var(--sc-border)]
              shadow-[var(--sc-shadow-sm)]"
          >
            {/* Sidebar header */}
            <div className="px-5 pt-5 pb-4 border-b border-[color:var(--sc-border)]">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md
                    bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))]
                    text-white shadow-[var(--sc-shadow-blue-sm)]"
                >
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={2.4} />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sc-text-muted)]">
                  Audit qualif&apos; rapide
                </p>
              </div>
              <h2 className="font-display text-base font-bold text-[color:var(--sc-text)] tracking-tight">
                Cheminement des questions
              </h2>
              <p className="text-[12px] text-[color:var(--sc-text-muted)] mt-1">
                {answeredCount}/{questions.length} répondues
              </p>
            </div>

            {/* Steps list */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {questions.map((q, i) => {
                const isActive = i === currentQ
                const isAnswered = !!answers[q.id]
                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(i)}
                    className={`group relative w-full flex items-start gap-3 text-left px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer
                      ${isActive
                        ? "bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-blue)]/30 shadow-[var(--sc-shadow-blue-sm)]"
                        : "border border-transparent hover:bg-[color:var(--sc-bg-soft)]/60 hover:border-[color:var(--sc-border)]"
                      }
                    `}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full
                          bg-[linear-gradient(180deg,var(--sc-blue-soft),var(--sc-blue))]"
                      />
                    )}

                    {/* Step badge */}
                    <span
                      className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-bold mt-0.5 transition-all
                        ${isActive
                          ? "bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] text-white shadow-[0_4px_10px_-2px_rgba(37,99,235,0.45)] ring-2 ring-[color:var(--sc-surface)]"
                          : isAnswered
                            ? "bg-[rgba(16,185,129,0.12)] text-[color:var(--sc-success)] border border-[rgba(16,185,129,0.30)] dark:bg-[rgba(16,185,129,0.16)] dark:text-[#6EE7B7] dark:border-[rgba(16,185,129,0.32)]"
                            : "bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-muted)] border border-[color:var(--sc-border)]"
                        }
                      `}
                    >
                      {isAnswered && !isActive ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                    </span>

                    {/* Step content */}
                    <span className="flex-1 min-w-0">
                      <span
                        className={`block text-[10.5px] font-semibold uppercase tracking-wider mb-0.5
                          ${isActive
                            ? "text-[color:var(--sc-blue)]"
                            : "text-[color:var(--sc-text-muted)]"
                          }`}
                      >
                        {q.category}
                      </span>
                      <span
                        className={`block text-[12.5px] leading-snug line-clamp-2
                          ${isActive
                            ? "text-[color:var(--sc-text)] font-medium"
                            : isAnswered
                              ? "text-[color:var(--sc-text-2)]"
                              : "text-[color:var(--sc-text-muted)]"
                          }`}
                      >
                        {q.text}
                      </span>
                    </span>
                  </button>
                )
              })}
            </nav>

            {/* Sidebar footer - completion summary */}
            <div className="px-5 py-4 border-t border-[color:var(--sc-border)] bg-[color:var(--sc-surface-2)]/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--sc-text-muted)]">
                  Avancement
                </span>
                <span className="text-[12px] font-bold text-[color:var(--sc-blue)]">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)]">
                <div
                  className="h-full rounded-full transition-all duration-500
                    bg-[linear-gradient(90deg,var(--sc-blue-soft),var(--sc-blue),var(--sc-indigo))]
                    shadow-[0_0_10px_rgba(37,99,235,0.40)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          {/* Top bar : sidebar toggle + question progress */}
          <div
            className="flex items-center gap-4 px-4 md:px-6 py-3
              border-b border-[color:var(--sc-border)]
              bg-[color:var(--sc-surface)]/70 backdrop-blur-md
              supports-[backdrop-filter]:bg-[color:var(--sc-surface)]/60"
          >
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg
                border border-[color:var(--sc-border)]
                bg-[color:var(--sc-surface)]
                text-[color:var(--sc-text-2)]
                hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)] hover:bg-[color:var(--sc-bg-soft)]
                shadow-[var(--sc-shadow-sm)] transition-all"
              aria-label={sidebarOpen ? "Masquer la barre latérale" : "Afficher la barre latérale"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>

            {/* Progress bar - clean, integrated */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[12px] font-bold text-[color:var(--sc-text)] tabular-nums shrink-0">
                    Question {currentQ + 1}
                    <span className="text-[color:var(--sc-text-muted)] font-medium"> / {questions.length}</span>
                  </span>
                  <span aria-hidden className="text-[color:var(--sc-border-strong)]">·</span>
                  <span className="text-[12px] font-medium text-[color:var(--sc-blue)] truncate">
                    {question.category}
                  </span>
                </div>
                <span className="text-[11.5px] font-semibold tabular-nums text-[color:var(--sc-text-muted)] shrink-0">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)]">
                <div
                  className="h-full rounded-full transition-all duration-500
                    bg-[linear-gradient(90deg,var(--sc-blue-soft),var(--sc-blue),var(--sc-indigo))]
                    shadow-[0_0_10px_rgba(37,99,235,0.40)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question area */}
          <div className="flex-1 flex flex-col items-center justify-start px-4 md:px-6 pt-10 pb-10">
            <div className="w-full max-w-2xl flex flex-col gap-7 sc-fade-in">
              {/* Question card with avatar */}
              <div className="flex items-end gap-5 md:gap-6">
                <div className="shrink-0 flex flex-col items-center">
                  <div className="relative">
                    <div
                      className="absolute inset-0 -m-3 rounded-full sc-halo opacity-50 sc-pulse-soft pointer-events-none"
                      aria-hidden
                    />
                    <div
                      className="relative w-20 h-20 rounded-full sc-avatar-gradient flex items-center justify-center
                        ring-4 ring-[color:var(--sc-surface)]
                        shadow-[0_14px_30px_-10px_rgba(37,99,235,0.55),inset_0_1px_0_rgba(255,255,255,0.30)]"
                    >
                      <Shield className="w-9 h-9 text-white" strokeWidth={2.2} />
                    </div>
                  </div>
                </div>

                <div
                  className="flex-1 relative rounded-2xl p-5 md:p-6
                    bg-[color:var(--sc-surface)]
                    border border-[color:var(--sc-border)]
                    shadow-[var(--sc-shadow)]"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 bottom-5 w-0 h-0 -translate-x-2"
                    style={{
                      borderTop: "8px solid transparent",
                      borderBottom: "8px solid transparent",
                      borderRight: "12px solid var(--sc-surface)",
                    }}
                  />
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sc-blue)] mb-1.5">
                    {question.category}
                  </p>
                  <p className="text-base md:text-[17px] font-medium text-[color:var(--sc-text)] leading-relaxed text-pretty">
                    {question.text}
                  </p>
                </div>
              </div>

              {/* Answer options */}
              <div className="flex flex-col gap-3">
                {question.options.map((opt) => {
                  const selected = selectedOption === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className={`group relative flex items-start gap-3.5 text-left px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer
                        ${selected
                          ? "border-[color:var(--sc-blue)] bg-[color:var(--sc-bg-soft)] shadow-[0_8px_24px_-8px_rgba(37,99,235,0.40)] ring-1 ring-[color:var(--sc-blue)]/40"
                          : "border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] hover:border-[color:var(--sc-blue)]/55 hover:-translate-y-0.5 hover:shadow-[var(--sc-shadow)] hover:bg-[color:var(--sc-bg-soft)]/40"
                        }
                      `}
                      aria-pressed={selected}
                    >
                      {/* Checkbox visual */}
                      <span
                        className={`shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                          ${selected
                            ? "border-[color:var(--sc-blue)] bg-[color:var(--sc-blue)] shadow-[0_4px_10px_-2px_rgba(37,99,235,0.45)]"
                            : "border-[color:var(--sc-border-strong)] bg-[color:var(--sc-surface)] group-hover:border-[color:var(--sc-blue)]/60"
                          }
                        `}
                      >
                        {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </span>

                      {/* Letter chip */}
                      <span
                        className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md text-[12px] font-bold uppercase transition-colors
                          ${selected
                            ? "bg-[color:var(--sc-blue)]/15 text-[color:var(--sc-blue)] border border-[color:var(--sc-blue)]/35"
                            : "bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-2)] border border-[color:var(--sc-border)]"
                          }`}
                      >
                        {opt.value}
                      </span>

                      <span
                        className={`text-[14.5px] leading-relaxed transition-colors
                          ${selected ? "text-[color:var(--sc-text)]" : "text-[color:var(--sc-text-2)]"}`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <ScButton
                  variant="secondary"
                  size="md"
                  onClick={goPrev}
                  disabled={currentQ === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-0.5" />
                  Précédent
                </ScButton>

                <ScButton
                  variant="primary"
                  size="md"
                  onClick={goNext}
                  disabled={!selectedOption}
                >
                  {isLast ? "Voir mes résultats" : "Question suivante"}
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </ScButton>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
