"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import { ScButton, ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
import { useAuth } from "@/components/safecheck/AuthProvider"
import {
  Brain,
  Cog,
  Monitor,
  Cpu,
  Globe,
  Wifi,
  Lock,
  Mail,
  Usb,
  Eye,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Server,
  Package,
  X,
  AlertTriangle,
  Download,
  RefreshCw,
  KeySquare,
  CloudOff,
  Filter as FilterIcon,
  HardDrive,
  Smartphone,
  Network,
  Repeat,
  ShieldAlert,
  Activity,
  Layers,
  Headphones,
  Clock,
  Target,
  Zap,
  BookOpen,
  ClipboardList,
  Star,
  ExternalLink,
  BarChart2,
  TrendingUp,
  BookMarked,
} from "lucide-react"

/* Types */
type HabitudeLevel = "Débutant" | "Intermédiaire" | "Avancé"
type HabitudeTag = "comptes" | "phishing" | "réseau" | "appareils" | "données" | "réflexes"
type StatusKey = "todo" | "en-cours" | "fait" | "sauvegarde"

interface LinkedTutorial {
  id: number
  title: string
}

interface Habitude {
  id: string
  title: string
  pitch: string
  detail: string
  whyImportant: string
  commonMistake: string
  benefit: string
  timeEstimate: string
  icon: React.ComponentType<{ className?: string }>
  level: HabitudeLevel
  tag: HabitudeTag
  linkedTutorials: LinkedTutorial[]
}

