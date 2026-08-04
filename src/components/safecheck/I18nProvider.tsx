"use client"

import * as React from "react"

/**
 * I18nProvider - minimal, dependency-free i18n for SafeCheck.
 *
 * - Two languages only: "fr" (default) and "en".
 * - Persists the choice in localStorage so it survives navigation/reloads.
 * - Syncs across tabs via the `storage` event.
 * - Sets <html lang="…"> so screen readers and search engines stay in sync.
 *
 * Strings are looked up by dot-path key (e.g. `"nav.connexion"`).
 * Missing keys fall back to French, then to the raw key, so we can
 * progressively translate pages without breaking the UI.
 */

export type Lang = "fr" | "en"

const STORAGE_KEY = "safecheck:lang"

type Dict = Record<string, string>

const fr: Dict = {
  // Navbar - top level
  "nav.audits": "Audits",
  "nav.tutoriels": "Tutoriels",
  "nav.essentiels": "Les essentiels",
  "nav.recommandations": "Recommandations",
  "nav.decouvrir": "Découvrir",
  "nav.voirTousAudits": "Voir tous les audits",
  // Right-side actions
  "nav.connexion": "Connexion",
  "nav.creerCompte": "Créer un compte",
  "nav.monProfil": "Mon profil",
  "nav.deconnexion": "Déconnexion",
  "nav.menu": "Menu",
  // Theme / language toggles (a11y labels)
  "nav.themeLight": "Passer en mode clair",
  "nav.themeDark": "Passer en mode sombre",
  "nav.changeTheme": "Changer le thème",
  "nav.switchToEn": "Switch to English",
  "nav.switchToFr": "Passer en français",
  "nav.langLabel": "Langue de l'interface",

  // Login modal
  "login.title": "Connexion",
  "login.subtitle": "Heureux de vous retrouver sur SafeCheck.",
  "login.email": "Adresse email",
  "login.emailPh": "exemple@mail.com",
  "login.password": "Mot de passe",
  "login.show": "Afficher le mot de passe",
  "login.hide": "Masquer le mot de passe",
  "login.submit": "Se connecter",
  "login.submitting": "Connexion…",
  "login.noAccount": "Pas encore de compte ?",
  "login.createOne": "Créer un compte",
  "login.cancel": "Annuler",
  "login.errorEmpty": "Renseigne ton email et ton mot de passe.",
  "login.errorGeneric": "Connexion impossible. Réessaie.",

  // Auth providers (mock OAuth)
  "auth.googleConnect": "Continuer avec Google",
  "auth.googleSignup": "S'inscrire avec Google",
  "auth.or": "ou",

  // Sign-up modal (used when a logged-out user tries to open a tutorial,
  // save progress, etc.)
  "signup.title": "Créer un compte",
  "signup.subtitle": "Sauvegarde ton profil et tes tutoriels en quelques secondes.",
  "signup.savePerk": "Avec un compte, tes tutoriels recommandés et ta progression sont sauvegardés sur tous tes appareils.",
  "signup.pseudo": "Pseudo",
  "signup.pseudoPh": "TheAliasMan",
  "signup.passwordPh": "8 caractères minimum",
  "signup.submit": "Créer mon compte",
  "signup.submitting": "Création…",
  "signup.haveAccount": "Déjà un compte ?",
  "signup.signInInstead": "Se connecter",
  "signup.errorMissing": "Renseigne ton email et un mot de passe d'au moins 8 caractères.",
  "signup.errorGeneric": "Création impossible. Réessaie.",
  "signup.reasonTutorial": "Crée un compte pour ouvrir ce tutoriel et le sauvegarder dans ton parcours.",

  // Resultats page
  "res.yourLevel": "Ton niveau actuel :",
  "res.outOf": "/100",
  "res.badge": "Badge {n} obtenu",
  "res.strong": "Points forts",
  "res.weak": "Points à améliorer",
  "res.priorityRecos": "Tes recommandations prioritaires",
  "res.priority": "Priorité {n} : {title}",
  "res.urgency": "Urgence : {value}",
  "res.impact": "Impact : {value}",
  "res.viewTuto": "Voir le tutoriel",
  "res.exploreTutos": "Explorer les tutoriels",
  "res.restart": "Recommencer l'audit",
  "res.loading": "Chargement des résultats…",

  // Urgency / impact values
  "value.haute": "Haute",
  "value.moyenne": "Moyenne",
  "value.faible": "Faible",
  "value.fort": "Fort",
  "value.moyen": "Moyen",

  // Levels
  "level.sentinelle": "Sentinelle Numérique",
  "level.gardien": "Gardien Averti",
  "level.scarabee": "Petit Scarabée",
  "level.novice": "Novice Connecté",
  "level.sentinelle.desc":
    "Impressionnant ! Tu appliques déjà la plupart des bonnes pratiques de cybersécurité. Quelques ajustements supplémentaires te permettront d'atteindre un niveau expert.",
  "level.gardien.desc":
    "Ta sécurité numérique est correcte, mais plusieurs habitudes importantes peuvent être améliorées. Les priorités sont la double authentification, la gestion des mots de passe et les sauvegardes.",
  "level.scarabee.desc":
    "Il te manque beaucoup d'acquis pour te promener sans risque sur internet. À la première arnaque, tu risques de tomber dans un piège et de ne plus pouvoir en ressortir. Mais pas de panique, on est là pour t'aider.",
  "level.novice.desc":
    "Tu fais tes premiers pas dans le monde numérique. C'est parfaitement normal ! Commence par les essentiels de SafeCheck pour construire des fondations solides étape par étape.",

  // Strong points
  "res.strong.high.1": "Bonne compréhension des bases de la cybersécurité",
  "res.strong.high.2": "Utilisation régulière d'internet",
  "res.strong.high.3": "Conscience des risques de phishing",
  "res.strong.low.1": "Tu as conscience qu'il faut des mots de passe",
  "res.strong.low.2": "Tu utilises un appareil numérique",
  "res.strong.low.3": "Tu es prêt(e) à apprendre !",

  // Weak points
  "res.weak.passwords": "Gestion des mots de passe à renforcer",
  "res.weak.2fa": "Double authentification non activée partout",
  "res.weak.updates": "Mises à jour irrégulières",
  "res.weak.backup": "Pas de sauvegarde en place",
  "res.weak.wifi": "Réseau Wi-Fi potentiellement non sécurisé",
}

