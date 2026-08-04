import type React from "react"
import { KeyRound, Smartphone, Wifi, Mail } from "lucide-react"

/*
   SafeCheck account - mock data for the demo mockup.
   No real backend yet: this is the seam where a future API /
   Prisma layer (users, audit sessions, tutorial progress, …)
   will plug in. Keep the shapes stable so the UI doesn't change.
 */

export type AuditStatus = "termine" | "en-cours" | "disponible"
export type TutoStatus = "termine" | "en-cours"

export const mockUser = {
  pseudo: "TheAliasMan",
  nom: "Smithe",
  prenom: "Alaan",
  email: "asmithe@gmail.com",
  age: "35 ans",
  profession: "réalisateur",
  langue: "Français",
  pays: "France",
  motDePasse: "••••••••",
  niveau: "Petit Scarabée",
  score: 62,
  badges: [
    { id: 1, label: "Premier audit", desc: "Premier audit complété" },
    { id: 2, label: "Mot de passe", desc: "Mot de passe fort créé" },
    { id: 3, label: "Tuto réalisé", desc: "Tutoriel terminé" },
  ],
}

export const mockAudits: {
  id: string
  nom: string
  type: string
  date: string
  status: AuditStatus
  score?: number
  duree: string
}[] = [
  { id: "a1", nom: "Audit de qualification rapide", type: "Quick", date: "12 mars 2026", status: "termine", score: 62, duree: "10 min" },
  { id: "a2", nom: "Audit standard", type: "Standard", date: "-", status: "en-cours", duree: "30-45 min" },
  { id: "a3", nom: "Audit complet", type: "Complet", date: "-", status: "disponible", duree: "1h30-2h" },
  { id: "a4", nom: "Audit expert", type: "Expert", date: "-", status: "disponible", duree: "4-5h" },
]

export const mockTutos: {
  id: string
  nom: string
  categorie: string
  date: string
  status: TutoStatus
  duree: string
  difficulte: "Débutant" | "Intermédiaire" | "Avancé"
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "t1", nom: "Créer un mot de passe fort", categorie: "Mots de passe", date: "14 mars 2026", status: "termine", duree: "8 min", difficulte: "Débutant", icon: KeyRound },
  { id: "t2", nom: "Activer la double authentification", categorie: "2FA", date: "14 mars 2026", status: "termine", duree: "12 min", difficulte: "Débutant", icon: Smartphone },
  { id: "t3", nom: "Sécuriser son réseau Wi-Fi", categorie: "Réseaux", date: "-", status: "en-cours", duree: "15 min", difficulte: "Intermédiaire", icon: Wifi },
  { id: "t4", nom: "Repérer un email de phishing", categorie: "Phishing", date: "13 mars 2026", status: "termine", duree: "10 min", difficulte: "Débutant", icon: Mail },
]

export const mockGuides: { id: string; titre: string; categorie: string; date: string }[] = [
  { id: "g1", titre: "Les fondamentaux de la cybersécurité", categorie: "Essentiels", date: "10 mars 2026" },
  { id: "g2", titre: "Reconnaître les arnaques courantes", categorie: "Phishing", date: "11 mars 2026" },
  { id: "g3", titre: "Protéger ses données personnelles", categorie: "Données", date: "13 mars 2026" },
]
