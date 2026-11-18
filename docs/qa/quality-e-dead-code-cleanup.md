# QUALITY FAMILY E — Dead code / legacy cleanup

Date : 2026-10-05. Repository : `GPE_SafeCheck_PUSH`.

## FAMILY E RESULT

**SUCCESS**. E1–E11 revalidés sur l'état courant ; six fichiers morts supprimés, douze fichiers simplifiés. Aucun candidat incertain conservé. Les modifications A/B/C/D préexistantes hors périmètre sont préservées : 99 blocs de diff initiaux sont identiques au diff final. Le diff de HEAD contient donc également des changements antérieurs qui ne doivent pas être attribués à E.

La baseline, les preuves par groupe et les logs sont dans `../quality-e-checkpoints/`. Aucun commit ni changement de branche effectué.

## Méthode de preuve et baseline

Avant suppression : lecture de `AGENTS.md`, architecture frontend et guide Next.js livré ; capture du status, du diff initial et des empreintes serveur/Prisma ; suite initiale verte, 259 tests, zéro échec ou test ignoré.

Recherches par fichier, symbole, chemin et alias `@/* -> src/*` dans les sources, routes, barrels, imports dynamiques, serveur, tests, scripts et docs. Les références documentaires seules ne constituent pas un consommateur applicatif. Les suppressions ont été déléguées après preuve, puis leurs diffs revus par le parent et validés par tests ciblés/typecheck. Une revue indépendante finale a contrôlé les références résiduelles et la couverture conservée.

## Inventaire Astra revalidé

| Item | Audit historique | État actuel avant E | Décision / résultat |
|---|---|---|---|
| E1 | AccountDeleteModal orphelin | Aucun import, JSX, reexport ou consumer réel | DELETE composant |
| E2 | AccountTutorialIcon orphelin | Aucun consumer ; son type ne sert qu'à ce composant | DELETE composant et type dans E4 |
| E3 | profile-form fusion réel/mock | Deux exports sans appelant ; seul lecteur des anciens champs utilisateur | DELETE module |
| E4 | account-data mocks | mockUser lu uniquement par E3/E5 ; mockAudits/mockGuides inutilisés ; types uniquement dans la chaîne morte | DELETE module complet |
| E5 | account types historiques | AccountTabId utilisé par tabs.ts/AccountTabs ; formulaire/setters/notifications morts | SIMPLIFY, conserver AccountTabId |
| E6 | réponses Audit transportées dans l'URL | Module consommé uniquement par deux tests ; flux actuel API/DB | DELETE module et deux tests dédiés |
| E7 | getResultScore, fallback 62 | Uniquement son propre test ; résultats chargés par auditId et score calculé depuis les réponses persistées | SIMPLIFY utils, retirer fonction/constantes et test |
| E8 | mockTutoStatus/mockTutoLastStep | Uniquement le test d'intégrité ; progression réelle par domaine/API/DB | SIMPLIFY données et adapter le test |
| E9 | Google bouton/icône/séparateur | Aucun consumer hors module et barrel ; formulaires Auth email/password actifs | DELETE module/barrel ; retirer ressources mortes associées |
| E10 | hasSecondBadge écrit, jamais lu | ALREADY REMOVED : précédent nettoyage produit, vérifié dans types/producers/consumers/tests | Aucune modification E |
| E11 | SafeCheckUser prénom/nom/pays/âge | Lectorat limité à E3 ; signup actuel email/password/pseudo | SIMPLIFY interface ; conserver id/email/pseudo et adaptation Better Auth name |

## Sub-agents

| Scope | Model | Effort | Why | Result |
|---|---|---|---|---|
| Account E1–E5 | Hérité du parent¹ | Hérité¹ | Chaîne orpheline simple, suppression bornée | PASS ; typecheck + 259 tests ; parent ajoute 30 tests ciblés PASS |
| Audit/Results E6–E7 | GPT-6-luna | Medium | Deux mécanismes isolés et leurs tests historiques | PASS ; 24 tests ciblés + typecheck |
| Tutorials/Auth E8–E11 et dépendances mortes | GPT-6-luna | Medium | Mocks, barrels, traductions/CSS et champs anciens | PASS ; 50 tests ciblés + typecheck |
| Second pass E12–E14 | GPT-6-luna | Medium | Vérification indépendante des références et invariants | PASS ; revue seule, aucun autre code mort confirmé |

¹ Le premier appel demandait GPT-6-luna/Medium avec un fork de tout l'historique. Ce mode hérite des réglages du parent ; l'identifiant effectif n'est pas exposé au sous-agent. Les trois appels suivants ont explicitement configuré GPT-6-luna/Medium sans fork d'historique.

## Fichiers supprimés

- `src/features/account/components/AccountDeleteModal.tsx`
- `src/features/account/components/AccountTutorialIcon.tsx`
- `src/features/account/profile-form.ts`
- `src/lib/account-data.ts`
- `src/features/audit/url-payload.ts`
- `src/components/safecheck/primitives/auth-buttons.tsx`

