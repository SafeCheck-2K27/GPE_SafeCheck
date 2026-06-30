# SafeCheck

répo du projet SafeCheck

Convention des branche à respecter : 
main          → production, protégée, merge via PR uniquement
feature/*     → toutes les features
fix/*         → corrections (fix/scoring-bug)
chore/*       → infra, config, docs (chore/setup-eslint)

## Prérequis

- Node.js >= 20
- npm >= 10
- Docker (pour PostgreSQL local)

## Installation

```bash
git clone https://github.com/ton-org/safecheck.git
cd safecheck
npm install
```

## Variables d'environnement

```bash
cp .env.example .env
# Ajuster les valeurs si besoin (Prisma lit DATABASE_URL depuis .env)
```

## Base de données locale

PostgreSQL tourne dans Docker (voir `docker-compose.yml`). Le client Prisma est
généré dans `src/generated/prisma` (ignoré par git, régénéré via `postinstall`).

```bash
npm run db:up        # démarre PostgreSQL (docker compose up -d)
npm run db:migrate   # applique les migrations et régénère le client Prisma
```

> Si le port 5432 est déjà utilisé sur ta machine, change `POSTGRES_PORT` et le
> port de `DATABASE_URL` dans ton `.env` (ex. 5433).

## Lancer le projet

```bash
npm run dev
# → http://localhost:3000
```

## Commandes utiles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de dev |
| `npm run build` | Build de production |
| `npm run lint` | Vérification ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run db:up` | Démarre PostgreSQL (Docker) |
| `npm run db:down` | Arrête PostgreSQL |
| `npm run db:logs` | Logs du conteneur PostgreSQL |
| `npm run db:migrate` | Crée/applique les migrations Prisma |
| `npm run db:generate` | Régénère le client Prisma |
| `npm run db:studio` | Ouvre Prisma Studio |