import { Crown, Microscope, ShieldCheck, Zap } from "lucide-react"
import type { AuditLevel } from "./types"

export const AUDIT_LEVELS: AuditLevel[] = [
  {
    id: "qualification",
    level: "Niveau 1",
    title: "Audit de qualification rapide",
    duration: "Moins de 10 minutes",
    durationShort: "≈ 10 min",
    goal:
      "Qualifier votre profil en quelques minutes et déterminer votre niveau (néophyte, intermédiaire ou avancé) pour vous orienter vers les bons contenus.",
    outputs: [
      "Premier score de sécurité",
      "Profil utilisateur",
      "Recommandations initiales",
      "Onboarding personnalisé",
    ],
    audience: "Recommandé à toutes les nouvelles personnes inscrites.",
    status: "available",
    href: "/audit",
    icon: Zap,
    accent: "var(--sc-blue)",
  },
  {
    id: "standard",
    level: "Niveau 2",
    title: "Audit standard",
    duration: "30 à 45 minutes",
    durationShort: "30-45 min",
    goal:
      "Produire un véritable score de sécurité en couvrant plusieurs dimensions : système, réseau, mots de passe, sauvegardes, confidentialité, usages et habitudes.",
    outputs: [
      "Score de sécurité détaillé",
      "Recommandations priorisées",
      "Plan d'action sur 30 jours",
      "Projection d'amélioration",
    ],
    audience: "Pour les utilisateurs qui veulent un vrai diagnostic.",
    status: "coming",
    href: "/wip?feature=audit-standard",
    icon: ShieldCheck,
    accent: "var(--sc-info)",
  },
  {
    id: "complet",
    level: "Niveau 3",
    title: "Audit complet",
    duration: "1h30 à 2h",
    durationShort: "1h30-2h",
    goal:
      "Diagnostic large par domaine : OS, réseau, données, confidentialité, architecture personnelle et hygiène numérique. Adapté aux usages plus avancés ou semi-pro.",
    outputs: [
      "Diagnostic par domaine",
      "Cartographie des risques",
      "Plan de remédiation détaillé",
      "Suivi sur 90 jours",
    ],
    audience: "Pour utilisateurs impliqués ou usages semi-professionnels.",
    status: "coming",
    href: "/wip?feature=audit-complet",
    icon: Microscope,
    accent: "var(--sc-teal)",
  },
  {
    id: "expert",
    level: "Niveau 4",
    title: "Audit expert",
    duration: "4 à 5 heures",
    durationShort: "4-5h",
    goal:
      "Audit extrêmement détaillé, potentiellement avec manipulations sur machine, accompagnement et restitution personnalisée. Réservé aux utilisateurs très engagés.",
    outputs: [
      "Audit guidé et accompagné",
      "Manipulations sur machine",
      "Rapport personnalisé",
      "Session de restitution",
    ],
    audience: "Pour profils expérimentés ou exigences fortes.",
    status: "premium",
    href: "/wip?feature=audit-expert",
    icon: Crown,
    accent: "var(--sc-orange)",
  },
]
