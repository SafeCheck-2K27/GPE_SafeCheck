const FEATURE_LABELS: Record<string, { title: string; subtitle: string }> = {
  "audit-standard": {
    title: "Audit standard de sécurité",
    subtitle: "Un audit complet de 30 à 45 minutes couvrant système, réseau, mots de passe, sauvegardes et habitudes.",
  },
  "audit-complet": {
    title: "Audit complet",
    subtitle: "Diagnostic large par domaine : OS, réseau, données, confidentialité, hygiène numérique.",
  },
  "audit-expert": {
    title: "Audit expert",
    subtitle: "Audit approfondi de 4 à 5 heures avec manipulations détaillées, pour les utilisateurs très engagés.",
  },
  simulations: {
    title: "Simulations, CTF & jeux",
    subtitle: "Espace ludique pour mettre en pratique vos réflexes : phishing simulé, mini-CTF, défis interactifs.",
  },
  "culture-cyber": {
    title: "Culture cyber",
    subtitle: "Articles, débunks et actualités pour comprendre les menaces et les enjeux du numérique.",
  },
  "test-vulnerabilite": {
    title: "Test de vulnérabilité",
    subtitle: "Estimation personnalisée de votre exposition aux principales menaces, basée sur des rapports officiels.",
  },
  "qui-sommes-nous": {
    title: "Qui sommes-nous ?",
    subtitle: "La présentation de l'équipe et de la mission SafeCheck arrive très vite.",
  },
  "patch-notes": {
    title: "Notes de mise à jour",
    subtitle: "L'historique détaillé des évolutions de la plateforme sera bientôt disponible ici.",
  },
  legal: {
    title: "Pages légales",
    subtitle: "Mentions légales, CGU, politique de cookies et accessibilité - pages en cours de rédaction.",
  },
}

const DEFAULT_FEATURE = {
  title: "Fonctionnalité en cours de construction",
  subtitle: "Cette section arrive bientôt. Notre équipe y travaille activement.",
}

export function getWipFeature(feature: string) {
  return FEATURE_LABELS[feature] ?? DEFAULT_FEATURE
}