Les deux fichiers Account contenant déjà des changements locaux ont été supprimés parce que la chaîne complète demeurait morte. Leur état initial est conservé dans la baseline de diff.

## Fichiers simplifiés

| Fichier | Retrait |
|---|---|
| src/features/account/types.ts | Imports React/mockUser et quatre types historiques |
| src/features/results/utils.ts | getResultScore et ses quatre constantes privées |
| src/features/tutorials/data.ts | Deux mocks, import TutoStatus et reexports morts |
| src/features/tutorials/data/catalog.ts | Reexports userProgress et levels sans consumer |
| src/lib/tutoriels-data.ts | Objet simulé userProgress uniquement ; catalogue/levels conservés |
| src/components/safecheck/primitives/index.ts | Reexport des trois primitives OAuth |
| src/components/safecheck/auth-logic.ts | Quatre champs optionnels obsolètes de SafeCheckUser |
| src/components/safecheck/I18nProvider.tsx | Trois clés OAuth par langue et commentaires associés |
| src/app/globals.css | Quatre tokens Google et précision du commentaire restant |
| tests/unit/audit.test.ts | Deux tests de payload URL et imports ; scoring conservé |
| tests/unit/results.test.ts | Test du parseur score URL et import ; seuils/recommandations conservés |
| tests/unit/tutorial-integrity.test.ts | Références aux mocks et libellé historique ; sélections éditoriales conservées |

## Exports supprimés

- `AccountDeleteModal`, `AccountTutorialIcon`.
- `createInitialAccountForm`, `mergeUserIntoAccountForm`.
- `AuditStatus` du seul module account-data supprimé, `AccountTutorialIconKey`.
- `AccountForm`, `AccountFormSetter`, `NotificationPreferences`, `NotificationPreferencesSetter`.
- `mockUser`, `mockAudits`, `mockGuides`.
- `parseAuditAnswersParam`, `serializeAuditAnswers`, `getResultScore`.
- `mockTutoStatus`, `mockTutoLastStep`, `userProgress` et ses reexports.
- `GoogleIcon`, `GoogleAuthButton`, `AuthDivider` et leurs reexports.
- Reexports `levels` depuis les deux adaptateurs Tutoriels inutilisés ; **définition canonique levels conservée**.

Également retirés : constantes privées DEFAULT_RESULT_SCORE/MINIMUM_RESULT_SCORE/MAXIMUM_RESULT_SCORE/DECIMAL_INTEGER_PATTERN ; champs SafeCheckUser prenom/nom/pays/age ; clés auth.googleConnect/auth.googleSignup/auth.or en FR/EN ; tokens --sc-google-blue/red/yellow/green.

## Mocks supprimés

`mockUser`, `mockAudits`, `mockGuides`, `mockTutoStatus`, `mockTutoLastStep`, `userProgress`. Les doubles de test API/HTTP restent en place.

## Tests supprimés comme obsolètes

| Test | Old behavior | Why obsolete | Current real behavior covered by |
|---|---|---|---|
| audit answer payloads serialize and parse without changing values | Aller-retour JSON de réponses dans un paramètre URL | Transport abandonné ; aucun consumer réel | audit-api.test.ts, audit-decoding.test.ts, integration/audits.test.ts : transport API, lecture des réponses persistées |
| audit answer parsing rejects malformed or unsupported payloads | Validation du JSON/ids/options du paramètre URL | Parseur supprimé ; plus de contrat URL à valider | audit-decoding.test.ts : racines/types/ids/doublons et filtrage catalogue ; integration/audits.test.ts : rejet des réponses invalides sans mutation DB |
| getResultScore applies the documented fallback and clamps valid integers | Parsing de score URL, défaut 62 et clamp | Résultats calculés depuis l'audit persisté ; défaut démo non actif | audit.test.ts : pourcentage et réponses inconnues/manquantes ; results.test.ts : toutes les bornes de niveau, ordre des recommandations et ids absents |

Trois cas retirés, aucun fichier de tests supprimé. Aucun invariant utile sans couverture restante identifié par les deux revues.

## Tests ajoutés ou adaptés

Aucun nouveau test. `editorial tutorial selections reference canonical tutorial ids` remplace le libellé ancien et conserve RECOMMENDED_IDS, POPULAR_IDS, RECOMMENDED_REASONS ; seuls les objets de progression simulée sont retirés de ses références. Deux fichiers de tests sont élagués comme décrit ci-dessus.

## Second pass dead-code search

