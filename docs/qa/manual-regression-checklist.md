# Recette manuelle — parcours utilisateur SafeCheck

Cette checklist est la référence courante pour les observations navigateur ;
**CURRENT REFERENCE**.
les rapports liés depuis l'[index QA](README.md) sont des comptes rendus datés
de leur étape.

Cette recette complète les tests unitaires et d'intégration. Elle sert à vérifier
les parcours visibles dans un navigateur après une modification qui touche
l'authentification, Audit, Résultats, les tutoriels, le compte, la navigation ou
les composants partagés. Elle ne constitue pas une suite E2E automatisée : le
projet n'en maintient pas.

## Fiche de recette

```text
Date / opérateur :
Branche / commit :
Environnement et URL :
Navigateur / version / système :
Viewport et thème :
Résultat des contrôles automatisés déjà exécutés :
Incidents préexistants :
```

Utiliser un environnement local ou QA relié à l'API et à une base de test. Prévoir
un compte de test contrôlé et un navigateur invité propre. Ne pas utiliser de
données personnelles. Garder la console et l'onglet réseau visibles ; noter les
erreurs et réponses HTTP utiles sans copier de cookie, jeton, mot de passe ou
autre secret dans le compte rendu.

## Authentification et récupération

### Création de compte et connexion

- [ ] Depuis la Navbar, ouvrir Créer un compte ; vérifier les champs, labels,
  erreurs de validation et états d'envoi. Une soumission répétée rapide ne crée
  qu'une tentative visible ; les contrôles sont désactivés pendant l'envoi.
- [ ] Depuis l'action dédiée de la landing, ouvrir la page `/compte/creer`.
  Créer un compte de test valide ; vérifier la confirmation de session puis
  l'arrivée à `/compte`. Cette route est le point de départ du formulaire, pas
  sa destination après succès.
- [ ] Depuis la modale Créer un compte de la Navbar, vérifier qu'une inscription
  réussie ouvre `/compte`, sauf destination protégée en attente.
- [ ] Se déconnecter, ouvrir Connexion et tester un mot de passe invalide, puis
  une connexion valide. L'erreur reste compréhensible et une nouvelle tentative
  est possible.
- [ ] Basculer directement entre Inscription et Connexion. La modale précédente
  se ferme, la destination en attente reste la même et il n'y a pas de backdrop
  superposé.
- [ ] Pendant une requête, vérifier le libellé d'attente et les contrôles
  désactivés. Au repos, Échap ferme la modale et le focus retourne à son
  déclencheur.
- [ ] Pour la recette QA, provoquer un échec de confirmation de session après
  un POST Signup réussi, puis après un POST Login réussi. L'action Vérifier ma
  session reprend la confirmation sans renvoyer le POST d'identifiants et
  conserve la destination en attente jusqu'à la navigation. Dans le réseau,
  vérifier méthode/chemin et nombre de requêtes seulement ; ne pas relever les
  corps ou secrets.

### Destination en attente (`pendingHref`)

- [ ] En invité, démarrer un Audit et ouvrir depuis Résultats une recommandation
  nécessitant un compte. Se connecter : après confirmation, le rattachement des
  audits invités et l'actualisation de session, la route du tutoriel demandé
  s'ouvre.
- [ ] Refaire le parcours avec Inscription, puis avec un compte déjà existant en
  choisissant Connexion depuis la modale. La même destination est conservée.
- [ ] Depuis la Navbar sans destination en attente, vérifier les destinations par
  défaut de la modale : inscription vers `/compte`, connexion vers `/accueil`.
- [ ] Vérifier que la navigation conserve les paramètres et fragments d'une
  destination interne. La validation des destinations externes et des formes
  hostiles de `pendingHref` est couverte par les tests automatisés
  `tests/unit/auth-navigation.test.ts` ; il n'existe pas de champ utilisateur
  pour saisir arbitrairement cette destination.

### Session, erreur et déconnexion

- [ ] Recharger une page après connexion : l'identité reste disponible après
  vérification de la session.
- [ ] Simuler une indisponibilité de l'API de session dans l'environnement QA.
  L'application affiche une erreur récupérable avec Réessayer ; elle ne traite
  pas cet état comme une déconnexion confirmée et ne révèle pas les données du
  compte.
- [ ] Réessayer après rétablissement de l'API ; vérifier que la session et la
  page Compte se chargent sans boucle de requêtes.
- [ ] En connecté, lancer Déconnexion. L'identité et les données personnelles
  disparaissent pendant la transition ; après succès, retour à `/` et accès
  direct à `/compte` redirigé vers l'accueil public.
- [ ] En invité, vérifier que les progressions de tutoriel ne révèlent pas celles
  d'un autre compte.

### Rattachement des audits invités

- [ ] En invité, terminer au moins un audit, puis créer un compte ou se connecter.
  Après authentification, l'audit apparaît dans l'historique du compte.
- [ ] Dans l'environnement QA, provoquer une réponse d'échec au rattachement
  après une authentification réussie. La connexion et la destination continuent,
  une notice indique le problème et propose Réessayer.
- [ ] Réessayer après rétablissement de l'API ; le compte récupère l'audit sans
  doublon. Vérifier que l'état et la version de l'audit sont conservés.
- [ ] Suspendre le POST de claim ou sa reconfirmation : après 15 secondes,
  la connexion continue, le rattachement échoué propose un retry et les opérations
  Auth redeviennent disponibles. Une réponse tardive ne masque pas cette erreur.
