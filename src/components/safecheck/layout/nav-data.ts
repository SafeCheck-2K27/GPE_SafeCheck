import type React from "react"
import { BookText, Gamepad2, BookOpen, ShieldAlert, Trophy } from "lucide-react"

/* Navigation data for the SafeCheck top navbar. Pure data so it can be reused
   by both the desktop dropdowns and the mobile menu, and later be driven by an
   API/config without touching the layout components. */

export interface DropdownItem {
  label: string
  href: string
  desc?: string
  icon?: React.ComponentType<{ className?: string }>
}

export const auditLinks: DropdownItem[] = [
  { label: "Audit de qualification rapide", href: "/audits", desc: "Disponible · 10 min" },
  { label: "Audit standard", href: "/wip?feature=audit-standard", desc: "Bientôt · 30-45 min" },
  { label: "Audit complet", href: "/wip?feature=audit-complet", desc: "Bientôt · 1h30-2h" },
  { label: "Audit expert", href: "/wip?feature=audit-expert", desc: "Long terme · 4-5h" },
  { label: "Tester ma vulnérabilité", href: "/vulnerabilite", desc: "Intro pédagogique" },
]

export const tutorielsLinks: DropdownItem[] = [
  { label: "Mes tutoriels personnalisés", href: "/tutoriels" },
  { label: "Tous les tutoriels", href: "/tutoriels?vue=tous" },
  { label: "Niveau débutant", href: "/tutoriels?niveau=debutant" },
  { label: "Niveau intermédiaire", href: "/tutoriels?niveau=intermediaire" },
  { label: "Niveau avancé", href: "/tutoriels?niveau=avance" },
]

export const essentielLinks: DropdownItem[] = [
  { label: "Vue d'ensemble", href: "/essentiels" },
  { label: "Mots de passe", href: "/essentiels?cat=motsdepasse" },
  { label: "Données personnelles", href: "/essentiels?cat=donnees" },
  { label: "Phishing & arnaques", href: "/essentiels?cat=phishing" },
  { label: "Sécurité des appareils", href: "/essentiels?cat=appareils" },
  { label: "Wi-Fi & réseaux", href: "/essentiels?cat=wifi" },
]

export const recommandationLinks: DropdownItem[] = [
  { label: "Vue d'ensemble", href: "/recommandations" },
  { label: "Bonnes habitudes & réflexes", href: "/recommandations?type=habitudes" },
  { label: "Recommandations techniques", href: "/recommandations?type=techniques" },
  { label: "Système d'exploitation", href: "/recommandations?cat=os" },
  { label: "Hardware", href: "/recommandations?cat=hardware" },
  { label: "Logiciels", href: "/recommandations?cat=logiciels" },
  { label: "Navigateur web", href: "/recommandations?cat=navigateur" },
]

export const decouvrirLinks: DropdownItem[] = [
  { label: "Lexique cyber", href: "/lexique", icon: BookText },
  { label: "Simulations / CTF / Jeux", href: "/simulations", icon: Gamepad2 },
  { label: "Culture cyber", href: "/culture-cyber", icon: BookOpen },
  { label: "Tester ma vulnérabilité", href: "/vulnerabilite", icon: ShieldAlert },
  { label: "Hall of Fame", href: "/hall-of-fame", icon: Trophy },
]
