"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import { ScButton, ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
import { useAuth } from "@/components/safecheck/AuthProvider"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowRight,
  Sparkles,
  GraduationCap,
  BookOpen,
  Sliders,
  Quote,
  Trophy,
  ListChecks,
  BookMarked,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Wifi,
} from "lucide-react"

const testimonials = [
  {
    name: "Mac Le Menace",
    role: "Cadre en communication",
    text: "Grâce à SafeCheck, j'ai enfin compris pourquoi mon mot de passe « azerty123 » était une catastrophe ! J'ai suivi les tutoriels en moins d'une heure et maintenant j'utilise un gestionnaire de mots de passe. Je me sens vraiment plus en sécurité.",
  },
  {
    name: "Sophie Durand",
    role: "Enseignante retraitée",
    text: "Je n'y connaissais rien en informatique. Avec SafeCheck, j'ai appris à reconnaître les emails de phishing, à verrouiller mon téléphone et à créer de bons mots de passe. Les explications sont claires et pas du tout stressantes.",
  },
  {
    name: "Kevin Marti",
    role: "Étudiant en BTS",
    text: "Je pensais déjà bien m'y connaître, mais l'audit m'a montré que j'avais encore des failles. La double authentification n'était pas activée sur mon compte mail principal. Corrigé en 5 minutes grâce au tutoriel.",
  },
]

const steps = [
  {
    number: 1,
    title: "Je passe le questionnaire",
    description: "5 minutes pour évaluer votre niveau et identifier vos priorités.",
  },
  {
    number: 2,
    title: "Je reçois mon plan d'action",
    description: "Un score personnalisé et des recommandations concrètes adaptées à votre profil.",
  },
  {
    number: 3,
    title: "Je corrige avec des tutoriels adaptés",
    description: "Des tutoriels ciblés pour corriger chaque faille, à votre rythme.",
  },
]

