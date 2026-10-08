# Préparation opérationnelle et registre des décisions conditionnelles

**CURRENT REFERENCE** — mainteneurs SafeCheck ; revue du 7 octobre 2026.
Le [rapport Family J](qa/quality-j-operational-readiness.md) conserve les preuves
ponctuelles. Ce registre est à revoir avant chaque publication publique et lors
d'un changement de volume, de contenu ou de topologie. Un trigger atteint ouvre
un travail explicite avec son propriétaire ; il ne vaut pas implémentation.

## Réseau et récupération

Le transport JSON applicatif utilise `API_REQUEST_TIMEOUT_MS = 15_000` dans
`src/lib/api-fetch.ts`. Les requêtes actuelles sont de petits snapshots et listes,
sans upload ni traitement long. Quinze secondes laissent une marge sur une
connexion lente tout en bornant le chargement et l'attente de la queue. Il s'agit
d'une politique de récupération UX, pas d'un SLA mesuré. Le délai couvre `fetch`
et la lecture JSON. Un transport qui ignore AbortSignal ne bloque pas la promesse
publique après ce délai. Les clients Better Auth utilisent leur propre transport.

Le recovery de claim Guest dispose aussi de 15 secondes pour sa reconfirmation
Better Auth et le POST/JSON natif, avec annulation et règlement garanti même si
le transport ignore le signal. Après timeout, l'authentification confirmée reste
valide et le claim reste réessayable ; aucune réponse tardive ne confirme le succès.
Le verrou Auth partagé répond `busy` aux opérations concurrentes pendant cette
attente bornée. Une session User restaurée tente une fois par cycle d'identité du
provider, y compris après remount, via le cookie signé HttpOnly côté serveur.
Un échec ne déclenche pas de boucle automatique. Un transfert confirmé, ou un
succès à zéro après une tentative non confirmée, recharge les lecteurs Compte,
Audit et Résultats ; un premier no-op ne perd pas les éditions en cours.

`TimeoutError`, annulation de session (`AbortError`) et panne réseau restent
distincts. Il n'y a pas de retry automatique. Un timeout ne prouve pas que le
serveur a annulé ou échoué : le snapshot Tutoriel reste non confirmé et récupérable
dans la queue de la session. Le lecteur le réaffiche avec une erreur de sauvegarde ;
Compte refuse de présenter les anciennes lignes DB comme confirmées. Le retry
manuel réécrit le snapshot. Changer de session efface les recoveries comme avant.
La mémoire n'est pas une persistance offline : un reload peut perdre un snapshot
non confirmé. Les écritures compatibles restent last-write-wins, y compris une
écriture serveur tardive après timeout.

## Liveness et readiness

- `GET /health` : 200 `{"status":"ok"}`, indépendamment de PostgreSQL.
- `GET /ready` : `SELECT 1` via Prisma ; 200 `{"status":"ready"}` ou 503
  `{"status":"unavailable"}`. Aucun détail de connexion/erreur dans la réponse.
- Le probe DB local et minuscule dispose d'une seconde pour répondre. Une DB
  incapable de répondre à ce probe est provisoirement retirée du trafic ; ce budget
  conservateur peut être adapté après mesure sur l'hébergement choisi.
- Une seule requête DB de readiness reste en vol par processus. Un timeout HTTP
  n'annule pas la requête Prisma ; les probes suivants partagent cette attente
  jusqu'à son règlement. Cela évite d'accumuler des requêtes pendant une panne.
- Ces endpoints ne prouvent ni que les migrations sont à jour, ni que toutes les
  tables et permissions métier sont correctes. Le gate de release les vérifie.

## Gate de lancement MVP

Next et Fastify restent deux processus. `npm run build` puis `npm start` lancent
Next compilé ; `npm run api:start` lance Fastify sans watch. Conserver les outils
runtime requis par `tsx` et le client Prisma généré. Compose est une recette locale
qui lance Next en développement, pas une image de production full-stack.

