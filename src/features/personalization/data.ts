import type {
  PersonalizationAnswers,
  PersonalizationOption,
} from "./types"

export const INITIAL_PERSONALIZATION_ANSWERS: PersonalizationAnswers = {
  motivations: [],
  detailLevel: null,
  devices: [],
  techLevel: 0,
  topics: [],
  discovery: null,
}

export const MOTIVATION_OPTIONS: PersonalizationOption[] = [
  { value: "point", label: "Faire un point sur ma sécurité personnelle" },
  { value: "reflexes", label: "Apprendre les bons réflexes" },
  { value: "probleme", label: "Corriger un problème précis" },
  { value: "proche", label: "Protéger un proche" },
  { value: "outils", label: "Découvrir des outils utiles" },
  { value: "tester", label: "Me tester" },
  { value: "progresser", label: "Progresser au fil du temps" },
  { value: "curiosite", label: "Utiliser SafeCheck par curiosité" },
]

export const DETAIL_LEVEL_OPTIONS: PersonalizationOption[] = [
  { value: "tres-simple", label: "Très simple, rapide, sans technique" },
  { value: "simple", label: "Simple, avec quelques explications" },
  { value: "accessible", label: "Accessible mais concret" },
  { value: "approfondi", label: "Approfondi et détaillé" },
  { value: "technique", label: "Très technique, niveau avancé" },
]

export const DEVICE_OPTIONS: PersonalizationOption[] = [
  { value: "ordinateur", label: "Ordinateur", icon: "monitor" },
  { value: "smartphone", label: "Smartphone", icon: "smartphone" },
  { value: "les-deux", label: "Les deux", icon: "sliders" },
  { value: "sais-pas", label: "Je ne sais pas encore", icon: "help" },
]

export const TOPIC_OPTIONS: PersonalizationOption[] = [
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

export const DISCOVERY_OPTIONS: PersonalizationOption[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "google", label: "Recherche Google" },
  { value: "bouche", label: "Bouche à oreille" },
  { value: "ecole", label: "École / formation" },
  { value: "discord", label: "Discord / communauté" },
  { value: "pub", label: "Publicité" },
  { value: "autre", label: "Autre" },
  { value: "pref-pas", label: "Je préfère ne pas répondre" },
]

export const TECH_LABELS: Record<number, string> = {
  1: "Peu à l'aise",
  2: "Je me débrouille un peu",
  3: "Niveau normal",
  4: "Plutôt à l'aise",
  5: "Très à l'aise",
}
