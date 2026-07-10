"use client"

import { Suspense, useCallback, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { ScButton, ScBadge } from "@/components/safecheck/primitives"
import { tutoriels, CATEGORY_LABEL } from "@/lib/tutoriels-data"
import type { Tutoriel, Niveau, Category } from "@/lib/tutoriels-data"
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Wifi,
  AlertTriangle,
  Save,
  Globe,
  Key,
  Eye,
  Target,
  TrendingUp,
  Zap,
  Star,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  Smartphone,
  Settings,
  Terminal,
  Layers,
  Filter as FilterIcon,
  GraduationCap,
  Flame,
  Flag,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  SortAsc,
  Lightbulb,
  Search,
} from "lucide-react"


/* MOCK STATUS DATA - tutoriel statuts par ID */
type TutoStatus = "todo" | "inprogress" | "done"

// Mock: which tutorials have been completed or are in progress
const mockTutoStatus: Record<number, TutoStatus> = {
  1: "done",
  6: "done",
  3: "inprogress",
  20: "inprogress",
}

// Mock: last step reached for in-progress tutorials
const mockTutoLastStep: Record<number, { step: number; label: string }> = {
  3: { step: 3, label: "Installer l'application mobile" },
  20: { step: 2, label: "Sauvegarde locale automatique" },
}

// Mock: recommended cards with reason labels
const RECOMMENDED_IDS = [1, 3, 5] as const
const RECOMMENDED_REASONS: Record<number, string> = {
  1: "Recommande apres votre audit",
  3: "Priorite securite",
  5: "Action rapide",
}

// Mock: popular tutorial IDs
const POPULAR_IDS = new Set([1, 3, 6, 11, 21])

/* USER PROGRESS - mock data */
const userProgress = {
  level: "Petit Scarabee",
  levelKey: "Debutant" as Niveau,
  levelIndex: 1,
  totalLevels: 5,
  progressPercent: 18,
  nextLevel: "Luciole",
  stepsToNextLevel: 3,
  completedTutos: 2,
  totalTutos: tutoriels.length,
  percentileBetter: 42,
  avgUserMessage:
    "Les utilisateurs de ton profil commencent souvent par securiser leurs comptes et leur Wi-Fi.",
  badges: ["Badge 01"],
}

const levels = [
  { name: "Petit Scarabee", icon: "S", color: "#F59E0B", key: "Debutant" as Niveau },
  { name: "Luciole", icon: "L", color: "#06B6D4", key: "Debutant" as Niveau },
  { name: "Renard", icon: "R", color: "#8B5CF6", key: "Intermediaire" as Niveau },
  { name: "Hibou", icon: "H", color: "#2563EB", key: "Intermediaire" as Niveau },
  { name: "Dragon", icon: "D", color: "#10B981", key: "Avance" as Niveau },
]

/* PAGE */
export default function TutorielsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[color:var(--sc-bg)]">
          <div className="w-8 h-8 border-2 border-[color:var(--sc-blue)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TutorielsContent />
    </Suspense>
  )
}

function TutorielsContent() {
  const router = useRouter()
  const params = useSearchParams()
  const niveauParam = params.get("niveau") // debutant | intermediaire | avance | null
  const vueParam = params.get("vue") // mes | tous | null

  // Determine view mode
  const view: "personalized" | "all" | "level" = niveauParam
    ? "level"
    : vueParam === "tous"
      ? "all"
      : "personalized"

  const [selectedTuto, setSelectedTuto] = useState<Tutoriel | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // Precision modal state
  const [precisionOpen, setPrecisionOpen] = useState(false)
  const [precisionStepTitle, setPrecisionStepTitle] = useState<string | undefined>(undefined)
  const openPrecision = (stepTitle?: string) => {
    setPrecisionStepTitle(stepTitle)
    setPrecisionOpen(true)
  }

  // Filters for "all" view
  const [catFilter, setCatFilter] = useState<"all" | Category>("all")
  const [levelFilter, setLevelFilter] = useState<"all" | Niveau>("all")

  const openTuto = (tuto: Tutoriel) => {
    setSelectedTuto(tuto)
    setCurrentStep(0)
    setCompletedSteps(new Set())
  }

  const markStep = (i: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--sc-bg)] font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {view === "personalized" && (
          <PersonalizedView openTuto={openTuto} router={router} />
        )}

        {view === "level" && niveauParam && (
          <LevelView
            niveau={
              niveauParam === "intermediaire"
                ? "Intermediaire"
                : niveauParam === "avance"
                  ? "Avance"
                  : "Debutant"
            }
            openTuto={openTuto}
          />
        )}

        {view === "all" && (
          <AllTutorielsView
            catFilter={catFilter}
            setCatFilter={setCatFilter}
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
            openTuto={openTuto}
          />
        )}
      </main>

      <Footer />

      {selectedTuto && (
        <TutoModal
          tuto={selectedTuto}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={setCurrentStep}
          onMarkStep={markStep}
          onClose={() => setSelectedTuto(null)}
          onOpenPrecision={openPrecision}
        />
      )}

      {precisionOpen && (
        <PrecisionModalInline
          onClose={() => setPrecisionOpen(false)}
          stepTitle={precisionStepTitle}
        />
      )}
    </div>
  )
}

