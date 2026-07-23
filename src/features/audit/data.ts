import type { AuditQuestion } from "./types"

export const auditQuestions: AuditQuestion[] = [
  {
    id: 1,
    category: "Connaissances générales",
    text: "La cybersécurité, tu t'y connais ou pas ?",
    options: [
      { label: "Je maîtrise bien, je sais ce qu'est un pare-feu, un VPN, le chiffrement.", value: "a", score: 10 },
      { label: "J'ai quelques bases, je connais les mots de passe et les antivirus.", value: "b", score: 6 },
      { label: "Pas vraiment, j'ai entendu parler mais ça reste vague pour moi.", value: "c", score: 3 },
      { label: "C'est quoi la cybersécurité ? Je ne connais pas du tout.", value: "d", score: 0 },
    ],
  },
  {
    id: 2,
    category: "Navigation sur internet",
    text: "Tu sais comment aller sur internet ou tu t'es retrouvé là par hasard ?",
    options: [
      { label: "Oui, j'utilise internet tous les jours sans problème.", value: "a", score: 10 },
      { label: "Oui, mais j'ai parfois du mal à trouver ce que je cherche.", value: "b", score: 7 },
      { label: "Un peu, j'ai besoin d'aide parfois.", value: "c", score: 3 },
      { label: "Non, c'est encore un grand mystère pour moi.", value: "d", score: 0 },
    ],
  },
  {
    id: 3,
    category: "Mots de passe",
    text: "Sinon, tu n'as jamais entendu parler d'un film de gladiateurs ? (Est-ce que tu utilises le même mot de passe partout ?)",
    options: [
      { label: "Non, j'utilise un gestionnaire de mots de passe avec des mots de passe uniques.", value: "a", score: 10 },
      { label: "J'ai quelques variations, mais certains sont réutilisés.", value: "b", score: 5 },
      { label: "Souvent oui, c'est plus simple à retenir.", value: "c", score: 2 },
      { label: "J'utilise le même partout, toujours le même depuis des années.", value: "d", score: 0 },
    ],
  },
  {
    id: 4,
    category: "Appareils",
    text: "C'est la question à poser avant les autres ? Est-ce que tu as déjà touché à un ordinateur ?",
    options: [
      { label: "Oui, j'utilise un ordinateur et un smartphone tous les jours.", value: "a", score: 10 },
      { label: "Oui, mais je préfère le téléphone.", value: "b", score: 7 },
      { label: "Rarement, seulement quand c'est vraiment nécessaire.", value: "c", score: 3 },
      { label: "Non, c'est la première fois que j'utilise un appareil numérique.", value: "d", score: 0 },
    ],
  },
  {
    id: 5,
    category: "Double authentification",
    text: "As-tu activé la double authentification (2FA) sur tes comptes importants (email, banque, réseaux sociaux) ?",
    options: [
      { label: "Oui, sur tous mes comptes importants.", value: "a", score: 10 },
      { label: "Sur quelques-uns, mais pas tous.", value: "b", score: 6 },
      { label: "Non, je ne sais pas comment faire.", value: "c", score: 2 },
      { label: "Je ne sais même pas ce qu'est la double authentification.", value: "d", score: 0 },
    ],
  },
  {
    id: 6,
    category: "Mises à jour",
    text: "Fais-tu régulièrement les mises à jour de ton ordinateur, téléphone et applications ?",
    options: [
      { label: "Toujours, dès qu'une mise à jour est disponible.", value: "a", score: 10 },
      { label: "Souvent, mais parfois je les reporte.", value: "b", score: 7 },
      { label: "Parfois, seulement quand l'appareil m'y force.", value: "c", score: 3 },
      { label: "Jamais, ça ralentit l'ordinateur.", value: "d", score: 0 },
    ],
  },
  {
    id: 7,
    category: "Sauvegardes",
    text: "As-tu une sauvegarde récente de tes fichiers importants (photos, documents, contacts) ?",
    options: [
      { label: "Oui, sauvegarde automatique sur le cloud et disque dur externe.", value: "a", score: 10 },
      { label: "Oui, mais c'est manuel et pas très régulier.", value: "b", score: 6 },
      { label: "Non, je n'ai jamais fait de sauvegarde.", value: "c", score: 1 },
      { label: "Je ne sais pas ce qu'est une sauvegarde.", value: "d", score: 0 },
    ],
  },
  {
    id: 8,
    category: "Phishing",
    text: "Sais-tu reconnaître un email de phishing (tentative d'arnaque par mail) ?",
    options: [
      { label: "Oui, je vérifie toujours l'expéditeur, les liens et les demandes suspectes.", value: "a", score: 10 },
      { label: "Je suis vigilant(e) mais j'ai parfois un doute.", value: "b", score: 7 },
      { label: "Pas vraiment, je ne sais pas quoi chercher.", value: "c", score: 2 },
      { label: "J'ai déjà cliqué sur des liens suspects sans m'en rendre compte.", value: "d", score: 0 },
    ],
  },
  {
    id: 9,
    category: "Wi-Fi",
    text: "Ton réseau Wi-Fi à la maison est-il protégé par un mot de passe robuste ?",
    options: [
      { label: "Oui, avec un long mot de passe unique que j'ai personnalisé.", value: "a", score: 10 },
      { label: "Oui, avec le mot de passe par défaut de la box.", value: "b", score: 5 },
      { label: "Je crois, mais je n'ai jamais vérifié.", value: "c", score: 2 },
      { label: "Non, mon Wi-Fi est ouvert pour tout le monde.", value: "d", score: 0 },
    ],
  },
  {
    id: 10,
    category: "Données personnelles",
    text: "As-tu déjà vérifié si tes identifiants ont été compromis dans une fuite de données en ligne ?",
    options: [
      { label: "Oui, j'utilise des outils comme HaveIBeenPwned régulièrement.", value: "a", score: 10 },
      { label: "Une fois, mais pas récemment.", value: "b", score: 6 },
      { label: "Non, je ne savais pas que c'était possible.", value: "c", score: 2 },
      { label: "Non, et je ne vois pas l'intérêt.", value: "d", score: 0 },
    ],
  },
]
