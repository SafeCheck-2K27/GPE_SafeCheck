# Architecture SafeCheck — frontend et full-stack

**CURRENT REFERENCE.** Le nom du fichier est conservé pour les liens existants ;
son périmètre couvre le frontend, l'API et la persistance du MVP.
Le [README](../README.md) est le point de départ, l'[onboarding](frontend-onboarding-lts.md)
détaille le travail quotidien et la [checklist QA](qa/manual-regression-checklist.md)
décrit la recette manuelle. Les rapports QA anciens sont des instantanés historiques.

## Carte du système

```text
Next.js 16 / React 19 (src/app, src/features)
  ├─ clients API de feature → apiFetchJson → contrats/décodage
  │    → Fastify 5 (server/*/routes.ts)
  │      → services → Prisma 7 / adapter-pg → PostgreSQL
  ├─ authClient → /api/auth/* → Better Auth → adaptateur Prisma
  │    → User / Session / Account / Verification
  └─ catalogues TypeScript → vues et fonctions pures
       (questions, tutoriels, recommandations, essentiels, lexique)
```

Next et Fastify sont deux processus distincts. L'API expose `/health`, `/ready`,
`/api/auth/*`, `/audits` et `/me/tutorial-progress`. Les clients navigateur
utilisent `NEXT_PUBLIC_API_URL`, les cookies avec `credentials: "include"` et
des lectures sans cache. Fastify limite CORS à `WEB_ORIGIN` avec credentials.
Les mutations Audit et le PUT de progression contrôlent l'Origin avant toute
résolution de session ou écriture : seul `WEB_ORIGIN` exact est accepté. Sans
Origin, seuls les headers Fetch Metadata `same-origin` avec mode `cors` ou
`same-origin`, ou l'absence des deux headers, sont acceptés. Ce dernier choix
préserve les clients HTTP non navigateur ; ces headers ne les authentifient pas.
Ces contrôles complètent ceux de Better Auth ; CORS ne constitue pas un contrôle
d'ownership.

En production, l'API impose des origines HTTPS pour `WEB_ORIGIN` et
`BETTER_AUTH_URL`. Le frontend se construit avec `NEXT_PUBLIC_API_URL` en HTTPS.
Les cookies Guest sont Secure à l'émission et au retrait, indépendamment du
protocole interne au proxy. Better Auth choisit ses cookies Secure depuis sa base
URL HTTPS ; le relais conserve tous les `Set-Cookie`. HTTP localhost reste
réservé au développement, avec des origines compatibles SameSite=Lax.

Fastify ne fait confiance à aucun proxy par défaut. `API_TRUSTED_PROXIES` nomme
uniquement les IP ou CIDR étroits des sockets proxy autorisés. Le serveur écrase
le header IP canonique remis à Better Auth depuis l'IP résolue par Fastify ; une
IP résolue malformée revient à l'adresse du socket. Les headers client ne peuvent
pas remplacer ce header. Le quota Better Auth reste natif, en mémoire par
processus, avec le regroupement IPv6 /64 de la bibliothèque. La configuration
réelle du proxy, de sa chaîne et du confinement réseau reste à vérifier avant
exposition ; voir le [README](../README.md).

`/health` est une liveness indépendante de la DB ; `/ready` vérifie PostgreSQL
avec une attente HTTP d'une seconde et un probe partagé en vol. Le transport JSON
applicatif borne fetch et lecture du body à 15 secondes ; timeout et annulation
de session restent distincts, sans retry automatique. Les recoveries de la queue
Tutoriel conservent les snapshots non confirmés. Voir le
[registre opérationnel](operational-readiness.md) pour les triggers et limites.

Sources : [dépendances](../package.json), [assemblage API](../server/app.ts),
[transport HTTP](../src/lib/api-fetch.ts), [Prisma](../src/lib/prisma.ts),
[contrats](../src/lib/contracts/), [Auth serveur](../server/auth/auth.ts).

## Auth, identité et navigation