const en: Dict = {
  // Navbar - top level
  "nav.audits": "Audits",
  "nav.tutoriels": "Tutorials",
  "nav.essentiels": "Essentials",
  "nav.recommandations": "Recommendations",
  "nav.decouvrir": "Discover",
  "nav.voirTousAudits": "View all audits",
  // Right-side actions
  "nav.connexion": "Sign in",
  "nav.creerCompte": "Create account",
  "nav.monProfil": "My profile",
  "nav.deconnexion": "Sign out",
  "nav.menu": "Menu",
  "nav.themeLight": "Switch to light mode",
  "nav.themeDark": "Switch to dark mode",
  "nav.changeTheme": "Change theme",
  "nav.switchToEn": "Switch to English",
  "nav.switchToFr": "Switch to French",
  "nav.langLabel": "Interface language",

  // Login modal
  "login.title": "Sign in",
  "login.subtitle": "Welcome back to SafeCheck.",
  "login.email": "Email address",
  "login.emailPh": "you@example.com",
  "login.password": "Password",
  "login.show": "Show password",
  "login.hide": "Hide password",
  "login.submit": "Sign in",
  "login.submitting": "Signing in…",
  "login.noAccount": "No account yet?",
  "login.createOne": "Create one",
  "login.cancel": "Cancel",
  "login.errorEmpty": "Please enter your email and password.",
  "login.errorGeneric": "Sign-in failed. Please try again.",

  // Auth providers (mock OAuth)
  "auth.googleConnect": "Continue with Google",
  "auth.googleSignup": "Sign up with Google",
  "auth.or": "or",

  // Sign-up modal
  "signup.title": "Create an account",
  "signup.subtitle": "Save your profile and tutorials in seconds.",
  "signup.savePerk": "With an account, your recommended tutorials and progress are saved across every device.",
  "signup.pseudo": "Username",
  "signup.pseudoPh": "TheAliasMan",
  "signup.passwordPh": "8 characters minimum",
  "signup.submit": "Create my account",
  "signup.submitting": "Creating…",
  "signup.haveAccount": "Already have an account?",
  "signup.signInInstead": "Sign in",
  "signup.errorMissing": "Please enter your email and a password of at least 8 characters.",
  "signup.errorGeneric": "Sign-up failed. Please try again.",
  "signup.reasonTutorial": "Create an account to open this tutorial and save it to your learning path.",

  // Resultats page
  "res.yourLevel": "Your current level:",
  "res.outOf": "/100",
  "res.badge": "Badge {n} earned",
  "res.strong": "Strengths",
  "res.weak": "Areas to improve",
  "res.priorityRecos": "Your top recommendations",
  "res.priority": "Priority {n}: {title}",
  "res.urgency": "Urgency: {value}",
  "res.impact": "Impact: {value}",
  "res.viewTuto": "View tutorial",
  "res.exploreTutos": "Browse tutorials",
  "res.restart": "Retake the audit",
  "res.loading": "Loading results…",

  "value.haute": "High",
  "value.moyenne": "Medium",
  "value.faible": "Low",
  "value.fort": "High",
  "value.moyen": "Medium",

  "level.sentinelle": "Digital Sentinel",
  "level.gardien": "Aware Guardian",
  "level.scarabee": "Little Beetle",
  "level.novice": "Connected Novice",
  "level.sentinelle.desc":
    "Impressive! You already follow most cybersecurity best practices. A few extra adjustments will get you to expert level.",
  "level.gardien.desc":
    "Your digital security is decent, but several important habits could be improved. Focus on two-factor authentication, password management and backups.",
  "level.scarabee.desc":
    "You're missing key fundamentals to safely roam the web. The first scam could trap you for good. Don't worry - we're here to help.",
  "level.novice.desc":
    "You're taking your first steps in the digital world - that's perfectly fine! Start with SafeCheck's essentials to build solid foundations step by step.",

  "res.strong.high.1": "Solid understanding of cybersecurity basics",
  "res.strong.high.2": "Regular internet use",
  "res.strong.high.3": "Aware of phishing risks",
  "res.strong.low.1": "You know passwords matter",
  "res.strong.low.2": "You use a digital device",
  "res.strong.low.3": "You're ready to learn!",

  "res.weak.passwords": "Password management needs strengthening",
  "res.weak.2fa": "Two-factor authentication isn't enabled everywhere",
  "res.weak.updates": "Software updates are irregular",
  "res.weak.backup": "No backup in place",
  "res.weak.wifi": "Wi-Fi network may not be secured",
}

