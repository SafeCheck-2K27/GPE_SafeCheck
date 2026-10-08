# SAFECHECK — QUALITY FAMILY D

Date : 5 octobre 2026 — Europe/Paris

## FAMILY D RESULT

**SUCCESS** — refactor ciblé, comportement conservé, aucun ajout architectural spéculatif.

## Baseline actuelle

Le projet utilise Next.js 16.2.9 / React 19, Fastify, Better Auth, Prisma et PostgreSQL. L'état de travail contenait déjà de nombreuses modifications et des fichiers non suivis des travaux précédents ; HEAD ne constitue donc pas la baseline de cette mission.

- A : lifecycle d'authentification, scope des requêtes Audit par identité/URL, annulation et suppression des continuations obsolètes, contrôleur et récupération des sauvegardes Tutoriels.
- B : suppression des simulations trompeuses, compte/résultats alimentés par les données réelles, sélection éditoriale explicitée.
- C : transport HTTP partagé `api-fetch.ts`, contrats et décodage des payloads séparés des clients de feature.

Ces responsabilités sont constatées dans le code courant ; les modifications non commitées ne permettent pas d'attribuer chaque ligne à une famille avec certitude. Le statut, le diff préexistant, les fichiers candidats et les empreintes de `src`, `server`, `prisma` et `tests` ont été sauvegardés dans `../../../quality-d-checkpoints` depuis ce rapport, soit `C:/Users/Tiago/Documents/Safecheck/quality-d-checkpoints`.

Avant modification, 211 tests unitaires passent. La première suite complète échoue sur 8 tests racines d'intégration, PostgreSQL étant inaccessible à `127.0.0.1:5432`. Le moteur Docker existant a été réactivé ; le conteneur PostgreSQL existant a repris avec son volume et son schéma, sans migration. La suite restaurée passe à 255 tests, sous-tests compris. Les tests ciblés Auth et Results sont verts avant leur refactor respectif.

## Refactor candidates

| Candidate | PAIN / responsabilités actuelles | BENEFIT / coût / risque | Decision | Reason / bon moment |
|---|---|---|---|---|
| D1 page Audit | 342 lignes ; orchestration du parcours et rendu, avec scope séparé de 58 lignes et UI nommée `AuditContent` | Extraction supplémentaire déplacerait callbacks/13 props ; coût moyen, risque de montage/Strict Mode | KEEP | ALREADY IMPROVED BY FAMILY A ; aucune complexité nouvelle démontrée |
| D2 erreurs Login | Deux copies de la même classification credentials/network/generic | Une seule politique pure ; coût faible, risque limité aux branches/fallbacks | REFACTOR NOW | Duplication réelle dans deux formulaires actifs, couverte après extraction |
| D2 erreurs Signup | Deux classifications network/generic, textes différents | Partager la classification en conservant les textes ; coût faible | REFACTOR NOW | Même comportement de classement, différences de copy légitimes |
| D2 validation Signup | Email/password et pseudo répétés dans modal et validation de steps | Deux prédicats purs partagés ; coût faible, risque seuil 8/trim | REFACTOR NOW | Invariants pas encore testés directement |
| D2 état/champs/navigation | Formulaire Login, callbacks PreHome et Signup à étapes différents | Un moteur commun ajouterait paramètres et concepts ; coût moyen, risque UX | KEEP | Soumission et navigation ne sont pas identiques |
| D3 imports serveur/feature | Données Audit et domaine progression purs, types effacés | Déplacement changerait surtout les chemins ; coût transversal | KEEP | Aucune dépendance React/navigateur, même transitive |
| D4 routes/service Audit | 252/132 lignes ; HTTP/ownership et persistance/verrous distincts | Extraction SQL ou repositories déplacerait un contrat sensible ; risque élevé | KEEP | Découpage lisible, transactions déjà explicites |
| D5 Tutoriels | Catalogue, domaine, session, décodage, API, queue, transport, controller et hook | Fusions perdraient les frontières de test/ownership ; coût et risque élevés | KEEP | Chaque couche a une responsabilité active distincte |
| D6 Compte | Deux effets et états de chargement/erreur/retry indépendants | Loader générique couplerait deux pannes ; bénéfice non démontré | KEEP | Isolation des erreurs préservée |
| D7 audit/audits et catalog/data | Parcours singulier, catalogue/liste pluriel ; données source/adaptateur/config distincts | Rename transversal coûteux, peu de gain | KEEP | Compréhensible dans les consommateurs ; expliquer en Family I |
| D8 Results `logic.tsx` | Configuration et résolution pures, sans JSX/React | Extension `.ts` exprime le rôle réel ; coût minime, imports extensionless | REFACTOR NOW | Déplacement local byte-identical vérifié |
| D8 grandes compositions UI | Quelques fichiers longs, mais logique déjà distribuée en composants | Fractionnement mécanique augmenterait la navigation entre fichiers | KEEP | La longueur seule n'est pas un problème démontré |
| Exports de mocks / documentation historique | Restes identifiés, hors maintien des flux actifs | Nettoyage et documentation à traiter dans leurs familles | DEFER TO OTHER FAMILY | Family E / Family I, pas de suppression transversale dans D |