Better Auth active signup/login par email et mot de passe. Le `pseudo` UI
correspond à `User.name`. Les sessions sont stockées en DB et utilisées via
cookies ; aucun parcours JWT ou OAuth n'est implémenté. Le relais Auth conserve
les `Set-Cookie` et retire le token des JSON réussis signup, login et get-session.

`AuthProvider` distingue User confirmé, Guest confirmé et identité indéterminée
(chargement, changement Auth ou erreur de session). Une panne de session masque
les données du compte et propose un retry ; elle ne déclenche pas la redirection
réservée au Guest confirmé. Les opérations sont verrouillées avant leur premier
`await`. Les erreurs distinguent `invalid_credentials`, `network`, `generic`, `busy`.

Après un POST signup/login réussi, le provider confirme le même User dans la
session, tente le claim des audits Guest, puis recharge la session. Si la
confirmation échoue, le retry reprend cette confirmation sans refaire le POST
credentials. Un claim échoué laisse l'authentification réussie et affiche une
récupération séparée. Celle-ci reconfirme le compte, reste liée à son identité et
invalide les tentatives obsolètes. Chaque tentative est bornée à 15 secondes,
reconfirmation et lecture JSON incluses : l'annulation native et une course de
promesses libèrent le verrou même si le transport ignore l'annulation. Une réponse
tardive ne confirme pas le rattachement. Une déconnexion concurrente reçoit `busy`
pendant cette attente bornée ; une déconnexion échouée conserve la récupération,
effacée après acceptation serveur de la déconnexion.

Une session User restaurée tente une fois le claim par cycle d'identité du provider,
sans doubler le claim de signup/login ni réessayer en boucle après échec. Remonter
le provider retrouve une tentative et, en cas d'échec, une notice récupérable.
Le cookie Guest signé HttpOnly et l'endpoint idempotent portent cette reprise ;
aucun état de claim n'est persisté ou cookie HttpOnly lu par JavaScript. Un transfert
confirmé incrémente la révision utilisée par Compte, Audit et Résultats. Un premier
succès à zéro conserve les vues en cours ; un retry à zéro après échec les invalide
aussi, car la tentative précédente peut avoir été validée côté serveur sans réponse.

`pendingHref` reste disponible dans le parcours signup ↔ login et lors d'erreurs ;
fermer le parcours le vide. La destination est validée comme chemin interne
relatif à la racine, y compris après décodage. Sans destination valide, signup
mène à `/compte`, login à `/accueil`. Les changements d'identité invalident les
requêtes dépendantes et masquent les données de l'identité précédente.

Sources : [provider](../src/components/safecheck/AuthProvider.tsx),
[logique Auth](../src/components/safecheck/auth-logic.ts),
[reprise de formulaire](../src/components/safecheck/auth-form-recovery.ts),
[claim recovery](../src/components/safecheck/guest-claim-recovery.ts),
[navigation](../src/components/safecheck/auth-navigation.ts),
[relais Auth](../server/auth/routes.ts),
[vue session du compte](../src/app/compte/_session-state.ts).

## Audits : propriétaire, réponses, soumission

Le serveur résout d'abord la session User ; sinon il utilise `safecheck_guest`,
cookie signé contenant un sujet UUID, HttpOnly, SameSite=Lax, Secure en production,
path `/`, durée de 30 jours. Créer un audit sans propriétaire existant crée ce
sujet et pose le cookie. Le sujet Guest n'est pas un compte DB.
Chaque audit appartient exactement à un User **ou** un sujet Guest. L'accès par
ID filtre aussi le propriétaire ; absence et autre propriétaire donnent le même 404.

| Opération | Endpoint | Effet |
|---|---|---|
| Créer | `POST /audits` | `IN_PROGRESS`, versions courantes figées |
| Lire/reprendre | `GET /audits/:id` | Réponses et versions du propriétaire |
| Enregistrer | `PUT /audits/:id/answers/:questionId` | Upsert d'une réponse validée |
| Terminer | `POST /audits/:id/submit` | Vérifie toutes les questions puis `COMPLETED` |
| Historique User | `GET /audits` | Création décroissante puis ID décroissant |
| Rattacher | `POST /audits/claim-guest` | Transfère tous les audits du sujet au User |

