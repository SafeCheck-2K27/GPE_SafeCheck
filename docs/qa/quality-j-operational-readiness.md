# SAFECHECK — QUALITY FAMILY J

Date : 6 octobre 2026 — Europe/Paris. **HISTORICAL / QA REPORT**.
Registre maintenu : [préparation opérationnelle](../operational-readiness.md).

## FAMILY J RESULT

**SUCCESS WITH DEBT**. J1–J8 traités en une passe BUILD : délais et readiness
implémentés, pagination/index supplémentaires différés avec triggers mesurables,
naming conservé avec raisons, extensions et deux petits P3 de présentation corrigés.
Les dettes préexistantes de tests UI, CI hébergée, contenu et sécurité restent
identifiées. La clôture de J n'est pas une autorisation d'exposition publique.

## Historical P3 reconciliation

| Item | Original status | Current status | Final decision |
|---|---|---|---|
| PUT Tutoriel bloqué et idle | STILL OPEN après A/C/D : signal de session, aucun timeout | Deadline transport et récupération A testées | IMPLEMENTED |
| Pagination historique | CONDITIONAL | GET sans limite, petit dataset QA, ordering stable | DEFERRED WITH EXPLICIT TRIGGER |
| Index supplémentaires | CONDITIONAL ; F avait déjà revu les accès | Index ownership/PK inchangés, pas de preuve de besoin | DEFERRED WITH EXPLICIT TRIGGER pour tri ; NOT NEEDED pour doublons |
| DB readiness | STILL OPEN : health et log startup seulement | Nouveau /ready séparé et borné | IMPLEMENTED |
| Naming audit/audits et questionnaire/niveaux | IMPLEMENTED BY PREVIOUS FAMILY D/I : distinction explicitée | Workflow singulier, catalogue pluriel, versions indépendantes | ALREADY RESOLVED ; KEEP |
| results/logic.tsx sans JSX | IMPLEMENTED BY PREVIOUS FAMILY D | logic.ts présent | ALREADY RESOLVED |
| Autres TSX sans JSX | STILL OPEN : deux pages redirect | Deux renommages validés par Next/build/start | IMPLEMENTED |
| Numérotation recommençant à 4 par catégorie | STILL OPEN depuis B | Rang issu de la liste originale | IMPLEMENTED |
| Escape Unicode littéral hub | STILL OPEN depuis B | Texte JSX corrigé | IMPLEMENTED |
| Statistiques et texte OS daté | STILL OPEN depuis B, éditorial | Maintenus localement ; revue avant publication exigée | DEFERRED WITH EXPLICIT TRIGGER |
| Nettoyage mocks / docs obsolètes D/E | IMPLEMENTED BY PREVIOUS FAMILY E/I | Modules retirés, références actuelles | ALREADY RESOLVED |
| Session error G | IMPLEMENTED BY PREVIOUS FAMILY H | État d'erreur/retry Auth explicite | ALREADY RESOLVED |
| Montage UI/E2E, CI hébergée G/I | STILL OPEN, validation réelle | Controllers/intégration/recette manuelle ; aucune suite navigateur permanente ni run hébergé observé | DEFERRED WITH EXPLICIT TRIGGER |
| LWW et autres features post-MVP | CONDITIONAL, comportements annoncés B/F/I | Pas de merge/offline promis ni backend fictif | DEFERRED WITH EXPLICIT TRIGGER ou NOT NEEDED au MVP |
| Roadmap Tutorial / anciennes étapes TUTO 4–6 | NO LONGER RELEVANT comme bugs de persistance | Contrats, versioning, API et raccordement actuels présents | ALREADY RESOLVED ; features roadmap hors MVP NOT NEEDED |
| Configuration runtime DB/secret Auth | STILL OPEN : pas de validation explicite dans buildApp | Vérification avant listen | IMPLEMENTED |
| Tickets sécurité externes F02/F03/F04 | STILL OPEN, préexistants et hors A–I | Chemins concernés toujours présents | DEFERRED WITH EXPLICIT TRIGGER ; ACTUAL DEBT / FINAL AUDIT BLOCKER |

