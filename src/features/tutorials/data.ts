import type { LibraryCategoryDefinition, PrecisionType, TutoStatus } from "./types"

export { levels, userProgress } from "@/lib/tutoriels-data"

export const mockTutoStatus: Record<number, TutoStatus> = {
  1: "done",
  6: "done",
  3: "inprogress",
  20: "inprogress",
}

export const mockTutoLastStep: Record<number, { step: number; label: string }> = {
  3: { step: 3, label: "Installer l'application mobile" },
  20: { step: 2, label: "Sauvegarde locale automatique" },
}

export const RECOMMENDED_IDS = [1, 3, 5] as const

export const RECOMMENDED_REASONS: Record<number, string> = {
  1: "Recommande apres votre audit",
  3: "Priorite securite",
  5: "Action rapide",
}

export const POPULAR_IDS = new Set([1, 3, 6, 11, 21])

export const SEARCH_SUGGESTIONS = [
  "mot de passe",
  "phishing",
  "Wi-Fi",
  "sauvegarde",
  "telephone",
]

export const LIBRARY_CATEGORIES: LibraryCategoryDefinition[] = [
  {
    id: "comptes-mdp",
    label: "Comptes & mots de passe",
    description:
      "Securise tes connexions : double authentification, gestionnaires de mots de passe et comptes en ligne.",
    icon: "key",
    categories: ["comptes", "motsdepasse"],
  },
  {
    id: "phishing",
    label: "Phishing & arnaques",
    description:
      "Reconnais les tentatives de fraude, les faux mails et les liens piiges avant de cliquer.",
    icon: "alert",
    categories: ["phishing"],
  },
  {
    id: "donnees",
    label: "Donnees personnelles & confidentialite",
    description:
      "Maitrise ce que tu partages et limite l'exposition de tes informations privees.",
    icon: "eye",
    categories: ["donnees"],
  },
  {
    id: "reseau",
    label: "Reseau & Wi-Fi",
    description:
      "Protege ta connexion : Wi-Fi public, VPN et bonnes pratiques reseau.",
    icon: "wifi",
    categories: ["reseau"],
  },
  {
    id: "appareils",
    label: "Appareils & mises a jour",
    description:
      "Garde tes systemes a jour et correctement configures contre les failles.",
    icon: "settings",
    categories: ["os"],
  },
  {
    id: "mobile",
    label: "Mobile",
    description:
      "Securise smartphone et tablette : permissions, applications et verrouillage.",
    icon: "smartphone",
    categories: ["mobile"],
  },
  {
    id: "sauvegardes",
    label: "Sauvegardes",
    description:
      "Mets tes donnees a l'abri avec des sauvegardes fiables et automatisees.",
    icon: "save",
    categories: ["sauvegardes"],
  },
  {
    id: "navigation",
    label: "Navigation & navigateur",
    description:
      "Navigue sereinement : extensions, cookies, traqueurs et parametres du navigateur.",
    icon: "globe",
    categories: ["navigateur"],
  },
  {
    id: "avance",
    label: "Avance / technique",
    description:
      "Pour aller plus loin : configurations avancees et sujets techniques.",
    icon: "terminal",
    level: "Avance",
  },
]

export const PRECISION_LABELS: Record<PrecisionType, string> = {
  information_fausse: "Information fausse",
  information_obsolete: "Information obsolete",
  reformulation: "Reformulation necessaire",
  manque_clarte: "Manque de clarte",
  lien_casse: "Lien casse",
  etape_ne_fonctionne_plus: "Etape qui ne fonctionne plus",
  precision_utile: "Precision utile a ajouter",
}