Le démarrage API valide la présence/forme de `DATABASE_URL` PostgreSQL et un
`BETTER_AUTH_SECRET` d'au moins 32 caractères, en plus du cookie secret, des
origines exactes et du port existants. La validation de forme n'est pas un test DB.
Renseigner `NEXT_PUBLIC_API_URL` au build Next, puis vérifier que cette URL publique,
`WEB_ORIGIN` et `BETTER_AUTH_URL` correspondent au routage choisi. Ne pas réutiliser
les secrets ou privilégier le rôle de migration pour le runtime.

R2 a corrigé F02/F03/F04 (anciens bloqueurs S01/S02/S03) au niveau serveur :
Origin et Fetch Metadata avant les mutations Audit/progression, Guest Secure
à l'émission et au retrait en production, origines serveur HTTPS imposées,
IP canonique provenant du socket ou d'une frontière proxy explicite. Les tests
`security-origin`, `security-production` et `security-ip` exercent les routes et
le quota natif Better Auth. Les rapports QA précédents restent historiques.

`API_TRUSTED_PROXIES` est vide par défaut. Utiliser uniquement les adresses
effectives des proxies : IP exacte, CIDR IPv4 /24–/32 ou IPv6 /64–/128, sans IPv4
mappée en IPv6. Le proxy de bord doit écraser `X-Forwarded-For` avec le client
observé ou l'ajouter à droite ; un header client transmis inchangé est insuffisant.
Configurer chaque hop fiable et confiner l'accès direct à l'API. Les chaînes
malformées retombent sur le socket. Le quota reste en mémoire par processus et
Better Auth regroupe IPv6 par /64 ; un déploiement multi-instance demande une
décision de stockage avant de promettre un quota global.

Avant une mise en service :

1. Exécuter le précontrôle des anciennes bases décrit dans l'onboarding/F, dont
   `users.name IS NULL = 0` avant la migration Better Auth non encore appliquée.
   Prévoir les scans/verrous F ; aucune réparation automatique de données.
2. Appliquer `npx prisma migrate deploy` avec le rôle de migration et régénérer
   le client. Vérifier `npx prisma migrate status` et les droits runtime restreints.
3. Exécuter unitaires, intégration et `npm run test:ci` sans skips, typecheck,
   lint, build, validation Prisma et `git diff --check`.
4. Démarrer les deux processus, contrôler `/health` et `/ready`, puis faire la
   recette manuelle Auth → Audit → Tutoriel → Compte. Observer un run CI hébergé.
5. Vérifier F02/F03/F04 sur la topologie HTTPS/proxy réelle et terminer la revue
   éditoriale avant exposition publique. Family J ne certifie pas le déploiement.

## Registre des triggers

Les seuils ci-dessous sont des budgets décidés pour le MVP, pas des résultats de
production. Une mesure de quelques fixtures ne prouve pas un p95. Les mesures de
volume se refont sur données représentatives avant chaque release publique.