const HABITUDES: Habitude[] = [
  /* Débutant */
  {
    id: "usb",
    title: "Ne pas brancher une clé USB inconnue",
    pitch: "Une clé USB trouvée par hasard peut contenir un malware déclenché à l'insertion.",
    detail:
      "Une attaque dite « rubber ducky » suffit à compromettre un poste en quelques secondes. Si vous trouvez une clé USB, ne la branchez pas - donnez-la à un service IT ou jetez-la.",
    whyImportant: "Un simple script sur une clé USB peut exécuter du code malveillant en moins de 10 secondes après branchement, sans aucun clic de votre part.",
    commonMistake: "Brancher une clé « pour voir ce qu'elle contient » depuis le gestionnaire de fichiers. C'est déjà trop tard.",
    benefit: "Zéro risque d'infection par clé USB",
    timeEstimate: "Immédiat - un seul réflexe à adopter",
    icon: Usb,
    level: "Débutant",
    tag: "appareils",
    linkedTutorials: [],
  },
  {
    id: "lien",
    title: "Vérifier un lien avant de cliquer",
    pitch: "Survolez les liens. Lisez l'URL réelle, pas seulement le texte.",
    detail:
      "Les attaques de phishing reposent sur des URL qui imitent une marque connue (ex. : « paypaI.com » avec un i majuscule). Survol = lecture du vrai lien en bas du navigateur.",
    whyImportant: "80 % des compromissions débutent par un simple clic sur un lien frauduleux. L'URL réelle est toujours visible dans la barre de statut en bas de l'écran.",
    commonMistake: "Cliquer sans regarder parce que le texte du lien semble légitime (ex. : « Cliquez ici pour valider votre commande »).",
    benefit: "Élimination du risque de phishing par URL trompeuse",
    timeEstimate: "2 secondes par lien - réflexe à automatiser",
    icon: Eye,
    level: "Débutant",
    tag: "phishing",
    linkedTutorials: [{ id: 6, title: "Reconnaître une tentative de phishing" }],
  },
  {
    id: "mdp-partage",
    title: "Ne jamais partager son mot de passe",
    pitch: "Aucun service légitime ne demande votre mot de passe par mail ou téléphone.",
    detail:
      "Banques, opérateurs, plateformes : aucun ne demande votre mot de passe. Si on vous le demande, c'est une arnaque. Utilisez un gestionnaire de mots de passe pour ne plus avoir à les retenir.",
    whyImportant: "Partager son mot de passe, c'est perdre tout contrôle sur son compte. Même un employé du support légitime ne devrait jamais en avoir besoin.",
    commonMistake: "Céder sous prétexte que l'interlocuteur « paraît officiel » ou que la demande est urgente.",
    benefit: "Vos comptes restent sous votre contrôle exclusif",
    timeEstimate: "Immédiat - refus systématique à adopter",
    icon: Lock,
    level: "Débutant",
    tag: "comptes",
    linkedTutorials: [{ id: 1, title: "Créer un mot de passe fort" }],
  },
  {
    id: "mdp-reuse",
    title: "Ne pas réutiliser ses mots de passe",
    pitch: "Un mot de passe = un compte. Toujours.",
    detail:
      "Quand un site fuit (et ils fuient), votre mot de passe se retrouve testé sur tous vos autres comptes via le credential stuffing. Un seul mot de passe unique par service stoppe net cette propagation.",
    whyImportant: "Des milliards de couples email/mot de passe circulent sur le dark web. Si vous réutilisez le même, une seule fuite compromet tous vos comptes.",
    commonMistake: "Utiliser le même mot de passe avec des variantes légères (monMdp1, monMdp2) que les scripts d'attaque testent automatiquement.",
    benefit: "Containment total : une fuite n'affecte qu'un seul service",
    timeEstimate: "30 min pour installer Bitwarden et migrer",
    icon: KeySquare,
    level: "Débutant",
    tag: "comptes",
    linkedTutorials: [
      { id: 1, title: "Créer un mot de passe fort" },
      { id: 2, title: "Installer Bitwarden" },
    ],
  },
  {
    id: "email",
    title: "Se méfier des pièces jointes inattendues",
    pitch: "Une pièce jointe non sollicitée est suspecte par défaut.",
    detail:
      "Même si l'expéditeur semble connu, un compte peut avoir été piraté. Vérifiez par un autre canal avant d'ouvrir un fichier .zip, .exe ou un document Office demandant l'activation de macros.",
    whyImportant: "Les malwares se propagent massivement via les pièces jointes. Un document Word avec macros peut installer un ransomware en un clic.",
    commonMistake: "Activer les macros dans un document Office reçu par mail parce qu'un message intégré le demande.",
    benefit: "Immunité contre la majorité des vecteurs d'infection par email",
    timeEstimate: "Immédiat - vérification systématique avant ouverture",
    icon: Mail,
    level: "Débutant",
    tag: "phishing",
    linkedTutorials: [{ id: 6, title: "Reconnaître une tentative de phishing" }],
  },
  {
    id: "expediteur",
    title: "Vérifier l'expéditeur d'un mail sensible",
    pitch: "Le nom affiché ne dit rien. C'est l'adresse complète qui compte.",
    detail:
      "Les pirates utilisent des noms d'expéditeur crédibles avec des adresses délirantes : « Banque de France <noreply@smtp123.ru> ». Cliquez toujours sur le nom pour voir l'adresse complète.",
    whyImportant: "Le nom affiché d'un expéditeur est librement falsifiable. L'adresse réelle derrière ne l'est pas.",
    commonMistake: "Ne regarder que le nom affiché et non l'adresse email complète, surtout sur mobile où elle est masquée par défaut.",
    benefit: "Détection immédiate des usurpations d'identité par email",
    timeEstimate: "2 secondes par mail sensible",
    icon: Mail,
    level: "Débutant",
    tag: "phishing",
    linkedTutorials: [{ id: 6, title: "Reconnaître une tentative de phishing" }],
  },
  {
    id: "verrouillage",
    title: "Verrouiller son écran à chaque pause",
    pitch: "Win+L ou Ctrl+Cmd+Q. Un réflexe d'hygiène numérique.",
    detail:
      "Un poste laissé déverrouillé en open-space ou en télétravail expose vos sessions. Verrouillez systématiquement, configurez un verrouillage automatique court (1 à 5 min).",
    whyImportant: "Un poste déverrouillé laissé sans surveillance 30 secondes suffit pour installer un logiciel malveillant ou exfiltrer des données.",
    commonMistake: "Compter sur le verrouillage automatique sans le configurer correctement - il peut être désactivé ou trop lent.",
    benefit: "Protection physique de vos sessions contre l'accès non autorisé",
    timeEstimate: "Immédiat - raccourci clavier à mémoriser",
    icon: ShieldCheck,
    level: "Débutant",
    tag: "appareils",
    linkedTutorials: [],
  },
  {
    id: "maj-ignorer",
    title: "Ne pas ignorer les mises à jour importantes",
    pitch: "Les mises à jour ferment des portes que les pirates connaissent déjà.",
    detail:
      "Des attaques mondiales comme WannaCry exploitaient des failles déjà corrigées. Repousser une mise à jour, c'est laisser sa porte ouverte. Activez les mises à jour automatiques quand c'est possible.",
    whyImportant: "Une fois une faille rendue publique (CVE), des scripts d'exploitation automatisés sont publiés en moins de 24h. Les systèmes non patchés sont scannés en permanence.",
    commonMistake: "Repousser les mises à jour « pour plus tard » pendant des semaines, ou les désactiver pour éviter les redémarrages.",
    benefit: "Fermeture des failles exploitées activement dans la nature",
    timeEstimate: "5 min pour activer les mises à jour automatiques",
    icon: RefreshCw,
    level: "Débutant",
    tag: "appareils",
    linkedTutorials: [],
  },
  {
    id: "support",
    title: "Se méfier des faux supports techniques",
    pitch: "Microsoft et Apple n'appellent jamais.",
    detail:
      "Un pop-up qui crie « Votre PC est infecté, appelez ce numéro » est toujours une arnaque. Ne décrochez pas, ne rappelez pas. Fermez le navigateur ou redémarrez l'ordinateur si nécessaire.",
    whyImportant: "Les arnaques au faux support technique coûtent des centaines de millions d'euros par an. Les victimes donnent souvent un accès distant complet à leur machine.",
    commonMistake: "Rappeler le numéro affiché dans le pop-up, ou pire, laisser l'« agent » prendre le contrôle à distance.",
    benefit: "Protection contre les arnaques au faux support (100 % évitables)",
    timeEstimate: "Immédiat - un seul principe : ils n'appellent jamais",
    icon: Headphones,
    level: "Débutant",
    tag: "phishing",
    linkedTutorials: [{ id: 6, title: "Reconnaître une tentative de phishing" }],
  },

  /* Intermédiaire */
  {
    id: "wifi",
    title: "Éviter les Wi-Fi publics non chiffrés",
    pitch: "Préférez un partage de connexion 4G/5G aux Wi-Fi gratuits.",
    detail:
      "Sur un Wi-Fi ouvert, un attaquant peut intercepter vos requêtes. Si c'est inévitable, utilisez un VPN fiable et évitez la banque ou les achats en ligne.",
    whyImportant: "Sur un réseau ouvert, les requêtes HTTP (et parfois même HTTPS via des attaques MITM) peuvent être interceptées et lues par n'importe qui sur le même réseau.",
    commonMistake: "Se connecter au Wi-Fi de l'hôtel ou du café pour accéder à sa banque ou son email professionnel sans VPN.",
    benefit: "Confidentialité de vos communications sur les réseaux non maîtrisés",
    timeEstimate: "15 min pour configurer un VPN fiable",
    icon: Wifi,
    level: "Intermédiaire",
    tag: "réseau",
    linkedTutorials: [{ id: 12, title: "Sécuriser sa navigation web" }],
  },
  {
    id: "extensions",
    title: "Éviter d'installer n'importe quelle extension",
    pitch: "Une extension peut lire tout ce qui se passe dans votre navigateur.",
    detail:
      "Beaucoup d'extensions changent de mains, sont rachetées par des sociétés peu scrupuleuses et se mettent à exfiltrer des données. Limitez-vous à celles que vous utilisez vraiment, vérifiez l'éditeur et les permissions.",
    whyImportant: "Une extension peut accéder à tous les onglets ouverts, lire vos mots de passe saisis, et modifier les pages web. C'est un vecteur d'attaque très exploité.",
    commonMistake: "Accepter toutes les permissions sans les lire, ou garder des dizaines d'extensions installées et jamais utilisées.",
    benefit: "Réduction drastique de la surface d'attaque dans le navigateur",
    timeEstimate: "20 min pour auditer et nettoyer ses extensions",
    icon: Package,
    level: "Intermédiaire",
    tag: "appareils",
    linkedTutorials: [],
  },
  {
    id: "telechargements",
    title: "Faire attention aux téléchargements piratés",
    pitch: "« Gratuit » est rarement gratuit en sécurité.",
    detail:
      "Logiciels crackés, films piratés, jeux non officiels : ces fichiers sont une voie royale pour les malwares. Si vous tenez à l'utiliser, faites-le dans une VM jetable, jamais sur votre poste principal.",
    whyImportant: "Les fichiers piratés sont l'une des principales sources d'infection par malware et ransomware dans les environnements domestiques.",
    commonMistake: "Télécharger un logiciel depuis un site « free download » au lieu du site officiel de l'éditeur.",
    benefit: "Élimination d'un vecteur d'infection majeur",
    timeEstimate: "Immédiat - habitude à changer",
    icon: Download,
    level: "Intermédiaire",
    tag: "appareils",
    linkedTutorials: [],
  },
  {
    id: "permissions",
    title: "Auditer les permissions d'apps mobiles",
    pitch: "Un jeu de cartes n'a pas besoin de votre micro.",
    detail:
      "Tous les 3 mois, ouvrez Réglages > Confidentialité et passez en revue les permissions caméra, micro, contacts, localisation. Révoquer ce qui n'est pas indispensable réduit votre surface d'exposition.",
    whyImportant: "Des centaines d'applications abusent de l'accès au micro, à la caméra ou à la localisation pour du profilage publicitaire ou de l'espionnage.",
    commonMistake: "Accepter toutes les permissions au premier lancement sans y réfléchir.",
    benefit: "Réduction de la collecte de données et de l'espionnage passif",
    timeEstimate: "15 min tous les 3 mois",
    icon: Smartphone,
    level: "Intermédiaire",
    tag: "appareils",
    linkedTutorials: [],
  },
  {
    id: "sauvegarde-routine",
    title: "Garder une sauvegarde régulière hors ligne",
    pitch: "Un disque externe débranché bat un cloud compromis.",
    detail:
      "Un ransomware peut chiffrer vos sauvegardes en ligne. Une copie sur disque externe que vous débranchez après usage reste hors d'atteinte. Visez une sauvegarde par mois minimum, plus pour le critique.",
    whyImportant: "Les ransomwares ciblent en priorité les sauvegardes connectées. Une copie hors ligne non accessible depuis le réseau est la seule vraie protection.",
    commonMistake: "Ne compter que sur le cloud (OneDrive, Google Drive) synchronisé en temps réel, qui sera chiffré lui aussi en cas d'attaque.",
    benefit: "Récupération complète après ransomware ou panne matérielle",
    timeEstimate: "30 min pour mettre en place la routine mensuelle",
    icon: CloudOff,
    level: "Intermédiaire",
    tag: "données",
    linkedTutorials: [],
  },
  {
    id: "session",
    title: "Auditer les sessions actives sur ses comptes",
    pitch: "Un téléphone vendu sans déconnexion = un compte exposé.",
    detail:
      "Tous les 3 mois, passez sur Google, Microsoft, Apple, Facebook : déconnectez les sessions et appareils inconnus. Un audit rapide qui évite des heures d'incident.",
    whyImportant: "Un appareil vendu, prêté ou perdu peut garder un accès actif à vos comptes pendant des mois si vous ne vous déconnectez pas à distance.",
    commonMistake: "Vendre un ancien téléphone sans révoquer les sessions actives sur Google, Apple et les apps tierces.",
    benefit: "Contrôle total sur qui a accès à vos comptes",
    timeEstimate: "10 min tous les 3 mois",
    icon: Activity,
    level: "Intermédiaire",
    tag: "comptes",
    linkedTutorials: [],
  },

  /* Avancé */
  {
    id: "compartimenter",
    title: "Séparer ses usages perso / sensibles",
    pitch: "Un email pour la banque, un autre pour Netflix.",
    detail:
      "Multiplier les boîtes mails (et utiliser des aliases comme SimpleLogin) limite l'impact d'une fuite. Le compte critique reste invisible des sites grand public, donc invisible des pirates.",
    whyImportant: "Un seul compte email pour tout = un seul point de compromission. Si Netflix fuit, vos identifiants bancaires ne sont pas en danger si vous avez compartimenté.",
    commonMistake: "Utiliser la même adresse email principale pour s'inscrire sur des centaines de sites différents.",
    benefit: "Containment des fuites : chaque compartiment est indépendant",
    timeEstimate: "1h pour migrer vers des aliases avec SimpleLogin",
    icon: Repeat,
    level: "Avancé",
    tag: "comptes",
    linkedTutorials: [],
  },
  {
    id: "iot",
    title: "Isoler les objets connectés du reste du réseau",
    pitch: "Une cafetière connectée ne devrait jamais voir votre PC.",
    detail:
      "Les IoT sont les maillons faibles d'un réseau domestique. Mettez-les sur un SSID invité dédié, sans accès au LAN principal. Une grosse partie des box récentes le permet en deux clics.",
    whyImportant: "Les objets connectés sont rarement patchés et souvent vulnérables. Un attaquant qui compromet votre ampoule connectée peut ensuite rebondir vers votre NAS ou votre PC.",
    commonMistake: "Connecter tous les appareils sur le même réseau Wi-Fi principal sans isolation réseau.",
    benefit: "Isolation : une compromission IoT ne touche pas vos données",
    timeEstimate: "30 min pour configurer un réseau invité dédié",
    icon: Network,
    level: "Avancé",
    tag: "réseau",
    linkedTutorials: [],
  },
  {
    id: "phishing-cible",
    title: "Reconnaître un phishing ciblé",
    pitch: "Le « PDG urgent » par mail est presque toujours un faux.",
    detail:
      "Spear phishing et BEC (Business Email Compromise) imitent un proche, un PDG, un fournisseur. Mettez en place un canal de validation par téléphone systématique pour toute demande financière inhabituelle.",
    whyImportant: "Le phishing ciblé (spear phishing) utilise des informations personnelles collectées sur les réseaux sociaux pour paraître crédible. Les pertes financières peuvent être considérables.",
    commonMistake: "Agir dans l'urgence face à un mail du « PDG » demandant un virement immédiat sans vérification téléphonique.",
    benefit: "Résistance aux attaques de social engineering avancées",
    timeEstimate: "30 min pour comprendre les patterns d'attaque",
    icon: ShieldAlert,
    level: "Avancé",
    tag: "phishing",
    linkedTutorials: [{ id: 6, title: "Reconnaître une tentative de phishing" }],
  },
]

