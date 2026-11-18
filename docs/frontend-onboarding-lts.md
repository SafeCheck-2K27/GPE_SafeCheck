# Onboarding développeur SafeCheck

**CURRENT REFERENCE** — guide de travail pour le code présent dans ce dépôt.

Commencez par le [quickstart du README](../README.md#prérequis-et-installation),
qui est la source canonique pour l’installation et la préparation de PostgreSQL.
Ce guide précise ensuite comment lancer les processus, où se trouvent les
comportements et comment valider un changement. Les règles de structure sont
dans [l’architecture frontend et full-stack](frontend-architecture.md).

## Démarrage de développement

Le parcours recommandé lance PostgreSQL dans Docker, puis Fastify et Next.js
comme deux processus Node locaux. Suivez les commandes et leur ordre dans le
quickstart du README : copie de `.env.example`, `npm ci`, sécurisation de la
base, application des migrations existantes avec `npx prisma migrate deploy`,
puis nouvelle vérification des droits via `npm run db:secure`.

Avant de démarrer les serveurs, complétez dans votre fichier local `.env`
`COOKIE_SECRET` et `BETTER_AUTH_SECRET` avec deux secrets aléatoires distincts
d’au moins 32 caractères. Ne les commitez pas et ne partagez pas le contenu de
`.env`.

Lancez ensuite deux terminaux depuis la racine du dépôt :

```bash
npm run api:dev
```

```bash
npm run dev
```

Fastify écoute par défaut sur `http://localhost:3001`, Next.js sur
`http://localhost:3000`, et le contrôle de santé HTTP de l’API répond sur
`http://localhost:3001/health`. Ce dernier ne vérifie pas la disponibilité de
PostgreSQL. Les modifications Next.js sont rechargées à chaud. L’API charge ses
propres logs dans son terminal ; utilisez `npm run db:logs` pour consulter
PostgreSQL.

`http://localhost:3001/ready` vérifie PostgreSQL et répond 200 `ready` ou
503 `unavailable`. Son attente HTTP est bornée à une seconde. Le démarrage API
refuse aussi une `DATABASE_URL` non PostgreSQL et un `BETTER_AUTH_SECRET` de
moins de 32 caractères. Les politiques réseau, limites des probes et conditions
avant exposition publique sont dans le [registre opérationnel](operational-readiness.md).

Le service `app` de Docker Compose lance seulement Next.js ; Compose ne lance
pas Fastify. Gardez le parcours hôte ci-dessus comme référence pour avoir les
deux processus. Compose peut servir à lancer le frontend en conteneur, mais
l’API doit toujours être démarrée séparément et les origines/ports doivent
rester accessibles depuis le navigateur.

## Configuration et base locale

Les noms d’environnement et les valeurs locales sans secrets sont dans
[.env.example](../.env.example). Les rôles PostgreSQL ont des responsabilités
distinctes :

- `DATABASE_URL` connecte l’application avec le rôle restreint, sans droits de
  création de rôles, base ou schéma ;
- `MIGRATION_DATABASE_URL` connecte le CLI Prisma avec le rôle
  d’administration/migration ; `prisma.config.ts` la privilégie et ne retombe
  sur `DATABASE_URL` que si elle manque ;
- `POSTGRES_USER` et `POSTGRES_PASSWORD` configurent le rôle administrateur du
  conteneur local ; `APP_DB_USER` et `APP_DB_PASSWORD` sont ceux de
  l’application. `db:secure` les configure dans le fichier local.

Renseignez les origines locales de manière cohérente : `WEB_ORIGIN` est
`http://localhost:3000`, `BETTER_AUTH_URL` et `NEXT_PUBLIC_API_URL` pointent
vers `http://localhost:3001`. `API_HOST` et `API_PORT` règlent l’écoute
Fastify. Seules les variables préfixées `NEXT_PUBLIC_` sont destinées au
navigateur.

Après modification de l’environnement, redémarrez les deux processus Node.
`npm run db:secure` concerne uniquement l’instance PostgreSQL locale et
préserve son volume ; il ne crée ni n’applique de migration. N’utilisez pas
`docker compose down -v` pour corriger les droits ou appliquer un changement
de schéma.

## Migrations et changements du schéma

Le schéma est dans [prisma/schema.prisma](../prisma/schema.prisma), les
migrations commitées dans [prisma/migrations](../prisma/migrations). Le client
généré sous `src/generated/prisma` est ignoré par Git et ne se modifie pas à la
main.

Pour modifier le schéma en développement, utilisez
`npm run db:migrate -- --name description_courte`. Cette commande invoque
`prisma migrate dev` : elle crée et applique une migration, et peut créer une
base shadow temporaire pour rechercher un drift. Il faut que
`MIGRATION_DATABASE_URL` vise un rôle qui possède les droits DDL et peut créer
cette base shadow. L’URL de secours `DATABASE_URL` est volontairement restreinte
et ne convient pas aux opérations DDL. Vérifiez le SQL produit, gardez le
fichier dans `prisma/migrations/` et régénérez le client avec
`npm run db:generate` si nécessaire.

Pour appliquer seulement les migrations déjà commitées, utilisez
`npx prisma migrate deploy`. Le README l’utilise pendant la préparation locale ;
la CI et les déploiements appliquent aussi les migrations existantes au moyen
de `migrate deploy`. Cette commande ne crée pas de migration.

## Où vivent les comportements et les données

Le frontend Next.js App Router se trouve dans `src/app`, les domaines dans
`src/features`, l’interface commune dans `src/components/safecheck`, et les
contrats/adaptateurs dans `src/lib`. Fastify et ses services sont dans
`server/`; schéma et migrations sont dans `prisma/`. L’architecture liée plus
haut décrit les frontières d’import et les conventions de contribution.

| Parcours ou route | Source actuelle |
|---|---|
| `/accueil`, `/audits`, `/essentiels`, `/lexique`, `/recommandations` | Pages et catalogues principalement statiques sous `src/features`. |
| `/audit`, `/resultats` | Questionnaire et calcul de score versionnés côté code ; audit, réponses et soumission persistés via Fastify/PostgreSQL. Le frontend calcule les résultats à partir de l’audit chargé par l’API. |
| `/tutoriels`, `/tutoriels/[id]` | Contenus éditoriaux statiques dans `src/lib/tutoriels-data.ts`, exposés par `src/features/tutorials/data/catalog.ts`. La progression des comptes connectés est persistée par l’API. |
| `/compte`, `/compte/creer` | Sessions Better Auth, historique des audits et progression des tutoriels reliés à Fastify/PostgreSQL. Le profil consulté est en lecture seule ; les préférences visuelles restent locales. |
| `/personalisation`, `/hall-of-fame`, `/vulnerabilite`, `/wip` et alias | Présentation et données locales ; ces parcours ne sont pas des enregistrements PostgreSQL. |

Le contenu des tutoriels, du lexique et des recommandations reste éditorial et
statique. Il n’existe pas de table `Tutorial`. L’audit invité est associé à un
cookie signé ; après authentification, l’utilisateur peut rattacher son audit à
son compte. L’API valide l’accès aux audits et à la progression. Les versions
d’audit prises en charge sont actuellement questionnaire 1 et scoring 1. Chaque
tutoriel a aussi une version vérifiée lors de la sauvegarde de sa progression.
Consultez les contrats et services existants avant de modifier ces comportements.

## Tests et vérifications

Les scripts disponibles sont déclarés dans `package.json` :

```bash
npm run test:unit
npm run test:integration
npm test
npm run test:ci
npm run lint
npm run typecheck
npm run build
```

`test:unit` n’a pas besoin de PostgreSQL. `test:integration` utilise Fastify et
une base PostgreSQL migrée. `npm test` exécute les deux groupes et peut laisser
passer des tests ignorés en environnement local. `test:ci` active la porte
stricte : les six variables `DATABASE_URL`, `MIGRATION_DATABASE_URL`,
`COOKIE_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` et `WEB_ORIGIN`
doivent être renseignées, et tout test ignoré ou TODO fait échouer la commande.
La CI GitHub Actions prépare PostgreSQL 17 jetable, applique les migrations,
configure les droits des deux rôles, puis exécute lint, typecheck, tests stricts
et build.

Pour un changement d’interface, complétez les vérifications automatisées par
une recette clavier, focus, thèmes clair/sombre et tailles d’écran adaptée aux
routes touchées. Utilisez `git diff --check` avant livraison et signalez toute
porte que vous n’avez pas pu exécuter.

## Dépannage courant

- Si `db:secure` ne démarre pas PostgreSQL, vérifiez que Docker Desktop est
  démarré et consultez `npm run db:logs`. Le port local par défaut est 5432.
- Si Prisma CLI échoue sur les droits de création ou le shadow database pendant
  `migrate dev`, vérifiez que `MIGRATION_DATABASE_URL` est présente et vise le
  rôle de migration ; ne remplacez pas cette URL par le rôle applicatif.
- Si l’API refuse de démarrer, vérifiez `COOKIE_SECRET` (au moins 32 caractères)
  et les origines exactes `WEB_ORIGIN` / `BETTER_AUTH_URL`.
- Si le navigateur ne joint pas l’API, vérifiez que les deux processus tournent,
  que `NEXT_PUBLIC_API_URL` pointe vers le port API vu par le navigateur, et
  redémarrez Next.js après changement de cette variable.
- Si le port 3000 ou 3001 est occupé, ajustez le port et faites correspondre les
  origines frontend, Fastify et Better Auth.
