import type {
  HomeExplorationModule,
  HomeJourneyStep,
  HomeTestimonial,
} from "./types"

export const homeTestimonials: HomeTestimonial[] = [
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

export const homeJourneySteps: HomeJourneyStep[] = [
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
    badge: "Adapté à vous",
    title: "Les recommandations",
    description:
      "Windows, macOS, Android, iOS&nbsp;: des recommandations concrètes adaptées à vos appareils et à votre niveau de risque réel.",
    buttonLabel: "Voir les recommandations",
    href: "/recommandations",
  },
  {
    icon: "list-checks",
    tone: "blue",
    badge: "Diagnostic",
    title: "Audits SafeCheck",
    description:
      "Quatre niveaux d'audit pour évaluer votre sécurité numérique, suivre vos progrès dans le temps et obtenir un plan d'action priorisé.",
    buttonLabel: "Découvrir les audits",
    href: "/audits",
  },
  {
    icon: "sparkles",
    tone: "indigo",
    badge: "Simulations",
    title: "Simulations & jeux",
    description:
      "Apprenez en pratiquant grâce à des mini-scénarios, simulations de phishing et défis interactifs. Plus engageant, mieux mémorisé.",
    buttonLabel: "Voir les simulations",
    href: "/simulations",
  },
  {
    icon: "trophy",
    tone: "cyan",
    badge: "Communauté",
    title: "Hall of Fame",
    description:
      "Découvrez les profils, contributions et progrès des utilisateurs SafeCheck. Une source d'inspiration pour avancer dans votre parcours.",
    buttonLabel: "Voir le hall of fame",
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
