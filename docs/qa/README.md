# Index des rapports QA et historiques

**CURRENT REFERENCE** — index maintenu ; les rapports indexés sont des
**HISTORICAL / QA REPORTS**, sauf la checklist explicitement actuelle.

Le [registre opérationnel et conditionnel](../operational-readiness.md) est aussi
une **CURRENT REFERENCE**, maintenue à partir de Family J.

Ce dossier rassemble des rapports de validation ponctuels et des recettes
historiques. Ils décrivent l'état et le périmètre de leur étape ; ils ne
remplacent pas les consignes à jour. Pour travailler sur le dépôt, commencer par
le [README du projet](../../README.md), le [guide d'onboarding](../frontend-onboarding-lts.md)
et la [carte d'architecture](../frontend-architecture.md). La
[recette manuelle actuelle](manual-regression-checklist.md) est le point de
départ pour la vérification navigateur.

Les dates ci-dessous viennent des rapports lorsqu'elles sont indiquées. Les
rapports Tutoriels sont ordonnés par étape, sans attribuer de date à ceux qui
n'en donnent pas ; Tuto 6A et 6B indiquent une recette du 2 octobre, et Tuto 7
précise ses dates de recette et de clôture. Un classement par étape ou date ne
signifie pas que chaque constat reste vrai dans le code courant.

## Archives et validations antérieures

### PATCH 6 — juillet 2026

- [Validation visuelle et E2E PATCH 6.8](patch6-visual-validation.md) — résultat
  Playwright ponctuel avant son retrait ; référence historique, pas une suite
  active.
- [Audit des dépendances PATCH 6.7](../security/dependency-audit-patch6.md) —
  analyse datée du 21 juillet 2026 ; les versions et advisories doivent être
  revérifiés avant toute décision actuelle.

### Domaine Tutoriels — étapes successives

- [Tuto 2A — intégrité statique](tuto2a-static-integrity.md) — intégrité du
  catalogue éditorial.
- [Tuto 3A — règles de progression](tuto3a-progress-domain.md) — diagnostic et
  règles pures de progression.
- [Tuto 3B — lecteur et catalogue en mémoire](tuto3b-memory-reader.md) —
  intégration du domaine dans les lecteurs.
- [Tuto 4 — persistance Prisma](tuto4-user-tutorial-progress.md) — modèle et
  migration de progression utilisateur.
- [Tuto 5 — API de progression](tuto5-tutorial-progress-api.md) — contrat de
  l'API pour les utilisateurs connectés.
- [Tuto 6A — persistance frontend](tuto6a-tutorial-persistence.md) — lecteurs,
  synchronisation et sauvegarde ; recette datée du 2 octobre 2026.
- [Tuto 6B — progression dans Compte](tuto6b-account-tutorials.md) — historique
  de progression du compte ; recette datée du 2 octobre 2026.
- [Tuto 7 — stabilisation Audit → Tutoriel → Compte](tuto7-final-stabilization.md)
  — recette navigateur des 2–3 octobre, clôture technique le 5 octobre ;
  résultat « SUCCESS WITH DEBT ».

### Families B à F — rapports d'octobre 2026

- [Quality Family B — vérité produit](quality-b-product-truth.md) — promesses
  visibles comparées aux fonctions réellement disponibles (daté du 5 octobre).
- [Quality Family D — refactor ciblé](quality-d-targeted-refactor.md) —
  responsabilités et frontières du refactor (daté du 5 octobre).
- [Quality Family E — nettoyage](quality-e-dead-code-cleanup.md) — revue du code
  mort et des références conservées (daté du 5 octobre).
- [Quality Family F — intégrité des données](quality-f-data-integrity.md) —
  invariants et modifications de données (clôture datée du 6 octobre).
- [Family F — revue de la base](quality-f-db-review.md) — analyse en lecture
  seule du schéma, des migrations et des chemins de persistance (daté du
  5 octobre).

## Families G et H — 6 octobre 2026

- [Quality Family G — architecture de tests](quality-g-test-architecture.md) —
  couverture automatisée, limites UI et dette de validation à la clôture G.
- [Quality Family H — UX Auth](quality-h-auth-ux.md) — recette locale des flux
  d'authentification, destinations en attente, erreurs de session, claim,
  compte et déconnexion.

## Documents historiques liés

- [Quality Family I — documentation](quality-i-documentation.md) — inventaire,
  revue factuelle et validations de la passe documentaire du 6 octobre 2026.
- [Quality Family J — préparation opérationnelle](quality-j-operational-readiness.md)
  — décisions, preuves et validations du 6 octobre 2026 ; les triggers actuels
  sont maintenus dans le registre opérationnel lié plus haut.

- [README frontend LTS](../../README_FRONTEND_LTS.md) — comparaison de la
  baseline frontend avec le dossier historique ; un bandeau en tête renvoie
  désormais vers la documentation courante.
- [Champs obligatoires — page Tutoriel](../../champs_tuto.md) — proposition
  **FUTURE / ROADMAP**, explicitement non implémentée comme schéma DB ; les
  contenus catalogue et la progression du MVP suivent l'architecture actuelle.

## Références de contribution maintenues

- [AGENTS.md](../../AGENTS.md) — consignes de contribution, dont règles
  frontend et vérifications avant handoff.
- [CLAUDE.md](../../CLAUDE.md) — renvoie vers `AGENTS.md` pour les outils qui
  consultent ce fichier.

Les rapports ci-dessus sont des instantanés. Pour l'état opérationnel courant,
consulter le [README racine](../../README.md), l'architecture, l'onboarding et
le code ; ne pas déduire le comportement actuel d'une affirmation ponctuelle
d'un ancien rapport.
