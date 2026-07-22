/*
   SafeCheck - Validation des identifiants à l'inscription (SC-041a)

   La longueur minimale retenue est de 12 caractères, en cohérence avec ce
   que le produit conseille lui-même dans l'audit et les tutoriels : un
   service qui recommande 12 caractères ne peut pas en accepter 6.

   Un maximum est également imposé : le hachage a un coût mémoire et CPU
   volontairement élevé, une entrée illimitée offrirait un levier de déni
   de service.
 */

export const LONGUEUR_MDP_MIN = 12
export const LONGUEUR_MDP_MAX = 128
export const LONGUEUR_EMAIL_MAX = 254

/*
   Validation volontairement simple : un point unique, pas d'espace, et un
   domaine plausible. Vouloir valider finement une adresse par expression
   régulière est un piège classique — seul un envoi de mail prouve qu'une
   adresse existe (confirmation prévue hors périmètre de ce ticket).
 */
const MOTIF_EMAIL = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/

export interface ResultatValidation {
  valide: boolean
  /** Message destiné à l'utilisateur, en français. */
  erreur?: string
}

/** Normalise une adresse : espaces retirés et casse uniformisée. */
export function normaliserEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function validerEmail(email: unknown): ResultatValidation {
  if (typeof email !== 'string' || email.trim().length === 0) {
    return { valide: false, erreur: "L'adresse email est obligatoire." }
  }

  const normalise = normaliserEmail(email)

  if (normalise.length > LONGUEUR_EMAIL_MAX) {
    return { valide: false, erreur: "L'adresse email est trop longue." }
  }
  if (!MOTIF_EMAIL.test(normalise)) {
    return { valide: false, erreur: "Le format de l'adresse email n'est pas valide." }
  }
  return { valide: true }
}

export function validerMotDePasse(motDePasse: unknown): ResultatValidation {
  if (typeof motDePasse !== 'string' || motDePasse.length === 0) {
    return { valide: false, erreur: 'Le mot de passe est obligatoire.' }
  }
  if (motDePasse.length < LONGUEUR_MDP_MIN) {
    return {
      valide: false,
      erreur: `Le mot de passe doit contenir au moins ${LONGUEUR_MDP_MIN} caractères.`,
    }
  }
  if (motDePasse.length > LONGUEUR_MDP_MAX) {
    return {
      valide: false,
      erreur: `Le mot de passe ne peut pas dépasser ${LONGUEUR_MDP_MAX} caractères.`,
    }
  }
  if (motDePasse.trim().length === 0) {
    return { valide: false, erreur: 'Le mot de passe ne peut pas être composé uniquement d\'espaces.' }
  }
  return { valide: true }
}

/** Nom d'affichage : facultatif, mais borné s'il est fourni. */
export function validerNom(nom: unknown): ResultatValidation {
  if (nom === undefined || nom === null || nom === '') return { valide: true }
  if (typeof nom !== 'string') {
    return { valide: false, erreur: 'Le nom est invalide.' }
  }
  if (nom.trim().length > 80) {
    return { valide: false, erreur: 'Le nom ne peut pas dépasser 80 caractères.' }
  }
  return { valide: true }
}
