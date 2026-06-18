# SafeCheck

répo du projet SafeCheck

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
cp .env.example .env.local
# Remplir les valeurs dans .env.local
```

## Base de données locale

```bash
docker compose up -d
npx prisma migrate dev
npx prisma db seed
```

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
| `npm run format` | Formater le code |