## Sub-agents

| Scope | Model | Effort | Why | Result |
|---|---|---|---|---|
| D2 Auth | GPT-6 Luna | Medium | Extraction mécanique de règles pures réellement communes | Accepté après revue parent ; 12 tests Auth avant, 16 après avec 4 nouveaux tests ; typecheck vert |
| D1/D3/D4 revue Audit/frontières | GPT-6.1 Sol | Medium | Vérifier protections A et frontières serveur sans changer les verrous | KEEP confirmé ; revue exclusivement en lecture |
| D5/D6/D7 revue, D8 renommage | GPT-6 Luna | Medium | Revue de maintien et déplacement local sans changement de contenu | KEEP confirmé ; renommage accepté ; 5 tests ciblés avant/après |
| Parent | Agent de la session | Effort de la session | Baseline, décision, limites du scope, review et validation globale | Tous les contrôles exécutés, comparaison contre snapshots initiaux |

Les scopes et modèles/efforts ont été annoncés avant chaque délégation. Les deux implémentations ont travaillé sur des fichiers distincts.

## D1 — Audit frontend

État avant : page de 342 lignes, callbacks de chargement/restauration/sauvegarde/finalisation, composant de rendu `AuditContent`, scope de requêtes indépendant.

Family A avait déjà corrigé : isolation identité/URL, annulation, generation des continuations, cleanup et création unique en replay Strict Mode. **ALREADY IMPROVED BY FAMILY A.**

Refactor effectué : aucun. Les callbacks du parcours restent lisibles et utilisent une seule primitive de lifecycle ; un hook supplémentaire déplacerait ce code sans réduire sa complexité.

Tests : invariants identité, URL/hydratation, réponses tardives, GET/create/save/submit, ownership, immutabilité après finalisation et concurrence sont verts dans les suites existantes. Aucun nouveau test Audit ajouté.

## D2 — Auth forms

| Concern | Login | Signup | Identical? |
|---|---|---|---|
| Email normalization | `email.trim()` | `email.trim()` | Oui ; expression simple conservée, aucune mise en minuscules |
| Password validation | Non vide | Au moins 8 caractères | Non ; mot de passe conservé tel quel |
| Submit state | État local ; modal Navbar vs callback PreHome | État local ; modal vs flow à étapes | Syntaxe ressemblante, contexte différent : KEEP |
| Better Auth errors | Credentials/network/generic | Network/generic | Politiques distinctes ; chaque politique partagée entre ses deux appelants |
| Claim handling | Provider + recovery existants | Provider + recovery existants | Déjà mutualisé ; KEEP sans modifier les internals |
| Navigation | `/accueil` ou callback du parent | `/compte` ou `pendingHref` | Non : KEEP |
| Profile validation | Aucun pseudo | Pseudo non blanc | Partagé entre les deux Signup uniquement |
| Champs / visibilité / UI | Variantes actuelles | Pseudo et étapes propres | Aucune primitive supplémentaire justifiée |

