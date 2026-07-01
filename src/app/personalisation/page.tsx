"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { ScButton } from "@/components/safecheck/primitives"
import {
  Shield,
  ChevronRight,
  SkipForward,
  Check,
  Sparkles,
  SlidersHorizontal,
  Monitor,
  Smartphone,
  HelpCircle,
} from "lucide-react"

// Types

interface PersonalisationAnswers {
  motivations: string[]
  detailLevel: string | null
  devices: string[]
  techLevel: number
  topics: string[]
  discovery: string | null
}

// Data

const motivationOptions = [
  { value: "point", label: "Faire un point sur ma sécurité personnelle" },
  { value: "reflexes", label: "Apprendre les bons réflexes" },
  { value: "probleme", label: "Corriger un problème précis" },
  { value: "proche", label: "Protéger un proche" },
  { value: "outils", label: "Découvrir des outils utiles" },
  { value: "tester", label: "Me tester" },
  { value: "progresser", label: "Progresser au fil du temps" },
  { value: "curiosite", label: "Utiliser SafeCheck par curiosité" },
]

const detailLevelOptions = [
  { value: "tres-simple", label: "Très simple, rapide, sans technique" },
  { value: "simple", label: "Simple, avec quelques explications" },
  { value: "accessible", label: "Accessible mais concret" },
  { value: "approfondi", label: "Approfondi et détaillé" },
  { value: "technique", label: "Très technique, niveau avancé" },
]

const deviceOptions = [
  { value: "ordinateur", label: "Ordinateur", icon: <Monitor className="w-4 h-4" /> },
  { value: "smartphone", label: "Smartphone", icon: <Smartphone className="w-4 h-4" /> },
  { value: "les-deux", label: "Les deux", icon: <SlidersHorizontal className="w-4 h-4" /> },
  { value: "sais-pas", label: "Je ne sais pas encore", icon: <HelpCircle className="w-4 h-4" /> },
]

const topicOptions = [
  { value: "mots-de-passe", label: "Mots de passe & comptes" },
  { value: "phishing", label: "Phishing & arnaques" },
  { value: "donnees", label: "Données personnelles" },
  { value: "reseau", label: "Réseau & Wi-Fi" },
  { value: "smartphone", label: "Smartphone" },
  { value: "ordinateur", label: "Ordinateur" },
  { value: "hardware", label: "Hardware / matériel" },
  { value: "logiciels", label: "Logiciels & applications" },
  { value: "vie-privee", label: "Vie privée" },
  { value: "comprendre", label: "Comprendre comment ça marche" },
  { value: "formation", label: "Me former pour plus tard" },
]

const discoveryOptions = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "google", label: "Recherche Google" },
  { value: "bouche", label: "Bouche à oreille" },
  { value: "ecole", label: "École / formation" },
  { value: "discord", label: "Discord / communauté" },
  { value: "pub", label: "Publicité" },
  { value: "autre", label: "Autre" },
  { value: "pref-pas", label: "Je préfère ne pas répondre" },
]

const techLabels: Record<number, string> = {
  1: "Peu à l'aise",
  2: "Je me débrouille un peu",
  3: "Niveau normal",
  4: "Plutôt à l'aise",
  5: "Très à l'aise",
}

// Multi-chip selector

function MultiChip({
  options,
  selected,
  onToggle,
  maxSelect,
}: {
  options: { value: string; label: string; icon?: React.ReactNode }[]
  selected: string[]
  onToggle: (v: string) => void
  maxSelect?: number
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value)
        const isDisabled = !isSelected && maxSelect !== undefined && selected.length >= maxSelect
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => !isDisabled && onToggle(opt.value)}
            className={`
              inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium
              border transition-all duration-200 cursor-pointer select-none
              ${isSelected
                ? "border-[color:var(--sc-blue)] bg-[color:var(--sc-blue)] text-white shadow-[0_4px_12px_-4px_rgba(37,99,235,0.45)]"
                : isDisabled
                  ? "border-[color:var(--sc-border)] bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-muted)] opacity-50 cursor-not-allowed"
                  : "border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/60 hover:bg-[color:var(--sc-bg-soft)] hover:text-[color:var(--sc-blue)]"
              }
            `}
            aria-pressed={isSelected}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={3} />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// Single chip selector

