import type {
  TutorialDetailLexiconTag,
  TutorialDetailMockComment,
} from "./types"

export const TUTORIAL_DETAIL_LEXICON_TAGS: TutorialDetailLexiconTag[] = [
  { slug: "2fa", patterns: ["double authentification", "2fa", "validation en deux"] },
  { slug: "mot-de-passe", patterns: ["mot de passe"] },
  { slug: "gestionnaire-mdp", patterns: ["bitwarden", "gestionnaire"] },
  { slug: "phishing", patterns: ["phishing", "hameçonnage", "faux lien", "url spoofing"] },
  { slug: "fuite-de-donnees", patterns: ["compromis", "fuite", "pwned"] },
  { slug: "chiffrement", patterns: ["chiffr"] },
  { slug: "ransomware", patterns: ["ransomware", "rançongiciel"] },
  { slug: "vpn", patterns: ["vpn"] },
  { slug: "pare-feu", patterns: ["pare-feu", "firewall"] },
  { slug: "adresse-ip", patterns: ["adresse ip", "ports ouverts", "reseau a domicile"] },
  { slug: "cookie", patterns: ["cookie", "navigateur"] },
  { slug: "malware", patterns: ["malware", "apps a risque", "permissions"] },
  { slug: "software", patterns: ["mise a jour", "extension", "logiciel"] },
]

export function getMockTutorialComments(tutorialId: number): TutorialDetailMockComment[] {
  if (tutorialId === 1) {
    return [
      {
        id: 1,
        author: "Marie T.",
        date: "il y a 3 jours",
        text: "Super clair, j'ai pu activer la 2FA en moins de 5 minutes. Le conseil sur Google Authenticator plutot que le SMS est tres pertinent.",
        helpful: true,
      },
      {
        id: 2,
        author: "Paul R.",
        date: "il y a 1 semaine",
        text: "Attention : depuis la derniere mise a jour de Google, l'interface a legerement change. La validation en deux etapes se trouve maintenant sous 'Comment vous vous connectez a Google'.",
        helpful: false,
      },
      {
        id: 3,
        author: "Sophie M.",
        date: "il y a 2 semaines",
        text: "Tres bien explique, meme pour une debutante comme moi. J'avais peur que ce soit complique mais non !",
        helpful: true,
      },
    ]
  }

  if (tutorialId === 6) {
    return [
      {
        id: 1,
        author: "David L.",
        date: "il y a 5 jours",
        text: "Tutoriel essentiel. J'ajoute : attention aux emails qui utilisent votre prenom - ca ne veut pas dire que l'expediteur est legitime.",
        helpful: true,
      },
      {
        id: 2,
        author: "Celine B.",
        date: "il y a 2 semaines",
        text: "Le conseil de ne jamais cliquer sur un lien dans un email de banque est d'or. J'ai failli me faire avoir.",
        helpful: true,
      },
    ]
  }

  return [
    {
      id: 1,
      author: "Utilisateur anonyme",
      date: "il y a 4 jours",
      text: "Tutoriel bien structure et actionnable. Merci a l'equipe SafeCheck.",
      helpful: true,
    },
  ]
}