Factorisé : nouveau module pur `src/components/safecheck/auth-form.ts` avec `getLoginErrorKey`, `getSignupErrorKey`, `hasValidSignupCredentials`, `hasValidSignupProfile`. Les types de clés sont explicites et les erreurs inconnues restent génériques. Le module dépend de la classe pure existante dans `auth-logic.ts`, jamais d'un provider React ni d'une feature.

Conservé séparé : états de soumission, gardes, champs, navigation, traductions et texte spécifique de `SignupFlow`. Le dernier step Signup garde sa validation de pseudo uniquement ; l'extraction ne lui impose pas un nouveau contrôle password. `validation.ts` garde ses exports publics et délègue les règles communes.

BEFORE : Login 2 classifications ; Signup 2 classifications ; validations credentials/profile dupliquées entre modal et feature.

AFTER : une implémentation par politique, sans moteur de formulaire commun. Modifier le classement d'une erreur ou le seuil Signup ne nécessite plus deux modifications coordonnées.

## D3 — Server/shared boundaries

| Import réel | Classification | Decision |
|---|---|---|
| `server/audits/service.ts` → `features/audit/data.ts` | PURE STATIC DATA ; seul import transitif type-only vers `types.ts` | KEEP |
| `server/audits/routes.ts` → `features/audit/data.ts` | PURE STATIC DATA | KEEP |
| `server/audits/routes.ts` → `features/audit/types.ts` | PURE DOMAIN, types uniquement, aucun import | KEEP |
| `server/tutorial-progress/contract.ts` → `features/tutorials/progress.ts` | PURE DOMAIN runtime + types, aucune dépendance | KEEP |
| `server/tutorial-progress/service.ts` → `features/tutorials/progress.ts` | PURE DOMAIN, type uniquement | KEEP |

Moves : aucun. Aucune cible MIXED ou REACT/CLIENT COUPLED. Les contrats de transport restent dans `src/lib/contracts` ; le catalogue Tutoriels serveur provient déjà de `src/lib/tutoriels-data.ts`.

Cycles : contrôle AST/résolution TypeScript des imports statiques, reexports et imports dynamiques littéraux dans 221 fichiers `src`/`server` : 458 edges runtime et 577 avec types ; aucun cycle runtime ou incluant les types, aucun import local manquant, aucune dépendance `components` → `features`. CSS existant exclu du graphe TypeScript. Aucun outil/dépendance ajouté au projet.

## D4 — Audit backend structure

**KEEP**. Routes : authentification/cookie, validation HTTP, sérialisation et codes de réponse. Service : propriété des données, requêtes Prisma, complétude, transactions et verrou de sérialisation écritures/finalisation. Les branches sont nommées et courtes ; la répétition de deux petits blocs SQL n'impose pas un helper abstrait.

Refactor : aucun ; verrous, ownership, transactions et API préservés byte-for-byte par comparaison des empreintes.

## D5 — Tutorial architecture

| Layer | Decision | Reason |
|---|---|---|
| Catalogue `src/lib/tutoriels-data.ts` | KEEP | Source statique unique et sérialisable |
| Public adapter `data/catalog.ts` | KEEP | Point d'entrée stable des consommateurs feature |
| Editorial config `data.ts` | KEEP | Config UI active distincte du contenu des tutoriels |
| `progress.ts` | KEEP | Règles et normalisation pures, utilisées serveur/frontend |
| `session.ts` | KEEP | Mapping statut carte et mises à jour isolées par tutoriel |
| `hydration.ts` | KEEP | Décodage inconnu, doublons et adaptation au catalogue actuel |
| `api.ts` | KEEP | HTTP et vérification de l'identité de la réponse PUT |
| `save-queue.ts` | KEEP | Ordre par tutoriel et récupération des écritures non confirmées |
| `transport.ts` | KEEP | Queue partagée entre routes dans le lifecycle Auth |
| `progress-controller.ts` | KEEP | Transitions, générations et erreurs de sauvegarde hors React |
| `useTutorialProgress.ts` | KEEP | Adaptateur Auth/React du controller |

