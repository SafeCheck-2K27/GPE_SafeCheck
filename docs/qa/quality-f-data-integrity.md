# SAFECHECK — QUALITY FAMILY F

Clôture : 2026-10-06, Europe/Paris. Travail réalisé depuis l'état existant des familles A–E, sans remplacer leurs changements. Résultat : **SUCCESS**.

## Baseline et carte des invariants

Avant modifications : `git status` relevé, schéma complet et cinq migrations lus, services Audit/Progress, scoring, questionnaires, 34 tutoriels et tests d'intégration inspectés. Les cinq migrations étaient appliquées. Suite initiale : **256/256**, aucun test ignoré.

| Modèle | Invariants | Gardes application | Gardes DB avant F | Écart traité |
|---|---|---|---|---|
| User | Identité, email unique, nom requis | Better Auth, session pour les accès User | PK, email UNIQUE, name NOT NULL, Role enum | Précondition de la migration historique du nom |
| Session | Session/token uniques, User existant, expiration | Better Auth | PK, token UNIQUE, FK Cascade, index userId | Aucun nouveau CHECK temporel nécessaire |
| Account | Compte auth associé à un User | Better Auth | PK, FK Cascade, index userId | Aucun changement |
| Verification | Vérification avec expiration | Better Auth | PK, colonnes requises, index identifier | Aucun changement |
| Audit | Un seul owner, statut, versions, activité métier | Owner filtré, cookies signés, verrou de ligne save/submit | PK, FK Restrict, enum, index owners | XOR SQL, versions, timestamp des réponses |
| AuditAnswer | Une réponse par Audit/question, question/option compatibles | Validation du questionnaire dans la transaction | PK composite, FK Cascade | questionId positif SQL ; définitions v1 conservées |
| UserTutorialProgress | Une progression par User/tutoriel, indices compatibles avec son contenu | Session, catalogue, bornes, normalisation | PK composite, FK Cascade, types/defaults | Version, bornes structurelles et tableau non NULL SQL |

| Finding | Statut initial | Résolution |
|---|---|---|
| F1 | CONFIRMED | XOR DB ajouté |
| F2 | CONFIRMED | Parent timestamp mis à jour dans la transaction réponse |
| F3 | CONFIRMED | Questionnaire persistant et définition v1 |
| F4 | CONFIRMED | Scorer persistant et dispatch explicite |
| F5 | CONFIRMED | Version par tutoriel et rejet des conflits |
| F6 | PARTIAL | API existante solide, CHECK structurels ajoutés |
| F7 | CONFIRMED | Migration locale sûre ; précontrôle ancienne base documenté et risque reproduit |
| F8 | ALREADY RESOLVED | Index existants suffisants pour les requêtes MVP ; aucun ajout |
| F9 | PARTIAL | Restrict conservé et politique explicite |

## Sub-agents

| Task | Model | Effort | Why | Result |
|---|---|---|---|---|
| F2–F4 : Audit, timestamps, questionnaire/scoring | GPT-6.1 Sol | High | Cohérence historique services/DTO/frontend | Implémenté ; unités et intégration ciblées vertes |
| F5 : contenu et progression tutoriels | GPT-6.1 Sol | High | Chargement et écriture compatibles, concurrence | Implémenté ; unités et intégration ciblées vertes |
| F6–F9 : revue contraintes/migration Auth/index/politique | GPT-6 Luna | Medium | Revue ciblée sans mutation concurrente du schéma | Préconditions et décisions documentées |
| Parent : schéma, migration, intégration et contrôle final | Modèle parent | — | Un seul propriétaire des changements SQL | Revue SQL, application, reprise isolée, données et validations |

## Schema avant/après

Modèles modifiés : **Audit**, **UserTutorialProgress**. `AuditAnswer` reçoit un CHECK SQL, sans nouvelle colonne.

- Audit : `questionnaireVersion Int @default(1)`, `scoringVersion Int @default(1)`.
- Progression : `tutorialVersion Int @default(1)`.
- `completedSteps` : SQL `NOT NULL`, en plus du défaut tableau vide existant.
- Huit CHECK validés : XOR owner, deux versions Audit positives, questionId positif, tutorialId positif, tutorialVersion positive, currentStep non négatif, tableau d'indices valide.
- Aucun index ni relation ajouté/modifié ; `Audit.userId` reste Restrict, les cascades existantes restent effectives.

## Migration

Nom : `20261005120000_strengthen_data_integrity_and_versions`.

Le diff Prisma initial ne contenait que les trois colonnes de version. Le parent a relu chaque instruction de la migration SQL complétée avec les gardes structurelles. Aucune instruction DROP, aucun changement de FK/PK/index, aucun UPDATE/DELETE des contenus existants.

