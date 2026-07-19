import { Activity, AlertTriangle, Briefcase, Cpu, Eye, Globe, Stethoscope, Users } from "lucide-react"

export const VULNERABILITY_FACTORS = [
  { icon: Users, label: "Âge & profil démographique" },
  { icon: Briefcase, label: "Métier & secteur d'activité" },
  { icon: Cpu, label: "OS et applications utilisées" },
  { icon: Globe, label: "Environnement de travail" },
  { icon: Activity, label: "Habitudes en ligne" },
  { icon: AlertTriangle, label: "Comportements à risque" },
]

export const VULNERABILITY_EXAMPLES = [
  {
    icon: Eye,
    title: "Profil senior",
    quote:
      "Un utilisateur de plus de 50 ans peut avoir un risque plus élevé d'être ciblé par des attaques de phishing ciblées sur des services bancaires et administratifs.",
    risk: "Phishing ciblé",
    accent: "var(--sc-info)",
  },
  {
    icon: Stethoscope,
    title: "Secteur sensible",
    quote:
      "Une personne travaillant dans un environnement sensible - médical, industriel, énergétique - peut être davantage exposée aux tentatives d'intrusion ou d'ingénierie sociale.",
    risk: "Ingénierie sociale",
    accent: "var(--sc-teal)",
  },
  {
    icon: Cpu,
    title: "Logiciels obsolètes",
    quote:
      "Un poste qui n'est pas à jour augmente significativement le risque d'être touché par une exploitation de vulnérabilité connue.",
    risk: "Exploits CVE",
    accent: "var(--sc-orange)",
  },
]