Le claim efface `guestSubject`, avance `updatedAt` et retire le cookie après
succès. Répéter sans sujet ne rattache rien. Il transfère les audits en cours et
terminés ; il ne migre pas de progression de tutoriel Guest.

Réponse et soumission verrouillent la ligne dans une transaction pour empêcher
une réponse après finalisation concurrente. Modifier un audit terminé donne 409
`AUDIT_COMPLETED`. Resoumettre un audit terminé le renvoie sans mutation. Une
soumission incomplète donne 400 `AUDIT_INCOMPLETE` avec les IDs manquants. Les
versions inconnues empêchent écriture/soumission (409 `AUDIT_VERSION_UNSUPPORTED`)
sans réinterpréter les réponses. `updatedAt` avance lors d'une réponse réussie,
finalisation ou claim ; lire/refuser une opération ne le met pas à jour.

Le navigateur crée l'audit quand `/audit` n'a pas d'ID, inscrit l'ID dans l'URL,
charge les réponses DB et reprend à la première question sans réponse. Un choix
en attente n'est confirmé localement qu'après sauvegarde serveur. Les changements
d'identité/URL annulent les continuations précédentes. Le claim recharge un audit
existant à URL et identité constantes ; il ne relance ni n'annule la création sur
`/audit` sans ID. Les anciennes lectures ne remplacent pas celles de la nouvelle
révision. La soumission mène à
`/personalisation?auditId=…`, puis `/resultats?auditId=…`.

Sources : [routes](../server/audits/routes.ts), [service](../server/audits/service.ts),
[page Audit](../src/app/audit/page.tsx), [scope](../src/app/audit/_request-scope.ts),
[contrat](../src/lib/contracts/audit.ts).

## Résultats et recommandations

Les résultats rechargent l'audit propriétaire par API et exigent un audit terminé
et une version supportée. Le score est **calculé dans le frontend** à partir des
réponses DB ; aucun score/résultat n'est persisté. Le registre supporte actuellement
questionnaire 1 / scoring 1. La formule v1 additionne les scores d'options, divise
par `nombre de questions × 10`, puis arrondit en pourcentage. Les définitions v1
sont isolées pour conserver le calcul des audits existants ; changer les versions
« courantes » ne remplace pas une ancienne définition.

La grille statique associe 0–34, 35–59, 60–79, 80–100 aux niveaux novice, scarabée,
gardien, sentinelle. Chaque niveau pointe vers des IDs du catalogue statique de
recommandations de résultats. Ces listes ne sont pas individualisées par réponse.
Le hub `/recommandations` possède son catalogue éditorial et ses filtres. Les
réponses de `/personalisation` restent dans l'état du formulaire : elles ne sont
ni persistées, ni utilisées par le score ou les recommandations actuelles.

Sources : [Résultats](../src/app/resultats/page.tsx),
[dispatch](../src/features/audit/scoring.ts), [versions](../src/features/audit/versions.ts),
[formule v1](../src/features/audit/versions/scoring-v1.ts),
[grille](../src/features/results/logic.ts), [mapping](../src/features/results/utils.ts),
[catalogue Résultats](../src/features/results/data.ts),
[catalogue du hub](../src/features/recommendations/data.ts),
[personnalisation](../src/app/personalisation/page.tsx).

## Tutoriels : contenu statique, progression persistée

Le contenu vient de [tutoriels-data.ts](../src/lib/tutoriels-data.ts), consommé par
l'[adaptateur](../src/features/tutorials/data/catalog.ts). Chaque tutoriel porte
ID et version. Il n'existe **aucune table Tutorial**. Catalogue, détail et lecteur
modal partagent cette source. La progression contient `currentStep` et
`completedSteps` (indices depuis zéro) ; statut et pourcentage sont dérivés.
Absence de snapshot = jamais commencé ; snapshot présent = en cours, sauf si
toutes les étapes sont validées. Le pourcentage est le ratio d'étapes validées,
sans arrondi métier. Changer d'étape ne la valide pas ; « Terminer » valide toutes
les étapes en conservant la position de reprise.

