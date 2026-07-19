export type VulnerabilityIconKey =
  | "activity"
  | "alert-triangle"
  | "briefcase"
  | "cpu"
  | "eye"
  | "globe"
  | "stethoscope"
  | "users"

export const VULNERABILITY_FACTORS = [
  { icon: "users", label: "Âge & profil démographique" },
  { icon: "briefcase", label: "Métier & secteur d'activité" },
  { icon: "cpu", label: "OS et applications utilisées" },
  { icon: "globe", label: "Environnement de travail" },
  { icon: "activity", label: "Habitudes en ligne" },
  { icon: "alert-triangle", label: "Comportements à risque" },
] satisfies Array<{ icon: VulnerabilityIconKey; label: string }>

export const VULNERABILITY_EXAMPLES = [
  {
    icon: "eye",
    title: "Profil senior",
    quote:
      "Un utilisateur de plus de 50 ans peut avoir un risque plus élevé d'être ciblé par des attaques de phishing ciblées sur des services bancaires et administratifs.",
    risk: "Phishing ciblé",
    accent: "var(--sc-info)",
  },
  {
    icon: "stethoscope",
    title: "Secteur sensible",
    quote:
      "Une personne travaillant dans un environnement sensible - médical, industriel, énergétique - peut être davantage exposée aux tentatives d'intrusion ou d'ingénierie sociale.",
    risk: "Ingénierie sociale",
    accent: "var(--sc-teal)",
  },
  {
    icon: "cpu",
    title: "Logiciels obsolètes",
    quote:
      "Un poste qui n'est pas à jour augmente significativement le risque d'être touché par une exploitation de vulnérabilité connue.",
    risk: "Exploits CVE",
    accent: "var(--sc-orange)",
  },
] satisfies Array<{
  icon: VulnerabilityIconKey
  title: string
  quote: string
  risk: string
  accent: string
}>
