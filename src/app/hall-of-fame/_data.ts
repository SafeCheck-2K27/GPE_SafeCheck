export interface Contributor {
  name: string
  role: string
  bio: string
  contribution: string[]
  github?: string
  linkedin?: string
  initials: string
  accent: string
}

export const CONTRIBUTORS: Contributor[] = [
  {
    name: "Élise Marchand",
    role: "Pentester · Conseil cybersécurité",
    bio: "Auteure des fiches mots de passe et 2FA, relectrice technique des essentiels.",
    contribution: ["Tutos", "Relecture", "Expertise"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    initials: "EM",
    accent: "var(--sc-blue)",
  },
  {
    name: "Karim Benali",
    role: "DevSecOps · Open source",
    bio: "Contributeur sur les recommandations OS et navigateurs, mainteneur de la base de connaissances.",
    contribution: ["Recommandations", "OSS"],
    github: "https://github.com",
    initials: "KB",
    accent: "var(--sc-teal)",
  },
  {
    name: "Maëlle Tournier",
    role: "Designer produit",
    bio: "Direction artistique de la maquette, charte graphique SafeCheck et système de composants.",
    contribution: ["Design", "UX"],
    linkedin: "https://linkedin.com",
    initials: "MT",
    accent: "var(--sc-orange)",
  },
  {
    name: "Lucas Petit",
    role: "Lead pédagogie",
    bio: "Conception du parcours d'audit de qualification et des progressions par niveau (Petit Scarabée à Sentinelle).",
    contribution: ["Pédagogie", "Audit"],
    linkedin: "https://linkedin.com",
    initials: "LP",
    accent: "var(--sc-violet)",
  },
  {
    name: "Sofia Reyes",
    role: "Journaliste tech",
    bio: "Rédige la section Culture cyber et les débunks d'arnaques courantes en s'appuyant sur des sources publiques.",
    contribution: ["Culture cyber", "Débunk"],
    github: "https://github.com",
    initials: "SR",
    accent: "var(--sc-info)",
  },
  {
    name: "Thomas Lavigne",
    role: "Mécène & soutien",
    bio: "A financé l'illustration mascotte et le développement du module d'audit standard.",
    contribution: ["Don financier"],
    initials: "TL",
    accent: "var(--sc-warn-strong)",
  },
  {
    name: "Jin-Wo Park",
    role: "Chercheur & analyste",
    bio: "Expertise sur le test de vulnérabilité et les corrélations entre profils utilisateurs et menaces.",
    contribution: ["Recherche", "Idées"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    initials: "JP",
    accent: "var(--sc-danger-deep)",
  },
  {
    name: "Amina Diallo",
    role: "Formatrice cybersécurité",
    bio: "A relu et structuré les essentiels destinés aux publics non techniques.",
    contribution: ["Pédagogie", "Relecture"],
    linkedin: "https://linkedin.com",
    initials: "AD",
    accent: "var(--sc-teal)",
  },
]