Un User hydrate avec `GET /me/tutorial-progress` et enregistre des snapshots
complets via `PUT /me/tutorial-progress/:tutorialId`. L'API exige session, version
courante du contenu et indices dans ses bornes. La ligne est unique par
`(userId, tutorialId)` ; une version DB différente n'est pas écrasée automatiquement
(409 `TUTORIAL_VERSION_CONFLICT`). Une ligne de contenu retiré reste DB mais ne
crée pas de carte ; une version incompatible de contenu présent provoque une
erreur de lecture. Réordonner les étapes exige une décision de migration explicite.

Un Guest peut interagir avec une progression **en mémoire de la page montée**.
Il n'émet pas de GET/PUT de progression, n'a pas de persistance localStorage/DB ni
transfert au compte. Quitter/remonter la page ou changer d'identité la réinitialise.
Certains liens depuis les résultats proposent signup/login avant navigation vers
le tutoriel ; ce gate ne change pas la politique du lecteur directement accessible.

Pour un User, la file par tutoriel ordonne les sauvegardes dans le cycle Auth
courant et survit à la navigation interne. Lecteur et compte attendent les écritures
avant relecture DB. Les snapshots non confirmés restent en mémoire avec retry
visible ; cela ne garantit pas la récupération après rechargement du navigateur.
La DB applique **last-write-wins** aux snapshots de même version, sans fusion des
étapes ni contrôle de révision entre appareils. `tutorialVersion` identifie le
contenu, pas une révision optimiste de sauvegarde.

Sources : [progression pure](../src/features/tutorials/progress.ts),
[contrôleur](../src/features/tutorials/progress-controller.ts),
[transport](../src/features/tutorials/transport.ts), [file](../src/features/tutorials/save-queue.ts),
[hydratation](../src/features/tutorials/hydration.ts),
[routes](../server/tutorial-progress/routes.ts),
[validation](../server/tutorial-progress/contract.ts), [service](../server/tutorial-progress/service.ts).

## Compte réellement disponible

`/compte` propose quatre onglets normalisés par `?tab=` :

- **Dashboard** : compteurs audits DB et tutoriels commencés, joignant snapshots DB
  aux métadonnées statiques.
- **Historique** : audits DB, actions reprendre/revoir selon statut.
- **Profil** : pseudo et email de session, lecture seule.
- **Préférences** : apparence clair/sombre/système via `next-themes`, sur cet appareil.

Les erreurs audits/tutoriels ont des retries distincts. Une sauvegarde de tutoriel
non confirmée n'est pas présentée comme état DB. Le MVP n'expose pas d'édition
avancée du profil, suppression de compte ou réglage de notifications.

Sources : [compte](../src/app/compte/page.tsx), [onglets](../src/features/account/tabs.ts),
[jointure tutoriels](../src/features/account/tutorial-summary.ts),
[attente des sauvegardes](../src/features/account/tutorial-loading.ts),
[profil](../src/features/account/components/AccountProfile.tsx),
[apparence](../src/features/account/components/AccountPreferences.tsx).

## Base, contraintes et migrations

Le [schéma Prisma](../prisma/schema.prisma) définit User, Session, Account,
Verification, Audit, AuditAnswer, UserTutorialProgress. Email User et token Session
sont uniques ; réponses uniques par `(auditId, questionId)` ; progression unique
par `(userId, tutorialId)`. Supprimer un User cascade sessions/comptes/progressions,
mais sa relation Audit est `Restrict`. Supprimer un Audit cascade ses réponses.
Ces relations ne signifient pas qu'une UI de suppression existe.

