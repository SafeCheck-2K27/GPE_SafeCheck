"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { ScButton } from "@/components/safecheck/primitives"
import { SignupModal } from "@/components/safecheck/SignupModal"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { useI18n } from "@/components/safecheck/I18nProvider"
import {
  AlertTriangle,
  Check,
  ArrowRight,
  RotateCcw,
  TrendingUp,
  ChevronDown,
  Info,
  Zap,
  Users,
  Target,
  BookOpen,
  Star,
  Clock,
  Save,
} from "lucide-react"
import { getLevel, getRiskLevel, riskColors } from "@/features/results/logic"
import { allRecommendations, categoryLabels } from "@/features/results/data"
import { RecommendationCard } from "@/features/results/RecommendationCard"
import type { Recommendation } from "@/features/results/types"

const scoreHeroClassName =
  "rounded-2xl p-6 border flex flex-col md:flex-row items-center gap-6 bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow)]"

const scoreCircleClassName =
  "w-32 h-32 rounded-full flex flex-col items-center justify-center border-[5px] bg-[color:var(--sc-bg)]"

const riskBadgeBaseClassName =
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"

const resultBadgeClassName =
  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)] text-[color:var(--sc-text)]"

const summaryCardClassName =
  "rounded-2xl p-5 border bg-[color:var(--sc-bg-soft)] border-[color:var(--sc-border)] shadow-[var(--sc-shadow-sm)]"

const infoRowClassName =
  "mt-3 pt-3 border-t border-[color:var(--sc-border)] flex items-start gap-2 text-xs text-[color:var(--sc-text-muted)]"

const statCardClassName =
  "rounded-xl p-4 flex items-start gap-3 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-sm)]"

const statIconClassName =
  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white mt-0.5"

const recosToggleButtonClassName =
  "w-full flex items-center justify-between px-4 py-3 bg-[color:var(--sc-surface-2)] hover:bg-[color:var(--sc-bg-soft)] text-sm font-semibold text-[color:var(--sc-text)] transition-colors cursor-pointer"

const comparisonCardClassName =
  "rounded-2xl p-5 border bg-[color:var(--sc-surface)] border-[color:var(--sc-border)] shadow-[var(--sc-shadow-sm)]"

const auditInfoCardClassName =
  "rounded-2xl p-5 border bg-[rgba(37,99,235,0.04)] border-[rgba(37,99,235,0.18)] shadow-[var(--sc-shadow-sm)]"

const nextStepCardClassName =
  "rounded-2xl p-5 border bg-[color:var(--sc-surface)] border-[color:var(--sc-border)] shadow-[var(--sc-shadow)]"

function ResultatsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, lang } = useI18n()
  const auth = useAuth()

  const scoreParam = searchParams.get("score")
  const score = scoreParam ? parseInt(scoreParam) : 62

  const level = getLevel(score)
  const risk = getRiskLevel(score)
  const riskStyle = riskColors[risk]

  const [signupOpen, setSignupOpen] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | undefined>(undefined)
  const [recoExpanded, setRecoExpanded] = useState(false)

  const handleTutorialClick = (href: string) => {
    if (auth.isLoggedIn) {
      router.push(href)
      return
    }
    setPendingHref(href)
    setSignupOpen(true)
  }

  const urgencyColor: Record<string, string> = {
    Haute: "#DC2626",
    Moyenne: "#EA580C",
    Faible: "#16A34A",
  }
  const impactColor: Record<string, string> = {
    Fort: "var(--sc-blue)",
    Moyen: "var(--sc-blue-soft)",
    Faible: "var(--sc-text-muted)",
  }
  const urgencyKeyMap: Record<string, string> = {
    Haute: "value.haute",
    Moyenne: "value.moyenne",
    Faible: "value.faible",
  }
  const impactKeyMap: Record<string, string> = {
    Fort: "value.fort",
    Moyen: "value.moyen",
    Faible: "value.faible",
  }

  const displayedRecos =
    score >= 80 ? allRecommendations.slice(3) : score >= 60 ? allRecommendations.slice(0, 4) : allRecommendations

  const topRecos = displayedRecos.slice(0, 3)
  const extraRecos = displayedRecos.slice(3)

  // Group extra recos by category for collapsible display
  const extraByCategory = extraRecos.reduce<Record<string, Recommendation[]>>((acc, r) => {
    const cat = r.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  // Gain potentiel: mocked numbers based on score range
  const gainPoints = score >= 60 ? "15 à 20" : score >= 35 ? "20 à 30" : "30 à 40"
  const gainActions = score >= 60 ? 2 : 3
  const gainTime = score >= 60 ? "15 à 25 min" : score >= 35 ? "25 à 40 min" : "40 à 60 min"

  // Benchmarks: mocked, score-dependent for plausibility
  const avgScore = 54
  const similarPct = score < 50 ? 42 : score < 70 ? 28 : 15
  const gainAfterTutos = score >= 60 ? "10 à 15" : "20 à 30"

  const riskLabel =
    risk === "low" ? "Faible" :
    risk === "medium" ? "Modéré" :
    risk === "high" ? "Élevé" :
    "Critique"

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--sc-bg)] font-sans">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col gap-6">

        {/* 1. Score hero */}
        <div className={scoreHeroClassName}>
          {/* Circle score */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div
              className={scoreCircleClassName}
              style={{ borderColor: level.colorVar }}
            >
              <span className="text-4xl font-extrabold leading-none" style={{ color: level.colorVar }}>
                {score}
              </span>
              <span className="text-xs font-medium text-[color:var(--sc-text-muted)] mt-0.5">
                /100
              </span>
            </div>
            {/* Risk badge */}
            <span
              className={`${riskBadgeBaseClassName} ${riskStyle.text} ${riskStyle.bg} ${riskStyle.border}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: riskStyle.dot }}
                aria-hidden
              />
              Risque {riskLabel}
            </span>
          </div>

          <div className="flex-1 text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--sc-blue)] mb-1">
              Ton niveau actuel
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[color:var(--sc-text)] mb-2 font-display text-balance">
              {t(level.labelKey)}
            </h1>
            <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
              {t(level.descKey)}
            </p>

            {/* Badges */}
            <div className="flex items-center gap-2 mt-3 flex-wrap justify-center md:justify-start">
              <span className={resultBadgeClassName}>
                <Star className="w-3 h-3 text-[color:var(--sc-warn)]" />
                Badge 1 obtenu
              </span>
              {score >= 60 && (
                <span className={resultBadgeClassName}>
                  <Star className="w-3 h-3 text-[color:var(--sc-warn)]" />
                  Badge 2 obtenu
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Résumé du diagnostic */}
        <div className={summaryCardClassName}>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white"
              style={{ background: "linear-gradient(135deg, var(--sc-blue-soft), var(--sc-blue))" }}
            >
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <h2 className="font-bold text-sm text-[color:var(--sc-text)]">
              Résumé de ton diagnostic rapide
            </h2>
          </div>
          <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
            {score >= 80 && "Ton score de "}
            {score < 80 && "Ton score de "}
            <strong className="text-[color:var(--sc-text)]">{score}/100</strong>
            {score >= 80 &&
              " place ton niveau de sécurité parmi les meilleurs. Tu appliques déjà les pratiques essentielles. Quelques optimisations supplémentaires te permettront d'atteindre un niveau expert."}
            {score >= 60 && score < 80 &&
              " indique un niveau de sécurité correct, mais avec des axes d'amélioration importants. Tes priorités immédiates : la double authentification et la gestion des mots de passe."}
            {score >= 35 && score < 60 &&
              " révèle plusieurs lacunes dans ta sécurité numérique. Tes risques principaux concernent tes comptes, tes sauvegardes et ta protection contre le phishing. Commence par les 3 premières recommandations ci-dessous."}
            {score < 35 &&
              " indique une exposition significative aux risques numériques. Pas d'inquiétude : chaque action compte, et les premières étapes sont simples à mettre en place. Commence par sécuriser ton email principal."}
          </p>
          <div className={infoRowClassName}>
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {"Ce résultat est issu d'un "}
              <strong className="text-[color:var(--sc-text-2)]">audit de qualification rapide</strong>
              {" (10 questions). Il permet d'identifier tes priorités immédiates, mais ne remplace pas un audit complet. Pour un diagnostic plus précis, tu pourras lancer un audit standard ou complet."}
            </span>
          </div>
        </div>

        {/* 3. Gain potentiel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: <TrendingUp className="w-4 h-4" />,
              label: "Gain estimé",
              value: `+${gainPoints} pts`,
              sub: "après les premières actions",
              color: "var(--sc-success)",
            },
            {
              icon: <Target className="w-4 h-4" />,
              label: "Actions prioritaires",
              value: `${gainActions} actions`,
              sub: "pour réduire les risques immédiats",
              color: "var(--sc-blue)",
            },
            {
              icon: <Clock className="w-4 h-4" />,
              label: "Temps estimé",
              value: gainTime,
              sub: "pour les premières étapes",
              color: "var(--sc-warn)",
            },
          ].map((item) => (
            <div key={item.label} className={statCardClassName}>
              <span
                className={statIconClassName}
                style={{ background: item.color }}
              >
                {item.icon}
              </span>
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[color:var(--sc-text-muted)] mb-0.5">
                  {item.label}
                </p>
                <p className="text-base font-extrabold text-[color:var(--sc-text)] leading-tight">
                  {item.value}
                </p>
                <p className="text-[11px] text-[color:var(--sc-text-muted)] leading-tight mt-0.5">
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 4. Points forts / faibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl p-4 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-sm)]">
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-[color:var(--sc-text)]">
              <Check className="w-4 h-4 text-[color:var(--sc-success)]" />
              {t("res.strong")}
            </h2>
            <ul className="space-y-1.5 text-sm text-[color:var(--sc-text-2)]">
              {score >= 60 ? (
                <>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[color:var(--sc-success)] mt-0.5 shrink-0" />
                    {t("res.strong.high.1")}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[color:var(--sc-success)] mt-0.5 shrink-0" />
                    {t("res.strong.high.2")}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[color:var(--sc-success)] mt-0.5 shrink-0" />
                    {t("res.strong.high.3")}
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[color:var(--sc-success)] mt-0.5 shrink-0" />
                    {t("res.strong.low.1")}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[color:var(--sc-success)] mt-0.5 shrink-0" />
                    {t("res.strong.low.2")}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[color:var(--sc-success)] mt-0.5 shrink-0" />
                    {t("res.strong.low.3")}
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="rounded-xl p-4 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-sm)]">
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-[color:var(--sc-text)]">
              <AlertTriangle className="w-4 h-4 text-[color:var(--sc-warn)]" />
              {t("res.weak")}
            </h2>
            <ul className="space-y-1.5 text-sm text-[color:var(--sc-text-2)]">
              {score < 80 && (
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--sc-warn)] mt-0.5 shrink-0" />
                  {t("res.weak.passwords")}
                </li>
              )}
              {score < 70 && (
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--sc-warn)] mt-0.5 shrink-0" />
                  {t("res.weak.2fa")}
                </li>
              )}
              {score < 60 && (
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--sc-warn)] mt-0.5 shrink-0" />
                  {t("res.weak.updates")}
                </li>
              )}
              {score < 50 && (
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--sc-warn)] mt-0.5 shrink-0" />
                  {t("res.weak.backup")}
                </li>
              )}
              {score < 40 && (
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--sc-warn)] mt-0.5 shrink-0" />
                  {t("res.weak.wifi")}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* 5. Recommandations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[color:var(--sc-text)] font-display">
              {t("res.priorityRecos")}
            </h2>
            <span className="text-xs text-[color:var(--sc-text-muted)]">
              {displayedRecos.length} recommandation{displayedRecos.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Top 3 - always visible */}
          <div className="flex flex-col gap-3 mb-3">
            {topRecos.map((reco, i) => (
              <RecommendationCard
                key={reco.id}
                reco={reco}
                index={i}
                lang={lang}
                urgencyColor={urgencyColor}
                impactColor={impactColor}
                urgencyKeyMap={urgencyKeyMap}
                impactKeyMap={impactKeyMap}
                t={t}
                onTutorialClick={handleTutorialClick}
              />
            ))}
          </div>

          {/* Extra recos - collapsible */}
          {extraRecos.length > 0 && (
            <div className="rounded-xl border border-[color:var(--sc-border)] overflow-hidden">
              <button
                onClick={() => setRecoExpanded(!recoExpanded)}
                className={recosToggleButtonClassName}
                aria-expanded={recoExpanded}
              >
                <span className="flex items-center gap-2">
                  <ChevronDown className={`w-4 h-4 text-[color:var(--sc-blue)] transition-transform ${recoExpanded ? "rotate-180" : ""}`} />
                  Voir {extraRecos.length} recommandation{extraRecos.length > 1 ? "s" : ""} supplémentaire{extraRecos.length > 1 ? "s" : ""}
                </span>
                <span className="text-xs text-[color:var(--sc-text-muted)] font-normal">
                  Plan d&apos;action complet
                </span>
              </button>

              {recoExpanded && (
                <div className="divide-y divide-[color:var(--sc-border)]">
                  {Object.entries(extraByCategory).map(([cat, recos]) => {
                    const catInfo = categoryLabels[cat as Recommendation["category"]]
                    return (
                      <div key={cat} className="bg-[color:var(--sc-surface)]">
                        <div className="px-4 py-2 flex items-center gap-2 bg-[color:var(--sc-surface-2)]/50">
                          <span className="text-[color:var(--sc-text-muted)]">{catInfo.icon}</span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--sc-text-muted)]">
                            {lang === "fr" ? catInfo.fr : catInfo.en}
                          </span>
                        </div>
                        <div className="p-3 flex flex-col gap-3">
                          {recos.map((reco, i) => (
                            <RecommendationCard
                              key={reco.id}
                              reco={reco}
                              index={topRecos.length + i}
                              lang={lang}
                              urgencyColor={urgencyColor}
                              impactColor={impactColor}
                              urgencyKeyMap={urgencyKeyMap}
                              impactKeyMap={impactKeyMap}
                              t={t}
                              onTutorialClick={handleTutorialClick}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* 6. Comparaison anonymisée */}
        <div className={comparisonCardClassName}>
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white"
              style={{ background: "linear-gradient(135deg, var(--sc-blue-soft), var(--sc-indigo))" }}
            >
              <Users className="w-3.5 h-3.5" />
            </span>
            <h2 className="font-bold text-sm text-[color:var(--sc-text)]">
              Où tu te situes
            </h2>
            <span className="ml-auto text-[10px] text-[color:var(--sc-text-muted)] bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)] px-2 py-0.5 rounded-full">
              Données mockées · anonymisées
            </span>
          </div>

          <div className="space-y-3">
            {/* Score vs average */}
            <div className="flex items-start gap-3">
              <span className="text-[color:var(--sc-blue)] shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
                  {score > avgScore ? (
                    <>Ton score est <strong className="text-[color:var(--sc-success)]">au-dessus de la moyenne</strong> des utilisateurs SafeCheck ({avgScore}/100).</>
                  ) : score === avgScore ? (
                    <>Ton score correspond <strong className="text-[color:var(--sc-text)]">exactement à la moyenne</strong> des utilisateurs SafeCheck ({avgScore}/100).</>
                  ) : (
                    <>Ton score est <strong className="text-[color:var(--sc-warn)]">légèrement en-dessous de la moyenne</strong> des utilisateurs SafeCheck ({avgScore}/100).</>
                  )}
                </p>
                {/* Progress bar comparison */}
                <div className="mt-2 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-[color:var(--sc-text-muted)]">
                    <span className="w-16 text-right shrink-0">Ton score</span>
                    <div className="flex-1 h-2 rounded-full bg-[color:var(--sc-surface-2)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${score}%`, background: level.colorVar }}
                      />
                    </div>
                    <span className="w-8 font-bold text-[color:var(--sc-text)] shrink-0">{score}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[color:var(--sc-text-muted)]">
                    <span className="w-16 text-right shrink-0">Moyenne</span>
                    <div className="flex-1 h-2 rounded-full bg-[color:var(--sc-surface-2)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[color:var(--sc-text-muted)]"
                        style={{ width: `${avgScore}%` }}
                      />
                    </div>
                    <span className="w-8 font-bold text-[color:var(--sc-text-muted)] shrink-0">{avgScore}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[color:var(--sc-border)]" />

            <div className="flex items-start gap-3">
              <span className="text-[color:var(--sc-warn)] shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </span>
              <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
                <strong className="text-[color:var(--sc-text)]">{similarPct} %</strong> des utilisateurs ayant un profil similaire commencent aussi par renforcer leurs mots de passe.
              </p>
            </div>

            <div className="border-t border-[color:var(--sc-border)]" />

            <div className="flex items-start gap-3">
              <span className="text-[color:var(--sc-success)] shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </span>
              <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
                Les profils proches du tien gagnent souvent <strong className="text-[color:var(--sc-success)]">+{gainAfterTutos} points</strong> après les 3 premiers tutoriels.
              </p>
            </div>
          </div>
        </div>

        {/* 7. Audit rapide ≠ audit complet */}
        <div className={auditInfoCardClassName}>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white"
              style={{ background: "var(--sc-blue)" }}
            >
              <Info className="w-3.5 h-3.5" />
            </span>
            <h2 className="font-bold text-sm text-[color:var(--sc-text)]">
              Audit rapide ≠ audit complet
            </h2>
          </div>
          <ul className="space-y-1.5 mb-4">
            {[
              "L'audit de qualification sert à t'orienter rapidement.",
              "Il donne une première estimation de ton niveau de sécurité.",
              "Il permet de recommander les premiers tutoriels adaptés à ton profil.",
              "Un audit standard ou complet sera plus précis et couvrira davantage de dimensions : appareils, comptes, réseau, sauvegardes, confidentialité, exposition aux risques.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-[color:var(--sc-text-2)]">
                <Check className="w-3.5 h-3.5 text-[color:var(--sc-blue)] mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <ScButton
            variant="secondary"
            size="sm"
            onClick={() => router.push("/audits")}
          >
            Voir les autres niveaux d&apos;audit
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </ScButton>
        </div>

        {/* 8. CTA final (connecté / non connecté) */}
        <div className={nextStepCardClassName}>
          <h2 className="font-bold text-base text-[color:var(--sc-text)] mb-1 font-display">
            Prochaine étape
          </h2>
          <p className="text-sm text-[color:var(--sc-text-2)] mb-4">
            {auth.isLoggedIn
              ? "Continue sur ta lancée et commence le premier tutoriel recommandé."
              : "Crée un compte pour retrouver tes résultats à tout moment, ou commence à explorer sans compte."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {auth.isLoggedIn ? (
              <>
                <ScButton
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={() => router.push("/compte")}
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Sauvegarder dans mon tableau de bord
                </ScButton>
                <ScButton
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={() => handleTutorialClick(displayedRecos[0]?.tutorielLink ?? "/tutoriels")}
                >
                  Continuer avec le premier tutoriel
                  <ArrowRight className="w-4 h-4 ml-1" />
                </ScButton>
              </>
            ) : (
              <>
                <ScButton
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={() => { setPendingHref("/compte"); setSignupOpen(true) }}
                >
                  Créer mon compte pour sauvegarder mes résultats
                  <ArrowRight className="w-4 h-4 ml-1" />
                </ScButton>
                <ScButton
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={() => router.push("/tutoriels")}
                >
                  Explorer les tutoriels sans compte
                </ScButton>
              </>
            )}
          </div>
        </div>

        {/* Recommencer l'audit */}
        <div className="flex justify-center">
          <ScButton variant="secondary" size="sm" onClick={() => router.push("/audit")}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            {t("res.restart")}
          </ScButton>
        </div>

      </main>

      <Footer />

      <SignupModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        pendingHref={pendingHref}
        reason={t("signup.reasonTutorial")}
      />
    </div>
  )
}

function ResultatsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen text-[color:var(--sc-blue)] font-bold bg-[color:var(--sc-bg)]">
      Chargement…
    </div>
  )
}

export default function ResultatsPage() {
  return (
    <Suspense fallback={<ResultatsLoading />}>
      <ResultatsContent />
    </Suspense>
  )
}
