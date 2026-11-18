# TUTO 5 — API de progression User authentifié

## Contrat

GET `/me/tutorial-progress` retourne `{ items: [...] }`, y compris une liste vide
pour un User sans progression. Chaque item comporte uniquement tutorialId,
currentStep, completedSteps, createdAt et updatedAt. Dates ISO 8601 ; ordre
updatedAt DESC, tutorialId ASC pour départager les dates identiques.

PUT `/me/tutorial-progress/:tutorialId` exige exactement un objet JSON contenant
currentStep et completedSteps, puis crée ou remplace le snapshot par upsert.
Réponse 200 avec le même DTO public. createdAt est conservé lors des updates ;
updatedAt est renouvelé par Prisma. Aucun contenu, userId, statut ou pourcentage
dans la réponse. Réponses marquées Cache-Control: no-store.

Exemple :

```json
{ "currentStep": 2, "completedSteps": [0, 1] }
```

## Identité et sécurité

Plugin Fastify dédié, enregistré dans server/app.ts. Son onRequest exige une
session valide via `auth.api.getSession` et `fromNodeHeaders`, avant le parsing du
body. Propriétaire exclusivement `session.user.id` ; requêtes Prisma limitées
à cet ID, clé d'upsert `(userId, tutorialId)`. Aucun cookie guest, claim ou
progression anonyme créé. Une query userId ne change jamais le propriétaire.
Les champs supplémentaires du body, notamment userId, sont rejetés.

PUT reprend la politique Origin du claim Audit : si présent, Origin doit être
exactement WEB_ORIGIN ; sinon 403. Les clients HTTP hors navigateur peuvent
l'omettre. CORS, méthodes autorisées et configuration Better Auth restent
inchangés. Text/plain est rejeté par validation du body ; form-urlencoded n'est
pas supporté. Aucun code ajouté ne journalise headers, cookies, session ou token.
Le gestionnaire d'erreurs existant masque les détails Prisma aux clients.

## Validation

- tutorialId : chaîne décimale canonique d'un entier positif sûr ; syntaxe
  invalide → 400 INVALID_TUTORIAL_ID. Résolution dans une Map construite depuis
  le catalogue canonique `src/lib/tutoriels-data.ts`, importable côté serveur,
  sans recopier les IDs. ID absent → 404 TUTORIAL_NOT_FOUND, comme les ressources
  absentes des routes Audit.
- Body : objet non-null, deux champs requis, aucun champ supplémentaire.
- currentStep : nombre entier sûr, 0 <= index < nombre d'étapes du tutoriel.
  Aucune coercition string/booléen/null ni clamp.
- completedSteps : tableau de nombres entiers sûrs dans les mêmes bornes.
  Un seul index invalide rejette tout le snapshot, sans écriture.
- Le boundary runtime est distinct de `normalizeTutorialProgress`, qui nettoie
  des snapshots typés et ne constitue pas un validateur de payload hostile.
  Après validation, cette fonction du domaine déduplique et trie : [2,0,2,1]
  devient [0,1,2]. RangeError du domaine → résultat invalide → HTTP 400.
- Payload invalide → 400 INVALID_TUTORIAL_PROGRESS. JSON malformé et type de
  contenu non supporté suivent les erreurs Fastify existantes (400/415).
- Guest/session absente, invalide ou révoquée → 401 UNAUTHENTICATED sur les deux
  routes. Erreur serveur/Prisma → 500 INTERNAL_ERROR avec message générique.

## Concurrence

**TEMPORARY MVP DECISION → last-write-wins.** Chaque PUT est un snapshot complet,
sans fusion, version ou verrouillage optimiste. La dernière écriture validée
et exécutée en DB gagne, quel que soit l'ordre de lancement des requêtes.
Cela préserve aussi la possibilité de retirer des validations.

Prisma upsert utilise la PK composite. Si un chemin d'upsert concurrent retourne
P2002 lors de la première insertion, le service effectue un update du même couple
User/tutoriel. Aucune seconde ligne possible, aucun SQL custom.
Références : [Prisma, upsert et concurrence](https://www.prisma.io/docs/orm/v7/reference/prisma-client-reference),
[Prisma, clés composites](https://docs.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints).

## Tests et recette

Neuf tests unitaires purs pour parsing ID, validation runtime, normalisation,
gestion des RangeErrors et DTO public.

Suite Fastify inject + PostgreSQL réel, sessions créées par Better Auth :
21 scénarios et leur parent, soit 22 nouveaux tests d'intégration :

1. GET sans session, cookie guest signé ou session invalide : 401.
2. PUT sans session, guest ou session invalide : 401, avant parsing JSON.
3. Liste vide pour les Users sans progression.
4. Création tuto 1, position 2, validations [0,1] ; contrôle PostgreSQL.
5. Lecture du snapshot et exactitude des seuls champs publics.
6. Updates et PUT répété, une ligne et createdAt conservé.
7. Plusieurs tutoriels, ordre updatedAt DESC contrôlé sans timing fragile.
8. Isolation A/B pour le même tutoriel, query userId sans effet.
9. ID inconnu : 404, aucune mutation DB.
10. IDs malformés : 400, aucune mutation DB.
11. currentStep négatif, hors borne, flottant, mauvais type ou infini : refus.
12. completedSteps négatifs, hors borne, flottants ou mauvais types : refus.
13. Champs manquants, userId client, statut/pourcentage/extra, null/array : refus.
14. Doublons et ordre : réponse et DB [0,1,2].
15. Snapshot complet : toutes les validations, aucun statut stocké/retourné.
16. Décomplétion : un snapshot vide remplace les validations existantes.
17. Deux premières écritures concurrentes : une ligne, un snapshot entier valide ;
    une écriture ensuite ordonnée gagne, sans supposer l'ordre concurrent.
18. Origin non autorisé ou null : 403, aucune mutation DB.
19. Text/plain et form-urlencoded : refus, aucune mutation DB.
20. Session révoquée : GET et PUT refusés, aucune mutation DB.
21. Erreur Prisma simulée : 500 générique sans détail interne dans la réponse.

Users à emails UUID sous example.test ; nettoyage ciblé de ces seuls utilisateurs
et vérification de la cascade. Aucune donnée réelle manipulée. Aucun endpoint
temporaire, nouvelle dépendance ou framework de test React.

Vérifications finales : 116/116 unitaires, 43/43 intégration, 159/159 total, sans
test ignoré, échec ou annulé. Prisma validate, typecheck, lint, build et
git diff --check passent.

## Périmètre et suite

Aucun changement Prisma, migration, table, colonne, index ou relation.
Aucun changement frontend, Auth, Audit, Claim, Compte, Résultats, scoring, lexique,
contenu Tutoriel ou recommandations. Le lecteur reste en mémoire jusqu'à TUTO 6.

Pas de blocage identifié avant connexion frontend. Le client devra traiter les
erreurs HTTP et ordonner/coalescer ses sauvegardes pour respecter last-write-wins.

TUTO 6 — connecter useTutorialProgress à l'API pour les Users authentifiés,
restaurer après F5 et alimenter le Compte avec les progressions réelles.
