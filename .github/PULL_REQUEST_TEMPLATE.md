## Objectif

<!-- Expliquer en 2-3 lignes ce que fait la PR -->

## Changements effectués

<!-- Lister les principaux fichiers ou modules modifiés -->

## Comment tester

<!-- Indiquer les étapes concrètes pour tester -->

## Screenshots

<!-- Obligatoire si changement visuel -->

## Risques / limites

<!-- Points non terminés, temporaires ou à surveiller -->

## Checklist

### Code & compréhension
- [ ] J'ai relu mon code
- [ ] J'ai compris le code que je propose
- [ ] Je n'ai pas collé du code IA sans le comprendre
- [ ] La PR traite un seul sujet
{- [ ] La PR fait moins de ~300 lignes modifiées (sinon je l'ai découpée)}

### Qualité (checks CI)
- [ ] Le lint passe (`npm run lint`)
- [ ] Le typecheck passe (`npm run typecheck`)
- [ ] Les tests unitaires passent (`npm run test`)
- [ ] Le build passe (`npm run build`)
- [ ] L'audit sécurité ne remonte pas de vulnérabilité critique (`npm audit --audit-level=critical`)

### Tests
- [ ] J'ai ajouté ou mis à jour les tests si la logique le justifie
- [ ] Les tests existants ne sont pas cassés par mes changements

### Git & convention
- [ ] Mes commits suivent la convention (feat / fix / docs / refactor / test / chore / ci / style / security)
- [ ] Ma branche part de `staging` et la PR cible `staging`
- [ ] Ma branche a un nom clair (feature/*, fix/*, docs/*…)

### Sécurité & environnement
- [ ] Aucun secret n'a été ajouté (pas de .env, clé API, DATABASE_URL réelle…)
- [ ] Aucune nouvelle variable d'environnement non documentée (sinon ajoutée au .env.example)
- [ ] Aucune migration Prisma ne touche la base de production

### Vérification visuelle / preview
- [ ] Screenshots ajoutés à la PR si changement visuel