Sources disponibles : rapports B/D/E/F/G/H/I, manifest A
`quality-a-checkpoints/family-delta.json`, checkpoints C, baseline A/C résumée
dans D, code courant, rapports TUTO et tickets `prompts-backend`.
Il n'existe pas de rapport QA autonome A/C dans docs/qa. La baseline Astra
Family J a été fournie par le prompt ; la synthèse comparative historique a été
recherchée, sans finding J additionnel correspondant. Pas d'attribution de chaque
ligne à une famille à partir du seul HEAD : checkout largement modifié avant J.

## Sub-agents

| Scope | Model | Effort | Why | Result |
|---|---|---|---|---|
| Network timeout / Tutoriel | GPT-6.1 Sol | Medium | Annulation, body stalled, ordonnancement et recoveries cross-route | Accepté ; commentaire délai complété par parent |
| Readiness / env startup | GPT-6 Luna | Medium | Endpoint/backend local et tests contrôlés | Accepté après review : probe partagé, env explicite ; parent remplace attente réelle du test par fake timers |
| Naming / extensions | GPT-6 Luna | Medium | AST et deux renommages simples | Accepté ; parent valide build et redirections HTTP |
| Reconciliation, pagination/index, registre, petits P3, validation | Parent | Medium | Relier décisions, mesures et risques transversaux | Terminé |

## J1 — Network timeout

Before : fetch et lecture JSON sans limite. Queue par tutoriel sérialisée ;
une promesse PUT qui ne finit pas bloque idle et donc lecteur/Compte destinations.
Le signal de session ne répondait pas à une panne pendant une session inchangée.

Decision : **IMPLEMENTED**, dans le transport JSON existant, sans dépendance,
sans modification de la queue ni mécanisme retry/backoff automatique.

Timeout : **15 000 ms**, constante `API_REQUEST_TIMEOUT_MS`. Petits snapshots
JSON sans traitement long : marge connexion lente, limite UX de récupération,
pas de SLA de production inventé. Deadline fetch + body ; race couvre aussi un
transport ignorant AbortSignal. Timer/listener nettoyés après règlement.

Recovery behavior : `ApiTimeoutError` nommé TimeoutError ; annulation caller
conserve sa raison, network failure reste distincte. Timeout n'aborte pas le signal
de session. S2 non confirmé reste en queue, failed=true ; lecteur le récupère avec
saveErrors, Compte renvoie save-error sans lire/afficher S1 comme confirmé. Retry
manuel réécrit S2 puis autorise la lecture. Changement Auth efface recoveries.
Timeout n'annule pas une écriture déjà reçue côté serveur : LWW et reload restent
les limites explicites du registre, pas une garantie d'exactement une écriture.

Tests : 7 nouveaux tests déterministes, transport et body jamais résolus,
late settlement, annulation préservée, nettoyage, lecteur/Compte/retry.
44 tests ciblés ont passé chez l'agent ; toute la suite finale passe.

## J2 — Pagination

Current volume/query : snapshot local QA du 6 octobre, **13 audits, 93 réponses,
5 progressions**. Six historiques User : 1, 2, 4, 2, 1, 2 items ; **219–845 octets**
pour `{items}` sans réponses détaillées. Un audit restant est Guest.
Une lecture par User : **2,51–20,96 ms**, sans prétention p95 ni benchmark prod.
`findMany` filtre userId, select de résumé + count réponses, tri
`createdAt DESC, id DESC`. API et consumer Compte n'ont pas de pagination/limite.

Decision : **DEFERRED WITH EXPLICIT TRIGGER**. Changer contrat, état Compte,
navigation/boundaries et tests coûtent plus que le gain pour quatre résumés max.
Ownership serveur reste en vigueur. Aucune page tronquée silencieusement.

Implementation : aucune. Trigger : payload représentatif > **100 KiB** ou
p95 handler > **500 ms** sur au moins 100 lectures représentatives. Budgets choisis
et expliqués dans le registre : environ 0,8 s de transfert à 1 Mbit/s et moitié
d'une seconde de budget d'interaction. Aucun N d'audits arbitraire. Avant chaque
release publique/changement de volume, refaire la mesure et ouvrir la pagination
si un budget est dépassé. Propriétaire backend/frontend.

## J3 — Indexes

