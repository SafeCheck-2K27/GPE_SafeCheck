## Ce que fait cette PR

<!-- Décris brièvement ce qui a été fait -->

## Ticket associé

Closes #SC-XXX

## Type de changement

- [ ] Feature
- [ ] Fix
- [ ] Refacto
- [ ] Chore (config, docs, infra)

## Checklist

- [ ] Le code lint sans erreur (`npm run lint`)
- [ ] Le typecheck passe (`npm run typecheck`)
- [ ] Les tests unitaires et d’intégration passent sans skip (`npm run test:ci`, PostgreSQL migré)
- [ ] Le build passe (`npm run build`)
- [ ] Le schéma Prisma est valide (`npx prisma validate`)
- [ ] Aucun problème de whitespace (`git diff --check`)
- [ ] Recette manuelle des parcours touchés, ou non applicable expliqué
- [ ] Pas de console.log oubliés
- [ ] Le nom de la branche respecte la convention (feature/*, fix/*, chore/*)

Références actuelles : [architecture](../docs/frontend-architecture.md),
[onboarding](../docs/frontend-onboarding-lts.md) et
[recette QA](../docs/qa/manual-regression-checklist.md).
