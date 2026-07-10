# Champs obligatoires — Page Tutoriel SafeCheck

Spécification des champs du modèle de données `Tutorial`, à utiliser comme base pour le schéma Prisma (SC-BDD-009) et la documentation éditoriale (SC-029 / SC-056).

| # | Champ | Type | Obligatoire | Notes |
|---|---|---|---|---|
| 1 | `title` | string | Oui | Titre du tutoriel |
| 2 | `summary` | text (2-3 phrases) | Oui | Affiché sous le titre, sert aussi de meta description SEO |
| 3 | `category` | enum / FK `TutorialCategory` | Oui | Ex : Phishing & arnaques, MDP, Sauvegardes |
| 4 | `os` | enum (Windows / macOS / Linux / Mobile / Tous) | Oui | Plateforme concernée |
| 5 | `level` | enum (Débutant / Intermédiaire / Avancé) | Oui | Niveau de difficulté |
| 6 | `estimatedTime` | int (minutes) | Oui | Affiché en badge |
| 7 | `prerequisites` | array de string ou FK `Tutorial[]` | Non si vide | Liste de prérequis, peut référencer d'autres tutoriels |
| 8 | `steps` | array structurée (`TutorialStep[]`) | Oui | Étapes numérotées, chacune avec titre + description |
| 9 | `risks` | text | Oui | Actuellement absent du wireframe — à ajouter |
| 10 | `rollback` | text | Oui | Actuellement absent du wireframe — à ajouter |
| 11 | `expectedBenefit` | text | Oui | Correspond à l'encart « Objectif concret » existant |
| 12 | `sources` | array de string/URL | Oui | Actuellement absent du wireframe — différent du lexique |
| 13 | `localStatus` | enum (à faire / en cours / fait) | Géré côté client | Stocké en localStorage, pas en base pour les users anonymes |
| 14 | `cta` | string (lien/action) | Oui | « Lancer le tutoriel guidé » |