La migration utilise une transaction, un `lock_timeout` de 10 s et un verrou exclusif sur les trois petites tables concernées. Le précontrôle exécuté sous ce verrou refuse les owners ambigus et indices invalides ; il ne tente aucune réparation automatique. Les CHECK revalident les données et les defaults constants backfillent les versions sans modifier les timestamps. Sur une base importante ou occupée, prévoir une fenêtre adaptée : les contraintes nécessitent un scan et le verrou peut bloquer les écritures jusqu'au COMMIT. Un dépassement du délai doit être investigué puis retenté, sans supprimer les garde-fous.

Backfill : **11 audits** reçoivent questionnaireVersion=1 et scoringVersion=1 ; **4 progressions** reçoivent tutorialVersion=1. Ces contenus étaient effectivement ceux utilisés avant F, toutes les questions/options présentes étaient compatibles, et les quatre progressions correspondent aux étapes actuelles des tutoriels 1, 3 et 7. Aucun autre champ n'est transformé.

Apply : succès avec `prisma migrate deploy`. Six migrations appliquées, `prisma migrate status` à jour. Diff DB → schema Prisma : **migration vide**. Les cinq fichiers de migration antérieurs sont identiques au checkpoint initial.

La reprise dans un schéma de test isolé reconstruit les cinq anciennes migrations, reproduit le refus Better Auth pour un nom NULL, puis vérifie le refus Family F pour un owner ambigu et le rollback sans colonne partiellement ajoutée. Après réparation du seul fixture synthétique, la migration réussit, backfille et conserve toutes les colonnes préexistantes. Le schéma de test est supprimé ; aucun schéma temporaire ne demeure.

## F1 — Ownership XOR

Avant : type discriminé et filtrage applicatif, sans garantie PostgreSQL. Après : `audits_owner_xor_check` exige exactement un owner non NULL. Le claim change userId et guestSubject ensemble dans un update SQL et reste compatible.

Tests : User-only et Guest-only acceptés ; both-null et both-set refusés directement par SQL ; claim explicite/idempotent, isolation User et conservation des versions/réponses/statut vérifiés. Le fixture de claim qui créait volontairement deux owners a été remplacé par un owner User valide.

## F2 — Audit.updatedAt

Sémantique : dernière écriture métier réussie via l'application, incluant sauvegarde/remplacement d'une réponse, submission et claim d'ownership. Le save actualise le parent **dans la transaction déjà sérialisée sur l'Audit**. Submit met à jour le statut via Prisma ; claim met à jour le timestamp et les deux champs owner ensemble.

Les dates sont des timestamps en millisecondes, pas un compteur de révision strictement croissant. Les écritures SQL administratives hors service ne déclenchent pas automatiquement `@updatedAt` ; aucun trigger n'a été ajouté.

Tests déterministes avec ancienne date : création/remplacement d'une réponse et submit actualisent l'activité ; réponse invalide, audit incomplet, réponse après completion, version incompatible et submit déjà terminé ne changent pas artificiellement updatedAt. Claim répété ne réactualise pas une ligne déjà réclamée.

## F3 — Questionnaire version

`CURRENT_QUESTIONNAIRE_VERSION=1`, valeur enregistrée explicitement à la création. La définition initiale vit dans `src/features/audit/versions/questionnaire-v1.ts` ; `data.ts` reste l'adaptateur public, sans second catalogue dupliqué.

Les DTO création/lecture/liste/submit portent les deux versions, décodées comme entiers positifs obligatoires. Les résumés peuvent transporter une version future comme métadonnée. L'interprétation des réponses et des questions utilise la version persistée ; une version inconnue donne une incompatibilité explicite. Les pages audit/résultats affichent que la version n'est pas prise en charge et que les réponses sont conservées.

## F4 — Scoring version

`CURRENT_SCORING_VERSION=1`, enregistré explicitement à la création. La formule v1 est conservée dans `versions/scoring-v1.ts` et `calculateVersionedAuditScore` choisit la combinaison questionnaire/scorer persistée. Actuellement seule Q1/S1 est supportée. Aucun fallback sur CURRENT ; Q2/S1 et Q1/S2 sont refusés. Le calcul reste frontend.

Les poids, le dénominateur et l'arrondi v1 sont vérifiés. L'API save/submit refuse aussi les versions non supportées avec **409 AUDIT_VERSION_UNSUPPORTED**, sous verrou, sans mutation des données.

## F5 — Tutorial version

Les **34 tutoriels** déclarent chacun `version: 1`, explicite et stable, dans le catalogue statique. La progression porte `tutorialVersion`, exposée par DTO et envoyée dans chaque PUT.

