-- Ajout de l'empreinte du mot de passe sur les comptes utilisateurs (SC-041a).
--
-- La colonne est NOT NULL sans valeur par défaut : un compte sans moyen
-- d'authentification n'a pas de sens, et fournir un défaut reviendrait à
-- donner la même empreinte à tout le monde.
--
-- Conséquence : cette migration échoue si la table "users" contient déjà
-- des lignes. C'est volontaire et sans risque à ce stade, la table étant
-- vide (aucune inscription n'existait avant ce ticket). Si une base de
-- développement contient des enregistrements de test, la réinitialiser
-- avec `npx prisma migrate reset`.

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "passwordHash" TEXT NOT NULL;
