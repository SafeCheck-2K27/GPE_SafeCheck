# Audit des dépendances - PATCH 6.7

Date de l'analyse : 21 juillet 2026

## Périmètre et méthode

Commandes exécutées depuis la racine du dépôt :

```bash
npm audit
npm audit --json
npm outdated --json
npm explain @hono/node-server
npm explain brace-expansion
npm explain js-yaml
npm explain postcss
npm audit fix --dry-run --json
```

L'audit initial signalait 26 entrées : 7 modérées, 19 hautes et aucune
critique. Ces entrées étaient la propagation de quatre advisories racines dans
l'arbre npm, et non 26 vulnérabilités indépendantes.

Les mises à jour ont été limitées aux versions compatibles autorisées par les
plages existantes :

- Prisma 7.8.0 vers 7.9.0 ;
- `@prisma/dev` 0.24.3 vers 0.24.14 ;
- ESLint 9.39.4 vers 9.39.5 ;
- `brace-expansion` 1.1.15 vers 1.1.16 et 5.0.6 vers 5.0.7 ;
- `js-yaml` 4.2.0 vers 4.3.0.

`package.json` n'a pas changé : ses plages acceptaient déjà ces versions. Le
résultat reproductible est enregistré dans `package-lock.json`.

## RESOLVED

### GHSA-92pp-h63x-v22m - `@hono/node-server`

| Champ | Analyse |
|---|---|
| Sévérité initiale | Modérée |
| Dépendance | Transitive, chaîne de l'outillage Prisma |
| Chemin initial | `prisma@7.8.0` -> `@prisma/dev@0.24.3` -> `@hono/node-server@1.19.11` |
| Vulnérabilité | Contournement du middleware `serveStatic` avec des slashs répétés |
| Exploitabilité SafeCheck | Non atteignable dans l'application : SafeCheck ne lance pas Hono et ce package provenait de l'outillage Prisma |
| Version corrigée | `@hono/node-server >=1.19.13` ; Prisma 7.9.0 retire cette dépendance de la chaîne installée |
| Changement majeur | Non |
| Impact build | Prisma Client régénéré normalement ; validations complètes requises après mise à jour |
| Décision | Résolu par mise à jour compatible de l'ensemble Prisma vers 7.9.0 |

L'audit npm propageait également cette alerte vers `@prisma/dev`, `prisma` et
`@prisma/client`. Après la mise à jour, `npm ls @hono/node-server` ne conserve
plus le package.

### GHSA-3jxr-9vmj-r5cp - `brace-expansion`

| Champ | Analyse |
|---|---|
| Sévérité initiale | Haute |
| Dépendance | Transitive, développement uniquement |
| Chemins initiaux | ESLint/plugins -> `minimatch@3.1.5` -> `brace-expansion@1.1.15` ; TypeScript ESLint -> `minimatch@10.2.5` -> `brace-expansion@5.0.6` |
| Vulnérabilité | Déni de service CPU lors de l'expansion de groupes `{}` spécialement construits |
| Exploitabilité SafeCheck | Non exposée aux utilisateurs ; les motifs sont utilisés par l'outillage lint local/CI |
| Versions corrigées | 1.1.16 et 5.0.7 |
| Changement majeur | Non |
| Impact build | Aucun changement applicatif ; le lint doit rester fonctionnel |
| Décision | Résolu par mise à jour transitive ciblée |

L'alerte était propagée vers ESLint, ses plugins, `eslint-config-next` et les
packages TypeScript ESLint. Tous ces comptes disparaissent du nouvel audit.

### GHSA-52cp-r559-cp3m - `js-yaml`

| Champ | Analyse |
|---|---|
| Sévérité initiale | Haute |
| Dépendance | Transitive, développement uniquement |
| Chemin initial | `eslint@9.39.4` -> `@eslint/eslintrc@3.3.5` -> `js-yaml@4.2.0` |
| Vulnérabilité | Consommation CPU quadratique via des chaînes de clés de fusion YAML |
| Exploitabilité SafeCheck | Non exposée au trafic de l'application ; aucun YAML utilisateur n'est analysé par cette chaîne |
| Version corrigée | 4.3.0 |
| Changement majeur | Non |
| Impact build | Aucun ; seule la configuration de l'outillage est concernée |
| Décision | Résolu avec ESLint 9.39.5 et la mise à jour transitive de `js-yaml` |