| Élément | Classification | Décision |
|---|---|---|
| userProgress et reexports | DEAD ; aucun consumer réel ou test | DELETE |
| Reexports levels des adaptateurs | DEAD ; consumers absents | DELETE reexports seulement |
| Traductions OAuth et tokens couleur Google | DEAD ; uniquement les primitives supprimées | DELETE |
| Score 62 de l'illustration AccueilHero | ACTIVE MVP DECISION ; affiché comme exemple fictif | KEEP |
| Fallback i18n et Suspense | ACTIVE MVP DECISION | KEEP |
| Mocks HTTP/Prisma de tests | FALSE POSITIVE ; doubles utiles | KEEP |
| old/legacy dans cas de concurrence, identité ou données stockées | FALSE POSITIVE ; contraintes actuelles | KEEP |
| Routes WIP et features futures déclarées | FUTURE FEATURE ; routes actives | KEEP |
| Commentaire de catalogue lexique et docs frontend obsolètes | DOC ISSUE ; mise à jour de descriptions hors fichiers touchés | DEFER Family I |

Recherche résiduelle finale dans src/server/tests/scripts : aucune référence aux modules/symboles supprimés. Aucun import commenté, TODO/FIXME ou autre export/module réellement mort supplémentaire confirmé. Les outils statiques de lecture des déclarations/imports ont servi d'indices ; aucune suppression n'a reposé uniquement sur un faible nombre d'occurrences.

## Éléments volontairement conservés

- AccountTabId et les onglets réels.
- SafeCheckUser id/email/pseudo, méthodes Auth, pseudo -> Better Auth name.
- Scoring Audit, sélection/groupement/résolution des recommandations.
- Navigation auditId ; aucune réponse ni score transporté par URL dans les routes concernées.
- Données éditoriales Tutoriels, catalogue canonique, levels et son test d'intégrité.
- TutoStatus utilisé par les cartes/session/filtres ; addCompletedStep/removeCompletedStep, opérations cohérentes du domaine et tests associés.
- Progression réelle, session, persistance et API ; commentaires expliquant concurrence/last-write-wins.

## Fichiers/comments legacy restant pour Family I

- `docs/frontend-architecture.md` : descriptions frontend simulé et chemins account-data/results logic obsolètes.
- `docs/frontend-onboarding-lts.md` : références account-data, profile-form, url-payload et comportements simulés.
- `src/features/lexicon/data.ts` : commentaire de données mockées, hors fichiers touchés et sans preuve de contenu mort.
- `docs/qa/tuto3a-progress-domain.md`, `tuto3b-memory-reader.md`, `tuto6b-account-tutorials.md`, `quality-b-product-truth.md`, `quality-d-targeted-refactor.md` citent l'état historique. Les conserver comme traces datées ; Family I peut clarifier leur portée si nécessaire.

Commentaires morts liés aux modules Account/OAuth supprimés avec ces modules ; commentaires OAuth du provider retirés ; commentaire CSS restant précise les couleurs d'illustration. Aucune réécriture documentaire globale.

## Tests

| Mesure | Nombre |
|---|---:|
| Avant Family E | 259 |
| Supprimés comme obsolètes | 3 |
| Ajoutés | 0 |
| Unitaires finaux | 212 |
| Intégration finaux, tests imbriqués compris | 44 |
| Total final | 256 |
| Échecs / ignorés | 0 / 0 |

## DB

Schema modifié par E : **NON**. Migration ajoutée/modifiée par E : **NON**. Les changements Prisma déjà présents en baseline appartiennent aux travaux antérieurs.

## API

Endpoint ajouté : **NON**. Endpoint supprimé : **NON**. Vérification SHA-256 des 16 fichiers serveur/Prisma initiaux : zéro différence ; liste de fichiers également conservée.

## Vérifications

| Contrôle | Résultat | Log dans ../quality-e-checkpoints/ |
|---|---|---|
| Unit | PASS 212/212 | final-unit.log |
| Integration | PASS 44/44, zéro skip | final-integration.log |
| Full suite npm test | PASS 256/256, zéro skip | final-tests.log |
| npm run typecheck | PASS | final-typecheck.log |
| npm run lint | PASS | final-lint.log |
| npm run build | PASS ; 20 pages générées, routes Audit/Compte/Results/Tutoriels conservées | final-build.log |
| npx --no-install prisma validate | PASS | final-prisma.log |
| git diff --check | PASS | final-diff-check.log |

Tests ciblés par groupe : Account 30/30 ; Audit/Results 24/24 ; Tutorials/Auth 50/50. Typecheck vert après chaque groupe. Le premier sous-agent a également relancé la suite complète initiale (259/259).

## Régressions

**PASS** sur les tests, imports/types, build et résolution des routes. Pas de recette visuelle manuelle exécutée ; les ressources retirées n'avaient aucun consumer visible actif.

## Dette résiduelle Family E

Aucune dette confirmée ou élément incertain identifié dans ce périmètre. La passe ne prétend pas prouver l'absence de tout code mort possible dans le repository.

## Findings renvoyés vers autres familles

- Family F : aucun nouveau finding DB.
- Family G : aucun nouveau finding tests/CI ; la baisse de trois tests est expliquée par l'abandon des mécanismes historiques.
- Family H : aucun nouveau finding Auth UX ; pendingHref et Better Auth restent inchangés.
- Family I : descriptions d'architecture/onboarding et références historiques listées ci-dessus.

## Verdict

FAMILY E CLOSED — code mort et dette historique purgés
