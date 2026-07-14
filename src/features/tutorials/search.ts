import { CATEGORY_LABEL } from "@/lib/tutoriels-data"
import type { Category, Tutoriel } from "@/lib/tutoriels-data"
import type { TutorialFilters } from "./types"
import { matchesTutorialFilters } from "./filters"

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

export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function expandQuery(raw: string): string[] {
  const query = normalizeSearch(raw)
  if (!query) return []

  const tokens = query.split(" ").filter((token) => token.length >= 2)
  const terms = new Set<string>([query])

  for (const token of tokens) {
    terms.add(token)
    for (const group of SYNONYM_GROUPS) {
      const normalizedGroup = group.map(normalizeSearch)
      const matches = normalizedGroup.some(
        (term) =>
          term === token ||
          term.split(" ").includes(token) ||
          (token.length >= 4 &&
            (term.includes(token) || token.includes(term))),
      )
      if (matches) normalizedGroup.forEach((term) => terms.add(term))
    }
  }

  return [...terms].filter(Boolean)
}

function searchScore(tutorial: Tutoriel, raw: string): number {
  const terms = expandQuery(raw)
  if (terms.length === 0) return 0

  const title = normalizeSearch(tutorial.title)
  const body = normalizeSearch(
    [
      tutorial.description,
      CATEGORY_LABEL[tutorial.category],
      tutorial.tags.join(" "),
      tutorial.level,
      (CATEGORY_KEYWORDS[tutorial.category] || []).join(" "),
    ].join(" "),
  )

  let score = 0
  for (const term of terms) {
    if (!term) continue
    const multiWord = term.includes(" ")
    if (title.includes(term)) score += multiWord ? 14 : 7
    else if (body.includes(term)) score += multiWord ? 4 : 2
  }
  return score
}

export function searchTutorials(
  tutorials: Tutoriel[],
  query: string,
  filters: TutorialFilters,
): Tutoriel[] {
  const scored = tutorials
    .filter((tutorial) => matchesTutorialFilters(tutorial, filters))
    .map((tutorial) => ({
      tutorial,
      score: searchScore(tutorial, query),
    }))
    .filter(({ score }) => score > 0)

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score

    const aBoost =
      (a.tutorial.isEssential ? 2 : 0) +
      (a.tutorial.isRecommended ? 1 : 0)
    const bBoost =
      (b.tutorial.isEssential ? 2 : 0) +
      (b.tutorial.isRecommended ? 1 : 0)
    return bBoost - aBoost
  })

  return scored.map(({ tutorial }) => tutorial)
}