| Query | Current index | Decision | Reason |
|---|---|---|---|
| User history | Audit(userId) | INDEX SUFFICIENT ; MEASURE FIRST pour tri | Filtre couvert, 4 items User max QA, aucun plan mesuré justifiant composite |
| Single Audit / answers / submit | Audit PK(id), AuditAnswer PK(auditId, questionId) | INDEX SUFFICIENT | Accès id/owner et réponses/count du seul audit |
| Guest claim | Audit(guestSubject) | INDEX SUFFICIENT | Filtre réel updateMany ; pas d'endpoint historique Guest |
| Tutorial list | PK(userId, tutorialId) | INDEX SUFFICIENT ; MEASURE FIRST pour tri updatedAt | Préfixe userId couvert, cardinalité liée au catalogue |
| Tutorial save/version conflict | Même PK | INDEX SUFFICIENT | Predicate userId/tutorialId/version cible une seule ligne ; index version inutile |
| Session lookup / User / Account | token/email uniques, PK et indexes userId existants | INDEX SUFFICIENT | Contrats Better Auth et relations actuelles ; aucune nouvelle query |
| Tutorial userId seul | Préfixe de PK | NOT NEEDED | Index dupliqué |
| TutorialId/versions seuls | Aucun nouveau index | NOT NEEDED | Pas de query globale correspondante |

Revue F8 conservée. Aucun EXPLAIN d'un minuscule dataset utilisé comme preuve.
Futur index exige budget dépassé + plan représentatif montrant le bottleneck,
review SQL parent et migration/test. Aucune modification DB dans J.

## J4 — Readiness

Health current : **200 `{status:ok}` indépendant de DB**, conservé.
Readiness decision : **IMPLEMENTED** ; coût borné utile avant déploiement,
même si aucun orchestrateur/routage public n'est installé.
Endpoint added : **GET /ready**, SELECT 1 Prisma.
DB failure behavior : **503 `{status:unavailable}`**, aucune erreur privée.
Budget une seconde pour probe DB léger ; une seule query en vol par app, y compris
après timeout HTTP. Prisma non annulable ici : une query bloquée reste en vol,
sans multiplication de probes. Succès tardif permet le probe suivant.
Tests : DB réelle disponible → 200 ; panne injectée → 503 et /health → 200 ;
fake timers et query jamais résolue → trois réponses 503, une seule query.
Smoke réel api:start : health/ready 200.
Trigger : premier hébergement pour configurer probes/budget ; aucun secret exposé.

## J5 — Naming

Changed : aucun rename esthétique de domaine.
Kept : features/audit = parcours individuel/questionnaire/scoring/versioning ;
features/audits = catalogue `/audits` ; server/audits = collection API.
Questionnaire, niveaux éditoriaux et summaries DTO ne représentent pas la même donnée.
Reason : D/I et consumers explicitent ces frontières ; confusion actuelle non
démontrée, coût d'un rename transversal supérieur au gain. **ALREADY RESOLVED**.

## J6 — TSX/TS

Inventaire AST TypeScript : **130 fichiers TSX avant**, deux sans JsxElement,
JsxSelfClosingElement ni JsxFragment. Après renommage : **128 TSX, zéro sans JSX**.
Renamed : culture-cyber/page.tsx → page.ts ; simulations/page.tsx → page.ts.
Kept : tous les autres TSX ont du JSX ; results/logic.ts déjà corrigé D.
Reason : pages uniquement redirect, aucun import extension explicite/barrel à modifier.
La doc installée page.md omet .ts ; config-shared et find-page-file Next installé
acceptent .ts. Build affiche les deux routes ; npm start répond **307** vers
`/wip?feature=culture-cyber` et `/wip?feature=simulations`. Recherche anciennes
références source : aucune. Historique des rapports n'est pas réécrit.

## J7 — Conditional debt register

