# SAFECHECK — QUALITY FAMILY G

Date : 2026-10-06, Europe/Paris. **SUCCESS WITH DEBT**.

Le gate strict et les intégrations réelles sont validés. Les limites de montage
React et un écart produit préexistant de récupération de session sont conservés
explicitement dans la dette ; aucun test vert ne prétend les résoudre.

## Baseline réelle

État de départ : working tree A–F non commité, sauvegardé avant modification dans
`../../../quality-g-checkpoints/before` ; statut dans
`../../../quality-g-baseline-status.txt`. Le diff contre HEAD ne représente donc
pas exclusivement Family G.

| Mesure | Avant G |
|---|---|
| Unit tests | 220 réussis, 25 fichiers, environ 1,80 s |
| Integration tests | 56 réussis, 9 fichiers, environ 5,68 s |
| All tests | 276 réussis, environ 7,55 s |
| Failed / skipped / cancelled / TODO | 0 / 0 / 0 / 0 |
| UI tests | Un rendu SSR de boundary d'erreur, compris dans les unités ; aucun montage client |
| Browser / E2E | Aucun framework actif ; anciennes recettes manuelles |
| CI jobs | Un job Ubuntu : lint, typecheck, build ; aucun test exécuté |
| Coverage % | Pas de solution active ni seuil ; aucun pourcentage revendiqué |