Le lecteur et le compte comparent cette version avant toute normalisation des indices. Un tutoriel retiré reste ignoré ; une progression de version incompatible n'est jamais convertie silencieusement. Le chargement passe par le chemin d'erreur contrôlé existant et interdit l'interaction tant que la progression n'est pas chargée.

L'API refuse un client périmé ou une ligne incompatible avec **409 TUTORIAL_VERSION_CONFLICT**. Les écritures transactionnelles utilisent un update conditionnel sur la version, puis une création/reprise bornée en cas de conflit de PK. Une ligne d'ancienne version n'est ni reset, ni réétiquetée avec la nouvelle version.

Tests : match v1, versions manquantes/invalides/inconnues, lecture lecteur/compte incompatible, refus PUT sans modification, concurrence des premières sauvegardes, isolation, et persistance explicite d'une version 2 simulée du catalogue. Aucun moteur de migration des étapes, CMS ou table Tutorial.

## F6 — Constraint matrix

| Invariant | DB / APP / BOTH | Reason |
|---|---|---|
| Un seul owner Audit | BOTH | Structure stable ; union et CHECK |
| User référencé existe | BOTH | Session/ownership plus FK |
| PK unique Audit/question, User/tutoriel | DB | Unicité structurelle |
| Versions non NULL et >0 | BOTH | Identifiant durable, DTO/request et SQL |
| Version supportée/compatible | APP | Dépend des handlers/catalogues disponibles |
| questionId >0 | BOTH | Domaine stable, indépendant du questionnaire |
| Question/option appartient à la définition persistée | APP | Catalogue statique versionné |
| Audit complet avant submit, pas de save après submit | APP | Règle métier, transaction et verrou |
| tutorialId >0 | BOTH | Domaine stable |
| Tutoriel existe | APP | Catalogue statique |
| currentStep >=0 | BOTH | Indice stable |
| currentStep et completedSteps < nombre d'étapes | APP | Longueur de contenu versionnée |
| completedSteps non NULL, sans élément NULL/négatif | BOTH | Structure durable d'une liste d'indices |
| Tableau unidimensionnel, stockage PostgreSQL à borne 1 | DB | Forme du tableau compatible avec la liste Prisma ; les valeurs métier restent à partir de 0 |
| Tri/dédoublonnage des completedSteps | APP | Normalisation, sans CHECK complexe |
| updatedAt correspond aux écritures métier | APP | Transaction service et Prisma, sans trigger SQL |
| email/token uniques, name requis, statut enum | DB + gardes Auth/APP existantes | Aucun renforcement supplémentaire nécessaire |

## F7 — Better Auth migration

La migration `20260928185518_add_better_auth_core` faisait `ALTER COLUMN name SET NOT NULL`, sans default/backfill, en supposant seulement une base locale vide. Elle est sûre pour la base locale actuelle : déjà appliquée, six utilisateurs, zéro nom NULL. Elle peut échouer sur une ancienne base peuplée.

Décision : **KEEP**, fichier historique inchangé. Précondition avant son application ailleurs : identifier le schéma/ledger, compter les `users.name IS NULL` et exiger **zéro** ; si des lignes ambiguës existent, arrêter le rollout et décider explicitement leur réparation. Si la migration est déjà appliquée, confirmer le NOT NULL réel et investiguer toute dérive. Les requêtes exploitables sont dans `quality-f-db-review.md`. Le test de reprise reproduit le SQLSTATE 23502 sur le cas ancien pour confirmer le risque.

## F8 — Indexes

| Index candidate | Decision | Reason |
|---|---|---|
| Audit PK(id) | KEEP | Lecture individuelle filtrée par owner |
| Audit(userId) | KEEP | GET history User et FK Restrict |
| Audit(guestSubject) | KEEP | Claim Guest ; aucun endpoint de liste Guest actuellement |
| Audit(userId,createdAt,id) | NOT JUSTIFIED | Filtre déjà indexé, tri des lignes User raisonnable au MVP ; pas de mesure justifiant un remplacement/ajout |
| AuditAnswer(auditId,questionId) PK | KEEP | Réponses ordonnées et count par Audit |
| UserTutorialProgress(userId,tutorialId) PK | KEEP | Filtre progression par User et accès unique |
| UserTutorialProgress(userId) | NOT JUSTIFIED | Redondant avec le préfixe de PK |
| UserTutorialProgress(userId,updatedAt,tutorialId) | NOT JUSTIFIED | Petit ensemble par User ; tri existant suffisant sans preuve de volume/latence |
| UserTutorialProgress(tutorialId) | NOT JUSTIFIED | Aucune requête correspondante |

Aucun EXPLAIN de petit dataset n'a été utilisé pour justifier un index spéculatif.

## F9 — User delete policy