| Item | Current decision | Trigger | Future expected action |
|---|---|---|---|
| Pagination | DEFERRED WITH EXPLICIT TRIGGER | >100 KiB ou p95 >500 ms / 100 lectures représentatives | Pagination API/Compte déterministe |
| Index tri | DEFERRED WITH EXPLICIT TRIGGER | Budget dépassé + plan représentatif montrant filtre/tri coûteux | Justifier et reviewer index/migration |
| Timeout / readiness | IMPLEMENTED | Nouveau type de request / premier hébergement | Adapter budget et probes à la mesure |
| Naming / extensions / petits P3 de présentation | ALREADY RESOLVED / IMPLEMENTED | Nouvelle confusion réelle ou module TSX sans JSX | Correction locale et validation |
| LWW/offline | DEFERRED WITH EXPLICIT TRIGGER | Besoin accepté ou perte concurrente démontrée | Contrat conflit/persistance avec ownership |
| Éditorial | DEFERRED WITH EXPLICIT TRIGGER | Avant publication ou prochaine édition, au premier des deux | Sourcer/retirer statistiques et actualiser OS |
| Montage UI/E2E | DEFERRED WITH EXPLICIT TRIGGER | Avant publication ou prochain changement lifecycle, au premier des deux | Tests représentatifs navigateur/montage |
| CI hébergée | DEFERRED WITH EXPLICIT TRIGGER | Prochaine PR main/dev avant merge | Observer le workflow complet |
| F02/F03/F04 | DEFERRED WITH EXPLICIT TRIGGER ; ACTUAL DEBT | Re-audit final et avant exposition publique | Fermer tickets sécurité dédiés |
| Produit post-MVP | NOT NEEDED aujourd'hui | Feature acceptée explicitement dans une release | Définir contrat/données réelles avant implémentation |

