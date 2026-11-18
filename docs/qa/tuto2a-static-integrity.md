# TUTO 2A — intégrité statique des tutoriels

## Périmètre et résultat

Source canonique : `src/lib/tutoriels-data.ts`, réexportée par
`src/features/tutorials/data/catalog.ts`. Aucun contenu produit, endpoint,
modèle Prisma, migration ou comportement UI modifié.

Tests ajoutés : `tests/unit/tutorial-integrity.test.ts`, avec `node:test`,
`node:assert/strict` et `tsx`. Le parseur TypeScript déjà installé vérifie que
les IDs sont des valeurs explicites dans les objets du catalogue, sans dépendre
de l'indice du tableau. Ce contrôle ne garantit pas leur immutabilité historique.

29 nouveaux tests : 20 verts, 9 rouges attendus. Suite unitaire : 67 tests,
58 verts et les mêmes 9 rouges. Les 38 tests préexistants restent verts.
13 tests d'intégration existants (5 tests racine, 8 sous-tests), non exécutés.
80 tests au total dans le projet, intégration comprise.

Commandes exécutées :

- `node --import tsx --test --test-reporter=spec tests/unit/tutorial-integrity.test.ts`
- `node --import tsx --test --test-reporter=tap tests/unit/*.test.ts`
- `npm run typecheck` : succès.
- `npm run lint` : succès.
- `git diff --check` : succès.

Les tests utilisent `TSX_DISABLE_CACHE=1`. Suite complète/intégration et build
non exécutés : les échecs attendus autorisent cette limite dans TUTO 2A ; les
tests d'intégration créent des données PostgreSQL, hors périmètre de cette tâche.

## Associations incorrectes : six tests rouges

Source : `src/features/recommendations/data.ts`, champs `linkedTutorials`.
Les contrats utilisent les destinations explicitement annoncées dans les liens
existants, sans rapprochement automatique de titres, NLP ou choix de nouvelles
recommandations. L'ordre des associations n'est pas imposé.

| Test / entrée | IDs actuels | IDs attendus | Slugs attendus |
|---|---|---|---|
| `habit mdp-partage links target the declared tutorial subjects` | 1 | 2 | `creer-un-mot-de-passe-fort` |
| `habit mdp-reuse links target the declared tutorial subjects` | 1, 2 | 2, 3 | `creer-un-mot-de-passe-fort`, `gestionnaire-mdp` |
| `habit wifi links target the declared tutorial subjects` | 12 | 13 | `securiser-son-navigateur-web` |
| `technical 1 links target the declared tutorial subjects` | 2 | 3 | `gestionnaire-mdp` |
| `technical 3 links target the declared tutorial subjects` | 12 | 13 | `securiser-son-navigateur-web` |
| `technical 9 links target the declared tutorial subjects` | 12 | 13 | `securiser-son-navigateur-web` |

Les IDs 1, 2 et 12 actuels désignent respectivement `double-authentification`,
`creer-un-mot-de-passe-fort` et `mettre-a-jour-son-navigateur`.
Les contrats wifi/VPN conservent le sujet annoncé « Sécuriser sa navigation web » ;
ils ne décident pas de remplacer cette association par un tutoriel Wi-Fi ou VPN.

## Lexique : deux tests rouges

Source : `src/features/lexicon/data.ts`, `TERMS[].tutoriels[]`.
Les 63 références existent et les titres correspondent. Pour comparer les
niveaux, seules casse, accents et espaces périphériques sont normalisés :
`Avancé` et `Avance` sont équivalents, pas `Débutant` et `Intermediaire`.

Test `lexicon tutorial difficulty metadata agrees with the canonical catalog` :
12 divergences, regroupées ci-dessous.

| Tutoriel | Réel lexique | Attendu catalogue | Termes concernés |
|---|---|---|---|
| 22 | Avancé | Intermediaire | phishing, ingenierie-sociale |
| 24 | Intermédiaire | Avance | metadonnees, pseudonymisation, data, anonymisation |
| 13 | Débutant | Intermediaire | cookie, https, cookie-tiers, extension-navigateur, xss, csrf |