Aucune couche devenue inutile ni nouvelle duplication justifiant fusion/suppression. Les 112 lignes du controller, 46 de queue et 34 du hook portent des responsabilités différentes. Les tests de queue ordering, cross-route recovery, auth invalidation, décodage et session restent verts.

## D6 — Account architecture

**KEEP**. `compte/page.tsx` conserve deux effets, deux jeux d'états et deux retries indépendants pour Audits et Tutoriels. La panne d'une section ne déclenche pas l'échec de l'autre. Le loader Tutoriels (25 lignes) attend la queue et expose les échecs de sauvegarde ; le mapper (45 lignes) enrichit les snapshots avec le catalogue. Aucun loader dashboard générique, aucune nouvelle API.

Changes : aucun. Les composants et mappings restent spécifiques à leurs données.

## D7 — Naming

Rename effectué : seulement extension `results/logic.tsx` → `logic.ts` (D8).

Renames refusés : arborescences `audit`/`audits`, catalogue/adaptateur/config éditoriale, `AuditDto`/résumé Compte. Singularité du parcours et pluralité du catalogue/liste sont compréhensibles dans les consommateurs.

Documentation future : Family I pourra expliquer ces frontières et mettre à jour les anciennes références à `logic.tsx`. Aucun rename transversal réalisé pour une préférence de dossier.

## D8 — Small structural refactors

Liste complète : **un** renommage `src/features/results/logic.tsx` → `src/features/results/logic.ts`.

BEFORE : module de configuration/résolution pur étiqueté TSX. AFTER : même code identifié comme TypeScript pur. Empreinte SHA-256 avant/après : `5EFD95C3CF7D42D7F2C74EA506ECE5FDE31EB0C7C1D3C31A6A4E4C7602E4504B`. Les imports extensionless résolvent le nouveau fichier ; seuils, scoring et recommandations n'ont pas changé.

Autres TSX sans JSX : deux wrappers de redirection de route de 4 lignes, conservés dans la convention App Router. Les longues compositions UI inspectées ne justifient pas de fractionnement mécanique.

## Refactors REJECTED par le parent

Aucun patch soumis par un sub-agent n'a été rejeté après implémentation : les deux changements respectaient les contraintes annoncées. Pistes examinées et refusées lors de la décision/review :

- Hook Audit ou extraction des 13 props de `AuditContent` uniquement pour réduire la longueur de page.
- Moteur générique Auth, hook de soumission commun, unification de navigation/copy et helper qui encapsulerait seulement `trim()`.
- Déplacement global vers `domain/`, repositories, contrôleurs par endpoint, abstraction du verrou Audit.
- Fusion des couches Tutoriels ou des chargements Compte.
- Suppression des exports de mocks dans D et découpage des longues compositions sans risque de maintenance précis.

Ces pistes ne constituent pas des modifications partiellement abandonnées ; aucun revert des travaux A/B/C n'a été nécessaire.

## Fichiers modifiés

Modifiés par D, comparaison à l'état de travail initial :

- `src/components/safecheck/layout/NavbarLoginModal.tsx`
- `src/components/safecheck/SignupModal.tsx`
- `src/features/home/components/PreHomeLoginModal.tsx`
- `src/features/account/signup/components/SignupFlow.tsx`
- `src/features/account/signup/validation.ts`

Ajoutés :

- `src/components/safecheck/auth-form.ts`
- `tests/unit/auth-form.test.ts`
- `docs/qa/quality-d-targeted-refactor.md`

Fichiers déplacés : `src/features/results/logic.tsx` → `src/features/results/logic.ts`, contenu identique à la baseline courante (incluant B).

Les empreintes des autres fichiers sources, serveur, tests existants et Prisma n'ont pas changé. Les logs, snapshots et script temporaire d'analyse d'imports sont dans le workspace parent, en dehors du dépôt. Aucun commit, staging ou nouvelle dépendance.

