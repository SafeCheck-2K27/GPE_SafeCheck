import type {
  ScoreRecommendation,
  ScoreRecommendationIconKey,
} from "./types"

export const scoreRecommendations: ScoreRecommendation[] = [
  {
    id: 1,
    key: "double-auth",
    category: "comptes",
    urgency: "Haute",
    impact: "Fort",
    tutorielLink: "/tutoriels/double-authentification",
    icon: "lock",
  },
  {
    id: 2,
    key: "password-manager",
    category: "comptes",
    urgency: "Haute",
    impact: "Fort",
    tutorielLink: "/tutoriels/gestionnaire-mdp",
    icon: "shield",
  },
  {
    id: 3,
    key: "backup",
    category: "sauvegardes",
    urgency: "Haute",
    impact: "Fort",
    tutorielLink: "/tutoriels/sauvegardes",
    icon: "save",
  },
  {
    id: 4,
    key: "auto-updates",
    category: "appareils",
    urgency: "Moyenne",
    impact: "Fort",
    tutorielLink: "/tutoriels/mises-a-jour",
    icon: "hard-drive",
  },
  {
    id: 5,
    key: "wifi",
    category: "reseau",
    urgency: "Moyenne",
    impact: "Moyen",
    tutorielLink: "/tutoriels/securiser-wifi",
    icon: "wifi",
  },
  {
    id: 6,
    key: "phishing",
    category: "phishing",
    urgency: "Moyenne",
    impact: "Fort",
    tutorielLink: "/tutoriels/phishing",
    icon: "alert-triangle",
  },
]

export const scoreRecommendationCopy: Record<
  ScoreRecommendation["key"],
  { fr: { title: string; desc: string }; en: { title: string; desc: string } }
> = {
  "double-auth": {
    fr: {
      title: "Activer la double authentification sur ton mail principal",
      desc: "Ton adresse email est la clé de tous tes comptes. Si elle est compromise, tous tes autres accès tombent. Ajoute une couche de protection avec une application comme Google Authenticator ou Authy.",
    },
    en: {
      title: "Enable two-factor authentication on your primary email",
      desc: "Your email is the key to every other account. If it's compromised, the rest goes down too. Add a second layer with an app like Google Authenticator or Authy.",
    },
  },
  "password-manager": {
    fr: {
      title: "Installer un gestionnaire de mots de passe",
      desc: "Utiliser le même mot de passe sur plusieurs sites est extrêmement risqué. Un gestionnaire comme Bitwarden (gratuit) ou 1Password génère et retient des mots de passe uniques pour chaque service.",
    },
    en: {
      title: "Install a password manager",
      desc: "Reusing the same password across sites is extremely risky. A manager like Bitwarden (free) or 1Password generates and remembers a unique password for every service.",
    },
  },
  backup: {
    fr: {
      title: "Mettre en place une sauvegarde automatique de tes fichiers",
      desc: "Un ransomware ou une panne peut te faire perdre toutes tes données en quelques secondes. La règle 3-2-1 : 3 copies, sur 2 supports différents, dont 1 hors site (cloud).",
    },
    en: {
      title: "Set up automatic backups for your files",
      desc: "Ransomware or a hardware failure can wipe everything in seconds. Follow the 3-2-1 rule: 3 copies, on 2 different media, with 1 stored off-site (cloud).",
    },
  },
  "auto-updates": {
    fr: {
      title: "Activer les mises à jour automatiques",
      desc: "Les mises à jour corrigent des failles de sécurité que les pirates exploitent activement. Active les mises à jour automatiques sur Windows, macOS, Android ou iOS.",
    },
    en: {
      title: "Enable automatic updates",
      desc: "Updates patch security flaws that attackers actively exploit. Turn on automatic updates on Windows, macOS, Android or iOS.",
    },
  },
  wifi: {
    fr: {
      title: "Sécuriser ton réseau Wi-Fi avec un mot de passe robuste",
      desc: "Le mot de passe par défaut de ta box est souvent imprimé sur l'appareil ou facile à deviner. Personnalise-le avec une phrase longue et unique pour éviter les intrusions.",
    },
    en: {
      title: "Secure your Wi-Fi network with a strong password",
      desc: "Your router's default password is often printed on the device or easy to guess. Replace it with a long, unique passphrase to keep intruders out.",
    },
  },
  phishing: {
    fr: {
      title: "Apprendre à identifier les emails de phishing",
      desc: "Le phishing représente 90% des cyberattaques. Apprends à vérifier l'adresse de l'expéditeur, à repérer les fautes d'orthographe et à ne jamais cliquer sur les liens suspects.",
    },
    en: {
      title: "Learn to spot phishing emails",
      desc: "Phishing accounts for 90% of cyberattacks. Check the sender address, watch for typos, and never click suspicious links.",
    },
  },
}

export const scoreRecommendationCategoryLabels: Record<
  ScoreRecommendation["category"],
  { fr: string; en: string; icon: ScoreRecommendationIconKey }
> = {
  comptes: {
    fr: "Comptes & mots de passe",
    en: "Accounts & passwords",
    icon: "lock",
  },
  appareils: {
    fr: "Appareils & mises à jour",
    en: "Devices & updates",
    icon: "hard-drive",
  },
  sauvegardes: { fr: "Sauvegardes", en: "Backups", icon: "save" },
  reseau: { fr: "Réseau Wi-Fi", en: "Wi-Fi network", icon: "wifi" },
  phishing: {
    fr: "Phishing & arnaques",
    en: "Phishing & scams",
    icon: "alert-triangle",
  },
}

export const scoreRecommendationUrgencyColors: Record<ScoreRecommendation["urgency"], string> = {
  Haute: "var(--sc-danger-deep)",
  Moyenne: "var(--sc-warn-vivid)",
  Faible: "var(--sc-success-vivid)",
}

export const scoreRecommendationImpactColors: Record<ScoreRecommendation["impact"], string> = {
  Fort: "var(--sc-blue)",
  Moyen: "var(--sc-blue-soft)",
  Faible: "var(--sc-text-muted)",
}

export const scoreRecommendationUrgencyTranslationKeys: Record<ScoreRecommendation["urgency"], string> = {
  Haute: "value.haute",
  Moyenne: "value.moyenne",
  Faible: "value.faible",
}

export const scoreRecommendationImpactTranslationKeys: Record<ScoreRecommendation["impact"], string> = {
  Fort: "value.fort",
  Moyen: "value.moyen",
  Faible: "value.faible",
}
