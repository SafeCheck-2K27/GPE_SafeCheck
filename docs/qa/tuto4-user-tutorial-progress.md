# TUTO 4 — persistance Prisma minimale de progression

## Modèle et migration

Provider PostgreSQL existant ; User Better Auth identifié par un String stocké
en TEXT. Ajout de `User.tutorialProgress` et du seul modèle
`UserTutorialProgress`, mappé sur `user_tutorial_progress`.

| Champ | Prisma | PostgreSQL généré | Rôle |
| --- | --- | --- | --- |
| userId | String | TEXT NOT NULL | Propriétaire Better Auth |
| tutorialId | Int | INTEGER NOT NULL | ID numérique du catalogue statique |
| currentStep | Int @default(0) | INTEGER NOT NULL DEFAULT 0 | Position de reprise |
| completedSteps | Int[] @default([]) | INTEGER[] DEFAULT ARRAY[]::INTEGER[] | Validations |
| createdAt | DateTime @default(now()) | TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP | Création |
| updatedAt | DateTime @updatedAt | TIMESTAMP(3) NOT NULL | Dernière mutation via Prisma |

La migration `20261002180303_add_user_tutorial_progress` a été générée par
`prisma migrate dev --create-only --name add_user_tutorial_progress`, inspectée,
puis appliquée par `prisma migrate dev`. Client Prisma installé 7.9.0 régénéré.

Le SQL comporte uniquement CREATE TABLE pour la nouvelle table puis ALTER TABLE
de cette même table pour sa FK. Aucun changement de table existante, suppression,
renommage, enum, JSONB, CHECK manuel ou contenu Tutoriel en DB.

La FK `user_tutorial_progress_userId_fkey` référence `users.id`, ON DELETE CASCADE,
ON UPDATE CASCADE. Aucun lien avec Audit, aucune FK vers un tutoriel.

PK `user_tutorial_progress_pkey` sur `(userId, tutorialId)` : au plus une ligne
par User/tutoriel, sans ID technique supplémentaire. Son index B-tree unique
commence par userId et couvre les recherches de progressions d'un User ; aucun
index userId redondant ni index tutorialId global ajouté.
Référence : [PostgreSQL 17, index multicolonne](https://www.postgresql.org/docs/17/indexes-multicolumn.html).

Le SQL est conservé exactement tel que Prisma le génère : le tableau n'a pas
de NOT NULL SQL explicite, mais possède le défaut vide ; les écritures de cette
tâche passent par le client Prisma. `@updatedAt` est maintenu par Prisma,
sans trigger SQL ni DEFAULT SQL sur updatedAt. Référence :
[Prisma Schema API](https://docs.prisma.io/docs/orm/reference/prisma-schema-reference).

## Smoke test et intégration

`tests/integration/tutorial-progress.test.ts` : un test parent et sept sous-tests,
soit huit tests comptés par node:test. Accès Prisma direct, aucun endpoint.

- Création de tutoriel 1, currentStep 2, completedSteps [0, 1].
- Lecture par clé composite avec relation User.
- Update de position et remplacement des validations par [0, 2] ; createdAt
  conservé et updatedAt renouvelé par Prisma sans temporisation fragile.
- Double insertion User/tutoriel rejetée avec P2002.
- Deux tutoriels par User ; défauts 0 et [] vérifiés sur la seconde ligne.
- Deux Users pour le même tutoriel, valeurs indépendantes.
- Suppression du premier User : ses deux progressions disparaissent, celle du
  second demeure.

Utilisateurs éphémères à UUID uniques, emails sous example.test et champs User
compatibles avec le schéma Better Auth. Aucun audit ni compte réel manipulé.
Nettoyage enregistré avant création et suppression ciblée des seuls IDs de test ;
absence de progressions résiduelles contrôlée après nettoyage.

## Vérifications finales

- Nouveaux : 8/8 ; unitaires : 107/107 ; intégration : 21/21 ; total : 128/128.
- Aucun ignoré, échec ou annulé.
- Prisma validate, migrate status, generate : succès.
- Diff datasource/schema Prisma vide : aucune dérive après application.
- Typecheck, lint, build et git diff --check : succès.
- Frontend, domaine progression, API, Auth, Audit, Claim, Compte, scoring,
  catalogue et recommandations inchangés par TUTO 4.

## Décisions reportées

TUTO 5 validera tutorialId contre les 34 contenus statiques et contrôlera les
indices, bornes, doublons et payloads. userId proviendra exclusivement de la
session Better Auth. Le statut et le pourcentage resteront dérivés via le domaine
en utilisant le nombre d'étapes du catalogue ; aucun champ SQL correspondant.

Concurrence d'écriture et contrat API exact restent à définir. Aucun endpoint
ni raccordement frontend ajouté. F5 continue à perdre la progression du lecteur
en mémoire jusqu'au raccordement prévu dans les tâches suivantes.

TUTO 5 — créer l'API de progression User authentifié et ses tests d'intégration.