## Tests

Avant : 211/211 unitaires ; 8 racines d'intégration indisponibles à la première exécution ; suite complète restaurée 255/255. Auth ciblé 12/12 ; Results/sérialisation ciblés 5/5 avant et après.

Nouveaux : 4 tests de politique jusque-là enfermée dans les composants — fallback des erreurs inconnues, différence Login/Signup, email non blanc/seuil de 8 sans trim du password, pseudo non blanc. Pas de nouveaux tests de rendu ni de compteur gonflé par des copies de l'implémentation.

Après : **215 unitaires, 44 intégration, 259 total**, zéro échec et zéro test ignoré. Les comptes d'intégration incluent les sous-tests Node.

## DB

Schema : **NON modifié**. Migrations : **NON**. Empreinte du schéma identique avant/après. Aucun changement de modèle, migration ou configuration DB par D ; seules les fixtures des tests existants utilisent la DB locale.

## API

Nouvel endpoint : **NON**. Response contract changed : **NON**. Clients, contrats HTTP et backend n'ont pas été modifiés.

## Vérifications

| Check | Command / evidence | Result |
|---|---|---|
| Unit | `node --import tsx --test tests/unit/*.test.ts` | 215/215 |
| Integration | `node --import tsx --test tests/integration/*.test.ts` | 44/44 |
| Full suite | `npm test` | 259/259 |
| Typecheck | `npm run typecheck` après build | PASS |
| Lint | `npm run lint` après changements | PASS |
| Build | `npm run build`, Next 16.2.9 Turbopack | PASS ; 20 pages générées |
| Prisma validate | `npx prisma validate`, schéma inchangé depuis ce contrôle | PASS |
| Diff whitespace | `git diff --check` et contrôle des fichiers ajoutés | PASS |
| Imports/cycles | AST TypeScript/résolution locale ; graphe runtime et avec types | PASS |
| Preservation | Manifest avant/après + snapshots des fichiers candidats | Seuls changements D attendus |

Pas de recette interactive navigateur dans cette passe : aucun JSX/layout ou mécanisme de navigation modifié ; la preuve de conservation repose sur les diffs ciblés, tests et compilation. Aucune affirmation de validation visuelle.

## Complexité supprimée

Quatre classifications d'erreurs dispersées deviennent deux politiques pures réutilisées. Les validations Signup répétées deviennent deux prédicats dont les wrappers publics existants gardent le sens. Le module Results révèle sa nature pure par son extension, sans changement de contenu.

## Dette volontairement conservée

- Page Audit encore longue : scope sensible et UI déjà séparés, bénéfice d'une nouvelle extraction insuffisant.
- Variantes Login/Signup : validations, copie et navigation légitimement différentes.
- Petits fichiers Tutoriels : limites d'ownership utiles pour les courses et la persistance.
- Imports serveur vers features pures : sécurité transitive vérifiée, déplacement sans bénéfice actuel.
- Noms singulier/pluriel et documentation historique : nettoyage/documentation hors D.

## Findings autres familles

- **Family E** : anciens exports `mockTutoStatus`, `mockTutoLastStep`, `userProgress` à auditer dans leur périmètre de code mort ; aucune suppression dans D.
- **Family F** : aucun nouveau finding structurel DB ; problème initial de disponibilité locale résolu sans modifier schéma/migrations.
- **Family G** : tests Audit vérifient scope/helpers et intégration plutôt qu'un montage React complet ; catalogue Audit absent du test général de sérialisation. Observations de couverture, aucun défaut démontré ni test imposé dans D.
- **Family H** : variantes navigation/`pendingHref` volontairement conservées, aucun changement Auth UX.
- **Family I** : documentation frontend annonce encore une auth simulée et pas d'intégration backend, contrairement au code actuel ; références historiques `logic.tsx` à actualiser dans la passe documentaire.

## Verdict final

FAMILY D CLOSED — refactor ciblé terminé sans sur-architecture