| Item | Current decision | Trigger to revisit | Future expected action / owner |
|---|---|---|---|
| PUT Tutoriel bloqué / attente `idle()` | IMPLEMENTED : deadline 15 s et récupération A | Nouveau client applicatif contournant `apiFetchJson`, upload ou traitement long ajouté | Définir/tester son délai propre ; frontend |
| F01/N02 claim Guest et vues déjà montées | IMPLEMENTED : deadline 15 s incluant reconfirmation, reprise depuis session restaurée, relecture ciblée après recovery | Nouveau transport Auth/claim, changement d'ownership ou de cycle provider | Vérifier timeout, cookie signé, idempotence et anciennes continuations ; frontend + backend |
| Pagination `GET /audits` / Compte | DEFERRED WITH EXPLICIT TRIGGER : pas de limite actuelle ; petits résumés, sans réponses | Payload historique réel ou représentatif > 100 KiB, ou p95 du handler > 500 ms sur une campagne d'au moins 100 lectures représentatives | Pagination déterministe et ownership serveur ; backend + frontend |
| Budget pagination | NOT NEEDED : aucun nombre d'audits arbitraire retenu | Release publique ou changement de volumétrie prévu | Refaire la mesure ; 100 KiB coûte déjà environ 0,8 s sur 1 Mbit/s avant overhead, et 500 ms consomme la moitié d'un budget d'interaction d'une seconde ; mainteneur |
| Index tri historique Audit | DEFERRED WITH EXPLICIT TRIGGER : index userId suffisant actuellement | Budget p95 historique ci-dessus dépassé et EXPLAIN (ANALYZE, BUFFERS) représentatif montre que filtre/tri domine | Évaluer (userId, createdAt, id), parent review SQL/migration ; backend DB |
| Index tri progression | DEFERRED WITH EXPLICIT TRIGGER : PK (userId, tutorialId), ensemble borné par catalogue | p95 query > 500 ms sur au moins 100 lectures représentatives ET plan montrant un tri coûteux après croissance du catalogue | Mesurer puis justifier un index ; backend DB |
| Index userId progression dupliqué | NOT NEEDED : préfixe de PK déjà couvert | Changement de PK ou de filtre réel | Revoir plan et couverture, pas de doublon spéculatif ; backend DB |
| Index tutorialId global / versions | NOT NEEDED : aucune requête globale correspondante | Ajout d'une query réelle filtrant ces colonnes sans préfixe couvert | Mesurer plan avant index ; backend DB |
| Readiness DB | IMPLEMENTED : /ready ; /health reste liveness | Premier hébergement réel avec health checks | Configurer les probes, mesurer le budget et tester une panne sur cette topologie ; exploitation |
| Naming audit/audits/questionnaire/niveaux | ALREADY RESOLVED : distinction de domaine documentée D/I | Introduction d'un consumer qui confond effectivement catalogue et workflow ou doublon de contrat | Corriger localement la frontière ; frontend |
| Extensions TSX sans JSX | IMPLEMENTED : deux pages redirect deviennent .ts ; logic.ts déjà D | Ajout/modification de modules TSX sans JSX | Inventaire AST, convention Next locale, typecheck/build ; frontend |
| LWW, écritures tardives et conflits multi-device | DEFERRED WITH EXPLICIT TRIGGER : snapshots remplaçables compatibles ; aucun merge promis | Besoin produit d'édition simultanée multi-device ou perte confirmée d'un snapshot plus récent par écriture tardive | Contrat révision/ETag/conflit avant sophistication de retry ; produit + backend |
| Offline / persistance de snapshots non confirmés | DEFERRED WITH EXPLICIT TRIGGER : retry en mémoire uniquement | Exigence produit de reprise après reload/offline d'une écriture non confirmée | Définir stockage, ownership et nettoyage de session ; produit + frontend |
| Numérotation Results réinitialisée par catégorie | IMPLEMENTED : rang de la liste initiale conservé | Changement de tri/groupement des recommandations | Vérifier unicité et rangs après groupement ; frontend |
| Escape Unicode littéral du hub | IMPLEMENTED : texte JSX corrigé | Nouveau texte JSX avec escape littéral visible | Corriger lors de recette ; contenu + frontend |
| E01 dette éditoriale : chiffres non sourcés, garanties absolues et date OS dépassée | IMPLEMENTED : chiffres et garanties superflus retirés, formulations durables, conseil OS fondé sur le support courant | Nouvelle statistique, promesse absolue ou jalon de support ajouté au contenu public | Justifier et sourcer le chiffre, circonscrire la promesse, vérifier le statut et les options OS avant publication ; responsable éditorial |
| Suite de montage UI / E2E permanente | IMPLEMENTED pour recovery Auth/Audit/Résultats : ReactDOM/jsdom et réseau contrôlé ; E2E navigateur reste DEFERRED WITH EXPLICIT TRIGGER | Première release publique ou prochaine modification des autres parcours Auth/navigation/abonnements du store, au premier des deux | Compléter les montages ciblés et définir recette browser représentative ; QA + frontend |
| Première CI GitHub hébergée | DEFERRED WITH EXPLICIT TRIGGER : gate local vert, hébergé non observé | Prochaine PR vers main/dev, avant merge/release | Observer le run complet et investiguer les écarts ; mainteneur |
| Budget test de verrou DB | DEFERRED WITH EXPLICIT TRIGGER : polling borné et assertion du verrou conservés | Premier échec de liveness sur runner saturé alors que l'assertion métier passe localement | Diagnostiquer ressources/délai sans affaiblir assertion ; QA backend |
| Précontrôle migrations sur ancienne DB | ALREADY RESOLVED : procédure F/I ; preuve locale uniquement | Tout rollout sur une base ancienne ou non inspectée | Exécuter précontrôle, bloquer en cas d'anomalie, choisir réparation explicite ; backend DB |
| Routage/TLS et configuration publique | DEFERRED WITH EXPLICIT TRIGGER : deux processus locaux seulement | Avant première exposition publique, déplacement d'origine ou proxy | Concevoir routage et confinement, vérifier URLs, cookies et provenance IP ; exploitation |
| F02 protection mutations Audit | IMPLEMENTED : Origin exact ou métadonnées same-origin ; clients sans métadonnées acceptés | Nouvelle route mutante ou topologie navigateur | Vérifier Origin et absence d'effet de bord depuis une seconde origine sur déploiement ; backend sécurité |
| F03 cookies Secure production | IMPLEMENTED : Guest Secure explicite, origines HTTPS imposées en production | Première exposition HTTPS via proxy | Vérifier émission et suppression Guest/Auth dans le navigateur réel ; backend sécurité |
| F04 provenance IP / quota Auth | IMPLEMENTED : IP socket par défaut, liste proxy explicite et étroite | Proxy réel ou première exposition publique | Définir la liste effective, confiner le réseau et vérifier quotas depuis deux clients ; exploitation + backend sécurité |
| Commentaires/précisions, votes/avis, favoris et suivi Recommendations | NOT NEEDED au MVP : anciennes simulations retirées B/E | Feature explicitement acceptée dans une release produit | Contrat, stockage, ownership/modération selon feature ; produit + backend |
| Gamification, popularité/comparaison et personnalisation effective | NOT NEEDED au MVP : démonstrations/editorial déclarés | Feature acceptée avec règles ou méthodologie de données réelles | Définir règles, données et API sans compteurs fictifs ; produit |
| CMS / catalogue dynamique | NOT NEEDED au MVP : contenu TypeScript canonique | Exigence d'édition dynamique acceptée | Contrat contenu/versioning puis migration explicite ; produit + contenu |
| Score côté serveur | NOT NEEDED au MVP : grille frontend versionnée, aucune décision serveur fondée sur score UI | Nouveau consumer serveur prenant une décision à partir du score | Source de calcul validée/versionnée côté serveur ; backend |
| Persistance Tutoriel Guest / rattachement | NOT NEEDED au MVP : mémoire, claim réservé aux audits | Exigence produit de conservation Guest ou claim progression acceptée | Définir ownership, confidentialité et mapping ; produit + backend |
| Modification profil, suppression compte, fournisseur Auth supplémentaire | NOT NEEDED au MVP : lecture seule, FK Audit Restrict | Parcours explicitement accepté dans une release | Définir retention/permissions et endpoints dans chantier dédié ; produit + backend |
| Versions de catalogue/scoring | ALREADY RESOLVED : versioning F, incompatibilité explicite | Changement de sens/ordre des étapes ou questionnaire/scoring | Incrémenter version, garder définitions historiques, mapping/reset décidé ; contenu + backend |
| Features WIP / roadmap champs_tuto | NOT NEEDED au MVP : routes de redirection et roadmap déclarées | Feature explicitement acceptée dans une release | Définir scope avant implémentation ; produit |

Les correctifs F02/F03/F04 requièrent encore une vérification sur le routage
public choisi ; les tests par injection HTTP ne prouvent pas à eux seuls la
configuration du proxy ni le comportement d'un navigateur déployé. Les travaux
produit post-MVP ne sont pas des bugs.
