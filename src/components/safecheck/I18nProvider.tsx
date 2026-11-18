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

type Lang = "fr" | "en"

const STORAGE_KEY = "safecheck:lang"

type Dict = Record<string, string>

const fr: Dict = {
  "session.title": "Vérification de la session",
  "session.failed": "Ta session n’a pas pu être vérifiée. Réessaie pour accéder à ton compte et à tes données.",
  "session.retry": "Réessayer la vérification",
  "session.verify": "Vérifier ma session",
  "session.retrying": "Vérification de la session…",
  "claim.title": "Rattachement des audits invités",
  "claim.failed": "Tu es connecté, mais tes audits invités n’ont pas pu être rattachés à ton compte. Réessaie pour les retrouver dans ton historique.",
  "claim.pending": "Rattachement de tes audits invités en cours…",
  "claim.retry": "Réessayer le rattachement",
  "claim.retrying": "Rattachement en cours…",
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
  "login.errorCredentials": "Email ou mot de passe incorrect.",
  "login.errorNetwork": "Connexion au serveur impossible. Réessaie.",
  "login.errorGeneric": "Connexion impossible. Réessaie.",

  // Sign-up modal (used when a logged-out user tries to open a tutorial,
  // save progress, etc.)
  "signup.title": "Créer un compte",
  "signup.subtitle": "Crée un compte pour rattacher tes audits à ton identité.",
  "signup.savePerk": "Ton audit invité sera rattaché à ton compte après inscription.",
  "signup.pseudo": "Pseudo",
  "signup.pseudoPh": "TheAliasMan",
  "signup.passwordPh": "8 caractères minimum",
  "signup.submit": "Créer mon compte",
  "signup.submitting": "Création…",
  "signup.haveAccount": "Déjà un compte ?",
  "signup.signInInstead": "Se connecter",
  "signup.errorMissing": "Renseigne un pseudo, ton email et un mot de passe d'au moins 8 caractères.",
  "signup.errorNetwork": "Connexion au serveur impossible. Réessaie.",
  "signup.errorGeneric": "Création impossible. Réessaie.",
  "signup.reasonTutorial": "Crée un compte pour ouvrir ce tutoriel et rattacher ton audit.",

  // Resultats page
  "res.yourLevel": "Ton niveau actuel :",
  "res.outOf": "/100",
  "res.badge": "Badge {n} obtenu",
  "res.strong": "Points forts",
  "res.weak": "Points à améliorer",
  "res.priorityRecos": "Pistes d’action selon ton score",
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
    "Ton score se situe entre 80 et 100/100 dans la grille de cet audit.",
  "level.gardien.desc":
    "Ton score se situe entre 60 et 79/100 dans la grille de cet audit.",
  "level.scarabee.desc":
    "Ton score se situe entre 35 et 59/100 dans la grille de cet audit.",
  "level.novice.desc":
    "Ton score se situe entre 0 et 34/100 dans la grille de cet audit.",

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
  "session.title": "Session verification",
  "session.failed": "Your session could not be verified. Retry to access your account and your data.",
  "session.retry": "Retry session verification",
  "session.verify": "Verify my session",
  "session.retrying": "Verifying your session…",
  "claim.title": "Guest audit recovery",
  "claim.failed": "You are signed in, but your guest audits could not be added to your account. Retry to find them in your history.",
  "claim.pending": "Adding your guest audits to your account…",
  "claim.retry": "Retry adding guest audits",
  "claim.retrying": "Adding audits…",
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
  "login.errorCredentials": "Incorrect email or password.",
  "login.errorNetwork": "Cannot reach the server. Please try again.",
  "login.errorGeneric": "Sign-in failed. Please try again.",

  // Sign-up modal
  "signup.title": "Create an account",
  "signup.subtitle": "Create an account to link your audits to your identity.",
  "signup.savePerk": "Your guest audit will be linked to your account after sign-up.",
  "signup.pseudo": "Username",
  "signup.pseudoPh": "TheAliasMan",
  "signup.passwordPh": "8 characters minimum",
  "signup.submit": "Create my account",
  "signup.submitting": "Creating…",
  "signup.haveAccount": "Already have an account?",
  "signup.signInInstead": "Sign in",
  "signup.errorMissing": "Enter a username, email and password of at least 8 characters.",
  "signup.errorNetwork": "Cannot reach the server. Please try again.",
  "signup.errorGeneric": "Sign-up failed. Please try again.",
  "signup.reasonTutorial": "Create an account to open this tutorial and link your audit.",

  // Resultats page
  "res.yourLevel": "Your current level:",
  "res.outOf": "/100",
  "res.badge": "Badge {n} earned",
  "res.strong": "Strengths",
  "res.weak": "Areas to improve",
  "res.priorityRecos": "Suggested actions based on your score",
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
    "Your score falls between 80 and 100/100 on this audit's scale.",
  "level.gardien.desc":
    "Your score falls between 60 and 79/100 on this audit's scale.",
  "level.scarabee.desc":
    "Your score falls between 35 and 59/100 on this audit's scale.",
  "level.novice.desc":
    "Your score falls between 0 and 34/100 on this audit's scale.",

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

type LangSnapshot = Lang | null | undefined

const langListeners = new Set<() => void>()
let memoryLang: Lang | null = null

function getLangSnapshot(): LangSnapshot {
  if (typeof window === "undefined") return undefined
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === "fr" || saved === "en" ? saved : null
  } catch {
    return memoryLang
  }
}

function getServerLangSnapshot(): LangSnapshot {
  return undefined
}

function subscribeToLang(listener: () => void) {
  langListeners.add(listener)

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener()
  }
  window.addEventListener("storage", onStorage)

  return () => {
    langListeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

function persistLang(next: Lang) {
  memoryLang = next
  try {
    window.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* ignore - localStorage may be unavailable */
  }
  langListeners.forEach((listener) => listener())
}

function format(template: string, params?: Record<string, string | number>) {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    Object.prototype.hasOwnProperty.call(params, k) ? String(params[k]) : `{${k}}`,
  )
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const snapshot = React.useSyncExternalStore(
    subscribeToLang,
    getLangSnapshot,
    getServerLangSnapshot,
  )
  const lang = snapshot ?? "fr"
  const isHydrated = snapshot !== undefined

  // Keep <html lang> in sync for a11y / SEO.
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang
    }
  }, [lang])

  const setLang = React.useCallback((next: Lang) => {
    persistLang(next)
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
