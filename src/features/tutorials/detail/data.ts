import type { TutorialDetailLexiconTag } from "./types"

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