const dictionaries: Record<Lang, Dict> = { fr, en }

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggle: () => void
  t: (key: string, params?: Record<string, string | number>) => string
  isHydrated: boolean
}

const I18nContext = React.createContext<I18nContextValue | null>(null)

function format(template: string, params?: Record<string, string | number>) {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    Object.prototype.hasOwnProperty.call(params, k) ? String(params[k]) : `{${k}}`,
  )
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("fr")
  const [isHydrated, setIsHydrated] = React.useState(false)

  // Load saved preference once on mount.
  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved === "fr" || saved === "en") setLangState(saved)
    } catch {
      /* ignore - localStorage may be unavailable */
    }
    setIsHydrated(true)
  }, [])

  // Keep <html lang> in sync for a11y / SEO.
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang
    }
  }, [lang])

  // Cross-tab sync.
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      if (e.newValue === "fr" || e.newValue === "en") setLangState(e.newValue)
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const setLang = React.useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const toggle = React.useCallback(() => {
    setLang(lang === "fr" ? "en" : "fr")
  }, [lang, setLang])

  const t = React.useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const dict = dictionaries[lang]
      const raw = dict[key] ?? dictionaries.fr[key] ?? key
      return format(raw, params)
    },
    [lang],
  )

  const value = React.useMemo<I18nContextValue>(
    () => ({ lang, setLang, toggle, t, isHydrated }),
    [lang, setLang, toggle, t, isHydrated],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext)
  if (!ctx) {
    // Permissive fallback: if a component renders outside the provider
    // (e.g. story/test), don't crash - return a French passthrough.
    return {
      lang: "fr",
      setLang: () => {},
      toggle: () => {},
      t: (key: string, params?: Record<string, string | number>) =>
        format(fr[key] ?? key, params),
      isHydrated: false,
    }
  }
  return ctx
}
