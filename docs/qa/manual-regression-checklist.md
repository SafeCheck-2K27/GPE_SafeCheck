# Checklist manuelle de régression frontend

Cette checklist conserve les scénarios navigateur importants après le retrait de
Playwright. Elle doit être exécutée pour toute modification significative de
l'interface, de la navigation, des providers, des paramètres d'URL ou des
primitives partagées.

## Fiche d'exécution

```text
Date :
Opérateur :
Branche / commit :
Navigateur et version :
Système :
Commande de démarrage :
Résultat build :
Anomalies connues avant test :
```

Utiliser un build de production lorsque le changement concerne le rendu serveur,
l'hydratation ou les paramètres d'URL :

```bash
npm run build
npm run start
```

Ouvrir les outils de développement et conserver la console visible pendant les
parcours. Tester avec un profil local vierge, puis avec un utilisateur mocké
connecté lorsque le scénario le demande.

## Matrice obligatoire

Exécuter les contrôles globaux et les routes touchées dans chaque case :

| Largeur | Hauteur indicative | Clair | Sombre |
|---:|---:|:---:|:---:|
| 320 px | 720 px | [ ] | [ ] |
| 360 px | 800 px | [ ] | [ ] |
| 390 px | 844 px | [ ] | [ ] |
| 768 px | 1024 px | [ ] | [ ] |
| 1024 px | 768 px | [ ] | [ ] |
| 1280 px | 800 px | [ ] | [ ] |

Pour chaque case validée :

- [ ] aucune barre de défilement horizontale sur la page ;
- [ ] aucun texte, contrôle ou média ne sort de son conteneur ;
- [ ] les contenus principaux restent visibles et atteignables ;
- [ ] les états hover, focus, active et disabled restent lisibles ;
- [ ] le thème sélectionné survit à une navigation et à un rechargement ;
- [ ] aucune erreur React, hydratation, chargement ou runtime dans la console ;
- [ ] aucune requête inattendue en échec dans l'onglet réseau.

## Navigation globale

### Navbar desktop

- [ ] le logo ouvre `/accueil` ;
- [ ] les menus Audits, Tutoriels, Essentiels, Recommandations et Découvrir
  s'ouvrent au clic ;
- [ ] un seul menu est ouvert à la fois ;
- [ ] un clic à l'extérieur ferme le menu ;
- [ ] chaque lien ferme le menu et ouvre la bonne route ;
- [ ] le menu Audits ouvert ne provoque aucun débordement horizontal ;
- [ ] les toggles langue et thème sont utilisables au clavier ;
- [ ] Connexion, Créer un compte, Mon profil et Déconnexion ont un focus visible.

### Navbar mobile

- [ ] le bouton Menu est présent jusqu'au breakpoint desktop ;
- [ ] le drawer s'ouvre et se ferme sans déplacer la largeur de page ;
- [ ] toutes les sections et actions sont accessibles par défilement ;
- [ ] le drawer ouvert à 320, 360 et 390 px ne déborde pas horizontalement ;
- [ ] choisir un lien referme le drawer ;
- [ ] le focus clavier ne disparaît pas derrière le drawer.

### Footer

- [ ] tous les groupes de liens sont lisibles ;
- [ ] les liens internes pointent vers une route existante ;
- [ ] le footer ne recouvre pas le dernier contenu de la page.

## Parcours principaux

### Landing `/`

- [ ] le contenu de marque est visible dès le premier viewport ;
- [ ] Découvrir la plateforme ouvre `/accueil` ;
- [ ] le CTA d'audit ouvre `/audit` ;
- [ ] les sections restent dans l'ordre et sans chevauchement ;
- [ ] la modale de connexion propre à la landing s'ouvre et se ferme.

### Accueil `/accueil`

- [ ] le titre et le CTA Passer le questionnaire restent visibles aux six
  largeurs ;
- [ ] les cartes et sections ne créent pas de débordement ;
- [ ] Voir les audits ouvre `/audits` ;
- [ ] les CTA Tutoriels, Essentiels et Recommandations ouvrent les bonnes routes.

### Audit `/audit`

- [ ] quatre réponses sont proposées et l'état choisi est identifiable ;
- [ ] Suivant reste désactivé sans réponse ;
- [ ] Précédent restaure la réponse déjà choisie ;
- [ ] la navigation directe par question conserve les réponses ;
- [ ] les dix questions peuvent être terminées ;
- [ ] Voir mes résultats ouvre `/personalisation` avec score et réponses valides ;
- [ ] la barre latérale ou barre de progression ouverte ne déborde pas à 320,
  360 ou 390 px.

### Personnalisation `/personalisation`

- [ ] les réponses et le score provenant de l'URL sont conservés ;
- [ ] les valeurs URL absentes ou invalides produisent un fallback compréhensible ;
- [ ] Passer cette étape ouvre `/resultats` sans perdre les paramètres utiles ;
- [ ] le formulaire est utilisable uniquement au clavier.

### Résultats `/resultats`

- [ ] les scores 0, 34, 35, 59, 60, 79, 80 et 100 affichent le bon niveau ;
- [ ] les recommandations conservent leur ordre et leurs liens ;
- [ ] une URL incomplète ou invalide ne fait pas planter la page ;
- [ ] les actions Audit, Audits, Tutoriels et création de compte fonctionnent ;
- [ ] la modale d'inscription respecte le thème et ne masque pas son contenu.

### Recommandations `/recommandations`