La [migration d'intégrité et de versions](../prisma/migrations/20261005120000_strengthen_data_integrity_and_versions/migration.sql)
ajoute des CHECK SQL : propriétaire XOR, versions/IDs positifs, indices de
progression non négatifs, tableau non nul, unidimensionnel sans élément nul.
L'app vérifie l'appartenance des questions et les bornes du catalogue ; la DB
ne stocke pas ces catalogues. La migration prévalide les lignes et prend un
verrou exclusif avec timeout de 10 secondes. Elle échoue sur données invalides
sans réparation silencieuse. Le backfill v1 conserve réponses, indices et timestamps.

`createdAt` est l'insertion. User, Audit et UserTutorialProgress ont `@updatedAt`,
géré par les écritures Prisma, sans trigger SQL pour les modifications externes.
Les timestamps Better Auth ont des défauts ; leurs écritures relèvent de Better
Auth. Les DTO exposent des dates ISO. Suivre l'[onboarding](frontend-onboarding-lts.md)
pour les migrations versionnées : `db push` ne reproduit pas les CHECK SQL.

### Faire évoluer une version

Les versions stockées identifient une définition, pas simplement la dernière
édition du fichier. Aujourd'hui, seule la paire questionnaire 1 / scoring 1
est interprétée ; augmenter les constantes ne fournit pas une nouvelle implémentation.

- Pour une évolution de la signification des questions, des IDs/options ou de
  l'interprétation des réponses, ajouter une nouvelle définition de questionnaire
  et son dispatch explicite, en conservant v1 pour les audits existants.
- Pour une évolution des poids, du dénominateur ou de l'arrondi, ajouter un scorer
  versionné et les combinaisons compatibles ; conserver le calcul historique.
  Incrémenter volontairement les constantes courantes et adapter les defaults DB
  dans une nouvelle migration. Une paire inconnue reste refusée.
- Pour un changement de sens ou d'ordre des étapes d'un tutoriel, incrémenter sa
  version. Choisir et documenter une migration/mapping ou un reset explicite des
  anciennes progressions avant livraison ; aucun moteur de conversion automatique
  n'existe. Le code actuel conserve les anciennes lignes et bloque le mismatch.

Ces règles de maintenance suivent les définitions versionnées et le contrat
de contenu ; une nouvelle version doit inclure sa prise en charge client/serveur
et ses tests. Déployer ensemble les contrats : un PUT de progression sans version
est rejeté avec 400, une version valide mais incompatible avec 409.

## Décisions structurantes du MVP

| État actuel | Conséquence pour le développeur | Évolution à examiner si nécessaire |
|---|---|---|
| API Fastify séparée de Next | Deux processus et des origines/cookies cohérents | Concevoir explicitement le déploiement et le routage public |
| Sessions Better Auth en DB, cookies | Ownership résolu par la session serveur, sans JWT applicatif | Ajouter un autre fournisseur Auth seulement avec un besoin produit |
| Contenus TypeScript, aucune table Tutorial | Une source éditoriale partagée suffit au lecteur et à l'API de progression | CMS/édition dynamique nécessiteraient un contrat de contenu et versioning |
| Score frontend versionné et mapping éditorial par tranche | Les réponses DB restent la source ; aucune décision de sécurité serveur ne repose sur le score UI | Un usage serveur du score demanderait une source de calcul adaptée |
| Progression Guest en mémoire | Aucune migration de progression lors du claim des audits | Une persistance Guest serait une nouvelle décision de produit et d'ownership |
| Snapshots User last-write-wins | Pas de fusion ni verrou de révision entre appareils | Introduire un contrat de conflit si le produit demande une fusion multi-device |
| Profil en lecture seule, apparence locale | Aucune promesse de mise à jour du profil ou de suppression depuis l'UI | Ajouter endpoints et parcours seulement dans un chantier dédié |

## Conventions frontend et boundaries

`src/app` compose routes/layouts/boundaries ; les éléments propres à une route
restent dans `_components/`, `_data.ts` ou autres fichiers privés. Les domaines
durables vivent dans `src/features` avec composants, clients API, types, fonctions
pures et hooks. `src/components/safecheck` fournit UI partagée/providers/primitives ;
**`src/components` n'importe jamais `src/features`**. Les adaptateurs techniques
et contrats transversaux vivent dans `src/lib`. L'UI ne doit pas importer Prisma
ou Better Auth serveur ; les services peuvent utiliser les définitions métier partagées.

Une feature ne dépend pas des composants privés d'une autre route/feature. Les
besoins transverses passent par un contrat public stable. Les tutoriels passent
par l'adaptateur de catalogue ; éviter les copies concurrentes. Les catalogues
restent sérialisables (objets simples, tableaux, valeurs JSON), sans JSX/fonction/
classe ; le [test](../tests/unit/serializability.test.ts) protège cette frontière.

App Router est serveur par défaut ; ajouter `"use client"` à la boundary qui
requiert événements/état/navigateur. Avant une modification Next, lire le guide
pertinent dans `node_modules/next/dist/docs/` selon [AGENTS.md](../AGENTS.md).
Le [layout](../src/app/layout.tsx) compose Theme, I18n et Auth. Pour un store externe,
utiliser `useSyncExternalStore` avec snapshot serveur stable. Ne pas masquer une
divergence métier d'hydratation avec `suppressHydrationWarning`.

L'URL porte l'état partageable (ID audit, onglet, filtre) : valider/normaliser les
valeurs et éviter un état local divergent. Les `useSearchParams` qui en ont besoin
restent dans une boundary `Suspense`. Les résultats portent un ID dans l'URL,
jamais un score considéré comme preuve d'un résultat serveur.

Réutiliser [PageShell](../src/components/safecheck/layout/PageShell.tsx), les
[primitives](../src/components/safecheck/primitives/) `ScButton`, `ScChip`, `ScBadge`,
`ScCard`, `SafeCheckMark` et [AccessibleModal](../src/components/safecheck/layout/AccessibleModal.tsx).
La modale centralise portal, pile, scroll, inertie, focus, Échap, backdrop et restitution
du focus précédent. Les tokens clair/sombre vivent dans [globals.css](../src/app/globals.css).
Vérifier contraste, focus, disabled, mobile et desktop après modification visuelle.

Fichiers : composants `PascalCase.tsx`, hooks `use…`, logique pure nommée par
domaine, alias `@/` entre domaines, imports relatifs courts dans un domaine.
Les commentaires expliquent une contrainte actuelle, sans journal de patch.
Conserver les définitions des versions d'audit déjà persistées ; traiter la version
et les anciennes progressions lorsqu'un tutoriel change d'ordre d'étapes.

## Tests et validation

Le [runner](../scripts/run-tests.mjs) exécute les tests TypeScript Node via `tsx` :
`npm run test:unit`, `npm run test:integration`, `npm test` (les deux),
`npm run test:ci` (les deux, strict). Les intégrations utilisent PostgreSQL réel
et les migrations. Hors strict, DB indisponible peut produire des skips ; cela
ne vaut pas validation d'intégration. Le mode strict échoue si la DB est
indisponible ou un test skipped. Les suites couvrent notamment ownership, claim,
immutabilité, versions, Auth/recovery et files de progression.

Avant livraison : lint, typecheck, tests stricts avec DB, build, validation Prisma
et `git diff --check` selon l'[onboarding](frontend-onboarding-lts.md).
Les tests de montage `guest-claim-mounted` utilisent ReactDOM, jsdom, les contextes
Next et les vrais provider/pages avec réponses réseau contrôlées. Ils vérifient
timeout virtuel, remount, changements d'identité, retry visible et relecture Audit/
Résultats à URL constante. Ils ne remplacent pas un navigateur déployé.
La recette navigateur reste manuelle : clavier, modales, erreurs réseau, thèmes,
responsive et rendu des parcours. Le projet n'inclut pas de suite Playwright
ni de seuil de couverture/mutation imposé.
