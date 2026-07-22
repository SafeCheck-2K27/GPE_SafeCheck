import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto'
import { promisify } from 'node:util'

/*
   SafeCheck - Hachage des mots de passe (SC-041a)

   On s'appuie sur `scrypt`, fourni nativement par Node, plutôt que sur
   une dépendance externe : scrypt est une fonction de dérivation à coût
   mémoire, recommandée pour le stockage de mots de passe, et l'éviter
   nous épargne une dépendance native (bcrypt) qui compliquerait la CI.

   Un mot de passe n'est JAMAIS stocké en clair ni chiffré de façon
   réversible : on ne conserve qu'une empreinte, accompagnée d'un sel
   aléatoire propre à chaque utilisateur pour que deux mots de passe
   identiques ne produisent pas la même empreinte.

   Format stocké, autodescriptif pour permettre de durcir les paramètres
   plus tard sans invalider les empreintes existantes :

     scrypt$N$r$p$<sel base64>$<empreinte base64>
 */

/*
   `promisify` ne conserve pas la surcharge de `scrypt` acceptant un objet
   d'options ; on retypé donc explicitement la version promisifiée.
 */
const scryptAsync = promisify(scrypt) as (
  motDePasse: string | Buffer,
  sel: string | Buffer,
  longueur: number,
  options: ScryptOptions,
) => Promise<Buffer>

/** Coût CPU/mémoire. Mémoire consommée ≈ 128 * N * r octets, soit ~32 Mo ici. */
const COUT_N = 32768
const TAILLE_BLOC_R = 8
const PARALLELISME_P = 1

/** Relevé au-dessus du défaut Node (32 Mo), sinon scrypt refuse ces paramètres. */
const MEMOIRE_MAX = 64 * 1024 * 1024

const TAILLE_SEL = 16
const TAILLE_EMPREINTE = 64

/** Calcule l'empreinte d'un mot de passe, avec un sel aléatoire. */
export async function hacherMotDePasse(motDePasse: string): Promise<string> {
  const sel = randomBytes(TAILLE_SEL)
  const empreinte = await scryptAsync(motDePasse.normalize('NFKC'), sel, TAILLE_EMPREINTE, {
    N: COUT_N,
    r: TAILLE_BLOC_R,
    p: PARALLELISME_P,
    maxmem: MEMOIRE_MAX,
  })

  return [
    'scrypt',
    COUT_N,
    TAILLE_BLOC_R,
    PARALLELISME_P,
    sel.toString('base64'),
    empreinte.toString('base64'),
  ].join('$')
}

/**
 * Vérifie un mot de passe contre une empreinte stockée.
 * Retourne `false` plutôt que de lever une exception si l'empreinte est
 * illisible : une donnée corrompue en base ne doit pas laisser passer une
 * authentification, ni faire tomber la route.
 */
export async function verifierMotDePasse(
  motDePasse: string,
  empreinteStockee: string,
): Promise<boolean> {
  const parties = empreinteStockee.split('$')
  if (parties.length !== 6 || parties[0] !== 'scrypt') return false

  const N = Number(parties[1])
  const r = Number(parties[2])
  const p = Number(parties[3])
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false

  let sel: Buffer
  let empreinteAttendue: Buffer
  try {
    sel = Buffer.from(parties[4], 'base64')
    empreinteAttendue = Buffer.from(parties[5], 'base64')
  } catch {
    return false
  }

  /*
     Le décodage base64 de Node est permissif : il ignore ce qui suit le
     remplissage. On exige donc la forme canonique, pour qu'une valeur
     altérée en base soit rejetée au lieu d'être silencieusement tolérée.
   */
  if (
    sel.toString('base64') !== parties[4] ||
    empreinteAttendue.toString('base64') !== parties[5]
  ) {
    return false
  }
  /*
     La longueur attendue est imposée, jamais déduite de la donnée stockée.
     Sinon une empreinte tronquée serait acceptée : la sortie courte de
     scrypt est un préfixe de la sortie longue, donc dériver une clé de la
     longueur trouvée en base ferait correspondre un fragment d'empreinte.
   */
  if (sel.length === 0 || empreinteAttendue.length !== TAILLE_EMPREINTE) return false

  let empreinteCalculee: Buffer
  try {
    empreinteCalculee = await scryptAsync(motDePasse.normalize('NFKC'), sel, TAILLE_EMPREINTE, {
      N,
      r,
      p,
      maxmem: MEMOIRE_MAX,
    })
  } catch {
    return false
  }

  /*
     Comparaison à temps constant : une comparaison classique s'arrête au
     premier octet différent et laisserait fuiter, par la durée, le nombre
     d'octets corrects.
   */
  if (empreinteCalculee.length !== empreinteAttendue.length) return false
  return timingSafeEqual(empreinteCalculee, empreinteAttendue)
}

/*
   Empreinte factice utilisée quand l'email fourni n'existe pas : on
   effectue quand même un calcul scrypt pour que la réponse mette le même
   temps que pour un compte existant. Sans cela, la différence de durée
   permettrait d'énumérer les adresses inscrites.
 */
let empreinteFactice: string | null = null

export async function consommerTempsDeVerification(motDePasse: string): Promise<void> {
  if (!empreinteFactice) {
    empreinteFactice = await hacherMotDePasse('mot-de-passe-factice-safecheck')
  }
  await verifierMotDePasse(motDePasse, empreinteFactice)
}
