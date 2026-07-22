import { consommerTempsDeVerification, verifierMotDePasse } from '@/lib/auth/password'
import { normaliserEmail, validerEmail } from '@/lib/auth/validation'
import { prisma } from '@/lib/prisma'

/*
   SafeCheck - Connexion par email et mot de passe (SC-041a)

   POST /api/auth/connexion
   Corps attendu : { email, password }

   Deux précautions volontaires contre l'énumération de comptes :

   1. Le message d'erreur est le même que l'adresse soit inconnue ou que
      le mot de passe soit faux. Distinguer les deux cas révélerait quelles
      adresses sont inscrites.
   2. Quand l'adresse n'existe pas, on effectue tout de même un calcul de
      hachage. Sans cela, une réponse nettement plus rapide trahirait
      l'absence du compte.

   Aucune session n'est ouverte ici : l'émission de jeton relève de
   SC-041b (GPE-79), traité séparément. Cette route se limite à valider
   des identifiants.
 */

interface CorpsConnexion {
  email?: unknown
  password?: unknown
}

const MESSAGE_IDENTIFIANTS_INVALIDES = 'Email ou mot de passe incorrect.'

function reponseErreur(message: string, statut: number) {
  return Response.json({ erreur: message }, { status: statut })
}

export async function POST(request: Request) {
  let corps: CorpsConnexion
  try {
    corps = await request.json()
  } catch {
    return reponseErreur('Le corps de la requête doit être un JSON valide.', 400)
  }

  const emailValide = validerEmail(corps.email)
  const motDePasse = typeof corps.password === 'string' ? corps.password : ''

  /*
     Un email mal formé ou un mot de passe manquant reçoit le même message
     générique qu'un identifiant erroné : signaler « email invalide » sur
     une route de connexion aide surtout un attaquant à cadrer ses essais.
   */
  if (!emailValide.valide || motDePasse === '') {
    await consommerTempsDeVerification(motDePasse)
    return reponseErreur(MESSAGE_IDENTIFIANTS_INVALIDES, 401)
  }

  const email = normaliserEmail(corps.email as string)

  try {
    const utilisateur = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    })

    if (!utilisateur) {
      await consommerTempsDeVerification(motDePasse)
      return reponseErreur(MESSAGE_IDENTIFIANTS_INVALIDES, 401)
    }

    const motDePasseCorrect = await verifierMotDePasse(motDePasse, utilisateur.passwordHash)
    if (!motDePasseCorrect) {
      return reponseErreur(MESSAGE_IDENTIFIANTS_INVALIDES, 401)
    }

    /* L'empreinte est retirée avant toute réponse. */
    return Response.json({
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        name: utilisateur.name,
      },
    })
  } catch (erreur) {
    console.error('Échec de la connexion', erreur)
    return reponseErreur('La connexion a échoué. Réessaie dans un instant.', 500)
  }
}
