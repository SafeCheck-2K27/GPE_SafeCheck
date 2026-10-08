import type {
  HomeExplorationModule,
  HomeJourneyStep,
} from "./types"

export const homeJourneySteps: HomeJourneyStep[] = [
  {
    number: 1,
    title: "Je passe le questionnaire",
    description: "5 minutes pour évaluer votre niveau et identifier vos priorités.",
  },
  {
    number: 2,
    title: "Je consulte mes résultats",
    description: "Un score calculé depuis vos réponses et des recommandations selon sa tranche.",
  },
  {
    number: 3,
    title: "Je corrige avec des tutoriels adaptés",
    description: "Des tutoriels ciblés pour corriger chaque faille, à votre rythme.",
  },
]

export const homeExplorationModules: HomeExplorationModule[] = [
  {
    icon: "book-open",
    tone: "indigo",
    badge: "80 / 20",
    title: "Les essentiels",
    description:
      "Mots de passe, double authentification, mises à jour, données personnelles… Les règles fondamentales, simples à comprendre et à appliquer immédiatement.",
    buttonLabel: "Voir les essentiels",
    href: "/essentiels",
  },
  {
    icon: "sliders",
    tone: "cyan",
    badge: "Conseils pratiques",
    title: "Les recommandations",
    description:
      "Windows, macOS, Android, iOS : un catalogue éditorial de conseils à explorer par appareil et par niveau.",
    buttonLabel: "Voir les recommandations",
    href: "/recommandations",
  },
  {
    icon: "list-checks",
    tone: "blue",
    badge: "Diagnostic",
    title: "Audits SafeCheck",
    description:
      "Passez l'audit de qualification et retrouvez vos résultats dans votre compte. Les autres niveaux d'audit sont à venir.",
    buttonLabel: "Découvrir les audits",
    href: "/audits",
  },
  {
    icon: "sparkles",
    tone: "indigo",
    badge: "Simulations",
    title: "Simulations & jeux",
    description:
      "Les mini-scénarios, simulations de phishing et défis interactifs sont prévus pour une prochaine version.",
    buttonLabel: "Voir les simulations à venir",
    href: "/simulations",
  },
  {
    icon: "trophy",
    tone: "cyan",
    badge: "Démonstration",
    title: "Hall of Fame",
    description:
      "Découvrez la maquette des profils de contribution. Les noms et contributions présentés sont fictifs.",
    buttonLabel: "Voir la démonstration",
    href: "/hall-of-fame",
  },
  {
    icon: "book-marked",
    tone: "blue",
    badge: "Aide",
    title: "Lexique cyber",
    description:
      "Phishing, malware, 2FA, chiffrement, fuite de données… Comprenez les mots techniques en un coup d'œil, sans jargon inutile.",
    buttonLabel: "Ouvrir le lexique",
    href: "/lexique",
  },
]
