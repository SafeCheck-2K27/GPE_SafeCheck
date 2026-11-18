# SafeCheck

SafeCheck accompagne la découverte de pratiques de cybersécurité : audit rapide,
résultats pédagogiques, recommandations et tutoriels guidés.

**CURRENT REFERENCE** — point d’entrée du MVP présent dans ce dépôt.

## État du MVP et stack

Les comptes email/mot de passe utilisent Better Auth et des sessions PostgreSQL.
Les audits et leurs réponses sont persistés, y compris pour les visiteurs ; leur
rattachement au compte intervient après connexion ou inscription. La progression
des tutoriels est persistée pour les utilisateurs connectés. Le compte présente
l’identité, les audits et les tutoriels réels.

Stack : Node.js 22, Next.js 16.2.9 / React 19.2.4, TypeScript, Fastify 5,
Better Auth 1.7.6, Prisma 7 avec l’adaptateur `pg`, PostgreSQL 17 et Tailwind CSS 4.
Les versions exactes résolues sont dans `package-lock.json`.

```text
Next / React → clients API + contrats → Fastify → services → Prisma → PostgreSQL
             → client Better Auth    → /api/auth/* → Better Auth → Prisma
             → catalogues TypeScript et calcul du score dans le frontend
```

## Prérequis et installation

Installer Node.js 22 avec npm, Git et Docker avec Compose ; démarrer Docker.
Depuis le clone de ce dépôt, dans le dossier contenant `package.json` :

```powershell
Copy-Item .env.example .env
npm ci
npm run db:secure
npx prisma migrate deploy
npm run db:secure
```

Sur un shell POSIX, remplacer `Copy-Item .env.example .env` par
`cp .env.example .env`. Copier le fichier uniquement pour une nouvelle
installation ; conserver la configuration d’un checkout déjà configuré.

`npm ci` génère le client Prisma via `postinstall`. `db:secure` démarre PostgreSQL,
génère deux accès locaux distincts et conserve le volume et les données. Il
n’applique pas les migrations. Le second passage après `migrate deploy` vérifie
les droits sur les tables et retire l’accès applicatif à `_prisma_migrations`.

## Environnement

[`.env.example`](.env.example) contient les noms et exemples locaux sans secrets.
Avant de lancer l’API, renseigner séparément `COOKIE_SECRET` et
`BETTER_AUTH_SECRET` avec deux secrets aléatoires distincts ; utiliser au moins
32 caractères pour chacun. Ne jamais les commiter.

| Variables | Rôle |
|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` | Administration de PostgreSQL local ; mot de passe généré par `db:secure` |
| `APP_DB_USER`, `APP_DB_PASSWORD` | Rôle applicatif restreint ; mot de passe généré par `db:secure` |
| `DATABASE_URL` | Connexion applicative Prisma, remplie par `db:secure` |
| `MIGRATION_DATABASE_URL` | Connexion Prisma CLI pour migrations ; remplie par `db:secure` |
| `COOKIE_SECRET` | Signature du cookie Guest ; requis par Fastify, minimum 32 caractères |
| `BETTER_AUTH_SECRET` | Secret Better Auth, à renseigner séparément |
| `API_HOST`, `API_PORT` | Écoute Fastify, par défaut `localhost:3001` |
| `WEB_ORIGIN` | Origine exacte autorisée du frontend, exemple `http://localhost:3000` |
| `BETTER_AUTH_URL` | Origine exacte de l’API Auth, exemple `http://localhost:3001` |
| `NEXT_PUBLIC_API_URL` | Origine de l’API utilisée par le navigateur, exemple `http://localhost:3001` |
| `API_TRUSTED_PROXIES` | Liste optionnelle d’IP/CIDR étroits des seuls sockets proxy de confiance ; vide par défaut |

Conserver le même nom d’hôte pour frontend et API en local ; les cookies et les
origines doivent être cohérents. Relancer les processus après changement de
configuration. Seules les variables `NEXT_PUBLIC_*` sont destinées au navigateur.

En production, `WEB_ORIGIN` et `BETTER_AUTH_URL` doivent être des origines HTTPS
exactes. Construire aussi Next avec `NEXT_PUBLIC_API_URL` en HTTPS. Le cookie Guest
est signé, HttpOnly, SameSite=Lax et toujours Secure en production, même si le
transport interne du proxy vers Fastify est HTTP. Les origines navigateur doivent
être compatibles avec SameSite=Lax. Les mutations Audit et le PUT Tutoriel exigent
l'Origin frontend exact lorsqu'il est présent ; sans Origin, elles refusent les
métadonnées sauf `sec-fetch-site: same-origin` avec mode `cors` ou `same-origin`.
Les clients HTTP sans
Origin ni Fetch Metadata restent autorisés et doivent toujours satisfaire les
contrôles d'ownership.

Par défaut, l'IP utilisée par le quota natif Better Auth vient du socket direct.
Si un reverse proxy est déployé, renseigner uniquement ses adresses effectives
dans `API_TRUSTED_PROXIES` et confiner l'accès réseau direct à l'API. Valider la
chaîne `X-Forwarded-For` et les cookies sur la topologie réelle avant exposition.
La liste accepte des IP exactes ou des CIDR IPv4 /24–/32 et IPv6 /64–/128 ; les
adresses IPv4 mappées en IPv6 sont rejetées. Le proxy de bord doit écraser le
header entrant avec l'IP observée, ou ajouter cette IP à droite de la chaîne.
Transmettre un header client inchangé ne définit pas une frontière fiable.
Better Auth utilise uniquement l'IP canonique écrasée par le serveur ; sa limite
native reste en mémoire par processus, et regroupe les adresses IPv6 par /64.

