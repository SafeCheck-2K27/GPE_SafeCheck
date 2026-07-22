import { hacherMotDePasse } from '@/lib/auth/password'
import {
  normaliserEmail,
  validerEmail,
  validerMotDePasse,
  validerNom,
} from '@/lib/auth/validation'
import { prisma } from '@/lib/prisma'

/*
   SafeCheck - Inscription par email et mot de passe (SC-041a)

   POST /api/auth/inscription
   Corps attendu : { email, password, name? }

   La réponse ne renvoie jamais l'empreinte du mot de passe, ni aucun
   champ interne : uniquement l'identifiant, l'email et le nom.

   Aucune session n'est ouverte ici : l'émission de jeton relève de
   SC-041b (GPE-79), traité séparément.
 */

interface CorpsInscription {
  email?: unknown
  password?: unknown
  name?: unknown
}

function reponseErreur(message: string, statut: number) {
  return Response.json({ erreur: message }, { status: statut })
}

export async function POST(request: Request) {
  let corps: CorpsInscription
  try {
    corps = await request.json()
  } catch {
    return reponseErreur('Le corps de la requête doit être un JSON valide.', 400)
  }

  const emailValide = validerEmail(corps.email)
  if (!emailValide.valide) return reponseErreur(emailValide.erreur!, 400)

  const mdpValide = validerMotDePasse(corps.password)
  if (!mdpValide.valide) return reponseErreur(mdpValide.erreur!, 400)

  const nomValide = validerNom(corps.name)
  if (!nomValide.valide) return reponseErreur(nomValide.erreur!, 400)

  const email = normaliserEmail(corps.email as string)
  const nom = typeof corps.name === 'string' && corps.name.trim() !== '' ? corps.name.trim() : null

  try {
    const passwordHash = await hacherMotDePasse(corps.password as string)

    const utilisateur = await prisma.user.create({
      data: { email, name: nom, passwordHash },
      select: { id: true, email: true, name: true },
    })

    return Response.json({ utilisateur }, { status: 201 })
  } catch (erreur: unknown) {
    /*
       P2002 = violation de contrainte d'unicité, donc email déjà inscrit.
       On s'appuie sur la contrainte plutôt que sur une lecture préalable :
       cela évite une situation de concurrence entre deux inscriptions
       simultanées avec la même adresse.
     */
    if (
      typeof erreur === 'object' &&
      erreur !== null &&
      'code' in erreur &&
      (erreur as { code?: string }).code === 'P2002'
    ) {
      return reponseErreur('Un compte existe déjà avec cette adresse email.', 409)
    }

    console.error("Échec de l'inscription", erreur)
    return reponseErreur("La création du compte a échoué. Réessaie dans un instant.", 500)
  }
}