Infrastructure : `node:test` + `tsx`, React server rendering, Fastify inject,
Prisma et PostgreSQL 17 réels. Les intégrations utilisent `DATABASE_URL`,
`COOKIE_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `WEB_ORIGIN` ; le replay
des migrations exige également `MIGRATION_DATABASE_URL`. Le runtime DB doit être
distinct du rôle de migration et dépourvu de privilèges d'administration.

## G1 — Matrice de couverture actuelle

STRONG = assertions positives/négatives pertinentes au risque ; ADEQUATE = cœur
couvert avec frontière identifiée ; WEAK = protection limitée ; MISSING = aucune
preuve automatisée à cette couche. Une intégration Fastify ne constitue pas un
montage React, et le rendu SSR n'exécute pas les effets.

Les chemins de tests ci-dessous sont relatifs à `tests/`.

| Feature | Unit | Integration | UI/Lifecycle | Manual QA restant | Verdict |
|---|---|---|---|---|---|
| Auth | ADEQUATE : `unit/auth`, `auth-form` ; données, confirmation, erreurs, pending | STRONG : `integration/auth`, `auth-production` ; session, hashing, revocation, cookies HTTP/HTTPS | WEAK : provider réel non monté, erreur initiale non distinguée | Formulaires, annonces, focus | ADEQUATE avec écart produit précis |
| Audit | STRONG : `audit`, `audit-api`, `audit-decoding`, `audit-session` | STRONG : `audits`, `audit-ownership` ; isolation, réponses, submit, verrou DB | ADEQUATE : scope, génération, abort, create unique, key identité/URL ; rendu non monté | Masquage visible, transitions, clavier | STRONG cœur ; montage partiel |
| Claim | STRONG : `auth`, `guest-claim-recovery` ; retry, coalescence, identité | STRONG : `audit-claim` ; idempotence, réponses/statut/versions conservés | ADEQUATE : controller/revision + notice SSR failed/pending/idle ; clic non monté | Perception de l'alerte et du retry | STRONG cœur ; interaction browser partielle |
| Results | STRONG : `results`, `audit-versions` ; bornes et score historique | ADEQUATE : audit persisted/completed fourni par les intégrations | MISSING : route Results non montée | Lisibilité et parcours | ADEQUATE |
| Recommendations | ADEQUATE : nouveau `recommendations`, intégrité des destinations | Non applicable : catalogue éditorial local | WEAK : filtrage exécuté, router non monté | Changements URL et modales | ADEQUATE ; navigation partielle |
| Tutorials | STRONG : `tutorials`, `tutorial-integrity`, `serializability` | Non applicable au contenu éditorial | WEAK : sélection/domaines, aucun dialogue monté | Responsive, focus, détail | STRONG contenu ; UI partielle |
| Tutorial Progress | STRONG : `tutorial-progress`, `tutorial-session`, `tutorial-persistence`, adapters | STRONG : `tutorial-progress`, `tutorial-progress-api` | STRONG controllers : queues, late responses, recovery, replay ; hook non monté | Perception des indicateurs | STRONG cœur ; hook partiel |
| Account | STRONG : `account*` ; tab, résumés, DTO, sauvegarde puis GET | ADEQUATE : `audit-list`, progress API ; owner-only | ADEQUATE loaders/cancel ; dashboard/onglets non montés | Navigation générale et annonces | ADEQUATE |
| DB invariants | Non applicable : les mocks ne prouvent pas les CHECK | STRONG : `data-integrity`, `tutorial-progress`, `database-permissions` | Non applicable | Aucune comme protection principale | STRONG |
| API decoders | STRONG : `audit-decoding`, `account-api`, `api-fetch`, tutorial adapters | ADEQUATE : DTO publics/API réelles | ADEQUATE : erreur contrôlée et absence de publication au scope | Présentation des erreurs | STRONG |
| Family F versioning | STRONG : versions historiques Audit, conflits Tutoriel, refus d'interprétation | STRONG : versions conservées, écriture refusée, migration/backfill | ADEQUATE : hydration/account refusent les versions incompatibles | Clarté des messages | STRONG |

La matrice provient des assertions : ownership sans mutation DB, historique v1
avec score connu, remplacement complet et unicité des snapshots, réponse tardive
sans callback, recovery S2 conservée sur DB S1, et erreurs de payload qui ne
deviennent pas des résultats vides. Revue détaillée conservée dans
`../../../quality-g-checkpoints/coverage-review.md`.

## G2 — Réconciliation des neuf MUST / USEFUL

| Requirement | Covered before G? | Action G | Final |
|---|---|---|---|
| 1. Audit chargé → identity change → ancien état masqué | COVERED PARTIALLY : key/scopes testés, key React inspectée | Conserver, sans test source-regex ni faux montage | COVERED PARTIALLY : rendu visible non automatisé |
| 2. Late GET Audit → session change → ignoré | COVERED WELL : scopes et adapters, succès/erreur tardifs, abort | Conserver | COVERED WELL |
| 3. Claim fail → alerte/retry → succès | COVERED PARTIALLY : recovery/revision/coalescence testées | Tests existants étendus au vrai rendu SSR : message, retry actif, pending disabled, notice retirée après succès | COVERED WELL controller/markup ; clic browser non automatisé |
| 4. Tutorial PUT échoue après navigation → récupérable | COVERED WELL : controller, queue et Account, retry S2 puis reload | Conserver ; nouveau replay même instance est une frontière distincte | COVERED WELL au niveau controller/transport |
| 5. Aucun faux succès de contribution | NO LONGER APPLICABLE : actions supprimées par B/E | Vérifier les sources actuelles ; ne pas recréer le legacy | NO LONGER APPLICABLE |
| 6. Erreur session ≠ Guest | COVERED PARTIALLY : confirmation explicite refuse l'erreur ; hook initial non protégé | Documenter écart préexistant pour audit final | COVERED PARTIALLY ; défaut produit non corrigé |
| 7. Audit/Account malformé → erreur contrôlée | COVERED WELL : decoders/adapters ; scope reçoit ApiPayloadError sans état publié | Conserver | COVERED WELL aux frontières ; rendu des erreurs non monté |
| 8. Navigations URL successives → vue synchronisée | COVERED PARTIALLY : parsing/liens ; vues dérivées de l'URL inspectées | Ajouter filtres métier manquants ; distinguer filtre et router | COVERED PARTIALLY : Next navigation non automatisée |
| 9. Hook Tutorial dispose/remount/session pendant save | COVERED PARTIALLY : controllers destination distincts déjà testés | Six cas déterministes sur controller retenu et identité pendant PUT | COVERED WELL primitives ; hook React non monté |

## Sub-agents et revue parent

| Scope | Model | Effort | Why | Result |
|---|---|---|---|---|
| CI/gate/config/commandes | GPT-6.1 Sol | High | Détection d'exécution réelle et PostgreSQL obligatoire | Implémenté ; red gates et suite stricte validés |
| Intégrations/fixtures/indépendance | GPT-6.1 Sol | Medium | Refactor ciblé de fixtures réelles, assertions conservées | Quatre suites indépendantes, cinq comportements exécutés seuls |
| Matrice/lifecycle/erreurs | GPT-6.1 Sol | High | Revue des frontières async et gaps sans duplication | Huit tests utiles, matrice et dette précise |
| Parent : Auth HTTPS, intégration et validation | Modèle parent | — | Revue commune et contre-preuves | Test HTTPS + mutation isolée rouge ; base vide et validations finales vertes |

La revue parent a vérifié les diffs contre le checkpoint, conservé les vraies
assertions API/DB et contrôlé les preuves négatives. Les 243 empreintes de sources
`src`, `server` et `prisma` relevées avant G sont inchangées. Aucun commit créé.

## G3 / G11 / G12 — CI et commandes

Avant : CI pouvait réussir sans exécuter une seule intégration.

Après : le job principal démarre PostgreSQL 17 dans un conteneur jetable lié à
127.0.0.1, attend sa disponibilité TCP, génère et masque les secrets éphémères,
déploie les migrations sur DB vide, attribue les droits runtime restreints, puis
lance lint, typecheck, `npm run test:ci` et build. Le conteneur est retiré aussi
en cas d'échec. Aucun secret réel ni credential de production n'est ajouté.

| Commande | Usage |
|---|---|
| `npm run test:unit` | Unités et controllers sans PostgreSQL |
| `npm run test:integration` | API/Prisma/PostgreSQL et replay de migration |
| `npm test` | Les deux groupes |
| `npm run test:ci` | Les deux groupes, gate strict obligatoire |

Utiliser Node 22 comme le workflow ; validation locale sur 22.17.1. Les suites
actives portent le suffixe `.test.ts` et sont découvertes récursivement sous
`tests/unit` et `tests/integration`. Les helpers ne sont pas des suites.

Le runner natif exige une summary par fichier et une summary finale ; une simple
wrapper Node réussie ne prouve pas que les assertions ont tourné. Chaque groupe
requis doit contenir des fichiers. En mode strict : configuration absente,
PostgreSQL inaccessible, skip, TODO, annulation, fichier vide, sortie prématurée
ou fichier non terminé font échouer la commande. `CI=true` active aussi cette
politique pour les autres commandes. Les logs masquent URLs, secrets configurés
et cookies de session Better Auth.

La commande locale peut accepter un test enregistré explicitement skipped ;
elle ne masque jamais un échec de connexion avec une configuration fournie.
Elle refuse également un fichier sans tests exécutables enregistrés. Les
intégrations, permissions runtime et replay de migration sont **tous** requis
dans le gate CI : aucune suite conditionnelle n'est exclue du gate.

**Can integrations silently skip? NO.**

Contrôles négatifs exécutés : fixture skipped, TODO, sous-test annulé, fichier
vide, `process.exit(0)` sans tests, groupe d'intégration vide, summary absente,
configuration entièrement absente et PostgreSQL dirigé vers un port inaccessible
→ exit non nul. Avec environnement absent : 37 fichiers attendus, 0 exécuté,
0 test, exit 1. Une fixture skipped reste acceptable dans le mode local testé.

Le workflow GitHub lui-même n'a pas été dispatché pendant cette passe. Sa chaîne
DB/migrations/permissions/gate a été exercée localement sur une DB vide jetable ;
la première exécution hébergée reste à observer. L'étape postinstall Prisma
generate a aussi réussi dans une copie sans variables DB/Auth : l'installation
peut donc précéder le démarrage de PostgreSQL, comme prévu dans le workflow.

## G4 / G5 — Structure des intégrations et helpers

Refactorées : `audits`, `tutorial-progress`, `tutorial-progress-api`, contraintes
structurelles de `data-integrity`. Les comportements n'héritent plus des réponses
ou snapshots écrits par un sous-test précédent. `beforeEach` et seeds explicites
préparent les seuls UUID nécessaires. Les quatre conteneurs `test` deviennent
`describe`, ce qui permet de filtrer réellement un comportement seul.

Intentionnellement séquentiels : Auth signup/session/signout/signin, claim avec
ownership avant/après et répétition, scénario ownership avec Guest cookie/signin,
constitution HTTP d'une liste d'audits, replay historique des migrations et
concurrence save/submit au sein de son test. Leur ordre constitue la preuve du
workflow ; il ne sert plus de fixture à des comportements indépendants.

`tests/helpers/integration.ts` mutualise seulement : `createIntegrationApp`,
`signupSession`, `cookieFromHeader`, `cleanupIntegration`. Cookie extraction
accepte les namespaces HTTP et `__Secure-` HTTPS. Teardown supprime les seuls
emails/IDs alloués, ferme Fastify et déconnecte Prisma. Aucun framework de
fixtures, aucun mock DB de remplacement. L'injection existante d'erreur Prisma
reste limitée à la vérification de réponse HTTP générique et restaure le delegate.

Preuve d'indépendance : cinq comportements filtrés (lecture Prisma, PUT répété,
immutabilité après submit, RESTRICT/cascade, session révoquée) réussissent sans
exécuter leurs anciens sous-tests prédécesseurs.

## G6 — Auth production policy

`integration/auth-production.test.ts` configure production + origines HTTPS
avant import du serveur dans son processus isolé. Signup/session/signout réels
vérifient Secure, HttpOnly, SameSite=Lax, Path=/, namespace sécurisé, CORS
credentialed, token absent des réponses, révocation de la ligne Session et
expiration du même cookie sécurisé. Le test Auth HTTP local existant conserve
l'assertion d'absence de Secure.

Le contrôle porte sur la configuration effective SafeCheck/Better Auth et les
routes livrées. Il ne simule pas le chiffrement TLS ni un reverse proxy réel, et
n'affirme pas que l'application refuse une URL HTTP en production. Les choix
internes de durée/hashing de Better Auth ne reçoivent pas de nouveaux tests
redondants.

Contre-preuve : copie isolée de `server/auth/auth.ts` avec
`advanced.useSecureCookies=false` → échec `HTTPS uses the Secure cookie namespace`,
exit 1. La copie est restaurée ; la source produit n'a jamais été modifiée.

## G7 / G8 — Tests ajoutés et erreurs

| Fichier | Ajout / régression empêchée |
|---|---|
| `unit/tutorial-persistence.test.ts` | Six cas : cleanup/setup même instance pendant GET et PUT, succès/erreur, changement A→B pendant PUT ; ancien résultat ignoré, loading réactivé, recovery/retry conservés, aucun compteur pending négatif |
| `unit/recommendations.test.ts` | Deux cas : intersections de filtres, ordre éditorial, absence de match, reset et absence de mutation du catalogue |
| `unit/serializability.test.ts` | Test existant étendu au questionnaire canonique, sans nouvelle copie de catalogue |
| `unit/guest-claim-recovery.test.ts` | Deux tests existants étendus au vrai composant SSR/I18n : message d'échec et retry actif, pending désactivé, notice vide après retry réussi ; aucun faux clic simulé |
| `unit/test-runner.test.ts` | Treize tests/sous-tests de gate : env/replay, summaries, discovery, redaction et vrais subprocess pass/skip/TODO/cancel/empty/early-exit/local-skip |
| `integration/auth-production.test.ts` | Un lifecycle HTTPS réel et révocation, décrit ci-dessus |

Les cas async utilisent des promises contrôlées et des subscriptions, sans
sleep pour deviner l'ordre. Les six nouveaux cas ont un timeout de 2 s pour
transformer une régression de liveness en échec explicite.

Contre-preuve lifecycle : dans une copie isolée, supprimer `active &&` de la
garde d'identité du controller fait échouer le nouveau cas PUT success : phase
ready au lieu de loading. La copie restaurée passe les six nouveaux cas.

Contre-preuve Claim SSR : dans une copie isolée, masquer la notice pour l'état
failed fait échouer l'assertion de message/action annoncé (markup vide). La copie
restaurée, exécutée depuis son propre tsconfig JSX, passe le même scénario.

Les chemins d'erreur déjà couverts sont conservés : audit GET/save/submit,
payload/JSON malformed, HTTP/network/abort, claim retry, hydration Tutorial,
PUT/navigation/retry, Account audit fetch et sauvegarde puis Tutorial GET,
version incompatible. Ils ne retournent pas artificiellement succès ou données
vides. L'erreur de session initiale reste l'écart produit décrit plus bas.

## G9 — Déterminisme

Fixed : dépendances inter-sous-tests de quatre suites, setup et seeds explicites,
release/drain garantis du verrou et des inject requests même si la preuve de
concurrence échoue, liveness bornée des nouveaux cas async.

Acceptable : timestamps historiques explicites plutôt que comparaison de deux
écritures à la même milliseconde ; concurrent PUT accepte l'un des snapshots
complets puis vérifie une dernière écriture ordonnée ; labels legacy fixes dans
un schéma de replay à UUID privé ; assertions d'identité/arrays copiées.

Le test Audit conserve le polling SQL borné 50 × 20 ms avec `FOR UPDATE NOWAIT`
et reconnaissance de `55P03`. La fenêtre de 100 ms observe submit bloqué **après**
preuve du verrou détenu par PUT, puis l'état final vérifie la réponse écrite.
Les timers ne servent pas à supposer que le verrou a été acquis. Sur une machine
très chargée, le budget d'acquisition peut encore produire un échec de liveness ;
ce risque est documenté, pas remplacé par une assertion plus faible.

## Family F — Base vide et migration/backfill

Une DB temporaire à nom UUID a été créée sur le PostgreSQL local existant avec
le rôle admin, puis `prisma migrate deploy` a appliqué les six migrations. Rôle
runtime restreint, huit CHECK validés et migration table non accessible vérifiés
par la suite réelle. Le gate strict passe 294 tests / 37 fichiers sur cette DB.
Après tests : aucun User, Audit ou UserTutorialProgress restant ; seule cette DB
générée a été retirée. Aucun volume ni donnée QA manuelle supprimé.

Le replay Family F, inclus dans ce gate, conserve ses assertions : ancienne
valeur name NULL refusée, ownership ambigu refusé avec rollback, réparation du
seul fixture synthétique, backfill versions=1, snapshots avant/après identiques
hors colonnes de version, huit CHECK validés. Aucun SQL de migration modifié.

Preuves et script de validation conservés hors dépôt dans
`../../../quality-g-checkpoints/validate-clean-db.mjs`, `clean-db-migrate.log` et
`clean-db-strict.log`.

## G10 — Recette navigateur restant manuelle

Liste à intégrer par Family I, sans réécriture de l'onboarding :

- responsive, débordements, densité et perception visuelle aux viewports retenus ;
- thèmes clair/sombre, contraste, états hover/focus/disabled ;
- clavier, annonces visibles, focus des modales, inert/backdrop/Échap/restauration ;
- navigation générale, historique précédent/suivant, changements successifs des
  URL dans les vues réelles et absence d'erreurs d'hydratation ;
- perception des états chargement, alerte claim et recovery, puis interaction
  visible avec leurs actions de retry.

Ownership, isolation des sessions au serveur, persistence, intégrité/versioning,
decoders et recovery transport ne reposent plus exclusivement sur cette recette.
Le montage React et l'erreur de session signalés ci-dessous ne sont pas déclarés
automatisés. Aucun navigateur n'a été ouvert dans G : aucun JSX/layout produit
modifié et aucune validation visuelle revendiquée.

Les anciennes recettes et `frontend-architecture.md` décrivent encore des mocks,
payloads/score URL, precision/delete modals ou absence d'intégrations désormais
obsolètes. Family I doit les aligner sur les comportements actuels ; G n'a pas
réécrit ces documents globaux.

## Tests retirés et compte final

Aucun test utile ou legacy restant retiré par G. Les anciens mécanismes payload
Audit URL, score URL et mock signup/progression supprimés par E ne sont plus
importés par les suites ; aucun réintroduit. Quatre conteneurs sans assertions
autonomes sont convertis en suites : la baisse de quatre tests bruts conserve
tous leurs comportements.

| Compte | Avant | Ajout G | Conversion en suites | Final |
|---|---:|---:|---:|---:|
| Unit | 220 | 21 (8 métier/lifecycle + 13 gate) | 0 | 241 |
| Integration | 56 | 1 HTTPS | -4 conteneurs | 53 |
| Other | 0 | 0 | 0 | 0 |
| Total tests | 276 | 22 | -4 | 294 |
| Suites `describe` | 0 | 0 | +4 | 4 |
| Skipped / failed / cancelled / TODO | 0 | — | — | 0 |

Fichiers obligatoires attendus : **37** (27 Unit + 10 Integration). Exécutés :
**37/37**. Tests enregistrés attendus dans cette exécution : **294** ; réussis :
**294**. Aucun compteur historique fixe n'est utilisé comme gate.

## Durée et dépendances

| Suite | Avant | Après |
|---|---:|---:|
| Unit | 1,80 s | 5,52 s |
| Integration | 5,68 s | 7,49 s |
| All local | 7,55 s | 7,54 s |
| Strict all | Pas de commande | 7,42 s |
| Strict all DB vide | Pas de mesure | 8,49 s |

Mesures indicatives sur cette machine, pas un benchmark. La durée complète reste
proche de la baseline (différence du dernier run : -0,01 s ; autres runs entre
8,17 et 8,45 s). L'unitaire comporte désormais des subprocess réels qui vérifient
les refus du gate. Les seeds indépendants et HTTPS coûtent environ 1,81 s en
intégration. Aucun pipeline de vingt minutes ajouté.

Dependencies added : **NON**. `package-lock.json` inchangé par G. Pas de
Testing Library/jsdom/Playwright, snapshots géants, framework coverage/mutation
ou seuil arbitraire. Les outils existants couvrent les ajouts retenus.

Schema changed : **NON**. Migration changed : **NON**. Endpoint added : **NON**.

## G12 — Validations finales

| Validation | Résultat |
|---|---|
| `npm run test:unit` | PASS 241/241 ; 27/27 fichiers ; aucun skip/cancel/TODO |
| `npm run test:integration` | PASS 53/53 ; 10/10 fichiers ; aucun skip/cancel/TODO |
| `npm run test:ci` | PASS 294/294 ; 37/37 fichiers ; aucun skip/cancel/TODO |
| `npm test` | PASS 294/294 ; 37/37 fichiers |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS, routes de production générées |
| `prisma validate` | PASS |
| `prisma migrate status` | PASS, six migrations appliquées |
| Base vide + migrate deploy + strict gate | PASS, huit CHECK et fixtures nettoyées |
| `git diff --check` | PASS |
| Checks de diffs G contre checkpoint | PASS |

Logs finaux dans le workspace parent : `quality-g-final-unit.log`,
`quality-g-final-integration.log`, `quality-g-final-ci.log`,
`quality-g-final-all.log`, `quality-g-final-lint.log`, `quality-g-typecheck.log`
et `quality-g-build.log`. Les essais négatifs attendus ne sont pas des échecs
résiduels de cette suite finale.

## Residual testing debt / findings autres familles

1. **Session initiale/refresh — écart produit préexistant.**
   `src/components/safecheck/AuthProvider.tsx:36` ignore `useSession.error`.
   À :48–58, data absent + isPending=false devient Guest hydrated. L'implémentation
   Better Auth installée conserve error avec data null et isPending=false sur
   échec initial (`session-atom.mjs:87–96`, :109–117). Avec data cached, un échec
   refresh peut garder l'utilisateur précédent sans erreur visible. La confirmation
   explicite refuse déjà l'erreur, mais cette preuve ne couvre pas le hook initial.
   Aucun lien démontré à une régression A–F : correction produit hors G, à décider
   par l'audit final. Family H peut reprendre le finding s'il inclut le lifecycle
   Auth ; son périmètre n'est pas présumé. Ne pas figer le défaut par un test vert.
2. **Montage frontend.** Les controllers sont testés, pas les effets réels de
   AuthProvider/useTutorialProgress, les subscriptions, le rendu synchronisé
   d'ownership, la notice claim/clic et les navigations Next successives. Choisir
   une infrastructure de montage/browser au besoin dans une passe dédiée ; les
   tests de filtre, SSR ou key ne ferment pas cette dette. Audit final informé.
3. **Workflow hébergé.** Première exécution GitHub à observer : la chaîne DB
   équivalente et le gate sont verts localement, pas un run GitHub déclenché.
4. **Family I.** Intégrer la matrice, les quatre commandes, Node 22, les deux rôles
   DB, la liste manuelle ci-dessus et corriger les recettes/architecture obsolètes.
5. **Budget du test verrou DB.** Bounded polling déjà fondé sur un verrou réel ;
   surveiller les échecs de liveness sur runners saturés, conserver ses assertions.

FAMILY G CONDITIONAL — dette de validation restante listée