/*
   VIEW 1 - PERSONALIZED (mes tutoriels)
����� */
function PersonalizedView({
  openTuto,
  router,
}: {
  openTuto: (t: Tutoriel) => void
  router: ReturnType<typeof useRouter>
}) {
  // Personalize content based on user level (here: Debutant)
  const userLevel = userProgress.levelKey

  // Pick recommended tuto
  const recommendedTuto =
    tutoriels.find((t) => t.isRecommended && t.level === userLevel) ||
    tutoriels.find((t) => t.level === userLevel) ||
    tutoriels[0]

  // For Debutant profile: prioritize comptes/passwords/phishing/wifi
  const grouped: Record<string, { tutos: Tutoriel[]; description: string; priority: string }> =
    userLevel === "Debutant"
      ? {
          "Les bases (mots de passe et comptes)": {
            tutos: tutoriels
              .filter((t) => t.level === "Debutant" && ["motsdepasse", "comptes"].includes(t.category))
              .slice(0, 4),
            description: "Demarre par tes comptes et tes mots de passe",
            priority: "Priorite haute",
          },
          "Reconnaitre les menaces": {
            tutos: tutoriels.filter((t) => t.level === "Debutant" && t.category === "phishing").slice(0, 3),
            description: "Phishing, faux liens, arnaques courantes",
            priority: "Essentiel",
          },
          "Reseau et Wi-Fi": {
            tutos: tutoriels.filter((t) => t.level === "Debutant" && t.category === "reseau").slice(0, 2),
            description: "Securise ton point d'entree internet",
            priority: "Important",
          },
          "Donnees et sauvegardes": {
            tutos: tutoriels
              .filter((t) => t.level === "Debutant" && ["donnees", "sauvegardes"].includes(t.category))
              .slice(0, 3),
            description: "Protege et garde tes fichiers importants",
            priority: "Recommande",
          },
        }
      : userLevel === "Intermediaire"
        ? {
            "Confidentialite et navigation": {
              tutos: tutoriels.filter(
                (t) => t.level === "Intermediaire" && ["navigateur", "donnees"].includes(t.category),
              ),
              description: "Va plus loin que les bases",
              priority: "Priorite haute",
            },
            "Permissions et mobile": {
              tutos: tutoriels.filter(
                (t) => t.level === "Intermediaire" && ["mobile", "comptes"].includes(t.category),
              ),
              description: "Reprends le controle de tes apps",
              priority: "Important",
            },
            "Reseau et VPN": {
              tutos: tutoriels.filter(
                (t) => t.level === "Intermediaire" && ["reseau"].includes(t.category),
              ),
              description: "Comprendre vraiment ce qui circule",
              priority: "Etape suivante",
            },
            "Sauvegardes et systeme": {
              tutos: tutoriels.filter(
                (t) => t.level === "Intermediaire" && ["sauvegardes", "os", "phishing"].includes(t.category),
              ),
              description: "Routine durable et menaces ciblees",
              priority: "Recommande",
            },
          }
        : {
            "Durcissement systeme": {
              tutos: tutoriels.filter((t) => t.level === "Avance" && t.category === "os"),
              description: "Telemetrie, services, persistance",
              priority: "Priorite haute",
            },
            "Reseau avance": {
              tutos: tutoriels.filter((t) => t.level === "Avance" && t.category === "reseau"),
              description: "Surface d'exposition, pare-feu, DNS chiffre",
              priority: "Essentiel",
            },
            "Mobile et navigation cloisonnee": {
              tutos: tutoriels.filter(
                (t) => t.level === "Avance" && ["mobile", "navigateur"].includes(t.category),
              ),
              description: "Profils, conteneurs, manifestes Android",
              priority: "Important",
            },
            "Comptes et donnees": {
              tutos: tutoriels.filter(
                (t) => t.level === "Avance" && ["comptes", "donnees"].includes(t.category),
              ),
              description: "Compartimentation et chiffrement disque",
              priority: "Recommande",
            },
          }

  return (
    <>
      {/* Hero + progression banner */}
      <ProgressionHero recommendedTuto={recommendedTuto} openTuto={openTuto} />

      {/* Quick switcher */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wider mr-1">
          Vue
        </span>
        <ChipButton active onClick={() => {}}>
          <Sparkles className="w-3.5 h-3.5" /> Mes tutoriels
        </ChipButton>
        <ChipButton onClick={() => router.push("/tutoriels?vue=tous")}>
          <BookOpen className="w-3.5 h-3.5" /> Tous les tutoriels
        </ChipButton>
        <ChipButton onClick={() => router.push("/tutoriels?niveau=debutant")}>
          <GraduationCap className="w-3.5 h-3.5" /> Debutant
        </ChipButton>
        <ChipButton onClick={() => router.push("/tutoriels?niveau=intermediaire")}>
          <Flame className="w-3.5 h-3.5" /> Intermediaire
        </ChipButton>
        <ChipButton onClick={() => router.push("/tutoriels?niveau=avance")}>
          <Zap className="w-3.5 h-3.5" /> Avance
        </ChipButton>
      </div>

      {/* Grouped sections */}
      {Object.entries(grouped).map(
        ([sectionTitle, { tutos, description, priority }], sectionIndex) =>
          tutos.length > 0 && (
            <section key={sectionTitle} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-[linear-gradient(135deg,#3B82F6,#2563EB)] text-white font-bold text-sm shadow-[var(--sc-shadow-blue-sm)]">
                    {sectionIndex + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h2 className="font-bold text-base md:text-lg text-[color:var(--sc-text)] font-display">
                        {sectionTitle}
                      </h2>
                      <ScBadge tone={sectionIndex === 0 ? "info" : sectionIndex === 1 ? "warn" : "muted"}>
                        {priority}
                      </ScBadge>
                    </div>
                    <p className="text-xs text-[color:var(--sc-text-muted)]">{description}</p>
                  </div>
                </div>
                <ScButton
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/tutoriels?vue=tous")}
                >
                  Voir tout
                  <ArrowRight className="w-3.5 h-3.5" />
                </ScButton>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutos.map((tuto) => (
                  <TutoCard
                    key={tuto.id}
                    tuto={tuto}
                    onStart={() => openTuto(tuto)}
                    status={mockTutoStatus[tuto.id] || "todo"}
                  />
                ))}
              </div>
            </section>
          ),
      )}
    </>
  )
}

/* VIEW 2 - LEVEL FILTERED */
function LevelView({
  niveau,
  openTuto,
}: {
  niveau: Niveau
  openTuto: (t: Tutoriel) => void
}) {
  const router = useRouter()
  const list = useMemo(() => tutoriels.filter((t) => t.level === niveau), [niveau])

  const meta: Record<
    Niveau,
    { title: string; subtitle: string; tone: "success" | "warn" | "premium"; icon: React.ReactNode; description: string }
  > = {
    Debutant: {
      title: "Tutoriels pour debuter",
      subtitle: "Niveau Debutant",
      tone: "success",
      icon: <GraduationCap className="w-4 h-4" />,
      description:
        "Les fondamentaux : mots de passe, comptes, phishing, Wi-Fi, sauvegardes. Tout le monde devrait maitriser ces gestes.",
    },
    Intermediaire: {
      title: "Aller plus loin",
      subtitle: "Niveau Intermediaire",
      tone: "warn",
      icon: <Flame className="w-4 h-4" />,
      description:
        "Confidentialite, extensions, permissions, sauvegardes structurees, VPN, phishing avance. Pour ceux qui veulent prendre le controle.",
    },
    Avance: {
      title: "Approche experte",
      subtitle: "Niveau Avance",
      tone: "premium",
      icon: <Zap className="w-4 h-4" />,
      description:
        "Durcissement systeme, reseau, telemetrie, pare-feu, manifestes Android, DNS chiffre, navigation cloisonnee. Tutoriels longs et techniques.",
    },
  }

  const cur = meta[niveau]

  return (
    <>
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-md)] mb-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              niveau === "Debutant"
                ? "radial-gradient(at 0% 0%, rgba(16,185,129,0.12), transparent 50%), radial-gradient(at 100% 50%, rgba(37,99,235,0.10), transparent 50%)"
                : niveau === "Intermediaire"
                  ? "radial-gradient(at 0% 0%, rgba(245,158,11,0.14), transparent 50%), radial-gradient(at 100% 50%, rgba(37,99,235,0.10), transparent 50%)"
                  : "radial-gradient(at 0% 0%, rgba(139,92,246,0.16), transparent 50%), radial-gradient(at 100% 50%, rgba(37,99,235,0.10), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <ScBadge tone={cur.tone}>
              {cur.icon}
              {cur.subtitle}
            </ScBadge>
            <span className="text-xs text-[color:var(--sc-text-muted)]">
              {list.length} tutoriels disponibles
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--sc-text)] font-display mb-2 text-balance">
            {cur.title}
          </h1>
          <p className="text-sm md:text-base text-[color:var(--sc-text-2)] leading-relaxed max-w-3xl text-pretty mb-5">
            {cur.description}
          </p>

          {/* Quick switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <ChipButton onClick={() => router.push("/tutoriels")}>
              <Sparkles className="w-3.5 h-3.5" /> Mes tutoriels
            </ChipButton>
            <ChipButton onClick={() => router.push("/tutoriels?vue=tous")}>
              <BookOpen className="w-3.5 h-3.5" /> Tous
            </ChipButton>
            <ChipButton
              active={niveau === "Debutant"}
              onClick={() => router.push("/tutoriels?niveau=debutant")}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Debutant
            </ChipButton>
            <ChipButton
              active={niveau === "Intermediaire"}
              onClick={() => router.push("/tutoriels?niveau=intermediaire")}
            >
              <Flame className="w-3.5 h-3.5" /> Intermediaire
            </ChipButton>
            <ChipButton
              active={niveau === "Avance"}
              onClick={() => router.push("/tutoriels?niveau=avance")}
            >
              <Zap className="w-3.5 h-3.5" /> Avance
            </ChipButton>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((tuto) => (
          <TutoCard
            key={tuto.id}
            tuto={tuto}
            onStart={() => openTuto(tuto)}
            status={mockTutoStatus[tuto.id] || "todo"}
          />
        ))}
      </div>
    </>
  )
}

/* LIBRARY CATEGORIES - config pour la vue organisee */
interface LibraryCategory {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  match: (t: Tutoriel) => boolean
}

const LIBRARY_CATEGORIES: LibraryCategory[] = [
  {
    id: "comptes-mdp",
    label: "Comptes & mots de passe",
    description: "Securise tes connexions : double authentification, gestionnaires de mots de passe et comptes en ligne.",
    icon: <Key className="w-5 h-5" />,
    match: (t) => t.category === "comptes" || t.category === "motsdepasse",
  },
  {
    id: "phishing",
    label: "Phishing & arnaques",
    description: "Reconnais les tentatives de fraude, les faux mails et les liens piiges avant de cliquer.",
    icon: <AlertTriangle className="w-5 h-5" />,
    match: (t) => t.category === "phishing",
  },
  {
    id: "donnees",
    label: "Donnees personnelles & confidentialite",
    description: "Maitrise ce que tu partages et limite l'exposition de tes informations privees.",
    icon: <Eye className="w-5 h-5" />,
    match: (t) => t.category === "donnees",
  },
  {
    id: "reseau",
    label: "Reseau & Wi-Fi",
    description: "Protege ta connexion : Wi-Fi public, VPN et bonnes pratiques reseau.",
    icon: <Wifi className="w-5 h-5" />,
    match: (t) => t.category === "reseau",
  },
  {
    id: "appareils",
    label: "Appareils & mises a jour",
    description: "Garde tes systemes a jour et correctement configures contre les failles.",
    icon: <Settings className="w-5 h-5" />,
    match: (t) => t.category === "os",
  },
  {
    id: "mobile",
    label: "Mobile",
    description: "Securise smartphone et tablette : permissions, applications et verrouillage.",
    icon: <Smartphone className="w-5 h-5" />,
    match: (t) => t.category === "mobile",
  },
  {
    id: "sauvegardes",
    label: "Sauvegardes",
    description: "Mets tes donnees a l'abri avec des sauvegardes fiables et automatisees.",
    icon: <Save className="w-5 h-5" />,
    match: (t) => t.category === "sauvegardes",
  },
  {
    id: "navigation",
    label: "Navigation & navigateur",
    description: "Navigue sereinement : extensions, cookies, traqueurs et parametres du navigateur.",
    icon: <Globe className="w-5 h-5" />,
    match: (t) => t.category === "navigateur",
  },
  {
    id: "avance",
    label: "Avance / technique",
    description: "Pour aller plus loin : configurations avancees et sujets techniques.",
    icon: <Terminal className="w-5 h-5" />,
    match: (t) => t.level === "Avance",
  },
]

/* ��
   TUTORIAL ROW - version compacte pour la vue organisee
 */
function TutoRow({
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
    Debutant: { bg: "#10B981", label: "Debutant" },
    Intermediaire: { bg: "#F59E0B", label: "Intermediaire" },
    Avance: { bg: "#8B5CF6", label: "Avance" },
  }
  const style = levelStyles[tuto.level]
  const isDone = status === "done"
  const isInProgress = status === "inprogress"

  return (
    <div
      className={`group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl border bg-[color:var(--sc-surface)] p-3 sm:p-4 transition-all hover:shadow-[var(--sc-shadow-sm)] ${isDone ? "border-[color:var(--sc-success)]/30 hover:border-[color:var(--sc-success)]/50" : isInProgress ? "border-[color:var(--sc-blue)]/30 hover:border-[color:var(--sc-blue)]/50" : "border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/30" }`}
    >
      {/* Icon */}
      <div
        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isDone ? "bg-[color:var(--sc-success)]/10 text-[color:var(--sc-success)]" : "bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)]"}`}
      >
        <div className="scale-110">{tuto.icon}</div>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h4 className="font-semibold text-sm text-[color:var(--sc-text)] font-display truncate max-w-full">
            {tuto.title}
          </h4>
          {isDone && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[color:var(--sc-success)] text-white">
              <Check className="w-2.5 h-2.5" /> Termine
            </span>
          )}
          {isInProgress && !isDone && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[color:var(--sc-blue)] text-white">
              <Play className="w-2.5 h-2.5 fill-white" /> En cours
            </span>
          )}
          {!isDone && tuto.isEssential && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#F59E0B] text-white">
              <Star className="w-2.5 h-2.5 fill-white" /> Essentiel
            </span>
          )}
          {!isDone && !tuto.isEssential && tuto.isRecommended && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[color:var(--sc-blue)] text-white">
              <Sparkles className="w-2.5 h-2.5" /> Recommande
            </span>
          )}
          {!isDone && showPopularBadge && !tuto.isEssential && !tuto.isRecommended && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#8B5CF6] text-white">
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
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
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

/* RECHERCHE - synonymes & mots-cles (mocke, pensee grand public) */
// Mots-cles enrichis par categorie pour une recherche large et credible
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  comptes: [
    "compte", "comptes", "connexion", "google", "identifiant", "session",
    "double authentification", "2fa", "a2f", "validation en deux etapes",
    "compte pirate", "piratage", "compromis", "acces",
  ],
  motsdepasse: [
    "mot de passe", "mots de passe", "mdp", "password", "passe",
    "gestionnaire de mots de passe", "coffre fort", "phrase de passe", "passphrase",
  ],
  donnees: [
    "donnees personnelles", "donnee", "vie privee", "confidentialite", "rgpd",
    "traceurs", "tracking", "cookies", "fuite de donnees", "informations personnelles",
  ],
  sauvegardes: [
    "sauvegarde", "sauvegardes", "backup", "photo", "photos", "regle 3-2-1", "3-2-1",
    "restauration", "cloud", "disque dur", "copie de securite",
  ],
  phishing: [
    "phishing", "hameconnage", "arnaque", "arnaques", "mail", "email", "e-mail", "courriel",
    "mail pirate", "email compromis", "fraude", "escroquerie", "lien piege", "faux message", "spam", "smishing",
  ],
  os: [
    "systeme", "systeme d'exploitation", "mise a jour", "mises a jour", "update", "windows", "mac", "macos",
    "linux", "correctif", "patch", "ordinateur", "pc", "faille",
  ],
  reseau: [
    "reseau", "wifi", "wi-fi", "box", "box internet", "internet", "vpn", "routeur",
    "connexion publique", "hotspot", "point d'acces", "wifi public",
  ],
  navigateur: [
    "navigateur", "chrome", "firefox", "edge", "safari", "extension", "extensions",
    "cookies", "traceurs", "navigation privee", "historique",
  ],
  mobile: [
    "mobile", "telephone", "telephones", "smartphone", "portable", "android", "ios", "iphone",
    "ipad", "tablette", "application", "applications", "appli", "permissions",
  ],
}

// Groupes de synonymes : si un terme de recherche correspond a un groupe,
// tous les termes du groupe sont utilises pour elargir la recherche.
const SYNONYM_GROUPS: string[][] = [
  ["mdp", "mot de passe", "mots de passe", "password", "passe"],
  ["mail", "email", "e-mail", "courriel", "message", "boite mail", "messagerie"],
  ["pirate", "piratage", "hack", "hacke", "compromis", "vole", "usurpation", "pirater"],
  ["telephone", "mobile", "smartphone", "portable", "android", "ios", "iphone", "tablette", "appli", "application"],
  ["wifi", "wi-fi", "reseau", "box", "internet", "routeur", "hotspot"],
  ["sauvegarde", "sauvegardes", "backup", "photo", "photos", "sauver", "copie"],
  ["2fa", "a2f", "double authentification", "validation en deux etapes", "authentification"],
  ["arnaque", "phishing", "hameconnage", "fraude", "escroquerie", "spam"],
  ["virus", "malware", "logiciel malveillant", "ransomware", "rancongiciel"],
  ["confidentialite", "vie privee", "donnees personnelles", "rgpd", "traceurs", "cookies"],
  ["mise a jour", "update", "correctif", "patch", "systeme"],
]

// Normalise une chaine : minuscules + suppression des accents
const normalizeSearch = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

// Etend une requete en y ajoutant les synonymes pertinents
const expandQuery = (raw: string): string[] => {
  const q = normalizeSearch(raw)
  if (!q) return []
  const tokens = q.split(" ").filter((t) => t.length >= 2)
  const set = new Set<string>()
  set.add(q)
  for (const tok of tokens) {
    set.add(tok)
    for (const group of SYNONYM_GROUPS) {
      const ngroup = group.map(normalizeSearch)
      const hit = ngroup.some(
        (g) => g === tok || g.split(" ").includes(tok) || (tok.length >= 4 && (g.includes(tok) || tok.includes(g))),
      )
      if (hit) ngroup.forEach((g) => set.add(g))
    }
  }
  return [...set].filter(Boolean)
}

// Calcule un score de pertinence pour un tutoriel donne une requete
const searchScore = (t: Tutoriel, raw: string): number => {
  const terms = expandQuery(raw)
  if (terms.length === 0) return 0
  const title = normalizeSearch(t.title)
  const body = normalizeSearch(
    [
      t.description,
      CATEGORY_LABEL[t.category],
      t.tags.join(" "),
      t.level,
      (CATEGORY_KEYWORDS[t.category] || []).join(" "),
    ].join(" "),
  )
  let score = 0
  for (const term of terms) {
    if (!term) continue
    const multi = term.includes(" ")
    if (title.includes(term)) score += multi ? 14 : 7
    else if (body.includes(term)) score += multi ? 4 : 2
  }
  return score
}

/* VIEW 3 - ALL TUTORIELS (restructured with sections) */
type SortOption = "recommended" | "fastest" | "popular" | "level_asc" | "newest"
type StatusFilter = "all" | "todo" | "inprogress" | "done"
type DurationFilter = "all" | "quick" | "medium" | "long"
type TypeFilter = "all" | "essentiel" | "recommande" | "populaire" | "technique"

// Suggestions de recherche grand public (etat vide / aucun resultat)
const SEARCH_SUGGESTIONS = ["mot de passe", "phishing", "Wi-Fi", "sauvegarde", "telephone"]

function AllTutorielsView({
  catFilter,
  setCatFilter,
  levelFilter,
  setLevelFilter,
  openTuto,
}: {
  catFilter: "all" | Category
  setCatFilter: (c: "all" | Category) => void
  levelFilter: "all" | Niveau
  setLevelFilter: (l: "all" | Niveau) => void
  openTuto: (t: Tutoriel) => void
}) {
  const router = useRouter()

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const isSearching = normalizeSearch(searchQuery).length > 0

  // Additional filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("recommended")
  const [filtersOpen, setFiltersOpen] = useState(false)
  // Library display mode: organized (accordions by category) vs full (flat grid)
  const [libraryView, setLibraryView] = useState<"organized" | "full">("organized")
  // Which category accordions are open (organized view) - first open by default
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set([LIBRARY_CATEGORIES[0].id]),
  )
  const toggleCategory = (id: string) =>
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // Recommended section data (always shown, not filtered)
  const recommendedTutos = RECOMMENDED_IDS.map((id) => tutoriels.find((t) => t.id === id)!).filter(Boolean)

  // In-progress section data
  const inProgressTutos = useMemo(
    () => tutoriels.filter((t) => mockTutoStatus[t.id] === "inprogress"),
    [],
  )

  // Helper: parse duration string to minutes
  const parseDuration = (d: string): number => {
    const match = d.match(/(\d+)/)
    return match ? parseInt(match[1]) : 10
  }

  // Shared predicate : applique tous les filtres actifs a un tutoriel
  const matchesFilters = useCallback((t: Tutoriel): boolean => {
    if (catFilter !== "all" && t.category !== catFilter) return false
    if (levelFilter !== "all" && t.level !== levelFilter) return false
    if (statusFilter !== "all") {
      const s = mockTutoStatus[t.id] || "todo"
      if (s !== statusFilter) return false
    }
    if (durationFilter !== "all") {
      const mins = parseDuration(t.duration)
      if (durationFilter === "quick" && mins > 7) return false
      if (durationFilter === "medium" && (mins <= 7 || mins > 20)) return false
      if (durationFilter === "long" && mins <= 20) return false
    }
    if (typeFilter !== "all") {
      if (typeFilter === "essentiel" && !t.isEssential) return false
      if (typeFilter === "recommande" && !t.isRecommended) return false
      if (typeFilter === "populaire" && !POPULAR_IDS.has(t.id)) return false
      if (typeFilter === "technique" && !t.tags.includes("technique")) return false
    }
    return true
  }, [catFilter, durationFilter, levelFilter, statusFilter, typeFilter])

  // Tri reutilisable
  const sortList = useCallback((list: Tutoriel[], mode: SortOption): Tutoriel[] => {
    if (mode === "recommended") {
      return [...list].sort((a, b) => {
        const aScore = (a.isEssential ? 4 : 0) + (a.isRecommended ? 2 : 0) + (POPULAR_IDS.has(a.id) ? 1 : 0)
        const bScore = (b.isEssential ? 4 : 0) + (b.isRecommended ? 2 : 0) + (POPULAR_IDS.has(b.id) ? 1 : 0)
        return bScore - aScore
      })
    } else if (mode === "fastest") {
      return [...list].sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration))
    } else if (mode === "popular") {
      return [...list].sort((a, b) => (POPULAR_IDS.has(b.id) ? 1 : 0) - (POPULAR_IDS.has(a.id) ? 1 : 0))
    } else if (mode === "level_asc") {
      const levelOrder: Record<Niveau, number> = { Debutant: 0, Intermediaire: 1, Avance: 2 }
      return [...list].sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
    } else if (mode === "newest") {
      return [...list].sort((a, b) => b.id - a.id)
    }
    return list
  }, [])

  // Full filtered & sorted list for catalog (vue exploration, sans recherche)
  const catalogList = useMemo(
    () => sortList(tutoriels.filter(matchesFilters), sortBy),
    [matchesFilters, sortBy, sortList],
  )

  // Resultats de recherche : pertinence d'abord, filtres appliques
  const searchResults = useMemo(() => {
    if (!isSearching) return []
    const scored = tutoriels
      .filter(matchesFilters)
      .map((t) => ({ t, score: searchScore(t, searchQuery) }))
      .filter((x) => x.score > 0)
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      // departage : recommandes / essentiels d'abord
      const aBoost = (a.t.isEssential ? 2 : 0) + (a.t.isRecommended ? 1 : 0)
      const bBoost = (b.t.isEssential ? 2 : 0) + (b.t.isRecommended ? 1 : 0)
      return bBoost - aBoost
    })
    return scored.map((x) => x.t)
  }, [isSearching, matchesFilters, searchQuery])

  const cats: Array<"all" | Category> = [
    "all",
    "comptes",
    "motsdepasse",
    "phishing",
    "donnees",
    "sauvegardes",
    "reseau",
    "navigateur",
    "mobile",
    "os",
  ]

  const hasActiveFilters =
    catFilter !== "all" ||
    levelFilter !== "all" ||
    statusFilter !== "all" ||
    durationFilter !== "all" ||
    typeFilter !== "all"

  return (
    <>
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-md)] mb-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(at 0% 0%, rgba(37,99,235,0.12), transparent 50%), radial-gradient(at 100% 50%, rgba(99,102,241,0.10), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <ScBadge tone="info">
              <BookOpen className="w-3.5 h-3.5" />
              Bibliotheque complete
            </ScBadge>
            <span className="text-xs text-[color:var(--sc-text-muted)]">
              {tutoriels.length} tutoriels disponibles
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--sc-text)] font-display mb-2 text-balance">
            Tous les tutoriels
          </h1>
          <p className="text-sm md:text-base text-[color:var(--sc-text-2)] leading-relaxed max-w-3xl text-pretty mb-5">
            Du plus accessible au plus technique. Commence par ce qui est recommande, reprends la ou tu en etais, puis explore toute la bibliotheque.
          </p>

          {/* Barre de recherche centrale */}
          <div className="mb-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--sc-text-muted)]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Rechercher un tutoriel"
                placeholder="Rechercher un tutoriel : mot de passe, phishing, Wi-Fi, telephone..."
                className="w-full rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] py-3.5 pl-12 pr-11 text-sm md:text-base text-[color:var(--sc-text)] placeholder:text-[color:var(--sc-text-muted)] shadow-[var(--sc-shadow-sm)] focus:outline-none focus:border-[color:var(--sc-blue)]/60 focus:ring-2 focus:ring-[color:var(--sc-blue)]/15 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Effacer la recherche"
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full text-[color:var(--sc-text-muted)] hover:bg-[color:var(--sc-bg-soft)] hover:text-[color:var(--sc-text)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {!isSearching && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[color:var(--sc-text-muted)]">Suggestions :</span>
                {SEARCH_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSearchQuery(s)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View switcher */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <ChipButton onClick={() => router.push("/tutoriels")}>
              <Sparkles className="w-3.5 h-3.5" /> Mes tutoriels
            </ChipButton>
            <ChipButton active>
              <BookOpen className="w-3.5 h-3.5" /> Tous
            </ChipButton>
            <ChipButton onClick={() => router.push("/tutoriels?niveau=debutant")}>
              <GraduationCap className="w-3.5 h-3.5" /> Debutant
            </ChipButton>
            <ChipButton onClick={() => router.push("/tutoriels?niveau=intermediaire")}>
              <Flame className="w-3.5 h-3.5" /> Intermediaire
            </ChipButton>
            <ChipButton onClick={() => router.push("/tutoriels?niveau=avance")}>
              <Zap className="w-3.5 h-3.5" /> Avance
            </ChipButton>
          </div>

          {/* Filters toggle row */}
          <div className="pt-3 border-t border-[color:var(--sc-border)]">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)] transition-colors"
              >
                <FilterIcon className="w-3.5 h-3.5" />
                Filtres &amp; tri
                {hasActiveFilters && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[color:var(--sc-blue)] text-white text-[9px] font-bold">
                    !
                  </span>
                )}
                {filtersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {/* Sort selector - always visible */}
              <div className="flex items-center gap-2">
                <SortAsc className="w-3.5 h-3.5 text-[color:var(--sc-text-muted)]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-xs font-medium text-[color:var(--sc-text-2)] bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[color:var(--sc-blue)]/60 cursor-pointer"
                >
                  <option value="recommended">Recommandes d&apos;abord</option>
                  <option value="fastest">Les plus rapides</option>
                  <option value="popular">Les plus populaires</option>
                  <option value="level_asc">Niveau croissant</option>
                  <option value="newest">Derniers ajoutes</option>
                </select>
              </div>
            </div>

            {filtersOpen && (
              <div className="space-y-3 pb-1">
                {/* Level + Category (existing) */}
                <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wider inline-flex items-center gap-1">
                      Niveau
                    </span>
                    {(["all", "Debutant", "Intermediaire", "Avance"] as const).map((lvl) => (
                      <ChipButton
                        key={lvl}
                        size="xs"
                        active={levelFilter === lvl}
                        onClick={() => setLevelFilter(lvl as "all" | Niveau)}
                      >
                        {lvl === "all" ? "Tous" : lvl}
                      </ChipButton>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wider inline-flex items-center gap-1">
                    Categorie
                  </span>
                  {cats.map((c) => (
                    <ChipButton
                      key={c}
                      size="xs"
                      active={catFilter === c}
                      onClick={() => setCatFilter(c)}
                    >
                      {c === "all" ? "Toutes" : CATEGORY_LABEL[c as Category]}
                    </ChipButton>
                  ))}
                </div>

                {/* New filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="block text-[11px] font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wider mb-1.5">
                      Statut
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(["all", "todo", "inprogress", "done"] as StatusFilter[]).map((s) => (
                        <ChipButton
                          key={s}
                          size="xs"
                          active={statusFilter === s}
                          onClick={() => setStatusFilter(s)}
                        >
                          {s === "all" ? "Tous" : s === "todo" ? "A faire" : s === "inprogress" ? "En cours" : "Termine"}
                        </ChipButton>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wider mb-1.5">
                      Duree
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(["all", "quick", "medium", "long"] as DurationFilter[]).map((d) => (
                        <ChipButton
                          key={d}
                          size="xs"
                          active={durationFilter === d}
                          onClick={() => setDurationFilter(d)}
                        >
                          {d === "all" ? "Toutes" : d === "quick" ? "Rapide" : d === "medium" ? "10-20 min" : "20 min+"}
                        </ChipButton>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wider mb-1.5">
                      Type
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(["all", "essentiel", "recommande", "populaire", "technique"] as TypeFilter[]).map((t) => (
                        <ChipButton
                          key={t}
                          size="xs"
                          active={typeFilter === t}
                          onClick={() => setTypeFilter(t)}
                        >
                          {t === "all"
                            ? "Tous"
                            : t === "essentiel"
                              ? "Essentiel"
                              : t === "recommande"
                                ? "Recommande"
                                : t === "populaire"
                                  ? "Populaire"
                                  : "Technique"}
                        </ChipButton>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reset */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setCatFilter("all")
                      setLevelFilter("all")
                      setStatusFilter("all")
                      setDurationFilter("all")
                      setTypeFilter("all")
                    }}
                    className="text-xs text-[color:var(--sc-danger)] hover:underline font-medium"
                  >
                    Reinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resultats de recherche */}
      {isSearching && (
        <section aria-label="Resultats de recherche">
          {searchResults.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[color:var(--sc-blue)]/10 border border-[color:var(--sc-blue)]/20 text-[color:var(--sc-blue)]">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base md:text-lg text-[color:var(--sc-text)] font-display">
                      Resultats pour {'"'}{searchQuery.trim()}{'"'}
                    </h2>
                    <p className="text-xs text-[color:var(--sc-text-muted)]">
                      {searchResults.length} tutoriel{searchResults.length > 1 ? "s" : ""} pertinent
                      {searchResults.length > 1 ? "s" : ""}
                      {hasActiveFilters ? " (filtres appliques)" : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-1.5 self-start text-xs font-semibold px-3 py-1.5 rounded-lg border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/40 hover:text-[color:var(--sc-blue)] transition-all"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Revenir a l&apos;exploration par categorie
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((tuto) => (
                  <TutoCard
                    key={tuto.id}
                    tuto={tuto}
                    onStart={() => openTuto(tuto)}
                    status={mockTutoStatus[tuto.id] || "todo"}
                    showPopularBadge={POPULAR_IDS.has(tuto.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            /* Etat aucun resultat */
            <div className="rounded-2xl border border-dashed border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-8 md:p-10 text-center">
              <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-2xl bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-text-muted)]">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="font-bold text-base md:text-lg text-[color:var(--sc-text)] font-display mb-1.5">
                Aucun tutoriel trouve pour {'"'}{searchQuery.trim()}{'"'}
              </h2>
              <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed max-w-md mx-auto mb-5">
                Essayez : mot de passe, phishing, Wi-Fi, sauvegarde, telephone.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6">
                {SEARCH_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSearchQuery(s)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setCatFilter("all")
                  setLevelFilter("all")
                  setStatusFilter("all")
                  setDurationFilter("all")
                  setTypeFilter("all")
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-[color:var(--sc-blue)] text-white hover:opacity-90 transition-opacity"
              >
                <Layers className="w-3.5 h-3.5" />
                Voir les categories principales
              </button>
            </div>
          )}
        </section>
      )}

      {/* 1. Recommande pour vous */}
      {!isSearching && !hasActiveFilters && (
        <section className="mb-8" aria-label="Recommande pour vous">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[linear-gradient(135deg,#3B82F6,#2563EB)] text-white shadow-[var(--sc-shadow-blue-sm)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base md:text-lg text-[color:var(--sc-text)] font-display">
                  Recommande pour vous
                </h2>
                <p className="text-xs text-[color:var(--sc-text-muted)]">
                  Base sur votre profil et votre dernier audit
                </p>
              </div>
            </div>
            <ScBadge tone="info">
              <Target className="w-3 h-3" />
              Priorite
            </ScBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedTutos.map((tuto) => (
              <TutoCard
                key={tuto.id}
                tuto={tuto}
                onStart={() => openTuto(tuto)}
                status={mockTutoStatus[tuto.id] || "todo"}
                recommendationReason={RECOMMENDED_REASONS[tuto.id]}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Reprendre */}
      {!isSearching && !hasActiveFilters && inProgressTutos.length > 0 && (
        <section className="mb-8" aria-label="Reprendre la ou vous en etiez">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[color:var(--sc-blue)]/10 border border-[color:var(--sc-blue)]/20 text-[color:var(--sc-blue)]">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg text-[color:var(--sc-text)] font-display">
                Reprendre la ou vous en etiez
              </h2>
              <p className="text-xs text-[color:var(--sc-text-muted)]">
                {inProgressTutos.length} tutoriel{inProgressTutos.length > 1 ? "s" : ""} en cours
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {inProgressTutos.map((tuto) => {
              const progress = mockTutoLastStep[tuto.id]
              const progressPct = progress
                ? Math.round(((progress.step) / tuto.steps.length) * 100)
                : 0
              return (
                <div
                  key={tuto.id}
                  className="flex items-center gap-4 rounded-xl border border-[color:var(--sc-blue)]/30 bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-sm)] p-4 hover:border-[color:var(--sc-blue)]/50 hover:shadow-[var(--sc-shadow-md)] transition-all"
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-[color:var(--sc-bg-soft)] flex items-center justify-center text-[color:var(--sc-blue)]">
                    <div className="scale-150">{tuto.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--sc-blue)] text-white">
                        <Play className="w-2.5 h-2.5 fill-white" /> En cours
                      </span>
                      <span className="text-[10px] text-[color:var(--sc-text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {tuto.duration}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-[color:var(--sc-text)] truncate font-display">
                      {tuto.title}
                    </p>
                    {progress && (
                      <p className="text-xs text-[color:var(--sc-text-muted)] truncate mt-0.5">
                        Derniere etape : <span className="text-[color:var(--sc-text-2)]">{progress.label}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-[color:var(--sc-surface-2)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[linear-gradient(90deg,#3B82F6,#2563EB)] rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[color:var(--sc-blue)] shrink-0">
                        {progressPct}%
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col gap-2">
                    <ScButton variant="primary" size="sm" onClick={() => openTuto(tuto)}>
                      <Play className="w-3.5 h-3.5" />
                      Reprendre
                    </ScButton>
                    <Link
                      href={`/tutoriels/${tuto.id}`}
                      className="inline-flex items-center justify-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/40 hover:text-[color:var(--sc-blue)] transition-all"
                    >
                      Voir
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 3. Explorer par categorie */}
      {!isSearching && (
      <section aria-label="Explorer la bibliotheque">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)] text-[color:var(--sc-text-muted)]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg text-[color:var(--sc-text)] font-display">
                {hasActiveFilters
                  ? "Resultats filtres"
                  : libraryView === "organized"
                    ? "Explorer par categorie"
                    : "Toute la bibliotheque"}
              </h2>
              <p className="text-xs text-[color:var(--sc-text-muted)]">
                {catalogList.length} tutoriel{catalogList.length > 1 ? "s" : ""} disponible{catalogList.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Vue organisee / Vue complete toggle */}
          <div className="inline-flex items-center rounded-lg border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-0.5 self-start">
            <button
              type="button"
              onClick={() => setLibraryView("organized")}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${ libraryView === "organized" ? "bg-[color:var(--sc-blue)] text-white shadow-sm" : "text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)]" }`}
              aria-pressed={libraryView === "organized"}
            >
              <Layers className="w-3.5 h-3.5" />
              Vue organisee
            </button>
            <button
              type="button"
              onClick={() => setLibraryView("full")}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${ libraryView === "full" ? "bg-[color:var(--sc-blue)] text-white shadow-sm" : "text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)]" }`}
              aria-pressed={libraryView === "full"}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Vue complete
            </button>
          </div>
        </div>

        {catalogList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[color:var(--sc-border)] p-10 text-center">
            <p className="text-sm text-[color:var(--sc-text-muted)] mb-3">
              Aucun tutoriel ne correspond a tes filtres pour le moment.
            </p>
            <button
              type="button"
              onClick={() => {
                setCatFilter("all")
                setLevelFilter("all")
                setStatusFilter("all")
                setDurationFilter("all")
                setTypeFilter("all")
              }}
              className="text-xs font-semibold text-[color:var(--sc-blue)] hover:underline"
            >
              Reinitialiser les filtres
            </button>
          </div>
        ) : libraryView === "organized" ? (
          /* Organized view : accordions par categorie */
          <div className="flex flex-col gap-3">
            {LIBRARY_CATEGORIES.map((cat) => {
              const catTutos = catalogList.filter(cat.match)
              if (catTutos.length === 0) return null

              const isOpen = hasActiveFilters || openCategories.has(cat.id)

              // Stats : niveaux presents + fourchette de duree
              const levelsPresent = (["Debutant", "Intermediaire", "Avance"] as Niveau[]).filter((lvl) =>
                catTutos.some((t) => t.level === lvl),
              )
              const durations = catTutos.map((t) => parseDuration(t.duration))
              const minD = Math.min(...durations)
              const maxD = Math.max(...durations)
              const durationLabel = minD === maxD ? `${minD} min` : `${minD}-${maxD} min`
              const doneCount = catTutos.filter((t) => (mockTutoStatus[t.id] || "todo") === "done").length

              return (
                <div
                  key={cat.id}
                  className={`rounded-xl border bg-[color:var(--sc-surface)] overflow-hidden transition-all ${ isOpen ? "border-[color:var(--sc-blue)]/40 shadow-[var(--sc-shadow-sm)]" : "border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/30" }`}
                >
                  {/* Accordion header */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    aria-expanded={isOpen}
                    disabled={hasActiveFilters}
                    className="w-full flex items-center gap-3 sm:gap-4 p-4 text-left transition-colors hover:bg-[color:var(--sc-bg-soft)] disabled:cursor-default disabled:hover:bg-transparent"
                  >
                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-[color:var(--sc-blue)]/10 text-[color:var(--sc-blue)]">
                      {cat.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm md:text-base text-[color:var(--sc-text)] font-display">
                          {cat.label}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)] text-[color:var(--sc-text-2)]">
                          {catTutos.length} tuto{catTutos.length > 1 ? "s" : ""}
                        </span>
                        {doneCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--sc-success)]/10 text-[color:var(--sc-success)]">
                            <Check className="w-2.5 h-2.5" />
                            {doneCount} fait{doneCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed line-clamp-1 sm:line-clamp-none mt-0.5">
                        {cat.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] text-[color:var(--sc-text-muted)] font-medium">
                          <Clock className="w-3 h-3" /> {durationLabel}
                        </span>
                        {levelsPresent.map((lvl) => (
                          <span
                            key={lvl}
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                            style={{
                              background:
                                lvl === "Debutant" ? "#10B981" : lvl === "Intermediaire" ? "#F59E0B" : "#8B5CF6",
                            }}
                          >
                            {lvl}
                          </span>
                        ))}
                      </div>
                    </div>

                    {!hasActiveFilters && (
                      <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-[color:var(--sc-text-muted)]">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    )}
                  </button>

                  {/* Accordion body */}
                  {isOpen && (
                    <div className="px-3 sm:px-4 pb-4 pt-1 flex flex-col gap-2.5 border-t border-[color:var(--sc-border)]">
                      {catTutos.map((tuto) => (
                        <TutoRow
                          key={tuto.id}
                          tuto={tuto}
                          onStart={() => openTuto(tuto)}
                          status={mockTutoStatus[tuto.id] || "todo"}
                          showPopularBadge={POPULAR_IDS.has(tuto.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          /* Full view : grille complete de cartes */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalogList.map((tuto) => (
              <TutoCard
                key={tuto.id}
                tuto={tuto}
                onStart={() => openTuto(tuto)}
                status={mockTutoStatus[tuto.id] || "todo"}
                showPopularBadge={POPULAR_IDS.has(tuto.id)}
              />
            ))}
          </div>
        )}
      </section>
      )}
    </>
  )
}

/* PROGRESSION HERO */
function ProgressionHero({
  recommendedTuto,
  openTuto,
}: {
  recommendedTuto: Tutoriel
  openTuto: (t: Tutoriel) => void
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-md)] mb-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(at 0% 0%, rgba(37,99,235,0.12), transparent 50%), radial-gradient(at 100% 50%, rgba(6,182,212,0.10), transparent 50%), radial-gradient(at 50% 100%, rgba(99,102,241,0.08), transparent 50%)",
        }}
        aria-hidden
      />
      <div className="relative p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-8 items-start">
          {/* LEFT */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="relative mb-4">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-white text-3xl md:text-4xl font-bold font-display bg-[linear-gradient(135deg,#3B82F6,#2563EB_60%,#6366F1)] shadow-[0_12px_28px_-10px_rgba(37,99,235,0.55)]">
                P
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#F59E0B] border-3 border-[color:var(--sc-surface)] flex items-center justify-center">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs font-semibold text-[color:var(--sc-blue)] uppercase tracking-wider mb-1">
                Niveau actuel
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-[color:var(--sc-text)] font-display">
                {userProgress.level}
              </h2>
            </div>
            <div className="flex gap-2">
              {userProgress.badges.map((badge, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] text-[color:var(--sc-text)]"
                >
                  <Award className="w-3 h-3 text-[color:var(--sc-blue)]" />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* CENTER */}
          <div className="flex-1 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[color:var(--sc-text)]">Ta progression</span>
                <span className="text-sm font-bold text-[color:var(--sc-blue)]">
                  {userProgress.progressPercent}%
                </span>
              </div>
              <div className="relative h-3 bg-[color:var(--sc-surface-2)] rounded-full overflow-hidden mb-3">
                <div
                  className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#3B82F6,#2563EB,#6366F1)] rounded-full transition-all duration-700"
                  style={{ width: `${userProgress.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between">
                {levels.map((level, i) => (
                  <div
                    key={level.name}
                    className={`flex flex-col items-center ${ i <= userProgress.levelIndex ? "opacity-100" : "opacity-40" }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white mb-1 transition-transform ${ i === userProgress.levelIndex ? "scale-125 ring-2 ring-offset-2 ring-[color:var(--sc-blue)]" : "" }`}
                      style={{ backgroundColor: level.color }}
                    >
                      {level.icon}
                    </div>
                    <span
                      className={`text-[9px] font-medium ${ i === userProgress.levelIndex ? "text-[color:var(--sc-blue)] font-bold" : "text-[color:var(--sc-text-muted)]" }`}
                    >
                      {level.name.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] p-3 text-center">
                <div className="text-lg md:text-xl font-bold text-[color:var(--sc-text)] font-display">
                  {userProgress.completedTutos}
                </div>
                <div className="text-[10px] text-[color:var(--sc-text-muted)] uppercase tracking-wide">
                  Tutoriels
                </div>
              </div>
              <div className="rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] p-3 text-center">
                <div className="text-lg md:text-xl font-bold text-[color:var(--sc-text)] font-display">
                  {userProgress.stepsToNextLevel}
                </div>
                <div className="text-[10px] text-[color:var(--sc-text-muted)] uppercase tracking-wide">
                  Etapes restantes
                </div>
              </div>
              <div className="rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] p-3 text-center">
                <div className="text-lg md:text-xl font-bold text-[color:var(--sc-success)] font-display">
                  +{userProgress.percentileBetter}%
                </div>
                <div className="text-[10px] text-[color:var(--sc-text-muted)] uppercase tracking-wide">
                  Vs moyenne
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)] p-4">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-[color:var(--sc-blue)]/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-[color:var(--sc-blue)]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[color:var(--sc-blue)] mb-1">
                  Comparaison anonymisee
                </p>
                <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
                  Tu fais deja mieux que{" "}
                  <span className="font-bold text-[color:var(--sc-success)]">
                    {userProgress.percentileBetter}%
                  </span>{" "}
                  des utilisateurs de ta tranche d&apos;age. {userProgress.avgUserMessage}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4 lg:w-64">
            <div className="rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-4 shadow-[var(--sc-shadow-sm)]">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-[color:var(--sc-blue)]" />
                <span className="text-xs font-semibold text-[color:var(--sc-blue)] uppercase tracking-wider">
                  Prochain objectif
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: levels[userProgress.levelIndex + 1]?.color || "#06B6D4" }}
                >
                  {levels[userProgress.levelIndex + 1]?.icon || "L"}
                </div>
                <div>
                  <p className="font-bold text-[color:var(--sc-text)]">{userProgress.nextLevel}</p>
                  <p className="text-xs text-[color:var(--sc-text-muted)]">Niveau suivant</p>
                </div>
              </div>
              <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed mb-3">
                Il te reste{" "}
                <span className="font-bold text-[color:var(--sc-blue)]">
                  {userProgress.stepsToNextLevel} etapes
                </span>{" "}
                pour debloquer ce niveau.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[color:var(--sc-success)] font-medium">
                <TrendingUp className="w-3 h-3" />
                Tu progresses plus vite que la moyenne !
              </div>
            </div>

            <div className="rounded-xl border-2 border-[color:var(--sc-blue)]/30 bg-[linear-gradient(135deg,rgba(37,99,235,0.06)_0%,rgba(99,102,241,0.06)_100%)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[color:var(--sc-blue)]" />
                <span className="text-xs font-bold text-[color:var(--sc-blue)]">Recommande pour toi</span>
              </div>
              <p className="text-sm font-semibold text-[color:var(--sc-text)] mb-3 leading-snug">
                {recommendedTuto.title}
              </p>
              <ScButton
                variant="primary"
                size="sm"
                onClick={() => openTuto(recommendedTuto)}
                className="w-full"
              >
                <Zap className="w-3.5 h-3.5" />
                Commencer maintenant
              </ScButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/*
   CHIP BUTTON (filter pills)
 ��� */
function ChipButton({
  children,
  active,
  onClick,
  size = "sm",
}: {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  size?: "xs" | "sm"
}) {
  const sizeCls = size === "xs" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-all ${sizeCls} ${ active ? "text-white border border-transparent bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] shadow-[0_4px_12px_-3px_rgba(37,99,235,0.40)]" : "bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] border border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)]" }`}
    >
      {children}
    </button>
  )
}

/* TUTORIAL CARD */
function TutoCard({
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
    Debutant: { bg: "#10B981", label: "Debutant" },
    Intermediaire: { bg: "#F59E0B", label: "Intermediaire" },
    Avance: { bg: "#8B5CF6", label: "Avance" },
  }
  const style = levelStyles[tuto.level]
  const isDone = status === "done"
  const isInProgress = status === "inprogress"

  return (
    <article
      className={`group relative rounded-xl overflow-hidden flex flex-col bg-[color:var(--sc-surface)] border shadow-[var(--sc-shadow-sm)] hover:shadow-[var(--sc-shadow-md)] hover:-translate-y-1 transition-all duration-300 ease-out ${isDone ? "border-[color:var(--sc-success)]/40 hover:border-[color:var(--sc-success)]/60" : isInProgress ? "border-[color:var(--sc-blue)]/40 hover:border-[color:var(--sc-blue)]/60" : "border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/40" }`}
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[color:var(--sc-success)] text-white shadow-sm">
            <Check className="w-2.5 h-2.5" />
            Termine
          </span>
        )}
        {isInProgress && !isDone && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[color:var(--sc-blue)] text-white shadow-sm">
            <Play className="w-2.5 h-2.5 fill-white" />
            En cours
          </span>
        )}
        {!isDone && !isInProgress && tuto.isRecommended && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[color:var(--sc-blue)] text-white shadow-sm">
            <Sparkles className="w-2.5 h-2.5" />
            Recommande
          </span>
        )}
        {!isDone && tuto.isEssential && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B] text-white shadow-sm">
            <Star className="w-2.5 h-2.5 fill-white" />
            Essentiel
          </span>
        )}
        {!isDone && showPopularBadge && !tuto.isRecommended && !tuto.isEssential && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8B5CF6] text-white shadow-sm">
            <TrendingUp className="w-2.5 h-2.5" />
            Populaire
          </span>
        )}
        {!isDone && tuto.isNextStep && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8B5CF6] text-white shadow-sm">
            <ArrowRight className="w-2.5 h-2.5" />
            Prochaine etape
          </span>
        )}
      </div>

      <div className={`h-24 flex items-center justify-center text-[color:var(--sc-blue)] relative overflow-hidden ${isDone ? "bg-[color:var(--sc-success)]/8" : "bg-[color:var(--sc-bg-soft)]"}`}>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: isDone
              ? "radial-gradient(circle at 50% 120%, rgba(16,185,129,0.20), transparent 60%)"
              : "radial-gradient(circle at 50% 120%, rgba(37,99,235,0.25), transparent 60%)",
          }}
        />
        <div className={`relative scale-[2.5] transition-transform group-hover:scale-[2.8] ${isDone ? "text-[color:var(--sc-success)]" : ""}`}>
          {tuto.icon}
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
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
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

/* PRECISION MODAL (inline version for tutoriels list page) */
type PrecisionType =
  | "information_fausse"
  | "information_obsolete"
  | "reformulation"
  | "manque_clarte"
  | "lien_casse"
  | "etape_ne_fonctionne_plus"
  | "precision_utile"

const PRECISION_LABELS: Record<PrecisionType, string> = {
  information_fausse: "Information fausse",
  information_obsolete: "Information obsolete",
  reformulation: "Reformulation necessaire",
  manque_clarte: "Manque de clarte",
  lien_casse: "Lien casse",
  etape_ne_fonctionne_plus: "Etape qui ne fonctionne plus",
  precision_utile: "Precision utile a ajouter",
}

function PrecisionModalInline({
  onClose,
  stepTitle,
}: {
  onClose: () => void
  stepTitle?: string
}) {
  const [type, setType] = useState<PrecisionType | "">("")
  const [message, setMessage] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!type || !message.trim()) return
    setSent(true)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[color:var(--sc-border)] bg-[color:var(--sc-bg-soft)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flag className="w-4 h-4 text-[color:var(--sc-blue)]" />
              <span className="text-sm font-bold text-[color:var(--sc-text)]">Apporter une precision</span>
            </div>
            {stepTitle && (
              <p className="text-xs text-[color:var(--sc-text-muted)]">
                Etape : <span className="font-medium text-[color:var(--sc-text-2)]">{stepTitle}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[color:var(--sc-surface)] rounded-lg transition-colors" aria-label="Fermer">
            <X className="w-4 h-4 text-[color:var(--sc-text-muted)]" />
          </button>
        </div>

        {sent ? (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[color:var(--sc-success)]/10 border border-[color:var(--sc-success)]/30 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[color:var(--sc-success)]" />
            </div>
            <div>
              <p className="font-bold text-[color:var(--sc-text)] mb-2">Precision envoyee</p>
              <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed max-w-xs">
                Merci, votre precision a ete envoyee. Elle pourra etre relue avant publication.
              </p>
            </div>
            <ScButton variant="secondary" size="sm" onClick={onClose}>Fermer</ScButton>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[color:var(--sc-text)] mb-2">
                Type de retour <span className="text-[color:var(--sc-error)]">*</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {(Object.entries(PRECISION_LABELS) as [PrecisionType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all border ${ type === key ? "bg-[color:var(--sc-blue)]/10 border-[color:var(--sc-blue)]/50 text-[color:var(--sc-blue)]" : "bg-[color:var(--sc-bg-soft)] border-[color:var(--sc-border)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/30" }`}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${type === key ? "border-[color:var(--sc-blue)] bg-[color:var(--sc-blue)]" : "border-[color:var(--sc-border-strong)]"}`}>
                      {type === key && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[color:var(--sc-text)] mb-2">
                Message <span className="text-[color:var(--sc-error)]">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Decrivez la precision que vous souhaitez apporter..."
                rows={3}
                className="w-full rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-bg-soft)] px-3 py-2 text-sm text-[color:var(--sc-text)] placeholder:text-[color:var(--sc-text-muted)] focus:outline-none focus:border-[color:var(--sc-blue)]/60 focus:ring-1 focus:ring-[color:var(--sc-blue)]/20 resize-none transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setAnonymous(!anonymous)}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${anonymous ? "bg-[color:var(--sc-surface-2)] border-[color:var(--sc-border-strong)] text-[color:var(--sc-text)]" : "bg-[color:var(--sc-bg-soft)] border-[color:var(--sc-border)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-border-strong)]"}`}
            >
              <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${anonymous ? "bg-[color:var(--sc-blue)] border-[color:var(--sc-blue)]" : "border-[color:var(--sc-border-strong)] bg-transparent"}`}>
                {anonymous && <Check className="w-3 h-3 text-white" />}
              </span>
              Envoyer anonymement
            </button>
            <ScButton
              variant="primary"
              size="sm"
              onClick={handleSend}
              disabled={!type || !message.trim()}
              className="w-full"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Envoyer la precision
            </ScButton>
          </div>
        )}
      </div>
    </div>
  )
}

/* TUTORIAL MODAL - Step by step guide */
function TutoModal({
  tuto,
  currentStep,
  completedSteps,
  onStepChange,
  onMarkStep,
  onClose,
  onOpenPrecision,
}: {
  tuto: Tutoriel
  currentStep: number
  completedSteps: Set<number>
  onStepChange: (i: number) => void
  onMarkStep: (i: number) => void
  onClose: () => void
  onOpenPrecision: (stepTitle?: string) => void
}) {
  const step = tuto.steps[currentStep]
  const isLast = currentStep === tuto.steps.length - 1
  const allDone = completedSteps.size === tuto.steps.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-5 border-b border-[color:var(--sc-border)] bg-[color:var(--sc-bg-soft)]">
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: "radial-gradient(at 0% 0%, rgba(37,99,235,0.15), transparent 50%)" }}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <ScBadge tone="info" className="mb-2">
                <BookOpen className="w-3 h-3" />
                Tutoriel
              </ScBadge>
              <h2 className="font-bold text-lg text-[color:var(--sc-text)] font-display">{tuto.title}</h2>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-[color:var(--sc-text-muted)]">
                  <Clock className="w-3 h-3" /> {tuto.duration}
                </span>
                <span className="text-xs text-[color:var(--sc-text-muted)]">{tuto.level}</span>
                <span className="text-xs text-[color:var(--sc-text-muted)]">
                  {CATEGORY_LABEL[tuto.category]}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[color:var(--sc-surface)] rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-[color:var(--sc-text-muted)]" />
            </button>
          </div>
        </div>

        <div className="px-5 pt-4 pb-2 border-b border-[color:var(--sc-border)]">
          <div className="flex justify-between text-xs text-[color:var(--sc-text-2)] mb-2">
            <span className="font-medium">
              Etape {currentStep + 1} sur {tuto.steps.length}
            </span>
            <span className="font-bold text-[color:var(--sc-blue)]">
              {Math.round(((currentStep + 1) / tuto.steps.length) * 100)}%
            </span>
          </div>
          <div className="relative h-2 bg-[color:var(--sc-surface-2)] rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#3B82F6,#2563EB)] rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / tuto.steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-[linear-gradient(135deg,#3B82F6,#2563EB)] text-white flex items-center justify-center font-bold text-sm shadow-[var(--sc-shadow-blue-sm)]">
              {currentStep + 1}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base text-[color:var(--sc-text)] mb-2">{step.title}</h3>
              <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">{step.description}</p>
            </div>
          </div>

          <button
            onClick={() => onMarkStep(currentStep)}
            className={`mt-2 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${ completedSteps.has(currentStep) ? "bg-[color:var(--sc-success)]/10 border-[color:var(--sc-success)]/40 text-[color:var(--sc-success)]" : "bg-[color:var(--sc-surface)] border-[color:var(--sc-border)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/45" }`}
          >
            {completedSteps.has(currentStep) ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Etape validee
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" /> Marquer comme fait
              </>
            )}
          </button>

          {tuto.tip && isLast && (
            <div className="mt-5 rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[color:var(--sc-blue)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[color:var(--sc-blue)] uppercase tracking-wider mb-1">
                    Astuce SafeCheck
                  </p>
                  <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">{tuto.tip}</p>
                </div>
              </div>
            </div>
          )}

          {/* Discrete precision link */}
          <div className="mt-4 pt-3 border-t border-[color:var(--sc-border)]">
            <button
              type="button"
              onClick={() => onOpenPrecision(tuto.steps[currentStep].title)}
              className="inline-flex items-center gap-1.5 text-xs text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-blue)] transition-colors"
            >
              <Flag className="w-3 h-3" />
              Un probleme avec cette etape ? Signaler une precision
            </button>
          </div>

          {allDone && (
            <div className="mt-5 rounded-xl bg-[color:var(--sc-success)]/10 border border-[color:var(--sc-success)]/30 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[color:var(--sc-success)]" />
                <p className="text-sm font-semibold text-[color:var(--sc-success)]">
                  Tutoriel termine ! Bravo, c&apos;est une etape de moins vers ton prochain niveau.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[color:var(--sc-border)] bg-[color:var(--sc-bg-soft)] flex items-center justify-between gap-3">
          <ScButton
            variant="secondary"
            size="sm"
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Precedent
          </ScButton>

          <div className="flex gap-1">
            {tuto.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => onStepChange(i)}
                className={`w-2 h-2 rounded-full transition-all ${ i === currentStep ? "bg-[color:var(--sc-blue)] w-6" : completedSteps.has(i) ? "bg-[color:var(--sc-success)]" : "bg-[color:var(--sc-border-strong)]" }`}
                aria-label={`Aller a l'etape ${i + 1}`}
              />
            ))}
          </div>

          {isLast ? (
            <ScButton variant="primary" size="sm" onClick={onClose}>
              Terminer
              <CheckCircle2 className="w-3.5 h-3.5" />
            </ScButton>
          ) : (
            <ScButton variant="primary" size="sm" onClick={() => onStepChange(currentStep + 1)}>
              Suivant
              <ChevronRight className="w-3.5 h-3.5" />
            </ScButton>
          )}
        </div>
      </div>
    </div>
  )
}