Test `lexicon tutorial duration metadata agrees with the canonical catalog` :
40 divergences, regroupées ci-dessous. Toutes les valeurs sont en minutes.

| Tutoriel | Réel lexique | Attendu catalogue | Termes concernés |
|---|---|---|---|
| 22 | 12 | 10 | phishing, ingenierie-sociale |
| 31 | 12 | 25 | surface-attaque, adresse-ip, dns, adresse-mac, firmware |
| 16 | 6 | 8 | 2fa, fuite-de-donnees |
| 14 | 8 | 12 | gestionnaire-mdp |
| 15 | 10 | 15 | chiffrement |
| 24 | 8 | 25 | metadonnees, pseudonymisation, data, anonymisation |
| 17 | 8 | 12 | rgpd, data |
| 13 | 8 | 10 | cookie, https, cookie-tiers, extension-navigateur, xss, csrf |
| 18 | 8 | 10 | cookie, cookie-tiers, extension-navigateur, software |
| 21 | 10 | 12 | vpn |
| 27 | 12 | 25 | pare-feu |
| 26 | 10 | 15 | pare-feu |
| 9 | 5 | 6 | malware |
| 19 | 8 | 9 | malware |
| 20 | 10 | 20 | ransomware, cloud |
| 25 | 12 | 20 | root |
| 7 | 5 | 10 | bug, mise-a-jour-securite, antivirus, patch, software |

## Navigation : un test rouge

Test `recommendation category navigation selects the technical view and a known category`.
Source : `src/components/safecheck/layout/nav-data.ts`, `recommandationLinks`.
Les catégories existent, mais le paramètre sélectionnant leur vue manque :

| Réel | Attendu |
|---|---|
| `/recommandations?cat=os` | `/recommandations?type=techniques&cat=os` |
| `/recommandations?cat=hardware` | `/recommandations?type=techniques&cat=hardware` |
| `/recommandations?cat=logiciels` | `/recommandations?type=techniques&cat=logiciels` |
| `/recommandations?cat=navigateur` | `/recommandations?type=techniques&cat=navigateur` |

## DECISION REQUIRED — notions éditoriales

Sources : `src/features/tutorials/data.ts` et `src/lib/tutoriels-data.ts`.
Les listes sont testées pour l'existence des références, pas pour une égalité
arbitraire entre des notions pouvant représenter des sélections différentes.

- `RECOMMENDED_IDS` = [1, 3, 5] ; `isRecommended` = [1, 3, 8]. Déterminer si
  sélection « pour vous » et recommandation éditoriale doivent être identiques.
- `isEssential` = [1, 6] ; tag `essentiel` = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12].
  Déterminer si badge/filtre et tag portent la même notion.
- `POPULAR_IDS` = [1, 3, 6, 11, 21] ; tag `populaire` = [1, 3, 6, 11].
  Déterminer le sens de chaque signal de popularité.

## Corrections bornées pour TUTO 2B

1. Corriger les sept références numériques réparties dans les six entrées du
   premier tableau, en conservant leur intention déclarée.
2. Aligner les 12 niveaux et les 40 durées recopiés du lexique sur le catalogue.
   Une résolution depuis le catalogue peut remplacer la duplication, avec
   adaptation des tests au contrat résultant sans perdre ces contrôles.
3. Ajouter `type=techniques` aux quatre liens de navigation par catégorie.
4. Arbitrer séparément les trois notions éditoriales ci-dessus avant d'écrire
   d'éventuels invariants supplémentaires. Aucun arbitrage n'est nécessaire
   pour rendre les 29 tests actuels verts.

Ne pas modifier les IDs/slugs canoniques pour contourner les assertions.
Les six destinations Résultats sont déjà correctes. Aucune correction de
progression, API, auth ou DB n'est nécessaire pour ces tests.
