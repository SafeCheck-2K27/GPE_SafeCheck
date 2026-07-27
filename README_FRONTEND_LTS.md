# SafeCheck - Du dossier Tony à la baseline frontend LTS

## Pourquoi ce document existe

Deux versions du frontend SafeCheck peuvent encore être présentes sur les
postes de travail :

- le dossier historique
  `GPE_SafeCheck-tonywhg-gpe-92-sc-003-1-refactor-de-la-structure-frontend-mvp` ;
- le clone Git de référence `GPE_SafeCheck_PUSH`, qui contient désormais la
  baseline frontend dite **LTS**.


Le dossier Tony a servi de point de départ visuel et fonctionnel. Il reste utile
pour comprendre l'origine du projet, mais il ne doit plus servir de base de
développement ni de source pour recopier du code.

## Situation avant le refactor

La première version démontrait déjà l'essentiel de l'expérience SafeCheck :
navigation, audit rapide, résultats, recommandations, tutoriels, lexique,
essentiels, compte et thèmes clair/sombre.

Le problème n'était donc pas l'absence de fonctionnalités. Le problème était la
façon dont elles étaient assemblées.

Une grande partie du projet était concentrée dans quelques pages très longues.
Les pages Tutoriels, Recommandations, Compte et Détail d'un tutoriel dépassaient
chacune largement le millier de lignes. Données, règles métier, navigation,
état, modales et affichage étaient souvent mélangés au même endroit.

Cette organisation entraînait plusieurs difficultés :

- une petite modification pouvait affecter une page entière ;
- des composants et styles proches étaient recréés à plusieurs endroits ;
- les mêmes données existaient parfois sous plusieurs formes ;
- les comportements de navigation, de thème et de modale n'étaient pas toujours
  cohérents ;
- les cas invalides, l'hydratation React et l'accessibilité étaient difficiles
  à vérifier ;
- le manque de tests et de documentation rendait les régressions plus faciles ;
- chaque nouveau développement augmentait la dette technique.

Le dossier Tony comptait 44 fichiers TypeScript, React ou CSS sous `src`, pour
environ 16 800 lignes. Ce chiffre n'était pas excessif en lui-même, mais le code
était trop concentré : la plus grande page atteignait 2 325 lignes.

## Ce que devient la baseline LTS

La LTS conserve le produit et ses 18 routes principales. Le refactor n'a pas
réinventé SafeCheck et n'a pas volontairement changé son identité visuelle. Il a
surtout rendu son fonctionnement interne lisible, isolé et vérifiable.

Les pages servent maintenant principalement à assembler des blocs fonctionnels.
Le comportement est réparti dans dix domaines clairs : accueil, audit, compte,
essentiels, lexique, personnalisation, recommandations, résultats, tutoriels et
catalogue des audits.

La base contient désormais 195 fichiers TypeScript, React ou CSS sous `src`.
Le nombre de fichiers a augmenté parce que les responsabilités ont été séparées.
Le volume total a légèrement augmenté avec les protections, les contrats et les
tests, mais les pages critiques sont devenues beaucoup plus courtes. La page
Tutoriels principale est passée de 2 325 à 111 lignes, Recommandations de 1 806
à 11 lignes et Compte de 1 155 à 145 lignes.

La nouvelle base apporte notamment :

- une organisation par domaine fonctionnel ;
- des sources de données identifiées et non dupliquées ;
- des composants partagés pour les boutons, cartes, badges, filtres, pages et
  modales ;
- un thème clair/sombre piloté par des variables communes ;
- des parcours plus robustes face aux URL ou données invalides ;
- une meilleure gestion du clavier, du focus et des modales ;
- des tests sur les règles les plus sensibles ;
- une documentation d'architecture et une recette manuelle durable ;
- des commandes de validation reproductibles avant chaque pull request.

## Ce qui ne change pas encore

La LTS est une base frontend saine, mais elle reste un MVP.

L'authentification visible est simulée dans le navigateur. Les profils,
progressions, recommandations et contenus affichés ne sont pas encore reliés à
un backend de production. PostgreSQL et Prisma sont présents dans le dépôt, mais
les parcours visibles ne les utilisent pas encore.

Certains écrans sont volontairement annoncés comme en construction. Les données
de progression de plusieurs parcours restent temporaires. La validation
visuelle complète demeure une responsabilité humaine avant une mise en
production.

Enfin, le dernier audit de dépendances du 23 juillet 2026 signale encore des
alertes sur Next.js et Sharp. Elles doivent être traitées dans une évolution
dédiée, avec une nouvelle validation complète, et non masquées.

## Référence à utiliser

À partir de maintenant :

- développez uniquement depuis le clone Git `GPE_SafeCheck_PUSH` et la branche
  approuvée par l'équipe ;
- utilisez le dossier Tony uniquement comme archive de comparaison ;
- ne recopiez pas une ancienne page dans la LTS pour aller plus vite ;
- lisez avant toute modification
  [`docs/frontend-onboarding-lts.md`](docs/frontend-onboarding-lts.md) ;
- consultez aussi
  [`docs/frontend-architecture.md`](docs/frontend-architecture.md) pour les
  règles de contribution frontend.

La LTS n'est pas une fin de projet. C'est le point à partir duquel l'équipe peut
enfin ajouter des fonctionnalités sans reconstruire les fondations à chaque
ticket.
