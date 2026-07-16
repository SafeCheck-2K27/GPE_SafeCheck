import type {
  TutorialDetailLexiconTag,
  TutorialDetailMockComment,
} from "./types"

export const TUTORIAL_DETAIL_LEXICON_TERMS: Record<string, string> = {
  "double authentification": "Methode de securite qui exige deux preuves d'identite : ton mot de passe + un code temporaire envoye sur un autre appareil.",
  "2FA": "Two-Factor Authentication. Voir 'double authentification'. Protege ton compte meme si ton mot de passe est compromis.",
  phishing: "Tentative de fraude par email, SMS ou faux site imitant une organisation de confiance pour voler tes identifiants.",
  "mot de passe": "Sequence secrete permettant d'acceder a un compte. Doit etre long, complexe et unique par service.",
  "compte Google": "Identifiant centralise donnant acces a tous les services Google : Gmail, Drive, YouTube, etc.",
  "appareil de confiance": "Appareil reconnu par un service qui n'exige plus la double authentification a chaque connexion.",
  "codes de secours": "Codes a usage unique generes lors de l'activation de la 2FA. Permettent d'acceder au compte si tu perds ton telephone.",
  authentificateur: "Application (Google Authenticator, Authy...) qui genere des codes temporaires a 6 chiffres pour la 2FA.",
  VPN: "Reseau prive virtuel qui chiffre ta connexion et masque ton adresse IP. Ne rend pas anonyme.",
  chiffrement: "Transformation des donnees en code illisible sans la cle adequate. Protege les fichiers et les communications.",
  ransomware: "Logiciel malveillant qui chiffre tes fichiers et exige une rancon pour les restituer.",
  "Wi-Fi": "Reseau sans fil. Un Wi-Fi public ou mal securise peut etre intercepte par des attaquants.",
  DNS: "Systeme de noms de domaine. Traduit les adresses web (google.com) en adresses IP numeriques.",
}

export const TUTORIAL_DETAIL_LEXICON_TAGS: TutorialDetailLexiconTag[] = [
  { label: "2FA", slug: "2fa", patterns: ["double authentification", "2fa", "validation en deux"] },
  { label: "Mot de passe", slug: "mot-de-passe", patterns: ["mot de passe"] },
  { label: "Gestionnaire de mots de passe", slug: "gestionnaire-mdp", patterns: ["bitwarden", "gestionnaire"] },
  { label: "Phishing", slug: "phishing", patterns: ["phishing", "hameçonnage", "faux lien", "url spoofing"] },
  { label: "Fuite de données", slug: "fuite-de-donnees", patterns: ["compromis", "fuite", "pwned"] },
  { label: "Chiffrement", slug: "chiffrement", patterns: ["chiffr"] },
  { label: "Ransomware", slug: "ransomware", patterns: ["ransomware", "rançongiciel"] },
  { label: "VPN", slug: "vpn", patterns: ["vpn"] },
  { label: "Pare-feu", slug: "pare-feu", patterns: ["pare-feu", "firewall"] },
  { label: "Adresse IP", slug: "adresse-ip", patterns: ["adresse ip", "ports ouverts", "reseau a domicile"] },
  { label: "Cookie", slug: "cookie", patterns: ["cookie", "navigateur"] },
  { label: "Malware", slug: "malware", patterns: ["malware", "apps a risque", "permissions"] },
  { label: "Software", slug: "software", patterns: ["mise a jour", "extension", "logiciel"] },
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
