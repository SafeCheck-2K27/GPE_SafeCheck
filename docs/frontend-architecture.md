# Architecture frontend SafeCheck

Ce document est la référence pour l'organisation et la maintenance du frontend
SafeCheck. Le `README.md` reste centré sur l'installation et les commandes ; les
règles de contribution propres au frontend vivent ici.

## État du MVP

SafeCheck est actuellement un MVP frontend. L'infrastructure PostgreSQL et
Prisma existe, mais les parcours visibles ne sont pas encore reliés à des API de
production :

- l'authentification est simulée et persistée dans le navigateur ;
- les contenus, résultats, recommandations et progressions viennent de données
  locales ;
- les actions de compte ne modifient pas encore un backend réel ;
- les données locales ne constituent ni une politique de sécurité ni un moteur
  de recommandation définitif.

Toute évolution doit préserver cette distinction. Ne présentez pas un état local
comme une confirmation serveur et n'ajoutez pas de faux comportement réseau.

## Organisation des sources

### `src/app`

Le dossier App Router définit les routes, layouts, boundaries et métadonnées.
Une `page.tsx` doit principalement composer les éléments du domaine concerné.
Elle ne doit pas redevenir un composant monolithique contenant données, logique
métier et interface dans le même fichier.

Les éléments qui n'appartiennent qu'à une route sont colocalisés avec elle :

- `_components/` pour ses composants privés ;
- `_data.ts` pour ses données privées ;
- les autres fichiers préfixés par `_` lorsqu'ils ne doivent pas devenir des
  segments de route.

On choisit cette colocalisation lorsqu'un élément n'a qu'un consommateur et ne
porte pas un concept métier réutilisable. Les routes `hall-of-fame`,
`vulnerabilite` et `wip` montrent cette convention.

### `src/features`

Chaque dossier représente un domaine fonctionnel durable : audit, compte,
tutoriels, résultats, recommandations, etc. Une feature peut contenir :

- ses composants ;
- ses données et types ;
- ses fonctions pures de filtrage, normalisation ou calcul ;
- ses hooks, lorsqu'ils sont réellement propres au domaine.

Un élément passe de la route vers une feature lorsqu'il représente un concept
métier, possède plusieurs consommateurs, ou mérite des tests indépendants de la
page. Une feature ne doit pas exposer les détails internes d'une route.

### `src/components/safecheck`

Ce dossier contient l'interface partagée et marquée SafeCheck : navigation,
providers, layout, modales et primitives visuelles. Ces composants peuvent être
consommés par les routes et les features, mais ne doivent jamais importer depuis
`src/features`.

### `src/components/ui`

Ce namespace est réservé à d'éventuels contrôles génériques, sans marque et sans
connaissance métier. Il n'existe pas actuellement : ne le créez que si une vraie
primitive générique ne peut pas vivre dans le système SafeCheck. Ne dupliquez
pas les primitives déjà présentes dans `src/components/safecheck/primitives`.

### `src/lib`

`src/lib` accueille les adaptateurs partagés, hooks techniques, accès
d'infrastructure et sources de données transversales. Il ne doit pas devenir un
dossier fourre-tout : une logique qui ne sert qu'une feature reste dans cette
feature.

## Sens des dépendances

Le sens normal des imports est :

```text
src/app -> src/features -> src/components/safecheck -> utilitaires partagés
    |             |                    |
    +-------------+--------------------+-> src/lib
```

Règles obligatoires :

- `src/components` n'importe jamais `src/features` ;
- une feature peut importer les primitives partagées et `src/lib` ;
- une route compose les features et les composants partagés ;
- une feature ne doit pas importer la page ou les composants internes d'une
  autre feature ;
- un besoin transverse récurrent doit devenir un contrat stable : type, donnée,
  fonction pure ou composant partagé dans la couche appropriée.

L'import du lexique par le détail d'un tutoriel est un cas transverse limité à
une source de données publique. Il ne doit pas évoluer vers un couplage entre
interfaces internes des deux features.

## Sources de vérité et données

Une donnée métier ne doit avoir qu'une source de vérité. Les vues peuvent la
transformer, jamais la recopier dans un second catalogue.

Sources importantes :