/* Recommandations techniques */
type TechCategory =
  | "logiciels"
  | "os"
  | "hardware"
  | "navigateur"
  | "confidentialite"
  | "sauvegarde"
  | "reseau"

interface TechReco {
  id: number
  title: string
  subtitle: string
  description: string
  urgency: "Haute" | "Moyenne" | "Faible"
  level: HabitudeLevel
  category: TechCategory
  icon: React.ComponentType<{ className?: string }>
  steps: string[]
  timeEstimate: string
  benefit: string
  whyImportant: string
  commonMistake: string
  linkedTutorials: LinkedTutorial[]
}

const TECH: TechReco[] = [
  /* Logiciels */
  {
    id: 1,
    title: "Installer un gestionnaire de mots de passe",
    subtitle: "Un seul mot de passe maître à retenir",
    description:
      "Bitwarden (gratuit, open source) ou 1Password permettent de générer et de stocker des mots de passe uniques pour chaque service.",
    urgency: "Haute",
    level: "Débutant",
    category: "logiciels",
    icon: Lock,
    steps: [
      "Choisissez Bitwarden (gratuit) ou 1Password",
      "Créez un mot de passe maître long et unique (phrase de passe)",
      "Activez la double authentification sur le coffre",
      "Importez vos mots de passe depuis votre navigateur",
      "Désactivez la mémorisation des mots de passe dans le navigateur",
    ],
    timeEstimate: "30 min",
    benefit: "Mots de passe uniques et solides sur tous vos comptes",
    whyImportant: "Sans gestionnaire, on réutilise inévitablement des mots de passe. Un credential stuffing suffit alors à compromettre tous vos comptes en cascade.",
    commonMistake: "Continuer à utiliser le gestionnaire du navigateur qui n'est pas protégé par une authentification forte.",
    linkedTutorials: [{ id: 2, title: "Installer Bitwarden" }],
  },
  {
    id: 2,
    title: "Configurer un antivirus moderne",
    subtitle: "Microsoft Defender suffit dans 90% des cas",
    description:
      "Sur Windows 10/11, Defender est compétitif. Sur macOS, gardez la protection système active et n'ajoutez pas plusieurs antivirus simultanément.",
    urgency: "Haute",
    level: "Débutant",
    category: "logiciels",
    icon: ShieldCheck,
    steps: [
      "Sécurité Windows > Protection contre les virus",
      "Activez la protection en temps réel",
      "Activez la protection contre les ransomwares (accès contrôlé aux dossiers)",
      "Lancez une analyse complète une fois par mois",
    ],
    timeEstimate: "10 min",
    benefit: "Protection en temps réel contre malwares et ransomwares",
    whyImportant: "Un antivirus actif détecte et bloque la majorité des malwares connus avant qu'ils s'exécutent. Sur Windows 11, Defender est compétitif face aux solutions tierces.",
    commonMistake: "Installer plusieurs antivirus simultanément, ce qui crée des conflits et ralentit la machine.",
    linkedTutorials: [],
  },
  {
    id: 3,
    title: "Configurer un VPN fiable",
    subtitle: "Sur Wi-Fi public et pour la confidentialité",
    description:
      "Un VPN payant et reconnu (Mullvad, ProtonVPN) protège votre trafic sur les réseaux non maîtrisés. Évitez les VPN gratuits.",
    urgency: "Moyenne",
    level: "Intermédiaire",
    category: "logiciels",
    icon: Globe,
    steps: [
      "Choisissez Mullvad ou ProtonVPN (essai gratuit)",
      "Installez l'application officielle",
      "Activez le kill switch (déconnexion si VPN tombe)",
      "Activez le DNS over HTTPS dans le navigateur en plus",
    ],
    timeEstimate: "20 min",
    benefit: "Confidentialité sur les réseaux non maîtrisés",
    whyImportant: "Sur un Wi-Fi ouvert ou étranger, sans VPN vos requêtes peuvent être interceptées. Un VPN chiffre le tunnel et masque votre adresse IP réelle.",
    commonMistake: "Utiliser un VPN gratuit qui revend lui-même vos données au lieu de les protéger.",
    linkedTutorials: [{ id: 12, title: "Sécuriser sa navigation web" }],
  },
  {
    id: 10,
    title: "Installer un outil de surveillance des fuites",
    subtitle: "Être alerté quand un compte fuit",
    description:
      "Have I Been Pwned, Firefox Monitor ou les services intégrés de Bitwarden / 1Password peuvent vous alerter quand votre email apparaît dans une fuite.",
    urgency: "Moyenne",
    level: "Débutant",
    category: "logiciels",
    icon: AlertTriangle,
    steps: [
      "Inscrivez votre email sur haveibeenpwned.com",
      "Activez les alertes Firefox Monitor",
      "Profitez des rapports automatiques de votre gestionnaire de mots de passe",
      "Changez immédiatement le mot de passe d'un compte qui apparaît dans une fuite",
    ],
    timeEstimate: "5 min",
    benefit: "Alerte immédiate si vos identifiants fuient",
    whyImportant: "Des milliards d'identifiants circulent sur le dark web après des fuites. Savoir rapidement que le vôtre est compromis permet de réagir avant qu'il soit exploité.",
    commonMistake: "Ne vérifier qu'une seule fois et oublier de s'inscrire aux alertes automatiques.",
    linkedTutorials: [],
  },

  /* OS */
  {
    id: 4,
    title: "Mettre à jour Windows / macOS",
    subtitle: "Les mises à jour ferment les portes ouvertes",
    description:
      "Windows 10 perd son support en octobre 2025. La mise à jour Windows 11 est gratuite et corrige des centaines de failles.",
    urgency: "Haute",
    level: "Débutant",
    category: "os",
    icon: Monitor,
    steps: [
      "Win+I > Système > Windows Update",
      "Cliquez sur « Vérifier les mises à jour »",
      "Téléchargez et installez Windows 11 si proposé",
      "Activez les mises à jour automatiques",
      "Redémarrez régulièrement (au moins une fois par semaine)",
    ],
    timeEstimate: "15-30 min",
    benefit: "Fermeture des failles exploitées activement",
    whyImportant: "Des milliers de failles sont publiées chaque année. Un OS non patché devient une cible facile pour les scripts d'exploitation automatisés.",
    commonMistake: "Repousser les mises à jour pour éviter les redémarrages et finir avec un système en retard de plusieurs mois.",
    linkedTutorials: [],
  },
  {
    id: 5,
    title: "Activer le pare-feu intégré",
    subtitle: "Première ligne de défense réseau",
    description:
      "Le pare-feu filtre les connexions entrantes non autorisées. Vérifiez qu'il est actif sur tous les profils réseau.",
    urgency: "Haute",
    level: "Débutant",
    category: "os",
    icon: ShieldCheck,
    steps: [
      "Sécurité Windows > Pare-feu et protection réseau",
      "Vérifiez : domaine, privé et public actifs",
      "macOS : Réglages > Réseau > Pare-feu",
      "N'autorisez que les apps explicitement nécessaires",
    ],
    timeEstimate: "5 min",
    benefit: "Blocage des connexions entrantes non autorisées",
    whyImportant: "Le pare-feu filtre les tentatives de connexion depuis l'extérieur. Un pare-feu désactivé laisse tous les ports accessibles depuis le réseau local.",
    commonMistake: "Désactiver le pare-feu pour « résoudre un problème réseau » sans le réactiver ensuite.",
    linkedTutorials: [],
  },
  {
    id: 11,
    title: "Limiter la télémétrie système",
    subtitle: "Réduire ce qui sort vers Microsoft / Apple",
    description:
      "Windows et macOS envoient des données de diagnostic et d'usage par défaut. Réduisez-les sans casser le système.",
    urgency: "Moyenne",
    level: "Avancé",
    category: "os",
    icon: Activity,
    steps: [
      "Windows : Confidentialité et sécurité > Diagnostic et commentaires",
      "Passez en « Données de diagnostic obligatoires uniquement »",
      "Désactivez l'historique d'activité et l'ID de publicité",
      "macOS : Réglages > Confidentialité > Analyse, décochez le partage",
      "Sur Windows Pro, complétez via les stratégies de groupe (gpedit.msc)",
    ],
    timeEstimate: "15 min",
    benefit: "Réduction des données envoyées à Microsoft / Apple",
    whyImportant: "Par défaut, Windows et macOS envoient des données d'usage détaillées. Minimiser la télémétrie réduit votre exposition sans impacter les fonctionnalités.",
    commonMistake: "Utiliser des outils tiers agressifs qui désactivent des services critiques et déstabilisent l'OS.",
    linkedTutorials: [],
  },
  {
    id: 12,
    title: "Auditer les services au démarrage",
    subtitle: "Identifier ce qui se lance avec Windows",
    description:
      "Beaucoup de logiciels installent des services qui démarrent avec Windows. Faites le ménage avec Autoruns (Sysinternals).",
    urgency: "Faible",
    level: "Avancé",
    category: "os",
    icon: Cog,
    steps: [
      "Téléchargez Autoruns (Microsoft Sysinternals)",
      "Exécutez en administrateur",
      "Activez « Hide Microsoft Entries » et « Hide Windows Entries »",
      "Désactivez (sans supprimer) les entrées non reconnues",
      "Vérifiez les entrées suspectes sur VirusTotal",
    ],
    timeEstimate: "30 min",
    benefit: "Suppression des programmes qui s'exécutent silencieusement",
    whyImportant: "Les malwares persistants s'installent souvent dans le démarrage Windows. Auditer régulièrement permet de détecter des intrus non visibles dans la liste des applications.",
    commonMistake: "Désactiver des entrées Windows légitimes et déstabiliser le système faute d'avoir identifié correctement les processus.",
    linkedTutorials: [],
  },

  /* Hardware */
  {
    id: 6,
    title: "Chiffrer son disque dur",
    subtitle: "BitLocker (Windows Pro) ou FileVault (macOS)",
    description:
      "Si votre ordinateur est volé, le chiffrement empêche l'accès à vos données. Indispensable pour un portable.",
    urgency: "Haute",
    level: "Intermédiaire",
    category: "hardware",
    icon: Cpu,
    steps: [
      "Windows : Paramètres > Confidentialité et sécurité > Chiffrement",
      "Activez BitLocker (Windows Pro) ou Chiffrement de l'appareil",
      "macOS : Réglages > Confidentialité > FileVault > Activer",
      "Sauvegardez votre clé de récupération hors ligne",
    ],
    timeEstimate: "10 min (+ chiffrement en arrière-plan)",
    benefit: "Données inaccessibles en cas de vol ou perte",
    whyImportant: "Sans chiffrement, retirer le disque dur d'un ordinateur volé suffit à lire toutes vos données. Le chiffrement les rend illisibles sans le mot de passe.",
    commonMistake: "Ne pas sauvegarder la clé de récupération BitLocker - si Windows ne démarre plus, toutes les données sont perdues.",
    linkedTutorials: [{ id: 29, title: "Vérifier l'état du chiffrement disque" }],
  },
  {
    id: 7,
    title: "Mettre à jour les firmwares",
    subtitle: "Box, routeur, imprimante : eux aussi !",
    description:
      "Les box internet et routeurs sont des cibles privilégiées. Connectez-vous à l'interface admin pour vérifier les mises à jour.",
    urgency: "Moyenne",
    level: "Intermédiaire",
    category: "hardware",
    icon: Server,
    steps: [
      "Connectez-vous à l'interface admin de votre box (192.168.1.1 souvent)",
      "Cherchez la section « Mise à jour » ou « Firmware »",
      "Activez les mises à jour automatiques si disponible",
      "Changez le mot de passe admin par défaut",
    ],
    timeEstimate: "20 min",
    benefit: "Fermeture des failles connues sur la box / le routeur",
    whyImportant: "La box internet est exposée en permanence sur internet. Un firmware non mis à jour peut contenir des failles permettant d'intercepter tout le trafic du foyer.",
    commonMistake: "Ne jamais vérifier les mises à jour de la box parce qu'elle « fonctionne bien ».",
    linkedTutorials: [],
  },
  {
    id: 13,
    title: "Utiliser une clé de sécurité physique",
    subtitle: "YubiKey ou Titan Key pour la 2FA forte",
    description:
      "Une clé matérielle (FIDO2 / U2F) est la 2FA la plus résistante au phishing. Idéal pour vos comptes critiques.",
    urgency: "Faible",
    level: "Avancé",
    category: "hardware",
    icon: KeySquare,
    steps: [
      "Achetez deux clés (une principale, une de secours)",
      "Enregistrez-les sur Google, Microsoft, GitHub, votre gestionnaire de mots de passe",
      "Désactivez les autres méthodes 2FA si possible (SMS notamment)",
      "Stockez la clé de secours hors site",
    ],
    timeEstimate: "45 min",
    benefit: "2FA phishing-resistant sur vos comptes critiques",
    whyImportant: "Les codes SMS et TOTP sont vulnérables au phishing en temps réel. Une clé matérielle FIDO2 lie l'authentification au domaine exact, rendant le phishing inopérant.",
    commonMistake: "Acheter une seule clé - en cas de perte, vous êtes bloqué de vos comptes.",
    linkedTutorials: [],
  },

  /* Navigateur */
  {
    id: 8,
    title: "Installer uBlock Origin",
    subtitle: "Bloqueur de pubs et de traceurs",
    description:
      "uBlock Origin (extension navigateur, gratuite, open source) bloque les pubs et la majorité des traceurs publicitaires sans ralentir votre navigation.",
    urgency: "Moyenne",
    level: "Débutant",
    category: "navigateur",
    icon: Globe,
    steps: [
      "Ouvrez la boutique d'extensions de votre navigateur",
      "Cherchez « uBlock Origin » (par Raymond Hill)",
      "Installez l'extension officielle",
      "Conservez la configuration par défaut, déjà efficace",
    ],
    timeEstimate: "5 min",
    benefit: "Blocage des pubs et traceurs sans ralentissement",
    whyImportant: "Les publicités peuvent servir de vecteur d'attaque (malvertising). uBlock Origin bloque aussi les domaines malveillants connus et réduit la surface de tracking.",
    commonMistake: "Installer une version clonée d'uBlock ou confondre avec uBlock (sans 'Origin') qui appartient à un autre éditeur.",
    linkedTutorials: [],
  },
  {
    id: 9,
    title: "Utiliser Firefox ou Brave",
    subtitle: "Plus de contrôle sur la confidentialité",
    description:
      "Firefox et Brave protègent par défaut contre le pistage publicitaire et la prise d'empreinte du navigateur.",
    urgency: "Moyenne",
    level: "Intermédiaire",
    category: "navigateur",
    icon: Globe,
    steps: [
      "Téléchargez Firefox sur mozilla.org ou Brave sur brave.com",
      "Importez vos favoris depuis votre ancien navigateur",
      "Activez la protection contre le pistage en mode strict",
      "Définissez DuckDuckGo comme moteur par défaut (optionnel)",
    ],
    timeEstimate: "15 min",
    benefit: "Navigateur orienté vie privée par défaut",
    whyImportant: "Chrome envoie par défaut des données de navigation à Google. Firefox et Brave offrent une protection contre le tracking beaucoup plus solide sans configuration avancée.",
    commonMistake: "Conserver Chrome avec ses réglages par défaut tout en pensant naviguer de façon privée.",
    linkedTutorials: [{ id: 12, title: "Sécuriser sa navigation web" }],
  },
  {
    id: 14,
    title: "Cloisonner ses profils navigateur",
    subtitle: "Banque, perso, social : un profil par usage",
    description:
      "Les profils Firefox et les Multi-Account Containers isolent les cookies et le tracking par contexte d'usage.",
    urgency: "Faible",
    level: "Avancé",
    category: "navigateur",
    icon: Layers,
    steps: [
      "Lancez Firefox avec firefox -P pour gérer les profils",
      "Créez « banque », « perso », « social » comme profils distincts",
      "Installez l'extension Multi-Account Containers",
      "Affectez chaque site à un container dédié",
    ],
    timeEstimate: "30 min",
    benefit: "Isolation totale des cookies et sessions par contexte",
    whyImportant: "Sans cloisonnement, les traceurs publicitaires recoupent vos activités entre votre banque, vos réseaux sociaux et vos achats en ligne.",
    commonMistake: "Utiliser un seul profil pour tout et s'étonner d'une publicité ciblée sur un produit recherché dans un autre onglet.",
    linkedTutorials: [],
  },

  /* Confidentialité */
  {
    id: 15,
    title: "Configurer un DNS chiffré (DoH / DoT)",
    subtitle: "Empêcher l'observation de vos requêtes DNS",
    description:
      "Un DNS chiffré (Quad9, Cloudflare, NextDNS) empêche votre FAI ou un attaquant local de voir les sites que vous visitez.",
    urgency: "Moyenne",
    level: "Intermédiaire",
    category: "confidentialite",
    icon: Network,
    steps: [
      "Choisissez Quad9 (9.9.9.9), Cloudflare (1.1.1.1) ou NextDNS",
      "Windows 11 : Paramètres > Réseau > Modifier > DNS over HTTPS",
      "macOS Ventura+ : configurez via un profil de configuration",
      "Vérifiez avec 1.1.1.1/help ou dnscheck.tools",
    ],
    timeEstimate: "10 min",
    benefit: "Requêtes DNS chiffrées, invisibles de votre FAI",
    whyImportant: "Sans DoH, votre FAI et tout attaquant sur le réseau local peuvent voir chaque domaine que vous visitez, même sur des sites HTTPS.",
    commonMistake: "Configurer DoH uniquement dans le navigateur mais pas au niveau OS - les autres apps continuent d'utiliser le DNS en clair.",
    linkedTutorials: [],
  },
  {
    id: 16,
    title: "Utiliser des aliases d'email",
    subtitle: "Une adresse différente par service",
    description:
      "SimpleLogin, addy.io ou Apple Hide My Email permettent de créer une adresse jetable par service. Idéal pour limiter l'impact des fuites.",
    urgency: "Faible",
    level: "Avancé",
    category: "confidentialite",
    icon: Mail,
    steps: [
      "Créez un compte SimpleLogin ou addy.io (gratuit)",
      "Générez un alias dédié pour chaque inscription",
      "Si un alias commence à recevoir du spam, désactivez-le",
      "Centralisez les aliases dans votre gestionnaire de mots de passe",
    ],
    timeEstimate: "20 min",
    benefit: "Votre adresse principale reste inconnue des services tiers",
    whyImportant: "Chaque inscription avec votre vraie adresse email augmente le risque de spam, de phishing ciblé et de fuite. Un alias jetable coupe ce lien.",
    commonMistake: "Créer un alias mais continuer à utiliser sa vraie adresse pour les inscriptions courantes par habitude.",
    linkedTutorials: [],
  },
  {
    id: 17,
    title: "Limiter le suivi publicitaire mobile",
    subtitle: "Désactiver l'identifiant publicitaire",
    description:
      "iOS et Android exposent un identifiant publicitaire unique aux apps. Désactivez-le pour réduire le profilage.",
    urgency: "Moyenne",
    level: "Intermédiaire",
    category: "confidentialite",
    icon: Smartphone,
    steps: [
      "iOS : Réglages > Confidentialité > Suivi > désactivez « Autoriser les apps à demander »",
      "Android : Paramètres > Confidentialité > Annonces > Supprimer l'identifiant",
      "Réinitialisez l'identifiant tous les 6 mois",
      "Désactivez la personnalisation des annonces",
    ],
    timeEstimate: "5 min",
    benefit: "Réduction du profilage publicitaire sur mobile",
    whyImportant: "L'identifiant publicitaire permet aux régies de vous tracer à travers des dizaines d'apps. Le désactiver casse ce graphe de profilage.",
    commonMistake: "Ne désactiver que dans une app sans désactiver l'identifiant au niveau système.",
    linkedTutorials: [],
  },

  /* Sauvegarde */
  {
    id: 18,
    title: "Mettre en place la stratégie 3-2-1",
    subtitle: "3 copies, 2 supports, 1 hors site",
    description:
      "La règle 3-2-1 est le standard de l'industrie pour résister aux ransomwares et aux pannes matérielles.",
    urgency: "Haute",
    level: "Intermédiaire",
    category: "sauvegarde",
    icon: HardDrive,
    steps: [
      "Définissez vos données critiques (documents, photos, projets)",
      "Sauvegarde locale : disque externe + Time Machine ou Historique des fichiers",
      "Sauvegarde cloud chiffrée : Backblaze, Cryptomator + Drive",
      "Testez la restauration tous les 3 mois",
    ],
    timeEstimate: "1h",
    benefit: "Résistance totale aux ransomwares et pannes matérielles",
    whyImportant: "Une seule copie - même dans le cloud - ne suffit pas. Un ransomware synchronisé chiffre Drive. Une panne matérielle détruit la sauvegarde locale. La règle 3-2-1 élimine ces cas.",
    commonMistake: "Considérer OneDrive ou iCloud comme une sauvegarde alors qu'une suppression accidentelle se synchronise immédiatement sur tous les appareils.",
    linkedTutorials: [],
  },
  {
    id: 19,
    title: "Chiffrer ses sauvegardes cloud",
    subtitle: "Cryptomator pour Drive, Dropbox, OneDrive",
    description:
      "Vos sauvegardes cloud devraient être chiffrées côté client, avant l'envoi. Cryptomator fait ça simplement et gratuitement.",
    urgency: "Moyenne",
    level: "Intermédiaire",
    category: "sauvegarde",
    icon: Lock,
    steps: [
      "Installez Cryptomator (cryptomator.org, gratuit)",
      "Créez un coffre dans votre dossier Drive / Dropbox synchronisé",
      "Définissez un mot de passe long et unique",
      "Conservez votre clé de récupération hors ligne",
    ],
    timeEstimate: "20 min",
    benefit: "Sauvegardes illisibles même pour le fournisseur cloud",
    whyImportant: "Google, Microsoft et Dropbox peuvent lire vos fichiers en clair. En cas de compromission du compte ou de demande judiciaire, vos données sont exposées sans chiffrement côté client.",
    commonMistake: "Croire que le chiffrement HTTPS entre vous et le cloud suffit - il ne protège pas les données au repos sur les serveurs du fournisseur.",
    linkedTutorials: [],
  },

  /* Réseau */
  {
    id: 20,
    title: "Sécuriser sa box internet",
    subtitle: "WPA3 / WPA2-AES et désactivation WPS",
    description:
      "Le Wi-Fi domestique est trop souvent laissé en configuration usine. Quelques minutes suffisent à le durcir sérieusement.",
    urgency: "Haute",
    level: "Débutant",
    category: "reseau",
    icon: Wifi,
    steps: [
      "Connectez-vous à l'interface admin (192.168.1.1)",
      "Changez le mot de passe administrateur par défaut",
      "Passez la sécurité Wi-Fi en WPA3 ou WPA2-AES",
      "Désactivez WPS et UPnP",
      "Activez les mises à jour automatiques du firmware",
    ],
    timeEstimate: "20 min",
    benefit: "Wi-Fi domestique durci contre les accès non autorisés",
    whyImportant: "WPS est vulnérable aux attaques par force brute. Un mot de passe admin par défaut donne accès à toute la configuration réseau depuis le LAN.",
    commonMistake: "Garder le mot de passe Wi-Fi affiché sur l'étiquette de la box et ne jamais changer le mot de passe admin.",
    linkedTutorials: [],
  },
  {
    id: 21,
    title: "Créer un réseau invité pour les IoT",
    subtitle: "Cloisonner les objets connectés",
    description:
      "Les objets connectés sont rarement bien sécurisés. Un SSID invité dédié les empêche d'accéder à votre PC ou NAS.",
    urgency: "Moyenne",
    level: "Avancé",
    category: "reseau",
    icon: Network,
    steps: [
      "Activez le réseau invité dans l'interface de votre box",
      "Définissez-lui un mot de passe distinct",
      "Désactivez l'isolation client si plusieurs IoT doivent se parler",
      "Connectez TV, ampoules, thermostat sur ce réseau invité",
    ],
    timeEstimate: "15 min",
    benefit: "Objets connectés isolés du reste du réseau",
    whyImportant: "Les IoT ont rarement des mises à jour de sécurité et sont fréquemment vulnérables. Sans isolation, une ampoule connectée compromise peut rebondir vers votre NAS ou PC.",
    commonMistake: "Activer le réseau invité mais y connecter aussi des appareils de confiance par commodité, annulant l'isolation.",
    linkedTutorials: [],
  },
  {
    id: 22,
    title: "Auditer les ports ouverts sur sa box",
    subtitle: "Vérifier qu'aucun port n'est exposé sans raison",
    description:
      "UPnP peut ouvrir automatiquement des ports vers internet. Vérifiez et nettoyez ce qui est exposé depuis l'extérieur.",
    urgency: "Faible",
    level: "Avancé",
    category: "reseau",
    icon: Activity,
    steps: [
      "Désactivez UPnP dans l'interface de la box",
      "Listez les redirections de port actives, supprimez l'inutile",
      "Testez avec un scanner externe (shieldsup de grc.com)",
      "Re-vérifiez tous les 6 mois",
    ],
    timeEstimate: "20 min",
    benefit: "Aucun port inutile exposé sur internet",
    whyImportant: "UPnP peut ouvrir automatiquement des ports vers internet sans que vous le sachiez. Les scanners automatisés testent en permanence les plages d'IP publiques.",
    commonMistake: "Ne vérifier la configuration des ports qu'une seule fois et oublier qu'UPnP peut en rouvrir à tout moment.",
    linkedTutorials: [],
  },
]