function SingleChip({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string }[]
  selected: string | null
  onSelect: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`
              inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium
              border transition-all duration-200 cursor-pointer select-none
              ${isSelected
                ? "border-[color:var(--sc-blue)] bg-[color:var(--sc-blue)] text-white shadow-[0_4px_12px_-4px_rgba(37,99,235,0.45)]"
                : "border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/60 hover:bg-[color:var(--sc-bg-soft)] hover:text-[color:var(--sc-blue)]"
              }
            `}
            aria-pressed={isSelected}
          >
            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={3} />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// Tech level slider

function TechSlider({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Pips */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`
              flex-1 flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border transition-all duration-200 cursor-pointer
              ${value === n
                ? "border-[color:var(--sc-blue)] bg-[color:var(--sc-blue)] shadow-[0_4px_12px_-4px_rgba(37,99,235,0.45)]"
                : "border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] hover:border-[color:var(--sc-blue)]/60 hover:bg-[color:var(--sc-bg-soft)]"
              }
            `}
            aria-pressed={value === n}
          >
            <span
              className={`text-lg font-extrabold leading-none transition-colors
                ${value === n ? "text-white" : "text-[color:var(--sc-blue)]"}`}
            >
              {n}
            </span>
            {value === n && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </button>
        ))}
      </div>
      {/* Labels */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs text-[color:var(--sc-text-muted)]">Peu à l&apos;aise</span>
        <span className="text-xs text-[color:var(--sc-text-muted)]">Très à l&apos;aise</span>
      </div>
      {/* Active label */}
      {value > 0 && (
        <div
          className="text-center py-1.5 px-3 rounded-lg text-xs font-semibold
            bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)]
            text-[color:var(--sc-blue)]"
        >
          {value} - {techLabels[value]}
        </div>
      )}
    </div>
  )
}

// Section card

function SectionCard({
  number,
  label,
  question,
  optional = true,
  children,
}: {
  number: number
  label: string
  question: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl p-5 md:p-6 flex flex-col gap-4
        bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)]
        shadow-[var(--sc-shadow-sm)]"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span
          className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white mt-0.5
            bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))]
            shadow-[var(--sc-shadow-blue-sm)]"
        >
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sc-blue)]">
              {label}
            </span>
            {optional && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium
                  bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)]
                  text-[color:var(--sc-text-muted)]"
              >
                Optionnel
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm md:text-[15px] font-semibold text-[color:var(--sc-text)] leading-snug text-pretty">
            {question}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="pl-0 md:pl-10">{children}</div>
    </div>
  )
}

// Main component

function PersonalisationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Preserve all query params from the audit page so results stay intact
  const scoreParam = searchParams.get("score") ?? ""
  const answersParam = searchParams.get("answers") ?? ""

  const buildResultsUrl = () => {
    const params = new URLSearchParams()
    if (scoreParam) params.set("score", scoreParam)
    if (answersParam) params.set("answers", answersParam)
    return `/resultats?${params.toString()}`
  }

  const [form, setForm] = useState<PersonalisationAnswers>({
    motivations: [],
    detailLevel: null,
    devices: [],
    techLevel: 0,
    topics: [],
    discovery: null,
  })

  const toggleMulti = (field: "motivations" | "devices" | "topics") => (value: string) => {
    setForm((prev) => {
      const current = prev[field]
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      }
    })
  }

  const setSingle = (field: "detailLevel" | "discovery") => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    // Answers are mocked frontend-only as requested
    // Could be persisted to localStorage or a profile endpoint here
    router.push(buildResultsUrl())
  }

  const handleSkip = () => {
    router.push(buildResultsUrl())
  }

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--sc-bg)] font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-6">

        {/* Hero header */}
        <div className="flex flex-col items-center text-center gap-3">
          {/* Score already calculated reassurance badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold
              bg-[rgba(16,185,129,0.10)] border border-[rgba(16,185,129,0.25)]
              text-[color:var(--sc-success)]"
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0 bg-[color:var(--sc-success)]"
              aria-hidden
            />
            Votre score est déjà calculé. Cette étape sert seulement à affiner votre parcours.
          </div>

          {/* Decorative icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white
              bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue),var(--sc-indigo))]
              shadow-[var(--sc-shadow-blue)]"
          >
            <SlidersHorizontal className="w-6 h-6" />
          </div>

          <div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[color:var(--sc-text)] text-balance leading-tight">
              Personnalisez vos résultats
            </h1>
            <p className="mt-2 text-sm md:text-base text-[color:var(--sc-text-2)] leading-relaxed text-pretty max-w-lg mx-auto">
              Ces questions sont optionnelles. Elles nous aident à mieux adapter les ressources,
              tutoriels et recommandations à vos objectifs.
            </p>
          </div>

          {/* Step label */}
          <div className="flex items-center gap-2 text-xs text-[color:var(--sc-text-muted)]">
            <Sparkles className="w-3.5 h-3.5 text-[color:var(--sc-blue)]" />
            <span>6 questions · Toutes facultatives · Moins de 2 minutes</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[color:var(--sc-border)]" />

        {/* Q1 - Motivations */}
        <SectionCard
          number={1}
          label="Objectif"
          question="Pourquoi utilisez-vous SafeCheck aujourd'hui ?"
        >
          <MultiChip
            options={motivationOptions}
            selected={form.motivations}
            onToggle={toggleMulti("motivations")}
          />
        </SectionCard>

        {/* Q2 - Niveau de détail */}
        <SectionCard
          number={2}
          label="Niveau de détail"
          question="Quel niveau de détail préférez-vous ?"
        >
          <SingleChip
            options={detailLevelOptions}
            selected={form.detailLevel}
            onSelect={setSingle("detailLevel")}
          />
        </SectionCard>

        {/* Q3 - Appareils */}
        <SectionCard
          number={3}
          label="Appareils"
          question="Sur quels appareils voulez-vous surtout progresser ?"
        >
          <MultiChip
            options={deviceOptions}
            selected={form.devices}
            onToggle={toggleMulti("devices")}
          />
        </SectionCard>

        {/* Q4 - Aisance technologique */}
        <SectionCard
          number={4}
          label="Aisance technologique"
          question="Quel est votre niveau d'aisance avec la technologie ?"
        >
          <TechSlider
            value={form.techLevel}
            onChange={(v) => setForm((prev) => ({ ...prev, techLevel: v }))}
          />
        </SectionCard>

        {/* Q5 - Sujets */}
        <SectionCard
          number={5}
          label="Centres d'intérêt"
          question="Quels sujets vous intéressent le plus ?"
        >
          <div className="flex flex-col gap-2">
            {form.topics.length >= 3 && (
              <p className="text-xs text-[color:var(--sc-text-muted)] italic">
                Maximum 3 sujets sélectionnés. Désélectionnez-en un pour en choisir un autre.
              </p>
            )}
            <MultiChip
              options={topicOptions}
              selected={form.topics}
              onToggle={toggleMulti("topics")}
              maxSelect={3}
            />
          </div>
        </SectionCard>

        {/* Q6 - Découverte (discrète) */}
        <SectionCard
          number={6}
          label="À propos"
          question="Comment avez-vous connu SafeCheck ?"
        >
          <SingleChip
            options={discoveryOptions}
            selected={form.discovery}
            onSelect={setSingle("discovery")}
          />
        </SectionCard>

        {/* CTA */}
        <div
          className="rounded-2xl p-5 md:p-6 flex flex-col items-center gap-4
            bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)]"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            {/* Primary CTA */}
            <button
              type="button"
              onClick={handleSubmit}
              className="
                w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2
                px-6 py-3 rounded-xl text-sm font-bold text-white
                bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))]
                border border-[color:var(--sc-blue-hover)]
                shadow-[0_8px_20px_-6px_rgba(37,99,235,0.45)]
                hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.55)]
                hover:-translate-y-0.5 active:translate-y-0
                transition-all duration-200
              "
            >
              <Shield className="w-4 h-4 shrink-0" />
              Voir mes résultats
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>

            {/* Secondary CTA */}
            <button
              type="button"
              onClick={handleSkip}
              className="
                w-full sm:w-auto inline-flex items-center justify-center gap-2
                px-5 py-3 rounded-xl text-sm font-semibold
                border border-[color:var(--sc-border)]
                bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)]
                hover:border-[color:var(--sc-border-strong)] hover:text-[color:var(--sc-text)]
                hover:bg-[color:var(--sc-surface-2)]
                transition-all duration-200
              "
            >
              <SkipForward className="w-4 h-4 shrink-0" />
              Passer cette étape
            </button>
          </div>

          {/* Reassurance note */}
          <p className="text-xs text-[color:var(--sc-text-muted)] text-center">
            Vous pourrez modifier ces préférences plus tard depuis votre profil.
          </p>
        </div>

        {/* Bottom padding for mobile */}
        <div className="h-4" />
      </main>

      <Footer />
    </div>
  )
}

export default function PersonalisationPage() {
  return (
    <Suspense>
      <PersonalisationContent />
    </Suspense>
  )
}