- tutoriels : `src/lib/tutoriels-data.ts` ;
- adaptateur public des tutoriels : `src/features/tutorials/data/catalog.ts` ;
- questions d'audit : `src/features/audit/data.ts` ;
- recommandations : `src/features/recommendations/data.ts` ;
- recommandations liées au score : `src/features/results/data.ts` ;
- seuils et niveaux de résultat : `src/features/results/logic.tsx` ;
- essentiels : `src/features/essentials/data.ts` ;
- lexique : `src/features/lexicon/data.ts` ;
- données de compte du MVP : `src/lib/account-data.ts`.

Les consommateurs de tutoriels passent par l'adaptateur de la feature plutôt que
par la source `src/lib` directement. Cela garde un point d'entrée stable si le
stockage change plus tard.

Les catalogues destinés aux composants serveur, aux paramètres d'URL ou à une
future API doivent rester sérialisables : objets simples, tableaux, chaînes,
nombres, booléens et valeurs nulles. Évitez les instances de classes, fonctions,
éléments React et objets dépendant du navigateur dans ces données. La suite
`tests/unit/serializability.test.ts` protège cette frontière.

## React et Next.js

### Composants serveur et client

Les fichiers de l'App Router sont des composants serveur par défaut. Ajoutez
`"use client"` seulement au premier composant qui a réellement besoin d'état,
d'effets, d'événements ou d'une API navigateur. Gardez les données statiques et
les métadonnées côté serveur lorsque c'est possible.

Avant d'utiliser une API Next.js, vérifiez la documentation de la version livrée
dans `node_modules/next/dist/docs/`. Le projet utilise Next.js 16 et ne doit pas
être modifié selon des conventions d'une version antérieure.

### Providers et état navigateur

Les providers globaux sont assemblés dans `src/app/layout.tsx`. Ils doivent rester
peu nombreux et ne contenir que des préoccupations réellement globales.

Pour un état externe au cycle React, comme `localStorage`, les media queries ou
un état global observable, utilisez `useSyncExternalStore` avec un snapshot
serveur stable. N'utilisez pas un `useEffect` de montage uniquement pour masquer
un désaccord d'hydratation.

### Paramètres d'URL

L'URL est la source de vérité pour un état partageable : onglet, filtre, étape ou
résultat encodé. Les helpers doivent :

- valider les valeurs reçues ;
- fournir un défaut canonique ;
- ignorer ou normaliser les valeurs inconnues ;
- être testables sans navigateur ;
- éviter de dupliquer le même état dans l'URL et dans un state local divergent.

Les composants utilisant `useSearchParams` restent dans une boundary client et
sont enveloppés dans `Suspense` lorsque Next.js l'exige pour le rendu de
production.

### Hydratation

Le premier rendu serveur et le premier snapshot client doivent produire la même
structure. Les préférences navigateur sont lues via un store compatible SSR ou
après une boundary explicitement prévue. N'utilisez pas
`suppressHydrationWarning` pour cacher une divergence métier.

## Système UI SafeCheck

### Primitives

Les primitives partagées vivent dans
`src/components/safecheck/primitives`. Réutilisez-les avant d'ajouter une nouvelle
variante locale :

- `ScButton` pour les commandes et actions de navigation ;
- `ScChip` pour les filtres, choix compacts et états sélectionnables ;
- `ScBadge` pour une information courte non interactive ;
- `ScCard` pour un élément de contenu réellement encadré ;
- `SafeCheckMark` pour la marque partagée.

Une variante doit exprimer un besoin récurrent. Une différence propre à une seule
feature reste locale tant qu'elle ne justifie pas une API partagée.

### Layout et modales

`PageShell` fournit le cadre de page partagé. Ne recréez pas localement son fond,
sa hauteur minimale ou sa structure générale.

Toute nouvelle modale utilise `AccessibleModal` dans
`src/components/safecheck/layout/AccessibleModal.tsx`. La primitive centralise le
portal, le verrouillage du scroll, la pile de modales, l'inertie de l'arrière-plan,
le focus initial, la touche Échap, le clic sur le backdrop et la restitution du
focus. Un appelant fournit le nom accessible et le contenu ; il ne réimplémente
pas ces mécanismes.

### Tokens et thème sombre

Les tokens de couleurs, surfaces, textes, bordures et focus sont définis dans
`src/app/globals.css`, avec leurs valeurs claires dans `:root` et sombres dans
`.dark`. Les composants utilisent ces variables plutôt qu'une nouvelle palette
de littéraux Tailwind. Les couleurs littérales restent réservées aux cas où elles
portent une information intrinsèque ou à une contrainte externe documentée.

