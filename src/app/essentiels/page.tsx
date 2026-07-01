"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import { ScButton, ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
import {
  Search,
  X,
  Lock,
  Shield,
  Wifi,
  Save,
  HardDrive,
  Eye,
  Smartphone,
  Mail,
  Cloud,
  Key,
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  BookOpen,
  Cog,
  Heart,
  Sliders,
} from "lucide-react"

interface Essentiel {
  id: number
  title: string
  description: string
  importance: "Critique" | "Important" | "Recommandé"
  category: "motsdepasse" | "donnees" | "phishing" | "appareils" | "wifi" | "habitudes"
  type: "Guide" | "Réglage" | "Notion" | "Habitude"
  difficulty: "Facile" | "Moyen" | "Avancé"
  os: ("Windows" | "macOS" | "Mobile" | "Tous")[]
  popularity: number // 0-100
  details: string
  icon: React.ComponentType<{ className?: string }>
}

const ESSENTIELS: Essentiel[] = [
  {
    id: 1,
    title: "Utiliser un gestionnaire de mots de passe",
    description: "Un gestionnaire génère et stocke des mots de passe uniques pour chaque site. Fini les post-its.",
    importance: "Critique",
    category: "motsdepasse",
    type: "Guide",
    difficulty: "Facile",
    os: ["Tous"],
    popularity: 92,
    details:
      "Bitwarden (gratuit, open source) ou 1Password permettent de stocker tous vos mots de passe chiffrés. Vous ne retenez plus qu'un seul mot de passe maître. Plus jamais de réutilisation risquée.",
    icon: Key,
  },
  {
    id: 2,
    title: "Activer la double authentification (2FA)",
    description: "Même si votre mot de passe est volé, la 2FA bloque l'accès à votre compte.",
    importance: "Critique",
    category: "motsdepasse",
    type: "Réglage",
    difficulty: "Facile",
    os: ["Tous"],
    popularity: 88,
    details:
      "Activez la 2FA sur vos comptes mail, banque, réseaux sociaux. Préférez une application (Aegis, Authy, Google Authenticator) plutôt que les SMS, beaucoup moins sécurisés (SIM swapping).",
    icon: Shield,
  },
  {
    id: 3,
    title: "Mettre à jour ses appareils régulièrement",
    description: "Les mises à jour ferment les portes ouvertes que les pirates exploitent.",
    importance: "Critique",
    category: "appareils",
    type: "Réglage",
    difficulty: "Facile",
    os: ["Windows", "macOS", "Mobile"],
    popularity: 85,
    details:
      "Activez les mises à jour automatiques sur Windows, macOS, Android et iOS. Mettez aussi à jour vos navigateurs et extensions. Un appareil non mis à jour est une porte ouverte.",
    icon: HardDrive,
  },
  {
    id: 4,
    title: "Sauvegarder ses données (règle 3-2-1)",
    description: "Une assurance vie numérique en cas de panne, vol ou ransomware.",
    importance: "Critique",
    category: "donnees",
    type: "Habitude",
    difficulty: "Moyen",
    os: ["Tous"],
    popularity: 78,
    details:
      "3 copies de vos données, sur 2 supports différents (disque externe + cloud), dont 1 hors site. OneDrive, Google Drive, iCloud sont de bonnes options. Pour les puristes : un NAS ou Backblaze.",
    icon: Save,
  },
  {
    id: 5,
    title: "Repérer les emails de phishing",
    description: "Le phishing est l'arnaque numéro 1. Apprenez à reconnaître les signaux.",
    importance: "Critique",
    category: "phishing",
    type: "Notion",
    difficulty: "Facile",
    os: ["Tous"],
    popularity: 95,
    details:
      "Vérifiez l'expéditeur (le vrai, pas seulement le nom affiché), survolez les liens pour voir l'URL réelle, méfiez-vous des urgences artificielles (« compte suspendu », « facture impayée »), ne donnez jamais vos identifiants par mail.",
    icon: Mail,
  },
  {
    id: 6,
    title: "Sécuriser son Wi-Fi à la maison",
    description: "WPA3 ou WPA2-AES, mot de passe fort, nom de réseau neutre.",
    importance: "Important",
    category: "wifi",
    type: "Réglage",
    difficulty: "Moyen",
    os: ["Tous"],
    popularity: 72,
    details:
      "Connectez-vous à l'admin de votre box. Activez WPA3 si dispo (sinon WPA2-AES). Changez le mot de passe Wi-Fi par défaut. Désactivez WPS. Renommez le SSID sans mentionner votre nom ou votre opérateur.",
    icon: Wifi,
  },
  {
    id: 7,
    title: "Verrouiller automatiquement son écran",
    description: "Configurez un verrouillage rapide pour bloquer les regards indiscrets.",
    importance: "Important",
    category: "appareils",
    type: "Réglage",
    difficulty: "Facile",
    os: ["Windows", "macOS", "Mobile"],
    popularity: 68,
    details:
      "Réglez le verrouillage automatique entre 1 et 5 minutes. Sur Windows : Win+L. Sur macOS : Ctrl+Cmd+Q. Sur mobile : verrouillage par biométrie ou code de 6 chiffres minimum.",
    icon: Lock,
  },
  {
    id: 8,
    title: "Maîtriser ses paramètres de confidentialité",
    description: "Les réseaux sociaux, navigateurs et OS partagent par défaut beaucoup trop.",
    importance: "Important",
    category: "donnees",
    type: "Réglage",
    difficulty: "Moyen",
    os: ["Tous"],
    popularity: 64,
    details:
      "Faites le tour des paramètres confidentialité de Facebook, Instagram, TikTok, X, votre navigateur et votre OS. Désactivez le suivi publicitaire, limitez la visibilité de vos publications, révoquez les apps inutiles.",
    icon: Eye,
  },
  {
    id: 9,
    title: "Protéger son téléphone mobile",
    description: "Le smartphone est devenu la cible principale. Verrouillage, sources, autorisations.",
    importance: "Important",
    category: "appareils",
    type: "Guide",
    difficulty: "Facile",
    os: ["Mobile"],
    popularity: 81,
    details:
      "Verrouillage biométrique + code 6 chiffres. N'installez que depuis le store officiel. Vérifiez les autorisations des apps (micro, position, contacts). Activez le chiffrement et la localisation à distance.",
    icon: Smartphone,
  },
  {
    id: 10,
    title: "Choisir un mot de passe maître robuste",
    description: "La phrase de passe : longue, mémorable, difficile à deviner.",
    importance: "Critique",
    category: "motsdepasse",
    type: "Notion",
    difficulty: "Facile",
    os: ["Tous"],
    popularity: 90,
    details:
      "Préférez une phrase de passe (4-6 mots aléatoires) à un mot de passe court avec des symboles. Exemple : « cheval-banane-tortue-vélo ». Ne réutilisez jamais ce mot de passe ailleurs.",
    icon: Key,
  },
  {
    id: 11,
    title: "Utiliser un cloud chiffré",
    description: "Vos fichiers sont-ils accessibles à votre fournisseur ?",
    importance: "Recommandé",
    category: "donnees",
    type: "Guide",
    difficulty: "Moyen",
    os: ["Tous"],
    popularity: 55,
    details:
      "Pour des données sensibles, préférez un cloud chiffré de bout en bout : Proton Drive, Tresorit, Cryptomator par-dessus un cloud classique. Vos fichiers ne peuvent être lus que par vous.",
    icon: Cloud,
  },
  {
    id: 12,
    title: "Identifier les arnaques par téléphone",
    description: "Le « faux conseiller bancaire » et le SMS de livraison restent très courants.",
    importance: "Important",
    category: "phishing",
    type: "Notion",
    difficulty: "Facile",
    os: ["Tous"],
    popularity: 76,
    details:
      "Ne donnez jamais vos codes de carte ou identifiants par téléphone. Si on vous appelle de votre banque, raccrochez et rappelez le numéro officiel. Méfiez-vous des SMS « colis bloqué » avec un lien.",
    icon: Mail,
  },
]