- [ ] le hub ouvre les vues habitudes et techniques ;
- [ ] `?type=habitudes` et `?type=techniques` survivent au rechargement ;
- [ ] chaque carte possède une action de détail et une action de statut distinctes ;
- [ ] aucun bouton n'est imbriqué dans un autre bouton ;
- [ ] le statut passe visiblement à En cours ;
- [ ] les modales Habitude et Technique se ferment par bouton, Échap et backdrop.

### Tutoriels `/tutoriels` et `/tutoriels/[id]`

- [ ] la recherche ignore casse et accents ;
- [ ] chaque filtre, niveau, statut, durée, type et tri donne un résultat cohérent ;
- [ ] Réinitialiser restaure l'URL et le catalogue par défaut ;
- [ ] un résultat ouvre la route détail canonique ;
- [ ] les liens directs et le rechargement d'un détail fonctionnent ;
- [ ] le tutoriel en modale s'ouvre, se parcourt et se ferme ;
- [ ] Signaler une précision ouvre une deuxième modale au-dessus de la première ;
- [ ] fermer la modale supérieure restitue le focus dans le tutoriel ;
- [ ] fermer la dernière modale restitue le focus à la carte du catalogue.

### Essentiels `/essentiels`

- [ ] `?q=gestionnaire` initialise le champ de recherche ;
- [ ] la recherche et les filtres restent utilisables au clavier ;
- [ ] chaque détail s'ouvre dans une modale nommée ;
- [ ] la modale se ferme par bouton, Échap et backdrop.

### Lexique `/lexique`

- [ ] la recherche et les filtres affichent des termes cohérents ;
- [ ] `?terme=phishing` ouvre le drawer au rechargement ;
- [ ] le drawer est collé au bord droit et limité au viewport ;
- [ ] le drawer occupe toute la hauteur sans sortir de l'écran ;
- [ ] le contenu derrière est inerte et ne défile pas ;
- [ ] la fermeture retire le paramètre et restitue le focus ;
- [ ] contrôler spécialement 390 px clair et 1280 px sombre.

### Compte `/compte`

- [ ] un utilisateur non connecté reçoit le comportement MVP prévu ;
- [ ] les quatre sections sont des liens et non des boutons ;
- [ ] le lien actif porte `aria-current="page"` ;
- [ ] les paramètres URL étrangers sont conservés ;
- [ ] rechargement, précédent et suivant conservent la bonne section ;
- [ ] un onglet invalide revient au tableau de bord canonique ;
- [ ] Tab puis Entrée permettent de changer de section ;
- [ ] la suppression de compte ouvre une modale de confirmation accessible.

### Création de compte `/compte/creer`

- [ ] Prénom, Nom, Adresse email et Mot de passe ont des labels visibles et des
  noms accessibles identiques ;
- [ ] les erreurs de validation sont annoncées et proches du champ concerné ;
- [ ] le formulaire long reste atteignable à 320 px ;
- [ ] la Navbar ne permet pas d'ouvrir une seconde inscription concurrente.

## Routes secondaires

- [ ] `/audits` : catalogue lisible, cartes et CTA fonctionnels ;
- [ ] `/vulnerabilite` : aucun débordement, notamment à 320 px dans les deux thèmes ;
- [ ] `/culture-cyber` : contenu et navigation cohérents ;
- [ ] `/hall-of-fame` : contributeurs lisibles et layout stable ;
- [ ] `/simulations` : état MVP explicite et navigation fonctionnelle ;
- [ ] `/wip` : le paramètre `feature` est affiché sans casser la mise en page ;
- [ ] route inconnue : page 404 lisible et lien de récupération fonctionnel ;
- [ ] boundary d'erreur : message non technique, Réessayer et Retour à l'accueil
  accessibles.

## Protocole commun à toutes les modales

Appliquer cette section à Connexion Navbar, Connexion landing, Inscription,
Essentiel, Habitude, Recommandation technique, Tutoriel, Précision tutoriel,
Lexique et Suppression du compte.

- [ ] le dialogue possède un nom accessible et `aria-modal="true"` ;
- [ ] le rendu est porté directement sous `body` ;
- [ ] l'arrière-plan est inerte et non cliquable ;
- [ ] le scroll de la page est verrouillé sans saut horizontal ;
- [ ] le focus initial se place dans le dialogue ;
- [ ] Tab et Shift+Tab restent dans le dialogue ;
- [ ] Échap ferme uniquement la modale supérieure ;
- [ ] le bouton Fermer/Annuler fonctionne ;
- [ ] le backdrop ferme seulement lorsque ce comportement est prévu ;
- [ ] le focus revient au déclencheur encore présent ;
- [ ] après fermeture finale, aucun `inert`, `aria-hidden` ou verrou de scroll ne fuit ;
- [ ] le backdrop et les surfaces restent lisibles en clair et sombre.

## Authentification mockée

- [ ] la connexion avec une adresse de test crée la session locale ;
- [ ] la session survit au rechargement et à une navigation ;
- [ ] Mon profil devient disponible ;
- [ ] Déconnexion efface la session locale et revient à `/` ;
- [ ] ouvrir Inscription depuis Connexion ferme d'abord la première modale ;
- [ ] ouvrir Connexion depuis Inscription ne crée pas deux backdrops concurrents.

## Compte rendu

```text
Cases de matrice exécutées :
Routes exécutées :
Modales exécutées :
Erreurs console :
Erreurs d'hydratation :
Débordements :
Captures jointes :
Scénarios non exécutés et raison :
Verdict : PASS / PASS AVEC RÉSERVES / FAIL
```

Ne cocher que les contrôles réellement observés. Une absence de navigateur, un
parcours non testé ou un défaut préexistant doit rester visible dans le compte
rendu.