Le [registre maintenu](../operational-readiness.md#registre-des-triggers) contient
chaque item, Current decision, Trigger précis, Future expected action et owner.
Il ferme aussi les P3 B de présentation (rang original, escape Unicode) et
distingue explicitement les features post-MVP des défauts.
Les décisions sont IMPLEMENTED, ALREADY RESOLVED, NOT NEEDED ou DEFERRED WITH
EXPLICIT TRIGGER. **Aucun item BLOCKED BY USER DECISION**, aucune permission requise.
Les dettes réellement ouvertes restent marquées ACTUAL DEBT ; leur trigger ne
prétend pas les résoudre. Voir aussi Remaining debt et blockers ci-dessous.

## J8 — Deployment sanity

Env : secret Auth >=32 et URL PostgreSQL validés avant listen ; cookie secret,
origines et port déjà contrôlés. URL publique Next au build reste responsabilité
du futur déploiement. Ce patch n'implémente pas la politique TLS/proxy des tickets.
Migrations : migrate deploy/documentation F/I existants ; six migrations appliquées,
schema valide ; préflight anciennes données reste obligatoire selon cible.
Startup : npm start + api:start existent ; smoke deux processus réussi.
DB : rôle runtime séparé, SELECT 1 réel réussi ; pas de superuser remis dans API.
Health : indépendant. Readiness : endpoint borné testé, ne prouve pas schema/droits.
CI : gate strict complet local vert ; première exécution GitHub à observer.
Build : Next production vert, 20 pages produites et routes alias maintenues.
Compose/Dockerfile restent recette de développement, pas promesse production.
Pas de Kubernetes, Redis, Terraform, stack monitoring ou nouvelle plateforme.

## Files modified

Uniquement delta Family J ; modifications A–I préexistantes conservées :

- src/lib/api-fetch.ts
- server/app.ts ; nouveau server/runtime-config.ts
- src/app/culture-cyber/page.tsx → page.ts
- src/app/simulations/page.tsx → page.ts
- src/features/results/components/ResultsActionPlan.tsx
- src/features/recommendations/components/RecommendationsHub.tsx
- tests/unit/api-fetch.test.ts
- tests/unit/audit-api.test.ts
- tests/unit/tutorial-persistence-api.test.ts
- nouveaux tests/unit/tutorial-network-timeout.test.ts et runtime-config.test.ts
- nouveau tests/integration/readiness.test.ts
- .env.example (commentaire secret obligatoire)
- README.md ; docs/frontend-architecture.md ; docs/frontend-onboarding-lts.md
- docs/qa/README.md ; nouveaux docs/operational-readiness.md et ce rapport

Preuves externes au dépôt : `quality-j-checkpoints` contient logs et scripts de
mesure/smoke. Aucun commit/push, changement secret, suppression de volume ou reset.

## Tests

Before : rapport I **315 = 262 unit + 53 integration**, sans skips.
Re-run unit baseline J : **262/262** ; le premier log integration J est
**54/54**, car l'agent avait déjà ajouté le premier test readiness avant ce run.
Ne pas présenter ce dernier comme baseline avant mutation.
Added : **12 = 7 réseau + 3 configuration + 2 readiness**.
Updated : assertions signal dans 3 fichiers existants (signal composé plutôt
qu'identité stricte). Les invariants annulation/ownership restent couverts.
Total : **327 = 272 unit + 55 integration**, 45 fichiers.
Skipped / cancelled / TODO / failed : **0**.
Petits changements de libellé/rang et renames : typecheck/lint/build, review
du rang avant/après et smoke route pour les renames ; aucun test miroir ajouté.
Pas de nouvelle recette browser interactive pour les deux textes/rangs ; la
dette UI/E2E préexistante reste explicitement signalée.

## DB

Schema changed : **NON**. Migration : **NON**. Index added : **NON**.
Migrations appliquées : six, aucune en attente. Mesure locale read-only sans IDs
utilisateurs, contenu sensible ou URL de connexion dans ses résultats.
Vérification SHA-256 des fichiers Prisma contre le checkpoint I : **zéro
différence**. Après suites et cleanup, counts toujours **13/93/5**.

## API

Endpoints added : **GET /ready** seulement.
Contracts changed : **NON** pour Audits/Tutoriels/Auth ; délai du transport
frontend est maintenant explicite, `/health` reste identique.

## Validations

| Validation | Result | Evidence sous quality-j-checkpoints |
|---|---|---|
| unit | PASS 272/272 | final-unit.log |
| integration | PASS 55/55, DB réelle | final-integration.log |
| strict gate | PASS 327/327, 45/45 fichiers, aucun skip | final-strict.log |
| npm test | PASS 327/327 | final-all.log |
| typecheck | PASS | final-typecheck.log |
| lint | PASS | final-lint.log |
| build | PASS, aliases .ts reconnus | final-build.log |
| prisma validate | PASS | prisma-validate.log |
| migration status | PASS, six appliquées | migration-status.log |
| startup / endpoint / redirects | PASS | startup-smoke.log |
| diff --check | PASS | final-diff-check.log |
| liens documentaires / AST extensions | PASS, 109 liens locaux valides, 128 TSX tous avec JSX | documentation-inventory.log |

## Remaining debt

**ACTUAL DEBT** : F02 mutations Audit pas toutes protégées contre contexte
browser hostile ; F03 Secure du cookie Guest dépend de secure:auto sans topologie
proxy définie ; F04 headers IP transmis à Better Auth sans frontière de confiance
canonique. Tickets dédiés antérieurs disponibles, code courant concordant, pas
de nouvelle reproduction navigateur ni campagne attaque réalisée par Family J.
Pas de régression A–I démontrée ; pas de correction sécurité camouflée en P3.
Dette QA : pas de suite automatique de montage/UI/E2E permanente ; workflow
hébergé non observé. Dette éditoriale : stats non sourcées et copie OS datée.

**EXPLICITLY DEFERRED CONDITIONAL WORK** : pagination/index tri quand budgets et
plans l'exigent, multi-device/offline quand besoin ou perte démontrés, hébergement
et probes quand topologie choisie, features post-MVP uniquement si acceptées.
Safeties actuelles : API localhost par défaut, ownership serveur, petits payloads,
PK/indexes F, erreur/retry récupérables, versioning explicite, recette manuelle.
Une API déjà exposée publiquement devrait traiter immédiatement les blockers
sécurité ; aucune exposition n'est prouvée dans ce dépôt local.

## Final blockers before cross-repo audit

P0 : aucun identifié.
P1 : **FINAL AUDIT BLOCKER / sécurité de publication**, tickets préexistants
F02/F03/F04 à confirmer/classer et fermer avant exposition publique ; aucune
régression J identifiée. La validation verte ne les ferme pas.
P2 : dette G/I de validation montage UI/E2E et run hébergé non observé, triggers
dans le registre ; pas de nouvelle régression J identifiée.
P3 : revue éditoriale avant publication ; pagination/index/LWW/offline sont des
décisions conditionnelles avec triggers/owners explicites, pas des TODO vagues.

## Verdict

FAMILY J CONDITIONAL — triggers futurs définis, aucune dette ambiguë
