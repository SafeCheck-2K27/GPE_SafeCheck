import type { AuditQuestion } from "./types"

/*
   SafeCheck - Banque de questions de l'audit rapide (SC-017)

   10 catégories x 5 questions. Les questions sont regroupées par
   catégorie pour que l'utilisateur avance thème par thème plutôt que de
   sauter d'un sujet à l'autre.

   Chaque option porte un `score` sur 10 qui fait office de poids : 10 =
   pratique recommandée, 0 = pratique à risque ou notion inconnue. Une
   réponse "je ne sais pas ce que c'est" vaut 0 parce qu'elle signale un
   besoin d'accompagnement, pas parce qu'elle sanctionne l'utilisateur.

   Le vocabulaire reste grand public : tout terme technique est expliqué
   entre parenthèses dans l'intitulé.
 */

export const auditQuestions: AuditQuestion[] = [
  /* ---------- Connaissances générales ---------- */
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
    id: 11,
    category: "Connaissances générales",
    text: "Si un proche te demandait comment se protéger en ligne, saurais-tu quoi lui répondre ?",
    options: [
      { label: "Oui, je pourrais lui expliquer les bons réflexes en détail.", value: "a", score: 10 },
      { label: "Je lui donnerais deux ou trois conseils de base.", value: "b", score: 6 },
      { label: "Je lui dirais de faire attention, sans plus de précisions.", value: "c", score: 3 },
      { label: "Non, je serais bien incapable de le conseiller.", value: "d", score: 0 },
    ],
  },
  {
    id: 12,
    category: "Connaissances générales",
    text: "Penses-tu être une cible intéressante pour les pirates informatiques ?",
    options: [
      { label: "Oui, tout le monde est une cible : mes comptes et mes données ont de la valeur.", value: "a", score: 10 },
      { label: "Peut-être, sans trop savoir ce qu'on pourrait me prendre.", value: "b", score: 6 },
      { label: "Pas vraiment, je ne suis ni riche ni célèbre.", value: "c", score: 2 },
      { label: "Non, ça n'arrive qu'aux entreprises et aux personnalités.", value: "d", score: 0 },
    ],
  },
  {
    id: 13,
    category: "Connaissances générales",
    text: "Sais-tu quoi faire si l'un de tes comptes se faisait pirater ?",
    options: [
      { label: "Oui : changer le mot de passe, déconnecter les sessions et prévenir mes contacts.", value: "a", score: 10 },
      { label: "Je changerais le mot de passe, sans aller plus loin.", value: "b", score: 6 },
      { label: "Je chercherais sur internet le moment venu.", value: "c", score: 3 },
      { label: "Non, je ne saurais pas par où commencer.", value: "d", score: 0 },
    ],
  },
  {
    id: 14,
    category: "Connaissances générales",
    text: "Où t'informes-tu sur les questions de sécurité numérique ?",
    options: [
      { label: "Auprès de sources officielles comme cybermalveillance.gouv.fr ou la CNIL.", value: "a", score: 10 },
      { label: "Via des articles, des vidéos ou des podcasts spécialisés.", value: "b", score: 7 },
      { label: "Par le bouche-à-oreille, ce que disent mes proches.", value: "c", score: 3 },
      { label: "Je ne m'informe jamais sur le sujet.", value: "d", score: 0 },
    ],
  },

  /* ---------- Navigation sur internet ---------- */
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
    id: 15,
    category: "Navigation sur internet",
    text: "Avant d'entrer un mot de passe sur un site, vérifies-tu l'adresse affichée dans la barre du navigateur ?",
    options: [
      { label: "Toujours : je lis l'adresse en entier et je vérifie le cadenas.", value: "a", score: 10 },
      { label: "Souvent, surtout sur les sites bancaires.", value: "b", score: 7 },
      { label: "Rarement, je fais confiance à ce qui s'affiche.", value: "c", score: 2 },
      { label: "Jamais, je ne regarde pas l'adresse.", value: "d", score: 0 },
    ],
  },
  {
    id: 16,
    category: "Navigation sur internet",
    text: "Quand un site te propose d'accepter tous les cookies (traceurs qui suivent ta navigation), que fais-tu ?",
    options: [
      { label: "Je refuse ou je personnalise pour ne garder que le nécessaire.", value: "a", score: 10 },
      { label: "Ça dépend du site et de ma confiance envers lui.", value: "b", score: 6 },
      { label: "J'accepte tout pour aller plus vite.", value: "c", score: 2 },
      { label: "Je clique sans lire ce qui est écrit.", value: "d", score: 0 },
    ],
  },
  {
    id: 17,
    category: "Navigation sur internet",
    text: "Installes-tu des extensions (petits modules ajoutés au navigateur) ?",
    options: [
      { label: "Peu, uniquement depuis le magasin officiel, et je fais le ménage régulièrement.", value: "a", score: 10 },
      { label: "Quelques-unes, choisies avec attention.", value: "b", score: 7 },
      { label: "Plusieurs, sans vraiment vérifier leur origine.", value: "c", score: 2 },
      { label: "J'en installe dès qu'une me semble pratique.", value: "d", score: 0 },
    ],
  },
  {
    id: 18,
    category: "Navigation sur internet",
    text: "Télécharges-tu des logiciels depuis des sites autres que les sites officiels ?",
    options: [
      { label: "Jamais, uniquement depuis le site de l'éditeur ou un magasin officiel.", value: "a", score: 10 },
      { label: "Rarement, et je vérifie le site avant.", value: "b", score: 6 },
      { label: "Parfois, quand le logiciel est payant ailleurs.", value: "c", score: 1 },
      { label: "Souvent, je prends le premier lien de téléchargement trouvé.", value: "d", score: 0 },
    ],
  },

  /* ---------- Mots de passe ---------- */
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
    id: 19,
    category: "Mots de passe",
    text: "Comment retiens-tu tes mots de passe ?",
    options: [
      { label: "Dans un gestionnaire de mots de passe (coffre-fort numérique chiffré).", value: "a", score: 10 },
      { label: "Dans ma tête, ils sont tous différents.", value: "b", score: 7 },
      { label: "Dans le navigateur, sans mot de passe principal.", value: "c", score: 4 },
      { label: "Sur un papier, un carnet ou un fichier non protégé.", value: "d", score: 0 },
    ],
  },
  {
    id: 20,
    category: "Mots de passe",
    text: "À quoi ressemble le mot de passe de ta boîte mail principale ?",
    options: [
      { label: "Long (12 caractères ou plus), unique et sans rapport avec ma vie privée.", value: "a", score: 10 },
      { label: "Assez long, mais je l'utilise peut-être ailleurs.", value: "b", score: 5 },
      { label: "Court, avec un mot courant et quelques chiffres.", value: "c", score: 2 },
      { label: "Il contient mon prénom, une date de naissance ou le nom d'un proche.", value: "d", score: 0 },
    ],
  },
  {
    id: 21,
    category: "Mots de passe",
    text: "Partages-tu parfois un mot de passe avec quelqu'un ?",
    options: [
      { label: "Jamais, ou alors via une fonction de partage sécurisée dédiée.", value: "a", score: 10 },
      { label: "Rarement, et je le change juste après.", value: "b", score: 6 },
      { label: "Oui, avec mes proches, par message ou oralement.", value: "c", score: 2 },
      { label: "Oui, régulièrement, y compris par SMS ou par mail.", value: "d", score: 0 },
    ],
  },
  {
    id: 22,
    category: "Mots de passe",
    text: "Que fais-tu quand un service t'annonce que ton mot de passe a fuité ?",
    options: [
      { label: "Je le change aussitôt, ainsi que sur les autres sites où je l'utilisais.", value: "a", score: 10 },
      { label: "Je le change sur le site concerné uniquement.", value: "b", score: 6 },
      { label: "Je me dis que je le ferai plus tard.", value: "c", score: 2 },
      { label: "Ça ne m'est jamais arrivé, ou je n'y prête pas attention.", value: "d", score: 0 },
    ],
  },

  /* ---------- Appareils ---------- */
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
    id: 23,
    category: "Appareils",
    text: "Ton téléphone et ton ordinateur se verrouillent-ils automatiquement ?",
    options: [
      { label: "Oui, au bout de quelques minutes, avec code ou empreinte.", value: "a", score: 10 },
      { label: "Sur le téléphone uniquement.", value: "b", score: 6 },
      { label: "Il faut que je le fasse à la main.", value: "c", score: 3 },
      { label: "Non, mes appareils restent ouverts en permanence.", value: "d", score: 0 },
    ],
  },
  {
    id: 24,
    category: "Appareils",
    text: "Un antivirus ou une protection intégrée est-il actif sur ton ordinateur ?",
    options: [
      { label: "Oui, actif et à jour (l'antivirus intégré au système suffit).", value: "a", score: 10 },
      { label: "Oui, mais je ne sais pas s'il est à jour.", value: "b", score: 6 },
      { label: "Je l'ai désactivé parce qu'il me dérangeait.", value: "c", score: 1 },
      { label: "Je ne sais pas si j'en ai un.", value: "d", score: 0 },
    ],
  },
  {
    id: 25,
    category: "Appareils",
    text: "Vérifies-tu les autorisations demandées par les applications (micro, caméra, position, contacts) ?",
    options: [
      { label: "Oui, et je retire celles qui ne sont pas justifiées.", value: "a", score: 10 },
      { label: "Je regarde à l'installation, sans revenir dessus ensuite.", value: "b", score: 6 },
      { label: "J'accepte pour que l'application fonctionne.", value: "c", score: 2 },
      { label: "Je ne savais pas qu'on pouvait les vérifier.", value: "d", score: 0 },
    ],
  },
  {
    id: 26,
    category: "Appareils",
    text: "Que fais-tu d'un ancien téléphone ou ordinateur dont tu te sépares ?",
    options: [
      { label: "Je le réinitialise complètement après avoir récupéré mes données.", value: "a", score: 10 },
      { label: "Je supprime mes fichiers et mes comptes principaux.", value: "b", score: 6 },
      { label: "Je le donne ou le revends tel quel.", value: "c", score: 1 },
      { label: "Je n'y avais jamais réfléchi.", value: "d", score: 0 },
    ],
  },

  /* ---------- Double authentification ---------- */
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
    id: 27,
    category: "Double authentification",
    text: "Quelle méthode utilises-tu pour recevoir ton code de vérification ?",
    options: [
      { label: "Une application dédiée ou une clé physique de sécurité.", value: "a", score: 10 },
      { label: "Une notification envoyée par le service lui-même.", value: "b", score: 8 },
      { label: "Un SMS.", value: "c", score: 5 },
      { label: "Je n'utilise aucune vérification supplémentaire.", value: "d", score: 0 },
    ],
  },
  {
    id: 28,
    category: "Double authentification",
    text: "As-tu conservé les codes de secours fournis lors de l'activation de la double authentification ?",
    options: [
      { label: "Oui, dans un endroit sûr et accessible hors de mon téléphone.", value: "a", score: 10 },
      { label: "Oui, mais je ne sais plus vraiment où.", value: "b", score: 5 },
      { label: "Non, je ne les ai pas gardés.", value: "c", score: 2 },
      { label: "Je ne sais pas ce que sont les codes de secours.", value: "d", score: 0 },
    ],
  },
  {
    id: 29,
    category: "Double authentification",
    text: "Que fais-tu si tu reçois une demande de validation que tu n'as pas déclenchée ?",
    options: [
      { label: "Je refuse et je change immédiatement mon mot de passe.", value: "a", score: 10 },
      { label: "Je refuse, sans rien faire de plus.", value: "b", score: 6 },
      { label: "J'ignore la notification.", value: "c", score: 3 },
      { label: "J'accepte, en me disant que c'est sûrement moi.", value: "d", score: 0 },
    ],
  },
  {
    id: 30,
    category: "Double authentification",
    text: "Ta boîte mail principale est-elle protégée par une double authentification ?",
    options: [
      { label: "Oui : c'est le compte qui protège tous les autres.", value: "a", score: 10 },
      { label: "Je crois, mais je n'en suis pas certain(e).", value: "b", score: 5 },
      { label: "Non, seulement un mot de passe.", value: "c", score: 2 },
      { label: "Non, et je ne vois pas pourquoi ce serait utile.", value: "d", score: 0 },
    ],
  },

  /* ---------- Mises à jour ---------- */
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
    id: 31,
    category: "Mises à jour",
    text: "Les mises à jour automatiques sont-elles activées sur tes appareils ?",
    options: [
      { label: "Oui, sur le système et les applications.", value: "a", score: 10 },
      { label: "Sur le système uniquement.", value: "b", score: 7 },
      { label: "Non, je préfère décider moi-même.", value: "c", score: 4 },
      { label: "Je ne sais pas où se règle cette option.", value: "d", score: 0 },
    ],
  },
  {
    id: 32,
    category: "Mises à jour",
    text: "Ton système d'exploitation reçoit-il encore des mises à jour de sécurité ?",
    options: [
      { label: "Oui, j'utilise une version récente et toujours suivie.", value: "a", score: 10 },
      { label: "Je pense que oui, sans avoir vérifié.", value: "b", score: 5 },
      { label: "Non, mon appareil est trop ancien pour être mis à jour.", value: "c", score: 1 },
      { label: "Je ne sais pas quelle version j'utilise.", value: "d", score: 0 },
    ],
  },
  {
    id: 33,
    category: "Mises à jour",
    text: "Mets-tu aussi à jour ta box internet ou ton routeur ?",
    options: [
      { label: "Oui, les mises à jour automatiques sont activées ou je les lance moi-même.", value: "a", score: 10 },
      { label: "C'est mon opérateur qui s'en charge, je pense.", value: "b", score: 6 },
      { label: "Non, je n'y touche jamais.", value: "c", score: 2 },
      { label: "Je ne savais pas qu'une box pouvait se mettre à jour.", value: "d", score: 0 },
    ],
  },
  {
    id: 34,
    category: "Mises à jour",
    text: "Que fais-tu des applications que tu n'utilises plus ?",
    options: [
      { label: "Je les désinstalle : moins d'applications, moins de failles.", value: "a", score: 10 },
      { label: "Je fais le tri de temps en temps.", value: "b", score: 7 },
      { label: "Je les garde au cas où, sans les mettre à jour.", value: "c", score: 2 },
      { label: "Je ne les désinstalle jamais.", value: "d", score: 0 },
    ],
  },

  /* ---------- Sauvegardes ---------- */
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
    id: 35,
    category: "Sauvegardes",
    text: "À quand remonte ta dernière sauvegarde ?",
    options: [
      { label: "À moins d'une semaine, elle se fait toute seule.", value: "a", score: 10 },
      { label: "À moins d'un mois.", value: "b", score: 7 },
      { label: "À plus de six mois.", value: "c", score: 3 },
      { label: "Je n'ai aucune sauvegarde.", value: "d", score: 0 },
    ],
  },
  {
    id: 36,
    category: "Sauvegardes",
    text: "As-tu déjà vérifié qu'une sauvegarde pouvait bien être restaurée ?",
    options: [
      { label: "Oui, j'ai déjà restauré des fichiers pour m'en assurer.", value: "a", score: 10 },
      { label: "Non, mais je fais confiance à l'outil utilisé.", value: "b", score: 6 },
      { label: "Non, je n'y avais jamais pensé.", value: "c", score: 3 },
      { label: "Je n'ai pas de sauvegarde à tester.", value: "d", score: 0 },
    ],
  },
  {
    id: 37,
    category: "Sauvegardes",
    text: "Tes sauvegardes sont-elles stockées à plusieurs endroits différents ?",
    options: [
      { label: "Oui : au moins deux supports, dont un en dehors de mon domicile.", value: "a", score: 10 },
      { label: "Sur un seul support externe ou un seul service en ligne.", value: "b", score: 6 },
      { label: "Tout est sur le même appareil que les fichiers d'origine.", value: "c", score: 1 },
      { label: "Je n'ai pas de sauvegarde.", value: "d", score: 0 },
    ],
  },
  {
    id: 38,
    category: "Sauvegardes",
    text: "Si ton ordinateur devenait inutilisable demain, que perdrais-tu ?",
    options: [
      { label: "Rien d'important, tout est sauvegardé ailleurs.", value: "a", score: 10 },
      { label: "Quelques fichiers récents seulement.", value: "b", score: 7 },
      { label: "Une bonne partie de mes documents et photos.", value: "c", score: 2 },
      { label: "Absolument tout.", value: "d", score: 0 },
    ],
  },

  /* ---------- Phishing ---------- */
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
    id: 39,
    category: "Phishing",
    text: "Tu reçois un message urgent de ta banque demandant de confirmer tes identifiants. Que fais-tu ?",
    options: [
      { label: "Je ne clique pas et je contacte ma banque par un canal que je connais.", value: "a", score: 10 },
      { label: "Je vérifie l'expéditeur avant de décider.", value: "b", score: 7 },
      { label: "Je clique pour voir de quoi il s'agit.", value: "c", score: 1 },
      { label: "Je remplis le formulaire, une banque ne demanderait pas ça pour rien.", value: "d", score: 0 },
    ],
  },
  {
    id: 40,
    category: "Phishing",
    text: "Comment réagis-tu à un SMS annonçant un colis en attente avec un lien de suivi ?",
    options: [
      { label: "Je l'ignore et je vérifie directement sur le site du transporteur.", value: "a", score: 10 },
      { label: "Je regarde si j'attends réellement un colis avant d'agir.", value: "b", score: 7 },
      { label: "J'ouvre le lien pour vérifier.", value: "c", score: 2 },
      { label: "Je suis le lien et je paie les frais demandés.", value: "d", score: 0 },
    ],
  },
  {
    id: 41,
    category: "Phishing",
    text: "Ouvres-tu les pièces jointes reçues d'un expéditeur que tu n'attendais pas ?",
    options: [
      { label: "Jamais sans avoir confirmé l'envoi auprès de la personne.", value: "a", score: 10 },
      { label: "Seulement si le message semble crédible.", value: "b", score: 5 },
      { label: "Oui, par curiosité.", value: "c", score: 1 },
      { label: "Oui, j'ouvre toutes les pièces jointes que je reçois.", value: "d", score: 0 },
    ],
  },
  {
    id: 42,
    category: "Phishing",
    text: "Signales-tu les messages frauduleux que tu reçois ?",
    options: [
      { label: "Oui, je les signale (33700, Signal Spam, bouton du service concerné).", value: "a", score: 10 },
      { label: "Je les marque comme indésirables.", value: "b", score: 7 },
      { label: "Je les supprime sans rien signaler.", value: "c", score: 4 },
      { label: "Je les laisse dans ma boîte.", value: "d", score: 0 },
    ],
  },

  /* ---------- Wi-Fi ---------- */
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
    id: 43,
    category: "Wi-Fi",
    text: "Utilises-tu les réseaux Wi-Fi publics (gare, café, hôtel) ?",
    options: [
      { label: "Rarement, et jamais pour des sites sensibles comme ma banque.", value: "a", score: 10 },
      { label: "Oui, mais avec un VPN (connexion chiffrée qui protège mes échanges).", value: "b", score: 9 },
      { label: "Oui, régulièrement, pour tout usage.", value: "c", score: 2 },
      { label: "Oui, et je m'y connecte à ma banque sans crainte.", value: "d", score: 0 },
    ],
  },
  {
    id: 44,
    category: "Wi-Fi",
    text: "As-tu changé le mot de passe d'administration de ta box internet ?",
    options: [
      { label: "Oui, il est différent de celui inscrit sur l'étiquette.", value: "a", score: 10 },
      { label: "Non, mais l'accès à l'interface est limité.", value: "b", score: 5 },
      { label: "Non, c'est toujours celui d'origine.", value: "c", score: 2 },
      { label: "Je ne savais pas qu'une box avait un mot de passe d'administration.", value: "d", score: 0 },
    ],
  },
  {
    id: 45,
    category: "Wi-Fi",
    text: "Sais-tu quels appareils sont connectés à ton réseau Wi-Fi ?",
    options: [
      { label: "Oui, je consulte la liste et je retire ceux que je ne reconnais pas.", value: "a", score: 10 },
      { label: "Approximativement, sans avoir vérifié récemment.", value: "b", score: 6 },
      { label: "Non, je n'ai jamais regardé.", value: "c", score: 2 },
      { label: "Je ne savais pas que c'était possible.", value: "d", score: 0 },
    ],
  },
  {
    id: 46,
    category: "Wi-Fi",
    text: "Comment donnes-tu l'accès à ton Wi-Fi à des invités ?",
    options: [
      { label: "Via un réseau invité séparé de mes appareils personnels.", value: "a", score: 10 },
      { label: "Je donne le mot de passe principal, à des personnes de confiance.", value: "b", score: 5 },
      { label: "Le mot de passe est affiché ou connu de beaucoup de monde.", value: "c", score: 1 },
      { label: "Mon réseau est accessible sans mot de passe.", value: "d", score: 0 },
    ],
  },

  /* ---------- Données personnelles ---------- */
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
  {
    id: 47,
    category: "Données personnelles",
    text: "Sais-tu qui peut voir ce que tu publies sur les réseaux sociaux ?",
    options: [
      { label: "Oui, j'ai réglé la visibilité de chaque compte et je la vérifie.", value: "a", score: 10 },
      { label: "En gros, mais je n'ai pas tout vérifié.", value: "b", score: 6 },
      { label: "Non, j'ai gardé les réglages par défaut.", value: "c", score: 2 },
      { label: "Je ne savais pas que ça se réglait.", value: "d", score: 0 },
    ],
  },
  {
    id: 48,
    category: "Données personnelles",
    text: "Quelles informations personnelles donnes-tu pour créer un compte en ligne ?",
    options: [
      { label: "Le strict minimum, et une adresse mail dédiée si possible.", value: "a", score: 10 },
      { label: "Ce qui est demandé, en évitant les champs facultatifs.", value: "b", score: 7 },
      { label: "Tout ce qui est demandé, sans réfléchir.", value: "c", score: 3 },
      { label: "Je remplis tout, y compris mon numéro et mon adresse.", value: "d", score: 0 },
    ],
  },
  {
    id: 49,
    category: "Données personnelles",
    text: "Fais-tu le tri dans les comptes en ligne que tu n'utilises plus ?",
    options: [
      { label: "Oui, je supprime les comptes inutilisés pour réduire mon exposition.", value: "a", score: 10 },
      { label: "J'y pense parfois, sans le faire vraiment.", value: "b", score: 5 },
      { label: "Non, je les laisse ouverts.", value: "c", score: 2 },
      { label: "Je ne sais même plus combien de comptes j'ai créés.", value: "d", score: 0 },
    ],
  },
  {
    id: 50,
    category: "Données personnelles",
    text: "Connais-tu tes droits sur tes données personnelles (accès, rectification, suppression) ?",
    options: [
      { label: "Oui, et j'ai déjà exercé l'un de ces droits auprès d'un service.", value: "a", score: 10 },
      { label: "Je sais qu'ils existent, sans les avoir utilisés.", value: "b", score: 7 },
      { label: "J'en ai vaguement entendu parler.", value: "c", score: 3 },
      { label: "Non, je ne connais pas ces droits.", value: "d", score: 0 },
    ],
  },
]