const CATEGORY_LABELS: Record<
  TechCategory | "all",
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  all: { label: "Toutes", icon: Cog },
  logiciels: { label: "Logiciels", icon: Package },
  os: { label: "Système d'exploitation", icon: Monitor },
  hardware: { label: "Hardware / matériel", icon: Cpu },
  navigateur: { label: "Navigateur", icon: Globe },
  confidentialite: { label: "Confidentialité", icon: Eye },
  sauvegarde: { label: "Sauvegarde", icon: HardDrive },
  reseau: { label: "Réseau", icon: Network },
}

const HABITUDE_TAGS: Array<{ key: HabitudeTag | "all"; label: string }> = [
  { key: "all", label: "Tous" },
  { key: "comptes", label: "Comptes" },
  { key: "phishing", label: "Phishing" },
  { key: "réseau", label: "Réseau" },
  { key: "appareils", label: "Appareils" },
  { key: "données", label: "Données" },
]

function RecommandationsContent() {
  const router = useRouter()
  const params = useSearchParams()
  const typeParam = params.get("type")

  // Derive view directly from URL so "Vue d'ensemble" (/recommandations, no ?type)
  // always resets to the hub, even when navigated from a sub-view.
  const view: "hub" | "habitudes" | "techniques" =
    typeParam === "habitudes" ? "habitudes" : typeParam === "techniques" ? "techniques" : "hub"

  const setView = (v: "habitudes" | "techniques") => {
    router.push(`/recommandations?type=${v}`)
  }

  const goHub = () => {
    router.push("/recommandations")
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] font-sans">
      <Navbar onSignupClick={() => router.push("/compte/creer")} />

      <main className="flex-1">
        {view === "hub" && <RecoHub onSelect={setView} />}
        {view === "habitudes" && <HabitudesView onBack={goHub} />}
        {view === "techniques" && (
          <TechniquesView onBack={goHub} initialCat={params.get("cat")} />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function RecommandationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
          <div className="w-8 h-8 border-2 border-[#157FE2] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RecommandationsContent />
    </Suspense>
  )
}

/* Hub view */
function RecoHub({ onSelect }: { onSelect: (v: "habitudes" | "techniques") => void }) {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  return (
    <>
      {/* Hero */}
      <section className="bg-[#C3E8FF] border-b border-[#B3DBEF]">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
          <ScBadge tone="info" className="mb-4">
            Centre d&apos;action SafeCheck
          </ScBadge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#000] mb-4 text-balance">
            Des recommandations concrètes, priorisées selon votre profil.
          </h1>
          <p className="text-base md:text-lg text-[#000]/80 max-w-3xl mx-auto leading-relaxed text-pretty">
            Ces recommandations sont utiles à tous. Mais c&apos;est l&apos;audit SafeCheck qui vous indique lesquelles
            appliquer en priorité, selon votre situation réelle.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isLoggedIn ? (
              <ScButton variant="primary" onClick={() => router.push("/compte")}>
                <BarChart2 className="w-4 h-4" />
                Voir mon plan d&apos;action personnalisé
              </ScButton>
            ) : (
              <ScButton variant="primary" onClick={() => router.push("/audits")}>
                <TrendingUp className="w-4 h-4" />
                Passer l&apos;audit pour mes recommandations personnalisées
              </ScButton>
            )}
            <ScButton variant="secondary" onClick={() => onSelect("habitudes")}>
              Explorer les recommandations
            </ScButton>
          </div>
        </div>
      </section>

      {/* Comment utiliser les recommandations */}
      <section className="border-b border-[color:var(--sc-border)] bg-[color:var(--sc-surface-2)]">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-12">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-extrabold text-[color:var(--sc-text)] text-balance">
              Comment utiliser les recommandations ?
            </h2>
            <p className="text-sm text-[color:var(--sc-text-muted)] mt-2 max-w-xl mx-auto">
              Un parcours simple pour progresser de façon structurée, sans se noyer dans les détails.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: "1",
                icon: Brain,
                title: "Comprendre les bons réflexes",
                desc: "Commencez par les habitudes du quotidien. Pas d\u2019installation, pas de technique : juste les attitudes qui éliminent 80\u00a0% des risques.",
                tone: "success" as const,
                label: "Bonnes habitudes",
              },
              {
                step: "2",
                icon: Cog,
                title: "Appliquer les configurations techniques",
                desc: "Renforcez votre posture avec des outils et paramètres concrets\u00a0: gestionnaire de mots de passe, chiffrement, VPN, pare-feu.",
                tone: "info" as const,
                label: "Recommandations techniques",
              },
              {
                step: "3",
                icon: Target,
                title: "Prioriser avec l\u2019audit SafeCheck",
                desc: "L\u2019audit analyse votre profil et génère un plan d\u2019action personnalisé. Vous savez exactement quoi faire en premier.",
                tone: "premium" as const,
                label: "Audit SafeCheck",
              },
            ].map(({ step, icon: Icon, title, desc, tone, label }) => (
              <div
                key={step}
                className="relative flex flex-col gap-3 rounded-xl p-5 bg-[color:var(--sc-surface)]"
                style={{ border: "1px solid var(--sc-border)", boxShadow: "var(--sc-shadow-sm)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[color:var(--sc-blue)] text-white text-sm font-extrabold flex items-center justify-center">
                    {step}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-[#C3E8FF] flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-[#157FE2]" />
                  </div>
                </div>
                <h3 className="font-bold text-[color:var(--sc-text)] text-sm leading-snug">{title}</h3>
                <p className="text-xs text-[color:var(--sc-text-muted)] leading-relaxed">{desc}</p>
                <ScBadge tone={tone} className="self-start mt-auto">{label}</ScBadge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two family cards */}
      <section className="max-w-5xl mx-auto px-4 py-10 md:py-14 grid grid-cols-1 md:grid-cols-2 gap-5">
        <button
          onClick={() => onSelect("habitudes")}
          className="text-left rounded-xl p-6 md:p-8 bg-[#FFFFFF] flex flex-col gap-3 transition-all hover:-translate-y-1 cursor-pointer group"
          style={{ border: "1px solid #B3DBEF", boxShadow: "4px 4px 0px #C0DDF8" }}
        >
          <div className="w-14 h-14 rounded-lg bg-[#C3E8FF] flex items-center justify-center transition-transform group-hover:scale-110">
            <Brain className="w-7 h-7 text-[#157FE2]" />
          </div>
          <ScBadge tone="success" className="self-start">
            Bonnes habitudes &amp; réflexes
          </ScBadge>
          <h2 className="text-xl md:text-2xl font-extrabold text-[#000] text-balance">
            Les réflexes qui changent tout, sans jargon.
          </h2>
          <p className="text-sm text-[#000]/75 leading-relaxed">
            Adoptez les bons gestes au quotidien. Pas besoin d&apos;être technique, juste les bonnes attitudes au bon
            moment.
          </p>

          {/* Metadata row */}
          <div className="mt-1 grid grid-cols-2 gap-2">
            {[
              { icon: BookMarked, label: `${HABITUDES.length} réflexes` },
              { icon: Zap, label: "Sans installation" },
              { icon: Clock, label: "5 min pour commencer" },
              { icon: Star, label: "Idéal pour débuter" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-[#000]/65">
                <Icon className="w-3.5 h-3.5 text-[#157FE2] shrink-0" />
                {label}
              </div>
            ))}
          </div>

          <div className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#157FE2]">
            Voir les bonnes habitudes <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        <button
          onClick={() => onSelect("techniques")}
          className="text-left rounded-xl p-6 md:p-8 bg-[#FFFFFF] flex flex-col gap-3 transition-all hover:-translate-y-1 cursor-pointer group"
          style={{ border: "1px solid #B3DBEF", boxShadow: "4px 4px 0px #C0DDF8" }}
        >
          <div className="w-14 h-14 rounded-lg bg-[#C3E8FF] flex items-center justify-center transition-transform group-hover:scale-110">
            <Cog className="w-7 h-7 text-[#157FE2]" />
          </div>
          <ScBadge tone="info" className="self-start">
            Recommandations techniques
          </ScBadge>
          <h2 className="text-xl md:text-2xl font-extrabold text-[#000] text-balance">
            Les configurations qui renforcent durablement votre posture.
          </h2>
          <p className="text-sm text-[#000]/75 leading-relaxed">
            Logiciels, OS, hardware, navigateurs, confidentialité, sauvegarde, réseau\u00a0: les actions concrètes à
            appliquer pour un impact durable.
          </p>

          {/* Metadata row */}
          <div className="mt-1 grid grid-cols-2 gap-2">
            {[
              { icon: ClipboardList, label: `${TECH.length} configurations` },
              { icon: Monitor, label: "Logiciels, OS, réseau" },
              { icon: BarChart2, label: "Débutant à avancé" },
              { icon: TrendingUp, label: "Impact durable" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-[#000]/65">
                <Icon className="w-3.5 h-3.5 text-[#157FE2] shrink-0" />
                {label}
              </div>
            ))}
          </div>

          <div className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#157FE2]">
            Voir les recommandations techniques <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </section>
    </>
  )
}

/* Habitudes view �� */
/* Status helpers */
const STATUS_LABELS: Record<StatusKey, { label: string; color: string }> = {
  todo: { label: "À faire", color: "text-[color:var(--sc-text-muted)] bg-[color:var(--sc-surface-2)] border-[color:var(--sc-border)]" },
  "en-cours": { label: "En cours", color: "text-amber-700 bg-amber-50 border-amber-200" },
  fait: { label: "Fait", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  sauvegarde: { label: "Sauvegardé", color: "text-[color:var(--sc-blue)] bg-[#EEF4FF] border-[#C3DAFD]" },
}

function HabitudesView({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<Habitude | null>(null)
  const [levelFilter, setLevelFilter] = useState<"all" | HabitudeLevel>("all")
  const [tagFilter, setTagFilter] = useState<"all" | HabitudeTag>("all")
  const [statuses, setStatuses] = useState<Record<string, StatusKey>>({})

  const filtered = useMemo(
    () =>
      HABITUDES.filter((h) => {
        if (levelFilter !== "all" && h.level !== levelFilter) return false
        if (tagFilter !== "all" && h.tag !== tagFilter) return false
        return true
      }),
    [levelFilter, tagFilter],
  )

  const cycleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const order: StatusKey[] = ["todo", "en-cours", "fait", "sauvegarde"]
    const current = statuses[id] ?? "todo"
    const next = order[(order.indexOf(current) + 1) % order.length]
    setStatuses((s) => ({ ...s, [id]: next }))
  }

  return (
    <>
      <section className="bg-[#C3E8FF] border-b border-[#B3DBEF]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm mb-4">
            <button
              onClick={onBack}
              className="text-[#157FE2] hover:underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Recommandations
            </button>
            <span className="text-[#000]/40" aria-hidden="true">/</span>
            <span className="text-[#000]/70 font-semibold">Bonnes habitudes</span>
          </nav>

          <h1 className="text-2xl md:text-4xl font-extrabold text-[#000] mb-2 text-balance">
            Les réflexes qui changent tout, sans jargon.
          </h1>
          <p className="text-sm md:text-base text-[#000]/80 max-w-3xl">
            {HABITUDES.length} réflexes structurés par niveau et par thème. Intégrés au quotidien, ils suppriment une
            grande partie des risques sans rien avoir à installer.
          </p>

          {/* Filters */}
          <div className="space-y-3 mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[#000]/70 uppercase tracking-wider mr-1 inline-flex items-center gap-1">
                <FilterIcon className="w-3 h-3" /> Niveau
              </span>
              {(["all", "Débutant", "Intermédiaire", "Avancé"] as const).map((lvl) => (
                <FilterChip
                  key={lvl}
                  active={levelFilter === lvl}
                  onClick={() => setLevelFilter(lvl as "all" | HabitudeLevel)}
                >
                  {lvl === "all" ? "Tous niveaux" : lvl}
                </FilterChip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[#000]/70 uppercase tracking-wider mr-1 inline-flex items-center gap-1">
                <FilterIcon className="w-3 h-3" /> Thème
              </span>
              {HABITUDE_TAGS.map((tag) => (
                <FilterChip key={tag.key} active={tagFilter === tag.key} onClick={() => setTagFilter(tag.key)}>
                  {tag.label}
                </FilterChip>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#000]/60 mt-4">
            {filtered.length} habitude{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((h, i) => {
          const Icon = h.icon
          const status = statuses[h.id] ?? "todo"
          const { label: statusLabel, color: statusColor } = STATUS_LABELS[status]
          return (
            <button
              key={h.id}
              onClick={() => setSelected(h)}
              className="text-left rounded-xl p-5 bg-[#FFFFFF] flex flex-col gap-3 sc-fade-in transition-all hover:-translate-y-1"
              style={{
                animationDelay: `${i * 40}ms`,
                border: "1px solid #B3DBEF",
                boxShadow: "3px 3px 0px #C0DDF8",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-10 h-10 rounded-lg bg-[#C3E8FF] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#157FE2]" />
                  </div>
                  <ScBadge
                    tone={h.level === "Débutant" ? "success" : h.level === "Intermédiaire" ? "info" : "premium"}
                  >
                    {h.level}
                  </ScBadge>
                  <ScBadge tone="muted">{h.tag}</ScBadge>
                </div>
                <button
                  onClick={(e) => cycleStatus(h.id, e)}
                  className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${statusColor}`}
                  title="Changer le statut"
                >
                  {statusLabel}
                </button>
              </div>
              <h3 className="font-bold text-base text-[#000]">{h.title}</h3>
              <p className="text-sm text-[#000]/70 leading-relaxed">{h.pitch}</p>
              <div className="flex items-center gap-3 text-xs text-[#000]/55 mt-1">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {h.timeEstimate}
                </span>
              </div>
              <span className="text-xs text-[#157FE2] font-semibold mt-auto inline-flex items-center gap-1">
                En savoir plus <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          )
        })}
      </section>

      {selected && (
        <HabitudeDetail
          h={selected}
          onClose={() => setSelected(null)}
          status={statuses[selected.id] ?? "todo"}
          onStatusChange={(s) => setStatuses((prev) => ({ ...prev, [selected.id]: s }))}
        />
      )}
    </>
  )
}

function HabitudeDetail({
  h,
  onClose,
  status,
  onStatusChange,
}: {
  h: Habitude
  onClose: () => void
  status: StatusKey
  onStatusChange: (s: StatusKey) => void
}) {
  const Icon = h.icon
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl bg-[#FFFFFF] sc-fade-in max-h-[90vh] overflow-y-auto"
        style={{ border: "1px solid #B3DBEF", boxShadow: "5px 5px 0px #C0DDF8" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#C3E8FF] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#157FE2]" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#000] leading-tight">{h.title}</h3>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <ScBadge tone={h.level === "Débutant" ? "success" : h.level === "Intermédiaire" ? "info" : "premium"}>
                    {h.level}
                  </ScBadge>
                  <ScBadge tone="muted">{h.tag}</ScBadge>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-[#F6F6F6] rounded shrink-0" aria-label="Fermer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#000]/65 bg-[#F8FAFC] rounded-lg px-3 py-2 border border-[#E2E8F0]">
              <Clock className="w-3.5 h-3.5 text-[#157FE2] shrink-0" />
              {h.timeEstimate}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#000]/65 bg-[#F8FAFC] rounded-lg px-3 py-2 border border-[#E2E8F0]">
              <Zap className="w-3.5 h-3.5 text-[#157FE2] shrink-0" />
              {h.benefit}
            </div>
          </div>

          {/* Pourquoi c'est important */}
          <div>
            <h4 className="font-bold text-sm text-[#000] mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#157FE2]" />
              Pourquoi c&apos;est important
            </h4>
            <p className="text-sm text-[#000]/75 leading-relaxed">{h.whyImportant}</p>
          </div>

          {/* Explication détaillée */}
          <div>
            <h4 className="font-bold text-sm text-[#000] mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#157FE2]" />
              En détail
            </h4>
            <p className="text-sm text-[#000]/70 leading-relaxed">{h.detail}</p>
          </div>

          {/* Erreur fréquente */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <h4 className="font-bold text-xs text-amber-700 mb-1 flex items-center gap-1.5 uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5" />
              Erreur fréquente
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">{h.commonMistake}</p>
          </div>

          {/* Tutoriels liés */}
          {h.linkedTutorials.length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-[#000] mb-2 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-[#157FE2]" />
                Tutoriels liés
              </h4>
              <div className="flex flex-col gap-2">
                {h.linkedTutorials.map((tuto) => (
                  <a
                    key={tuto.id}
                    href={`/tutoriels/${tuto.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#157FE2] hover:underline bg-[#EEF4FF] px-3 py-2 rounded-lg border border-[#C3DAFD]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <BookMarked className="w-3.5 h-3.5 shrink-0" />
                    {tuto.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Status picker */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#000]/60 font-medium">Statut :</span>
            {(["todo", "en-cours", "fait", "sauvegarde"] as StatusKey[]).map((s) => {
              const { label, color } = STATUS_LABELS[s]
              return (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${ status === s ? color : "text-[#000]/40 bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#B3DBEF]" }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* CTAs */}
          <div className="flex justify-end gap-2 mt-1">
            <ScButton
              variant="secondary"
              onClick={() => { onStatusChange("fait"); onClose() }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Marquer comme fait
            </ScButton>
            <ScButton variant="primary" onClick={onClose}>
              Compris
            </ScButton>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Techniques view */
function TechniquesView({ onBack, initialCat }: { onBack: () => void; initialCat: string | null }) {
  const [cat, setCat] = useState<string>(initialCat ?? "all")
  const [levelFilter, setLevelFilter] = useState<"all" | HabitudeLevel>("all")
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "Haute" | "Moyenne" | "Faible">("all")
  const [selected, setSelected] = useState<TechReco | null>(null)
  const [statuses, setStatuses] = useState<Record<number, StatusKey>>({})

  const filtered = useMemo(
    () =>
      TECH.filter((t) => {
        if (cat !== "all" && t.category !== cat) return false
        if (levelFilter !== "all" && t.level !== levelFilter) return false
        if (urgencyFilter !== "all" && t.urgency !== urgencyFilter) return false
        return true
      }),
    [cat, levelFilter, urgencyFilter],
  )

  const cycleStatus = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const order: StatusKey[] = ["todo", "en-cours", "fait", "sauvegarde"]
    const current = statuses[id] ?? "todo"
    const next = order[(order.indexOf(current) + 1) % order.length]
    setStatuses((s) => ({ ...s, [id]: next }))
  }

  return (
    <>
      <section className="bg-[#C3E8FF] border-b border-[#B3DBEF]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm mb-4">
            <button
              onClick={onBack}
              className="text-[#157FE2] hover:underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Recommandations
            </button>
            <span className="text-[#000]/40" aria-hidden="true">/</span>
            <span className="text-[#000]/70 font-semibold">Techniques</span>
          </nav>

          <h1 className="text-2xl md:text-4xl font-extrabold text-[#000] mb-2 text-balance">
            Les configurations et outils qui renforcent durablement votre posture.
          </h1>
          <p className="text-sm md:text-base text-[#000]/80 max-w-3xl">
            {TECH.length} recommandations classées par catégorie, niveau et urgence. Cliquez sur une carte pour
            voir les étapes détaillées, les tutoriels liés et l&apos;explication complète.
          </p>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mt-5">
            {Object.entries(CATEGORY_LABELS).map(([key, { label, icon: Icon }]) => {
              const count = key === "all" ? TECH.length : TECH.filter((t) => t.category === key).length
              return (
                <button
                  key={key}
                  onClick={() => setCat(key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${ cat === key ? "text-white border border-transparent bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] shadow-[0_4px_12px_-3px_rgba(37,99,235,0.40)]" : "bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] border border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)]" }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {key !== "all" && (
                    <span className={`ml-0.5 ${cat === key ? "opacity-75" : "opacity-50"}`}>({count})</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Sub-filters */}
          <div className="space-y-3 mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[#000]/70 uppercase tracking-wider mr-1 inline-flex items-center gap-1">
                <FilterIcon className="w-3 h-3" /> Niveau
              </span>
              {(["all", "Débutant", "Intermédiaire", "Avancé"] as const).map((lvl) => (
                <FilterChip
                  key={lvl}
                  active={levelFilter === lvl}
                  onClick={() => setLevelFilter(lvl as "all" | HabitudeLevel)}
                >
                  {lvl === "all" ? "Tous" : lvl}
                </FilterChip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[#000]/70 uppercase tracking-wider mr-1 inline-flex items-center gap-1">
                <FilterIcon className="w-3 h-3" /> Urgence
              </span>
              {(["all", "Haute", "Moyenne", "Faible"] as const).map((u) => (
                <FilterChip
                  key={u}
                  active={urgencyFilter === u}
                  onClick={() => setUrgencyFilter(u as typeof urgencyFilter)}
                >
                  {u === "all" ? "Toutes" : u}
                </FilterChip>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#000]/60 mt-4">
            {filtered.length} recommandation{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#B3DBEF] bg-[#FFFFFF] p-10 text-center">
            <p className="text-sm text-[#000]/60">
              Aucune recommandation ne correspond à vos filtres pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t, i) => {
              const Icon = t.icon
              const status = statuses[t.id] ?? "todo"
              const { label: statusLabel, color: statusColor } = STATUS_LABELS[status]
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className="text-left rounded-xl p-5 bg-[#FFFFFF] flex flex-col gap-3 sc-fade-in transition-all hover:-translate-y-1"
                  style={{
                    animationDelay: `${i * 40}ms`,
                    border: t.urgency === "Haute" ? "1px solid #FCA5A5" : "1px solid #B3DBEF",
                    boxShadow: t.urgency === "Haute" ? "3px 3px 0px #FECACA" : "3px 3px 0px #C0DDF8",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-10 h-10 rounded-lg bg-[#C3E8FF] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#157FE2]" />
                      </div>
                      <ScBadge tone={t.urgency === "Haute" ? "warn" : t.urgency === "Moyenne" ? "info" : "muted"}>
                        {t.urgency === "Haute" && <AlertTriangle className="w-3 h-3" />}
                        {t.urgency}
                      </ScBadge>
                      <ScBadge tone={t.level === "Débutant" ? "success" : t.level === "Intermédiaire" ? "info" : "premium"}>
                        {t.level}
                      </ScBadge>
                    </div>
                    <button
                      onClick={(e) => cycleStatus(t.id, e)}
                      className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${statusColor}`}
                      title="Changer le statut"
                    >
                      {statusLabel}
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-[#000]">{t.title}</h3>
                  <p className="text-xs text-[#000]/60 italic">{t.subtitle}</p>
                  <p className="text-sm text-[#000]/75 leading-relaxed line-clamp-2">{t.description}</p>

                  <div className="flex items-center gap-3 text-xs text-[#000]/55 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {t.timeEstimate}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#000]/40">
                      {CATEGORY_LABELS[t.category].label}
                    </span>
                  </div>

                  <span className="text-xs text-[#157FE2] font-semibold mt-auto inline-flex items-center gap-1">
                    Voir les étapes <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {selected && (
        <TechDetail
          t={selected}
          onClose={() => setSelected(null)}
          status={statuses[selected.id] ?? "todo"}
          onStatusChange={(s) => setStatuses((prev) => ({ ...prev, [selected.id]: s }))}
        />
      )}
    </>
  )
}

function TechDetail({
  t,
  onClose,
  status,
  onStatusChange,
}: {
  t: TechReco
  onClose: () => void
  status: StatusKey
  onStatusChange: (s: StatusKey) => void
}) {
  const Icon = t.icon
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-xl bg-[#FFFFFF] sc-fade-in max-h-[90vh] overflow-y-auto"
        style={{ border: "1px solid #B3DBEF", boxShadow: "5px 5px 0px #C0DDF8" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#C3E8FF] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#157FE2]" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#000] leading-tight">{t.title}</h3>
                <p className="text-xs text-[#000]/55 italic mt-0.5">{t.subtitle}</p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <ScBadge tone={t.urgency === "Haute" ? "warn" : t.urgency === "Moyenne" ? "info" : "muted"}>
                    {t.urgency === "Haute" && <AlertTriangle className="w-3 h-3" />}
                    {t.urgency}
                  </ScBadge>
                  <ScBadge tone={t.level === "Débutant" ? "success" : t.level === "Intermédiaire" ? "info" : "premium"}>
                    {t.level}
                  </ScBadge>
                  <ScBadge tone="muted">{CATEGORY_LABELS[t.category].label}</ScBadge>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-[#F6F6F6] rounded shrink-0" aria-label="Fermer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#000]/65 bg-[#F8FAFC] rounded-lg px-3 py-2 border border-[#E2E8F0]">
              <Clock className="w-3.5 h-3.5 text-[#157FE2] shrink-0" />
              {t.timeEstimate}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#000]/65 bg-[#F8FAFC] rounded-lg px-3 py-2 border border-[#E2E8F0]">
              <Zap className="w-3.5 h-3.5 text-[#157FE2] shrink-0" />
              {t.benefit}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-[#000]/80 leading-relaxed">{t.description}</p>

          {/* Pourquoi c'est important */}
          <div>
            <h4 className="font-bold text-sm text-[#000] mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#157FE2]" />
              Pourquoi c&apos;est important
            </h4>
            <p className="text-sm text-[#000]/75 leading-relaxed">{t.whyImportant}</p>
          </div>

          {/* Étapes */}
          <div>
            <h4 className="font-bold text-sm text-[#000] mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#157FE2]" />
              Étapes à suivre
            </h4>
            <ol className="space-y-2.5">
              {t.steps.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#157FE2] text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#000]/85 leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Erreur fréquente */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <h4 className="font-bold text-xs text-amber-700 mb-1 flex items-center gap-1.5 uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5" />
              Erreur fréquente
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">{t.commonMistake}</p>
          </div>

          {/* Tutoriels liés */}
          {t.linkedTutorials.length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-[#000] mb-2 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-[#157FE2]" />
                Tutoriels liés
              </h4>
              <div className="flex flex-col gap-2">
                {t.linkedTutorials.map((tuto) => (
                  <a
                    key={tuto.id}
                    href={`/tutoriels/${tuto.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#157FE2] hover:underline bg-[#EEF4FF] px-3 py-2 rounded-lg border border-[#C3DAFD]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <BookMarked className="w-3.5 h-3.5 shrink-0" />
                    {tuto.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Status picker */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#000]/60 font-medium">Statut :</span>
            {(["todo", "en-cours", "fait", "sauvegarde"] as StatusKey[]).map((s) => {
              const { label, color } = STATUS_LABELS[s]
              return (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${ status === s ? color : "text-[#000]/40 bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#B3DBEF]" }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* CTAs */}
          <div className="flex justify-end gap-2">
            <ScButton
              variant="secondary"
              onClick={() => { onStatusChange("fait"); onClose() }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Marquer comme fait
            </ScButton>
            <ScButton variant="primary" onClick={onClose}>
              Compris
            </ScButton>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Reusable filter chip */
function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${ active ? "text-white border border-transparent bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] shadow-[0_4px_12px_-3px_rgba(37,99,235,0.40)]" : "bg-[#FFFFFF] text-[#000]/70 border border-[#B3DBEF] hover:border-[#157FE2] hover:text-[#157FE2]" }`}
    >
      {children}
    </button>
  )
}