**KEEP RESTRICT** : supprimer un User avec des audits est refusé. La progression ne disparaît donc pas alors que le User reste présent. Après suppression ciblée des audits de test, la suppression du User cascade bien ses progressions. Aucune feature de suppression de compte construite.

Une future feature devra décider de la conservation/anonymisation/cascade des audits et des obligations de rétention avant de modifier cette relation.

## Existing data verification

| Table | Before | After migration et tests |
|---|---:|---:|
| users | 6 | 6 |
| session | 2 | 2 |
| account | 6 | 6 |
| verification | 0 | 0 |
| audits | 11 | 11 |
| audit_answers | 73 | 73 |
| user_tutorial_progress | 4 | 4 |

Au-delà des counts, empreintes calculées sur **toutes les colonnes préexistantes** identiques avant/après migration et après la suite finale. Aucun owner invalide, nom NULL, tableau NULL/indice négatif, question/option inconnue ni progression hors catalogue trouvés. Aucun contenu QA/manuellement saisi supprimé. Backfill seul : trois champs version. Fixtures d'intégration nettoyés ; zéro schéma replay restant.

## API impact

AuditDto/CreatedAuditDto/AuditSummaryDto : ajout questionnaireVersion/scoringVersion ; TutorialProgressDto : ajout tutorialVersion. PUT progression requiert tutorialVersion. Les endpoints existants restent en place ; aucun nouvel endpoint. Décodeurs et fixtures adaptés. Déployer ensemble les contrats client/serveur : l'ancien client sans version de tutoriel est rejeté avec 400 plutôt qu'interprété arbitrairement.

## Tests et validations

Deux nouveaux fichiers : `tests/unit/audit-versions.test.ts`, `tests/integration/data-integrity.test.ts`. Tests/fixtures existants adaptés pour contrats, guards, timestamps et claim. Diff net : **+20 tests** comptés par node:test.

| Validation | Résultat |
|---|---|
| Baseline npm test | 256/256, 0 ignoré |
| prisma format | Succès |
| prisma validate | Succès, confirmé à la fin |
| prisma generate | Succès, client 7.9.0 |
| Migration apply | Succès |
| migration status | Six migrations, à jour |
| DB → schema diff | Migration vide |
| Unit | 220/220 |
| Integration | 56/56 |
| Full npm test | 276/276, 0 échec/ignoré/annulé |
| typecheck | Succès après correction du type littéral dans un fixture de test |
| lint | Succès |
| build | Succès, 20 pages générées |
| git diff --check | Succès |

Après l'interruption, Docker était fermé et un premier rerun complet a échoué avec P1001. Le moteur et le conteneur PostgreSQL existants ont été relancés avec leur volume conservé ; le rerun complet et le contrôle DB final ont réussi. Aucun changement du schéma ou des credentials n'a été nécessaire pour cette reprise. Pas de recette navigateur réalisée dans ce checkpoint ; les messages d'incompatibilité ont été inspectés dans le code et compilés, et les chemins d'erreur sont couverts par les tests de contrats/API.

## Règles d'évolution et dette restante

Aucune dette bloquante dans le périmètre F. Pour une évolution réelle :

1. Questionnaire/scoring : conserver les fichiers v1, ajouter une définition/scorer versionné et un dispatch explicite ; incrémenter volontairement CURRENT. Ne jamais modifier la signification d'un ID de version existant. Mettre à jour les defaults DB dans une nouvelle migration si les versions courantes changent.
2. Tutoriel : incrémenter son entier lorsque le sens/l'ordre des étapes change. Choisir une migration/mapping ou un reset explicite, justifié par cette évolution ; le code actuel bloque les progressions incompatibles et les conserve.
3. Migrations futures : inspecter le SQL pour préserver les huit CHECK et completedSteps NOT NULL, gardes documentées dans le schéma Prisma mais non modélisables intégralement dans son DSL. Le diff Prisma actuel est vide ; exécuter les tests SQL directs après toute évolution de migration pour détecter une suppression de ces gardes. Ne pas utiliser `db push` pour contourner l'historique.
4. Anciennes bases : appliquer le précontrôle Better Auth et vérifier le contenu réellement associé au backfill initial avant rollout. La preuve locale ne vaut pas pour un contenu externe différent.

## Findings for other families

- Family G : aucun nouveau finding dans le périmètre inspecté.
- Family H : aucun nouveau finding dans le périmètre inspecté.
- Family I : intégrer au runbook le précontrôle `users.name IS NULL = 0` avant la migration Better Auth non appliquée ; conserver les gardes SQL custom, prévoir une fenêtre pour les scans/locks, déployer les nouveaux contrats client/serveur ensemble. Revoir les index seulement avec volume/latence mesurés.

FAMILY F CLOSED — intégrité DB et historique versionné stabilisés
