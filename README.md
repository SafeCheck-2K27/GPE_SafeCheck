# SafeCheck

Application web d'accompagnement personnalisé en cybersécurité.

Stack : Next.js 16, React 19, TypeScript, PostgreSQL, Prisma 7, Docker.

## État du projet

Le frontend est un MVP fonctionnel alimenté par des données locales. Le dépôt
contient l'infrastructure PostgreSQL/Prisma, mais l'authentification, les contenus
et la progression visibles ne sont pas encore reliés à un backend de production.

L'organisation des sources, les règles de dépendances, le système UI et les
conventions de contribution sont documentés dans
[`docs/frontend-architecture.md`](docs/frontend-architecture.md).

## Prérequis

- Docker (Docker Desktop sur Windows/Mac).

Docker suffit : Node, la base et les dépendances tournent dans des conteneurs.

## Lancer le projet

```bash
git clone https://github.com/ton-org/safecheck.git
cd safecheck
cp .env.example .env
docker compose up --build -d
```

L'application est disponible sur http://localhost:3000

Le code source est monté dans le conteneur, ce qui active le rechargement à chaud :
modifier un fichier puis rafraîchir la page suffit à voir le changement.

Au démarrage, dans l'ordre :

1. `postgres` démarre et attend d'être prêt (healthcheck).
2. `app` applique les migrations Prisma, régénère le client, puis lance le serveur
   de développement.

## Commandes Docker

| Commande | Description |
|---|---|
| `docker compose up -d` | Démarrer (build seulement au premier lancement) |
| `docker compose up --build -d` | Reconstruire l'image puis démarrer |
| `docker compose logs -f app` | Suivre les logs de l'application |
| `docker compose restart app` | Redémarrer l'application |
| `docker compose down` | Tout arrêter |
| `docker compose down -v` | Tout arrêter et supprimer la base |

Reconstruire (`--build`) est nécessaire uniquement après un changement de
`package.json` ou du `Dockerfile`. Pour du code, un rafraîchissement suffit.

Changer le port si 3000 est occupé : `APP_PORT=3001 docker compose up -d`.

## Base de données

PostgreSQL tourne dans Docker. Le client Prisma est généré dans
`src/generated/prisma` (ignoré par git, régénéré automatiquement).

Les migrations existantes s'appliquent automatiquement au démarrage.

### Créer une migration

Après une modification de `prisma/schema.prisma` (nouvelle table, nouveau champ) :

```bash
docker compose exec app npx prisma migrate dev --name decris_le_changement
```

Cette commande crée le fichier de migration dans `prisma/migrations/`, l'applique
à la base et régénère le client. Le fichier de migration doit être commité.

### Exporter la base (dump)

```bash
docker compose exec -T postgres pg_dump -U safecheck safecheck > backup.sql
```

### Importer un dump

```bash
docker compose exec -T postgres psql -U safecheck -d safecheck < backup.sql
```

### Réinitialiser la base

```bash
docker compose down -v
docker compose up -d
```

### Autres commandes Prisma

```bash
docker compose exec app npx prisma generate
docker compose exec app npx prisma migrate deploy
```

## Convention de branches

| Branche | Usage |
|---|---|
| `main` | production, protégée, merge par pull request uniquement |
| `feature/*` | nouvelles fonctionnalités |
| `fix/*` | corrections (exemple : `fix/scoring-bug`) |
| `chore/*` | infrastructure, configuration, documentation |

## Développer sans Docker (optionnel)

L'application peut tourner directement sur la machine (Node.js >= 20 requis) :

```bash
npm install
npm run db:up
npm run db:migrate
npm run dev
```

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run lint` | Vérification ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Tests unitaires et tests de contrats |
| `npm run db:up` | Démarrer PostgreSQL (Docker) |
| `npm run db:down` | Arrêter PostgreSQL |
| `npm run db:logs` | Logs du conteneur PostgreSQL |
| `npm run db:migrate` | Créer et appliquer les migrations Prisma |
| `npm run db:generate` | Régénérer le client Prisma |
| `npm run db:studio` | Ouvrir Prisma Studio |

Avant une pull request, exécuter au minimum :

```bash
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```