const FILTERS = {
  priority: [
    { id: "all", label: "Toutes" },
    { id: "Critique", label: "Priorité absolue" },
    { id: "Important", label: "Important" },
    { id: "Recommandé", label: "Recommandé" },
  ],
  os: [
    { id: "all", label: "Tous OS" },
    { id: "Windows", label: "Windows" },
    { id: "macOS", label: "macOS" },
    { id: "Mobile", label: "Mobile" },
  ],
  difficulty: [
    { id: "all", label: "Toute difficulté" },
    { id: "Facile", label: "Facile" },
    { id: "Moyen", label: "Moyen" },
    { id: "Avancé", label: "Avancé" },
  ],
  type: [
    { id: "all", label: "Tout type" },
    { id: "Guide", label: "Guides" },
    { id: "Réglage", label: "Réglages" },
    { id: "Habitude", label: "Habitudes" },
    { id: "Notion", label: "Notions" },
  ],
}

const CATEGORIES_LABEL: Record<string, string> = {
  all: "Toutes les catégories",
  motsdepasse: "Mots de passe",
  donnees: "Données personnelles",
  phishing: "Phishing & arnaques",
  appareils: "Appareils",
  wifi: "Wi-Fi & réseaux",
}

function EssentielsContent() {
  const router = useRouter()
  const params = useSearchParams()

  const [search, setSearch] = useState("")
  const [priority, setPriority] = useState("all")
  const [os, setOs] = useState("all")
  const [difficulty, setDifficulty] = useState("all")
  const [type, setType] = useState("all")
  const [sortBy, setSortBy] = useState<"popularity" | "priority">("priority")
  const [category, setCategory] = useState(params.get("cat") ?? "all")
  const [selected, setSelected] = useState<Essentiel | null>(null)

  const filtered = useMemo(() => {
    let list = [...ESSENTIELS]
    if (search) {
      const s = search.toLowerCase()
      list = list.filter((e) => e.title.toLowerCase().includes(s) || e.description.toLowerCase().includes(s))
    }
    if (priority !== "all") list = list.filter((e) => e.importance === priority)
    if (os !== "all") list = list.filter((e) => e.os.includes(os as never) || e.os.includes("Tous"))
    if (difficulty !== "all") list = list.filter((e) => e.difficulty === difficulty)
    if (type !== "all") list = list.filter((e) => e.type === type)
    if (category !== "all") list = list.filter((e) => e.category === category)

    if (sortBy === "popularity") {
      list.sort((a, b) => b.popularity - a.popularity)
    } else {
      const order = { Critique: 0, Important: 1, Recommandé: 2 } as const
      list.sort((a, b) => order[a.importance] - order[b.importance])
    }
    return list
  }, [search, priority, os, difficulty, type, category, sortBy])

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] font-sans">
      <Navbar onSignupClick={() => router.push("/compte/creer")} />

      <main className="flex-1">
        {/* Hero / 80-20 intro - V2 premium, mesh + halo */}
        <section className="relative overflow-hidden border-b border-[color:var(--sc-border)] sc-mesh-soft">
          <div className="pointer-events-none absolute inset-0 sc-dot-texture opacity-50" aria-hidden />
          <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <ScBadge tone="info" className="mb-4">
                <Sparkles className="w-3 h-3" /> Loi du 80/20
              </ScBadge>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-[color:var(--sc-text)] mb-4 text-balance leading-[1.08]">
                Les essentiels&nbsp;: 20% des efforts,{" "}
                <span className="sc-gradient-text">80% de la sécurité</span>.
              </h1>
              <p className="text-base text-[color:var(--sc-text-2)] leading-relaxed max-w-2xl text-pretty">
                Cette section regroupe les actions, guides, réflexes et paramètres les plus rentables. Pas seulement
                des tutos techniques&nbsp;: vous y trouverez aussi des notions clés, des habitudes à adopter et des
                réglages à activer pour une protection à fort impact.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-7">
                <KpiPill icon={<BookOpen className="w-4 h-4" />} label="Guides" />
                <KpiPill icon={<Cog className="w-4 h-4" />} label="Réglages" />
                <KpiPill icon={<Heart className="w-4 h-4" />} label="Habitudes" />
                <KpiPill icon={<Target className="w-4 h-4" />} label="Notions" />
              </div>
            </div>

            {/* 80% medallion - gradient ring + halo */}
            <div className="relative hidden md:flex items-center justify-center w-52 h-52">
              <div className="absolute inset-0 sc-halo opacity-70 sc-pulse-soft" aria-hidden />
              <div
                className="relative w-44 h-44 rounded-full flex items-center justify-center
                  bg-[color:var(--sc-surface)]
                  shadow-[0_22px_50px_-18px_rgba(37,99,235,0.45),inset_0_1px_0_rgba(255,255,255,0.8)]"
                style={{
                  background:
                    "conic-gradient(from 220deg, #2563EB 0deg, #6366F1 90deg, #06B6D4 180deg, transparent 220deg, transparent 360deg)",
                }}
                aria-hidden
              >
                <div className="w-[154px] h-[154px] rounded-full bg-[color:var(--sc-surface)] flex items-center justify-center
                  border border-[color:var(--sc-border)] shadow-inner">
                  <div className="text-center">
                    <div className="font-display text-5xl font-bold sc-gradient-text leading-none">80%</div>
                    <div className="text-[11px] text-[color:var(--sc-text-muted)] mt-1.5 px-3 leading-tight">
                      de la sécurité atteinte
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search + filters */}
        <section className="border-b border-[color:var(--sc-border)] bg-[color:var(--sc-surface-2)]">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[color:var(--sc-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un essentiel…"
                  className="sc-input w-full pl-9 pr-3 py-2.5 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[color:var(--sc-blue)]" />
                <span className="text-sm font-semibold text-[color:var(--sc-text)]">Trier par</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as never)}
                  className="sc-input px-3 py-2 text-sm"
                >
                  <option value="priority">Priorité absolue</option>
                  <option value="popularity">Popularité</option>
                </select>
              </div>
            </div>

            {/* Filter chips */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <FilterRow label="Priorité" value={priority} setValue={setPriority} options={FILTERS.priority} />
              <FilterRow label="OS" value={os} setValue={setOs} options={FILTERS.os} />
              <FilterRow label="Difficulté" value={difficulty} setValue={setDifficulty} options={FILTERS.difficulty} />
              <FilterRow label="Type" value={type} setValue={setType} options={FILTERS.type} />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mt-5">
              {Object.entries(CATEGORIES_LABEL).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setCategory(k)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all
                    ${
                      category === k
                        ? "text-white border border-transparent bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] shadow-[0_4px_12px_-3px_rgba(37,99,235,0.40)]"
                        : "bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] border border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)]"
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Cards grid */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[#000]/60">
              <p className="text-sm">Aucun essentiel ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((e, i) => (
                <EssentielCard key={e.id} e={e} delay={i * 40} onClick={() => setSelected(e)} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      {selected && <EssentielDetail e={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

export default function EssentielsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
          <div className="w-8 h-8 border-2 border-[#157FE2] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EssentielsContent />
    </Suspense>
  )
}

function KpiPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
      bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)]
      text-xs font-semibold text-[color:var(--sc-text)]
      shadow-[var(--sc-shadow-sm)]">
      <span className="text-[color:var(--sc-blue)]">{icon}</span>
      {label}
    </span>
  )
}

function FilterRow({
  label,
  value,
  setValue,
  options,
}: {
  label: string
  value: string
  setValue: (v: string) => void
  options: { id: string; label: string }[]
}) {
  return (
    <div>
      <span className="block text-xs font-semibold text-[color:var(--sc-text-muted)] mb-1.5 uppercase tracking-wider">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="sc-input w-full px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function EssentielCard({ e, delay, onClick }: { e: Essentiel; delay: number; onClick: () => void }) {
  const Icon = e.icon
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl p-5 bg-[#FFFFFF] flex flex-col gap-3 sc-fade-in transition-all hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms`, border: "1px solid #B3DBEF", boxShadow: "3px 3px 0px #C0DDF8" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-[#C3E8FF] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#157FE2]" />
        </div>
        <ScBadge tone={e.importance === "Critique" ? "warn" : e.importance === "Important" ? "info" : "muted"}>
          {e.importance}
        </ScBadge>
        <ScBadge tone="muted">{e.type}</ScBadge>
      </div>
      <h3 className="font-bold text-base text-[#000]">{e.title}</h3>
      <p className="text-sm text-[#000]/75 leading-relaxed flex-1">{e.description}</p>
      <div className="flex items-center justify-between text-xs text-[#000]/60 pt-2 border-t border-[#AEAEAE]/30">
        <span className="inline-flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {e.popularity}% utile
        </span>
        <span className="inline-flex items-center gap-1 text-[#157FE2] font-semibold">
          Lire <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </button>
  )
}

function EssentielDetail({ e, onClose }: { e: Essentiel; onClose: () => void }) {
  const Icon = e.icon
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-xl bg-[#FFFFFF] sc-fade-in max-h-[90vh] overflow-y-auto"
        style={{ border: "1px solid #B3DBEF", boxShadow: "5px 5px 0px #C0DDF8" }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#C3E8FF] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#157FE2]" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#000]">{e.title}</h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <ScBadge tone={e.importance === "Critique" ? "warn" : "info"}>{e.importance}</ScBadge>
                  <ScBadge tone="muted">{e.type}</ScBadge>
                  <ScBadge tone="muted">{e.difficulty}</ScBadge>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-[#F6F6F6] rounded" aria-label="Fermer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-[#000]/85 leading-relaxed mb-3">{e.description}</p>
          <p className="text-sm text-[#000]/75 leading-relaxed">{e.details}</p>
          <div className="mt-6 flex justify-end">
            <ScButton variant="primary" onClick={onClose}>Compris</ScButton>
          </div>
        </div>
      </div>
    </div>
  )
}