Toute modification visuelle doit être contrôlée en thème clair et sombre, sur un
petit et un grand viewport. Le thème sombre n'est pas une inversion automatique :
contraste, focus, disabled, hover et surfaces superposées doivent rester lisibles.

## Tests

### Suite automatisée

Les tests unitaires et de contrats vivent dans `tests/unit` et s'exécutent avec :

```bash
npm test
```

Ils couvrent en priorité les fonctions pures, les frontières de sérialisation,
les paramètres d'URL, les données inconnues ou malformées, les invariants
d'accessibilité testables sans navigateur et les résolveurs de résultats.

Le projet n'utilise pas d'outil dédié de mutation testing et n'impose pas encore
de seuil de couverture. La stratégie actuelle consiste à ajouter des cas négatifs
et à vérifier explicitement les invariants : entrée invalide, identifiant absent,
payload incomplet, ordre stable et absence de mutation des données sources.

### Vérification manuelle

Dans l'état final du projet sans Playwright, les scénarios navigateur restent
obligatoires sous forme de recette manuelle. Avant une PR qui touche l'interface,
contrôlez au minimum :

- navigation clavier et focus visible ;
- ouverture, fermeture et restitution du focus des modales ;
- thèmes clair et sombre ;
- largeurs mobile et desktop ;
- absence de débordement horizontal inattendu ;
- parcours audit, résultats, tutoriels, compte et personnalisation concernés ;
- absence d'erreur ou avertissement nouveau dans la console.

Limites actuelles : il n'existe pas encore de tests d'intégration avec un backend
réel, les données utilisateur sont simulées, et la validation visuelle reste en
partie manuelle.

## Ajouter ou modifier un comportement

### Une feature

1. Créez ou complétez un dossier dans `src/features`.
2. Séparez données, types, fonctions pures et composants si chacun a une
   responsabilité identifiable.
3. Gardez `src/app/.../page.tsx` comme point de composition.
4. Exposez uniquement les contrats nécessaires aux consommateurs.
5. Ajoutez des tests aux fonctions et frontières qui portent le risque.

### Un tutoriel

1. Ajoutez le contenu dans `src/lib/tutoriels-data.ts` avec un identifiant et un
   slug uniques.
2. Gardez le contenu entièrement sérialisable.
3. Consommez-le via `src/features/tutorials/data/catalog.ts`.
4. Vérifiez les liens, filtres, niveaux et la suite de sérialisation.

### Un filtre ou paramètre d'URL

1. Placez la logique pure de normalisation dans la feature concernée.
2. Définissez les valeurs acceptées et le défaut canonique.
3. Faites de l'URL la source de vérité lorsqu'elle doit être partageable.
4. Testez valeurs valides, absentes, dupliquées et inconnues.

### Un niveau de résultat

1. Modifiez les seuils et métadonnées dans `src/features/results/logic.tsx`.
2. Utilisez uniquement des identifiants déclarés dans
   `src/features/results/types.ts` et présents dans
   `src/features/results/data.ts`.
3. Testez les deux bornes du niveau et le fallback d'un identifiant inconnu.

### Une modale

1. Composez `AccessibleModal` au lieu de créer un portal local.
2. Fournissez un titre ou un libellé accessible unique.
3. Choisissez explicitement le focus initial si le premier élément interactif
   n'est pas le bon.
4. Testez Échap, backdrop, tabulation, empilement et retour du focus.

## Conventions de fichiers

- composants React : `PascalCase.tsx` ;
- hooks : nom préfixé par `use` ;
- données publiques d'une feature : `data.ts` ou un dossier `data/` ;
- contrats : `types.ts` ;
- fonctions pures : nom de domaine explicite, sans dépendance React si inutile ;
- éléments privés d'une route : `_components/`, `_data.ts` ;
- alias `@/` pour les imports entre domaines, imports relatifs courts à
  l'intérieur d'un même domaine ;
- commentaires réservés aux contraintes non évidentes, sans journal historique
  ni référence à un ancien patch.

## Validation avant pull request

Exécutez depuis la racine :

```bash
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

Ajoutez la recette manuelle adaptée au changement. Vérifiez également que le
diff ne contient ni secret, ni artefact généré, ni nouvelle duplication de
données ou de styles. Une PR doit annoncer honnêtement les limites ou validations
qui n'ont pas pu être exécutées.