## Lancement

Lancer deux terminaux depuis la racine du dépôt :

```powershell
# Terminal 1 : API
npm run api:dev
```

```powershell
# Terminal 2 : frontend
npm run dev
```

Frontend : `http://localhost:3000` ; API : `http://localhost:3001` ; santé HTTP :
`http://localhost:3001/health` (liveness indépendante de PostgreSQL).
`http://localhost:3001/ready` vérifie PostgreSQL : 200 `ready` ou 503 `unavailable`,
avec une attente HTTP bornée à une seconde et une seule sonde DB en vol.
Lire la [préparation opérationnelle et les triggers](docs/operational-readiness.md)
avant toute publication publique.

Compose contient PostgreSQL et un service `app` qui lance **seulement Next**.
Il ne lance pas Fastify. Le parcours recommandé ci-dessus utilise PostgreSQL
dans Docker et les deux processus Node sur la machine.

Pour vérifier le frontend compilé : `npm run build`, puis `npm start`.
`npm run api:start` lance l’API sans watch via `tsx` ; ces commandes ne constituent
pas une procédure complète de déploiement public.

## Base de données et migrations

Le schéma est dans [`prisma/schema.prisma`](prisma/schema.prisma), les migrations
versionnées dans [`prisma/migrations`](prisma/migrations). Le client généré dans
`src/generated/prisma` est ignoré par Git.

- Appliquer les migrations existantes : `npx prisma migrate deploy`.
- Créer une migration en développement après modification du schéma :
  `npm run db:migrate -- --name description_du_changement`.
- Régénérer le client après changement : `npm run db:generate`.
- Vérifier le schéma et l’état : `npx prisma validate` et
  `npx prisma migrate status`.
- Logs PostgreSQL : `npm run db:logs` ; arrêt Compose : `npm run db:down`.

Prisma CLI privilégie `MIGRATION_DATABASE_URL` et se replie sur `DATABASE_URL` si
elle manque. Renseigner les deux : le rôle applicatif n’a pas les privilèges DDL.
`migrate dev` utilise une base shadow et doit s’exécuter avec le rôle de migration,
pas avec le rôle applicatif. Lire l’[onboarding](docs/frontend-onboarding-lts.md)
pour le workflow et les précautions sur une base existante. Ne pas supprimer le
volume pour appliquer une migration.

## Tests et vérifications

| Commande | Périmètre |
|---|---|
| `npm run test:unit` | Tests unitaires, sans PostgreSQL nécessaire |
| `npm run test:integration` | Contrats, services et API avec PostgreSQL réel |
| `npm test` | Unitaires + intégration ; le mode local peut autoriser des skips |
| `npm run test:ci` | Unitaires + intégration, gate strict : aucun skip/TODO accepté |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sans émission |
| `npm run build` | Build Next de production |

L’intégration nécessite une base migrée et les variables `DATABASE_URL`,
`MIGRATION_DATABASE_URL`, `COOKIE_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
et `WEB_ORIGIN`. Utiliser une base locale de développement ou de test : les tests
créent et nettoient leurs fixtures. Le runner découvre les fichiers récursivement
et vérifie leur exécution ; `CI=1` ou `CI=true` active aussi le mode strict.
Les tests utilisent `node:test` via `tsx`, sans suite E2E navigateur permanente.

Avant livraison :

```powershell
npm run test:ci
npm run typecheck
npm run lint
npm run build
npx prisma validate
git diff --check
```

La [CI](.github/workflows/ci.yml) des PR vers `main` et `dev` prépare PostgreSQL 17
jetable, sépare les rôles DB, applique les migrations et exécute lint, typecheck,
le gate strict et le build.

## Structure et limites du MVP

| Dossier | Responsabilité |
|---|---|
| `src/app` | Routes Next, layouts, composition et état privé de route |
| `src/features` | Domaines, vues, clients API et logique frontend |
| `src/components/safecheck` | Providers, navigation, modales et primitives partagées |
| `src/lib` | Transport, contrats, client Auth, Prisma et catalogue tutoriels |
| `server` | Fastify, Better Auth, services audits et progression |
| `prisma` | Schéma et migrations PostgreSQL |
| `scripts`, `tests` | Préparation DB, runner, tests unitaires et intégration |

Le contenu des tutoriels, du lexique et des recommandations est éditorial et
statique. Il n’existe pas de table `Tutorial`. Le score est calculé côté frontend
à partir des réponses persistées et de leurs versions ; les recommandations
Results sont sélectionnées par tranche de score. La progression Guest des
tutoriels reste en mémoire et n’est pas rattachée au compte. Les sauvegardes User
de tutoriels sont des snapshots complets avec politique last-write-wins pour une
version compatible. Le profil Compte est en lecture seule ; les préférences
visuelles sont locales. Les parcours annoncés en construction ne sont pas des
fonctionnalités implémentées.

## Documentation de référence

- **Commencer ici** : ce README.
- **Comprendre le système** : [architecture frontend et full-stack](docs/frontend-architecture.md).
- **Travailler sur le projet** : [onboarding développeur](docs/frontend-onboarding-lts.md).
- **Recette manuelle actuelle** : [checklist QA](docs/qa/manual-regression-checklist.md).
- **Préparation opérationnelle** : [readiness, récupération réseau et registre des triggers](docs/operational-readiness.md).
- **Historique uniquement** : [index des rapports et archives](docs/qa/README.md),
  dont [ancienne baseline frontend LTS](README_FRONTEND_LTS.md).

Les rapports TUTO, QUALITY et d’anciens audits décrivent leurs checkpoints. Ils
ne remplacent pas ces références actuelles.