- [ ] Après un claim échoué, recharger la page avec la session User restaurée :
  une tentative est faite une fois, puis le retry reste visible si l'API échoue.
  Pas de boucle automatique ; après déconnexion confirmée puis retour au même
  compte, un nouveau rattachement reste possible.
- [ ] Sur `/audit?auditId=…` puis `/resultats?auditId=…`, afficher un audit Guest
  devenu inaccessible sous User ; cliquer Réessayer le rattachement et vérifier
  le nouveau GET et le contenu récupéré sur la même URL sans F5. Tester aussi
  une première mutation serveur réussie dont la réponse est perdue, suivie d'un
  retry à zéro audit transféré : la relecture récupère les données.
- [ ] Sur `/audit` sans ID, retarder la création pendant un claim réussi :
  conserver un seul POST de création et l'ID dans l'URL à sa fin. Un claim initial
  à zéro ne réinitialise pas la question d'un audit déjà en cours.

## Audit, Résultats et Compte

- [ ] `/audit` : répondre à une question, avancer puis revenir ; la réponse est
  conservée. Impossible d'avancer sans réponse. Terminer le questionnaire et
  ouvrir Résultats.
- [ ] `/resultats` : vérifier score, niveau, recommandations et destinations. Un
  lien de tutoriel protégé propose l'authentification tout en gardant la cible.
  Une session en erreur expose son action de reprise.
- [ ] Connecté, ouvrir `/compte` : pendant le chargement, aucune ancienne donnée
  personnelle ne reste affichée. Une fois chargé, vérifier les audits et les
  progressions de tutoriels enregistrés.
- [ ] Parcourir les onglets du Compte, recharger chaque onglet, puis utiliser
  précédent/suivant. La section active reste cohérente avec l'URL ; une section
  inconnue revient au tableau de bord.
- [ ] Si un GET du compte échoue dans l'environnement QA, utiliser Réessayer et
  vérifier les données restaurées sans recharger l'application.

## Tutoriels, progression et navigation

- [ ] `/tutoriels` : rechercher, filtrer et ouvrir un tutoriel. En invité,
  vérifier le comportement local en mémoire ; connecté, avancer puis recharger
  pour vérifier la progression persistée.
- [ ] Connecté, dans `/tutoriels/[id]`, avancer une étape puis recharger ou
  naviguer vers Mes tutoriels : retrouver la progression persistée.
- [ ] Valider puis dévalider une étape : le pourcentage suit les étapes validées.
  Avancer sans validation ne la marque pas terminée ; Terminer valide toutes les
  étapes et conserve la position de lecture. Vérifier badges et actions
  Commencer/Reprendre/Revoir dans le lecteur et le compte.
- [ ] Avec une sauvegarde PUT retardée ou en échec dans l'environnement QA,
  observer l'état de synchronisation et utiliser le retry proposé. Vérifier la
  progression après confirmation serveur ; les snapshots non confirmés ne sont
  pas garantis après un rechargement du navigateur.
- [ ] Invité, constater que la progression de page est temporaire. Se connecter
  ou s'inscrire : cette progression Guest n'est pas transférée au compte ;
  après changement d'identité/remontage, elle ne doit pas être présentée comme
  une progression persistée.
- [ ] Vérifier que les liens directs vers un tutoriel valide fonctionnent et
  qu'un identifiant inconnu présente un état récupérable.
- [ ] Depuis la Navbar et le footer, ouvrir les routes principales. Les liens
  ferment les menus/drawers ; clic extérieur et Échap ferment les menus ouverts.
- [ ] Vérifier `/audits`, `/essentiels`, `/lexique`, `/recommandations`,
  `/personalisation`, `/culture-cyber`, `/vulnerabilite`, `/simulations` et
  `/hall-of-fame` lorsqu'ils sont touchés par le changement.

## Clavier, affichage et thèmes

Pour les routes touchées, vérifier au clavier :

- [ ] Tab et Maj+Tab suivent un ordre logique et le focus reste visible ; Entrée
  et Espace activent les contrôles attendus.
- [ ] Les formulaires annoncent leurs erreurs près du champ concerné. Les menus,
  modales et drawers ont un nom accessible ; Échap les ferme au repos, le focus
  revient au déclencheur et le contenu derrière une modale est inactif.
- [ ] Les liens sont des liens et les actions sont des boutons ; aucun contrôle
  interactif n'est imbriqué dans un autre.

Parcourir au minimum une largeur mobile (320–390 px) et une largeur desktop
(1280 px), en thème clair puis sombre :

- [ ] Aucun débordement horizontal ; contenu, formulaire et modale restent
  atteignables avec le défilement vertical.
- [ ] Texte, erreurs, focus, états désactivés et notices restent lisibles dans
  les deux thèmes.
- [ ] Changer de thème, naviguer puis recharger : le thème choisi persiste.
- [ ] Pas d'erreur console, d'erreur React/hydratation ni de requête échouée
  inattendue liée au parcours.

## Compte rendu

```text
Scénarios exécutés :
Scénarios non exécutés et raison :
Erreurs console / réseau :
Résultat destination pendingHref :
Résultat session / claim / logout :
Débordements ou défauts clavier :
Captures sans donnée sensible :
Verdict : PASS / PASS AVEC RÉSERVES / FAIL
```

Cocher uniquement ce qui a été observé. Distinguer un contrôle automatisé d'une
observation navigateur et signaler les parcours non exécutés.