## NOT REACHABLE

### GHSA-qx2v-qp2m-jg93 - PostCSS embarqué par Next.js

| Champ | Analyse |
|---|---|
| Sévérité restante | Modérée |
| Dépendance | Transitive de production/build |
| Chemin | `next@16.2.9` -> `postcss@8.4.31` ; propagation vers le direct `@vercel/analytics@2.0.1` |
| Vulnérabilité | XSS lors de la sérialisation CSS d'une valeur contenant `</style>` non échappé |
| Exploitabilité SafeCheck | Non atteignable dans le produit actuel : le build traite uniquement les feuilles de style versionnées et aucune entrée utilisateur n'est transformée ou sérialisée en CSS par PostCSS |
| Version corrigée | PostCSS 8.5.10 ou supérieure |
| Changement majeur | Aucun correctif stable compatible disponible via Next à la date de l'audit |
| Impact build | Aucun incident observé ; le risque apparaîtrait si du CSS non fiable entrait dans la chaîne de transformation |
| Décision | Ne pas forcer une résolution interne de Next ; surveiller une version stable Next embarquant PostCSS corrigé |

La dépendance directe `@tailwindcss/postcss` utilise déjà PostCSS 8.5.15 et
n'est pas concernée. L'instance restante est privée à Next.js.

## DEV ONLY

Les advisories `brace-expansion` et `js-yaml` étaient limités à la chaîne
ESLint. Ils ont néanmoins été corrigés afin de protéger les postes de
développement et la CI. L'ancienne chaîne Hono provenait également de l'outillage
Prisma, sans serveur Hono lancé par SafeCheck ; elle est désormais supprimée.

## DEFERRED WITH JUSTIFICATION

L'unique cause différée est PostCSS 8.4.31 embarqué par Next.js 16.2.9.

- `npm audit` ne propose aucun correctif compatible.
- Next.js 16.2.10, dernière version stable observée avec `npm outdated`, embarque
  encore PostCSS 8.4.31 et ne corrige donc pas l'advisory.
- Forcer une override d'une dépendance interne de Next n'est pas soutenu et peut
  casser le build.
- SafeCheck n'accepte ni ne sérialise de CSS fourni par un utilisateur.

Décision : conserver Next.js 16.2.9 pour ce patch, surveiller la publication d'un
correctif stable, puis mettre à jour Next et `eslint-config-next` ensemble après
validation complète.

## REQUIRES MAJOR UPGRADE

Aucune alerte ne dispose actuellement d'un correctif crédible nécessitant une
mise à niveau majeure. La suggestion produite par la simulation npm vers
Next.js 9.3.3 est un downgrade majeur incohérent et a été rejetée. Aucun
`npm audit fix --force` n'a été exécuté.

## PLAYWRIGHT REMOVAL PENDING

L'audit ne signale aucune vulnérabilité issue de `@playwright/test`,
`playwright` ou `playwright-core`. Cette catégorie était donc vide au moment de
l'audit. Le retrait prévu pour des raisons de portabilité a ensuite été effectué
par le PATCH 6.9, sans impact sur le compte d'alertes.

Le lockfile généré par npm conserve le nom `@playwright/test` uniquement dans les
métadonnées du peer optionnel déclaré par Next.js. Aucun nœud de package
Playwright n'est verrouillé ou installé par le projet.

## Paquets obsolètes non liés aux advisories

`npm outdated` a également signalé des mises à jour compatibles pour Tailwind,
Lucide et Prisma, ainsi que des versions plus récentes mais volontairement
épinglées de Next.js et React. Seules les mises à jour nécessaires à la sécurité
ont été appliquées. Les mises à niveau de confort sont hors périmètre de ce
patch.

## Résultat final

```text
Audit initial : 26 entrées (7 modérées, 19 hautes, 0 critique)
Audit final   :  3 entrées (3 modérées, 0 haute, 0 critique)
Cause restante : un advisory PostCSS propagé à postcss, next et @vercel/analytics
```

Le code source et `package.json` sont inchangés. Les validations techniques
finales du PATCH 6.7 sont consignées dans le compte rendu d'exécution de l'agent.