export default function AccueilPage() {
  const router = useRouter()
  const { isLoggedIn, user, isHydrated } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  const prevTestimonial = () =>
    setTestimonialIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1))
  const nextTestimonial = () =>
    setTestimonialIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1))

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) router.push(`/essentiels?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[color:var(--sc-bg)]">
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-4 pt-8 md:pt-12">
            <div
              className="relative overflow-hidden rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[0_2px_6px_-2px_rgba(15,23,42,0.06),0_10px_30px_-12px_rgba(15,23,42,0.10)]"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-90"
                style={{
                  background:
                    "radial-gradient(at 0% 0%, rgba(37,99,235,0.10), transparent 50%), radial-gradient(at 100% 100%, rgba(99,102,241,0.10), transparent 50%)",
                }}
                aria-hidden
              />
              <div className="relative p-6 md:p-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
                {/* Left: copy */}
                <div className="sc-fade-in">
                  <ScBadge tone="info" className="mb-3">
                    <Sparkles className="w-3 h-3" />
                    Bienvenue sur la plateforme
                  </ScBadge>
                  <h1 className="font-display text-2xl md:text-4xl font-bold text-[color:var(--sc-text)] mb-3 text-balance leading-tight">
                    La cybersécurité,{" "}
                    <span className="sc-gradient-text">pour tous</span>, à votre rythme.
                  </h1>
                  <p className="text-sm md:text-base text-[color:var(--sc-text-2)] leading-relaxed mb-5 max-w-xl text-pretty">
                    Apprenez les bonnes pratiques sur Internet et sur votre ordinateur, à votre niveau.
                    Pour commencer, passez le petit questionnaire de qualification&nbsp;: nous adapterons
                    ensuite la plateforme à votre profil et à vos priorités.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <ScButton variant="primary" size="md" onClick={() => router.push("/audit")}>
                      Passer le questionnaire
                      <ArrowRight className="w-4 h-4" />
                    </ScButton>
                    <ScButton variant="secondary" size="md" onClick={() => router.push("/audits")}>
                      Voir tous les audits
                    </ScButton>
                  </div>
                </div>

                {/* Right: diagnostic preview card */}
                <DiagnosticCard />
              </div>
            </div>
          </div>
        </section>

        {/* PAR OÙ COMMENCER ? */}
        <section className="max-w-7xl mx-auto px-4 pt-10 pb-2">
          {/* Section header */}
          <div className="mb-6">
            <ScBadge tone="info" className="mb-2">
              <Sparkles className="w-3 h-3" />
              Par où commencer&nbsp;?
            </ScBadge>
            <h2 className="font-display text-xl md:text-2xl font-semibold text-[color:var(--sc-text)] text-balance">
              Votre parcours SafeCheck en 3 étapes
            </h2>
            <p className="mt-1.5 text-sm text-[color:var(--sc-text-2)] max-w-xl text-pretty">
              Pas besoin d'être expert. Commencez par le questionnaire&nbsp;: il suffit de 5 minutes
              pour que SafeCheck adapte tout le reste à votre profil.
            </p>
          </div>

          {/* Steps + outcome card */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
            {/* Steps strip */}
            <div
              className="relative rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[0_2px_6px_-2px_rgba(15,23,42,0.06)] overflow-hidden"
            >
              {/* Subtle top accent line */}
              <div
                className="absolute inset-x-0 top-0 h-0.5"
                style={{
                  background:
                    "linear-gradient(90deg, #3B82F6, #2563EB 40%, #6366F1 70%, #06B6D4)",
                }}
                aria-hidden
              />

              <div className="p-5 md:p-7">
                {/* Steps: horizontal on md+, stacked on mobile */}
                <div className="flex flex-col sm:flex-row gap-0">
                  {steps.map((step, i) => (
                    <div key={step.number} className="flex sm:flex-col flex-1 relative">
                      {/* Desktop: horizontal connector track drawn between step bubbles */}
                      {i < steps.length - 1 && (
                        <div
                          className="hidden sm:block absolute top-[18px] left-[calc(50%+20px)] right-[calc(-50%+20px)] h-px"
                          style={{ background: "linear-gradient(90deg, #3B82F6 0%, #6366F1 100%)" }}
                          aria-hidden
                        />
                      )}

                      {/* Mobile: vertical connector */}
                      {i < steps.length - 1 && (
                        <div
                          className="sm:hidden absolute top-[44px] left-[17px] bottom-[-12px] w-px"
                          style={{ background: "linear-gradient(180deg, #3B82F6, #6366F1)" }}
                          aria-hidden
                        />
                      )}

                      {/* Step content */}
                      <div className="flex sm:flex-col gap-3 sm:gap-0 flex-1 pb-8 sm:pb-0 sm:px-4 last:pb-0">
                        {/* Number bubble */}
                        <div className="flex items-center gap-2.5 sm:justify-center sm:mb-4 shrink-0">
                          <div
                            className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 text-white text-sm font-bold relative z-10 bg-[linear-gradient(135deg,#3B82F6,#2563EB)] shadow-[0_4px_12px_-4px_rgba(37,99,235,0.55)]"
                          >
                            {step.number}
                          </div>
                        </div>
                        <div className="sm:text-center">
                          <p className="font-display font-semibold text-sm text-[color:var(--sc-text)] mb-1 text-balance">
                            {step.title}
                          </p>
                          <p className="text-xs text-[color:var(--sc-text-muted)] leading-relaxed text-pretty">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA row */}
                <div className="mt-5 pt-5 border-t border-[color:var(--sc-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-xs text-[color:var(--sc-text-muted)]">
                    Gratuit · Sans inscription obligatoire · Résultats immédiats
                  </p>
                  <ScButton variant="primary" size="md" onClick={() => router.push("/audit")}>
                    Je commence le questionnaire
                    <ArrowRight className="w-4 h-4" />
                  </ScButton>
                </div>
              </div>
            </div>

            {/* Outcome card - highlighted result of the journey */}
            <div
              className="lg:w-64 rounded-2xl border border-[color:var(--sc-blue)]/30 bg-[#EEF4FF] shadow-[0_2px_6px_-2px_rgba(37,99,235,0.12)] p-5 flex flex-col gap-3 relative overflow-hidden"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  background:
                    "radial-gradient(at 100% 0%, rgba(99,102,241,0.15), transparent 60%)",
                }}
                aria-hidden
              />
              <div className="relative">
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-white mb-3 bg-[linear-gradient(135deg,#3B82F6,#2563EB)] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.55)]"
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <ScBadge tone="info" className="mb-2">
                  Résultat attendu
                </ScBadge>
                <h3 className="font-display font-semibold text-base text-[color:var(--sc-text)] mb-1.5">
                  Tutos personnalisés
                </h3>
                <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed text-pretty">
                  Après le questionnaire, SafeCheck sélectionne les tutoriels les plus utiles
                  pour votre profil. Du débutant au confirmé, chacun trouve son parcours.
                </p>
              </div>
              <button
                onClick={() => router.push("/tutoriels")}
                className="relative mt-auto inline-flex items-center justify-between gap-2 w-full px-3.5 py-2 rounded-lg text-xs font-semibold text-[color:var(--sc-blue)] bg-[color:var(--sc-surface)] border border-[color:var(--sc-blue)]/25 hover:bg-[color:var(--sc-blue)] hover:text-white hover:border-[color:var(--sc-blue)] transition-colors"
              >
                Voir les tutoriels
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <section className="max-w-7xl mx-auto px-4 pt-4 pb-2">
          <div className="max-w-xl mx-auto">
            <p className="text-xs font-semibold text-[color:var(--sc-text-muted)] uppercase tracking-wide mb-2 text-center">
              Vous cherchez déjà quelque chose&nbsp;?
            </p>
            <form onSubmit={onSearch} className="flex items-stretch gap-2">
              <div
                className="flex items-center gap-2 flex-1 rounded-xl px-4 py-2.5 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border-strong)] focus-within:border-[color:var(--sc-blue)] focus-within:ring-2 focus-within:ring-[color:var(--sc-blue)]/25 transition-all"
              >
                <Search className="w-4 h-4 text-[color:var(--sc-text-muted)]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un tutoriel, un essentiel, une recommandation…"
                  className="flex-1 text-sm bg-transparent outline-none text-[color:var(--sc-text)] placeholder:text-[color:var(--sc-text-muted)]"
                />
              </div>
              <ScButton variant="secondary" size="md" type="submit">
                Rechercher
              </ScButton>
            </form>
          </div>
        </section>

        {/* MODULES D'EXPLORATION */}
        <section className="max-w-7xl mx-auto px-4 pt-10 pb-12">
          {/* Section header */}
          <div className="mb-6">
            <h2 className="font-display text-lg md:text-xl font-semibold text-[color:var(--sc-text)]">
              Modules d&apos;exploration
            </h2>
            <p className="mt-1 text-sm text-[color:var(--sc-text-muted)] text-pretty">
              Une fois votre parcours lancé, explorez ces ressources à votre rythme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModuleCard
              index={0}
              icon={<BookOpen className="w-5 h-5" />}
              tone="indigo"
              badge="80 / 20"
              title="Les essentiels"
              description="Mots de passe, double authentification, mises à jour, données personnelles… Les règles fondamentales, simples à comprendre et à appliquer immédiatement."
              buttonLabel="Voir les essentiels"
              onClick={() => router.push("/essentiels")}
            />

            <ModuleCard
              index={1}
              icon={<Sliders className="w-5 h-5" />}
              tone="cyan"
              badge="Adapté à vous"
              title="Les recommandations"
              description="Windows, macOS, Android, iOS&nbsp;: des recommandations concrètes adaptées à vos appareils et à votre niveau de risque réel."
              buttonLabel="Voir les recommandations"
              onClick={() => router.push("/recommandations")}
            />

            <ModuleCard
              index={2}
              icon={<ListChecks className="w-5 h-5" />}
              tone="blue"
              badge="Diagnostic"
              title="Audits SafeCheck"
              description="Quatre niveaux d'audit pour évaluer votre sécurité numérique, suivre vos progrès dans le temps et obtenir un plan d'action priorisé."
              buttonLabel="Découvrir les audits"
              onClick={() => router.push("/audits")}
            />

            <ModuleCard
              index={3}
              icon={<Sparkles className="w-5 h-5" />}
              tone="indigo"
              badge="Simulations"
              title="Simulations & jeux"
              description="Apprenez en pratiquant grâce à des mini-scénarios, simulations de phishing et défis interactifs. Plus engageant, mieux mémorisé."
              buttonLabel="Voir les simulations"
              onClick={() => router.push("/simulations")}
            />

            <ModuleCard
              index={4}
              icon={<Trophy className="w-5 h-5" />}
              tone="cyan"
              badge="Communauté"
              title="Hall of Fame"
              description="Découvrez les profils, contributions et progrès des utilisateurs SafeCheck. Une source d'inspiration pour avancer dans votre parcours."
              buttonLabel="Voir le hall of fame"
              onClick={() => router.push("/hall-of-fame")}
            />

            <ModuleCard
              index={5}
              icon={<BookMarked className="w-5 h-5" />}
              tone="blue"
              badge="Aide"
              title="Lexique cyber"
              description="Phishing, malware, 2FA, chiffrement, fuite de données… Comprenez les mots techniques en un coup d'œil, sans jargon inutile."
              buttonLabel="Ouvrir le lexique"
              onClick={() => router.push("/lexique")}
            />
          </div>
        </section>

        {/* ACCOUNT BANNER */}
        {isHydrated && (
          <section className="max-w-7xl mx-auto px-4 pb-12">
            <div
              className="relative overflow-hidden rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center border border-[color:var(--sc-border)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(99,102,241,0.06) 60%, rgba(6,182,212,0.06) 100%)",
              }}
            >
              <div
                className="pointer-events-none absolute -right-20 -top-20 w-72 h-72 sc-halo opacity-40"
                aria-hidden
              />

              {isLoggedIn ? (
                /* Connected state */
                <>
                  <div className="relative">
                    <ScBadge tone="success" className="mb-2">
                      <ShieldCheck className="w-3 h-3" />
                      Espace personnel actif
                    </ScBadge>
                    <h2 className="font-display text-xl md:text-2xl font-semibold text-[color:var(--sc-text)] mb-2">
                      {user?.prenom ? `Bienvenue, ${user.prenom}\u00A0!` : "Bonne reprise\u00A0!"}
                    </h2>
                    <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed max-w-2xl">
                      Continuez votre progression SafeCheck - consultez votre tableau de bord,
                      reprenez là où vous en étiez ou lancez un nouveau diagnostic.
                    </p>
                  </div>
                  <div className="relative shrink-0 flex flex-col sm:flex-row gap-2">
                    <ScButton variant="primary" size="lg" onClick={() => router.push("/accueil")}>
                      Mon tableau de bord
                      <ArrowRight className="w-4 h-4" />
                    </ScButton>
                    <ScButton variant="secondary" size="md" onClick={() => router.push("/compte")}>
                      Mon profil
                    </ScButton>
                  </div>
                </>
              ) : (
                /* Logged-out state */
                <>
                  <div className="relative">
                    <h2 className="font-display text-xl md:text-2xl font-semibold text-[color:var(--sc-text)] mb-2">
                      Créez votre espace SafeCheck gratuit
                    </h2>
                    <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed max-w-2xl">
                      Gardez votre progression, débloquez des badges, sauvegardez vos tutoriels
                      préférés et accédez à votre tableau de bord personnalisé - le tout gratuitement.
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <ScButton variant="primary" size="lg" onClick={() => router.push("/compte/creer")}>
                      Créer mon espace
                      <ArrowRight className="w-4 h-4" />
                    </ScButton>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* TESTIMONIALS */}
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="text-center mb-8">
            <ScBadge tone="muted" className="mb-3">
              <Star className="w-3 h-3" />
              Nos utilisateurs témoignent
            </ScBadge>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-[color:var(--sc-text)] text-balance">
              Ce que SafeCheck change concrètement.
            </h2>
          </div>

          <div
            className="relative rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[0_2px_6px_-2px_rgba(15,23,42,0.06),0_10px_30px_-12px_rgba(15,23,42,0.08)] p-6 md:p-10"
          >
            <Quote
              className="absolute top-5 left-6 w-8 h-8 text-[color:var(--sc-blue)]/15"
              aria-hidden
            />

            <div className="flex flex-col md:flex-row items-center gap-6">
              <button
                onClick={prevTestimonial}
                className="hidden md:inline-flex p-2.5 rounded-full border border-[color:var(--sc-border-strong)] bg-[color:var(--sc-surface)] hover:border-[color:var(--sc-blue)] hover:text-[color:var(--sc-blue)] transition-colors shrink-0"
                aria-label="Témoignage précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex-1 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div
                  className="relative w-20 h-20 md:w-24 md:h-24 rounded-full shrink-0 flex items-center justify-center text-white text-3xl font-display font-bold bg-[linear-gradient(135deg,#3B82F6,#2563EB_55%,#6366F1)] shadow-[0_12px_28px_-10px_rgba(37,99,235,0.55)]"
                >
                  {testimonials[testimonialIndex].name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-base text-[color:var(--sc-text)]">
                    {testimonials[testimonialIndex].name}
                  </p>
                  <p className="text-xs text-[color:var(--sc-blue)] font-semibold mb-2">
                    {testimonials[testimonialIndex].role}
                  </p>
                  <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed italic">
                    {`«\u00A0${testimonials[testimonialIndex].text}\u00A0»`}
                  </p>
                  <div className="flex justify-center md:justify-start gap-0.5 mt-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="w-3.5 h-3.5 text-[color:var(--sc-blue)] fill-[color:var(--sc-blue)]"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={nextTestimonial}
                className="hidden md:inline-flex p-2.5 rounded-full border border-[color:var(--sc-border-strong)] bg-[color:var(--sc-surface)] hover:border-[color:var(--sc-blue)] hover:text-[color:var(--sc-blue)] transition-colors shrink-0"
                aria-label="Témoignage suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile prev/next + dots */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={prevTestimonial}
                className="md:hidden inline-flex p-2 rounded-full border border-[color:var(--sc-border-strong)] bg-[color:var(--sc-surface)]"
                aria-label="Témoignage précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex justify-center gap-2 mx-auto">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`h-2 rounded-full transition-all ${ i === testimonialIndex ? "w-6 bg-[color:var(--sc-blue)]" : "w-2 bg-[color:var(--sc-border-strong)]" }`}
                    aria-label={`Aller au témoignage ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="md:hidden inline-flex p-2 rounded-full border border-[color:var(--sc-border-strong)] bg-[color:var(--sc-surface)]"
                aria-label="Témoignage suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

/* Diagnostic preview card - hero right panel */
function DiagnosticCard() {
  const priorities = [
    { icon: <Lock className="w-3.5 h-3.5" />, label: "Mots de passe faibles", level: "Critique" },
    { icon: <Wifi className="w-3.5 h-3.5" />, label: "Réseau Wi-Fi non sécurisé", level: "Moyen" },
    { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Mises à jour manquantes", level: "Faible" },
  ]

  return (
    <div
      className="lg:w-64 shrink-0 rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[0_4px_16px_-6px_rgba(37,99,235,0.14),0_2px_6px_-2px_rgba(15,23,42,0.06)] overflow-hidden"
      aria-label="Aperçu d'un diagnostic SafeCheck"
    >
      {/* Card header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-white/90" />
          <span className="text-xs font-semibold text-white">Diagnostic SafeCheck</span>
        </div>
        <span className="text-[10px] text-white/70 font-medium">Exemple</span>
      </div>

      <div className="p-4">
        {/* Score ring */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="relative w-14 h-14 shrink-0 rounded-full flex items-center justify-center border-[3px] border-[color:var(--sc-blue)] bg-[color:var(--sc-blue)]/8"
          >
            <span className="font-display font-bold text-lg text-[color:var(--sc-blue)] leading-none">
              62
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[color:var(--sc-text)]">Score de sécurité</p>
            <p className="text-[11px] text-[color:var(--sc-text-muted)] mt-0.5">3 priorités détectées</p>
            <div className="mt-1.5 h-1.5 w-28 rounded-full bg-[color:var(--sc-border)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: "62%", background: "linear-gradient(90deg, #3B82F6, #6366F1)" }}
              />
            </div>
          </div>
        </div>

        {/* Priority list */}
        <ul className="space-y-2 mb-4">
          {priorities.map((p, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-[11px] text-[color:var(--sc-text-2)]"
            >
              <span
                className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg text-[color:var(--sc-blue)] bg-[color:var(--sc-blue)]/10"
              >
                {p.icon}
              </span>
              <span className="flex-1 leading-tight">{p.label}</span>
              <span
                className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${ p.level === "Critique" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : p.level === "Moyen" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-[color:var(--sc-border)] text-[color:var(--sc-text-muted)]" }`}
              >
                {p.level}
              </span>
            </li>
          ))}
        </ul>

        {/* Footer hint */}
        <p className="text-[10px] text-center text-[color:var(--sc-text-muted)] italic leading-snug">
          Plan d&apos;action en 5 minutes &mdash; résultats immédiats
        </p>
      </div>
    </div>
  )
}

/* Module card - lighter weight for secondary modules */
function ModuleCard({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
  index,
  tone,
  badge,
}: {
  icon: React.ReactNode
  title: string
  description: string
  buttonLabel: string
  onClick: () => void
  index: number
  tone: "blue" | "indigo" | "cyan"
  badge?: string
}) {
  const toneGradient = {
    blue: "from-[#3B82F6] to-[#2563EB] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.45)]",
    indigo: "from-[#6366F1] to-[#4F46E5] shadow-[0_8px_20px_-6px_rgba(99,102,241,0.45)]",
    cyan: "from-[#06B6D4] to-[#0891B2] shadow-[0_8px_20px_-6px_rgba(6,182,212,0.45)]",
  } as const

  return (
    <article
      className="group relative flex flex-col rounded-2xl p-5 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[0_1px_3px_-1px_rgba(15,23,42,0.05)] hover:shadow-[0_16px_32px_-12px_rgba(37,99,235,0.16),0_6px_14px_-6px_rgba(15,23,42,0.08)] hover:border-[color:var(--sc-blue)]/30 hover:-translate-y-0.5 transition-all duration-300 ease-out sc-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-white bg-gradient-to-br ${toneGradient[tone]} group-hover:scale-105 transition-transform`}
        >
          {icon}
        </div>
        {badge && <ScBadge tone="muted">{badge}</ScBadge>}
      </div>

      <h3 className="font-display font-semibold text-base text-[color:var(--sc-text)] mb-1.5">{title}</h3>
      <p
        className="text-sm text-[color:var(--sc-text-2)] leading-relaxed flex-1 text-pretty"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      <button
        onClick={onClick}
        className="mt-4 inline-flex items-center justify-between gap-2 w-full px-4 py-2 rounded-lg text-sm font-semibold text-[color:var(--sc-blue)] bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] hover:bg-[color:var(--sc-blue)] hover:text-white hover:border-[color:var(--sc-blue)] transition-colors"
      >
        {buttonLabel}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* gradient hairline on hover */}
      <span
        className="pointer-events-none absolute inset-x-6 top-0 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(37,99,235,0.5), rgba(99,102,241,0.5), transparent)",
        }}
        aria-hidden
      />
    </article>
  )
}
