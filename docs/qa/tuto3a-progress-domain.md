# TUTO 3A — règles pures de progression

## Compatibilité avec l'existant

Les deux pages Tutoriels conservent `currentStep` et un `Set<number>` de
validations en React state. La page détail ajoute `markedDone` et `saved`.
`TutorialModal` calcule actuellement son pourcentage depuis la position de
lecture, annonce la complétion depuis la taille du Set et ferme seulement le
lecteur sur « Terminer ». Le détail dérive son statut depuis `markedDone`.
Ces incohérences correspondent au diagnostic attendu, sans incompatibilité
majeure avec le modèle cible.

`TutorialPrecisionModal` gère uniquement un signalement simulé.
Le catalogue et les vues personnalisées consomment `mockTutoStatus`,
`mockTutoLastStep` et les agrégats éditoriaux de `userProgress` ; ils ne constituent
pas une progression persistée. Aucun de ces fichiers n'est modifié ici.

Le module `src/features/tutorials/progress.ts` est indépendant du catalogue,
de React, Next.js, de l'identité utilisateur et de toute infrastructure.
Les indices actuels sont conservés ; les tableaux sont sérialisables et
peuvent être adaptés aux Set actuels lors de TUTO 3B.
Les anciens helpers du détail restent temporairement utilisés par le lecteur ;
seul le nouveau domaine fait autorité pour la future intégration.

## Contrat

- `null` : NOT_STARTED, 0 % ; normaliser ne crée aucune progression.
- Un objet existe : IN_PROGRESS, même à l'étape 0 sans validation.
- Toutes les étapes valides et uniques sont validées : COMPLETED.
- Pourcentage exact : validations uniques valides / totalSteps × 100.
  L'arrondi éventuel relève de l'affichage, jamais de la décision de complétion.
- `currentStep` est uniquement une position de reprise à index zéro.
- « Terminer » valide tous les indices et conserve la position de reprise.
  L'action est idempotente et équivaut aux validations manuelles.
- Décocher une étape terminée ramène IN_PROGRESS.
- Navigation bornée : précédente à 0 reste à 0 ; suivante à la dernière étape
  reste sur celle-ci. Elle conserve les validations et le statut COMPLETED.
- Les actions recevant `null` créent une progression à 0 avant de s'appliquer.
  Suivante depuis `null` navigue donc à 1 (ou 0 pour un tutoriel d'une étape).

## Normalisation et rejets

Normalisation automatique des snapshots typés : indices de validation invalides
supprimés, doublons supprimés, indices triés. Cela évite de gonfler le pourcentage
sur des données imparfaites. La position est tronquée puis bornée ; une position
non finie revient à 0. L'entrée et son tableau ne sont jamais modifiés.

Une action d'ajout, retrait ou toggle sur un indice invalide lève RangeError.
La consultation d'un indice invalide renvoie false. `totalSteps` doit être un
entier sûr strictement positif pour toutes les fonctions : un tutoriel vide
est rejeté, jamais considéré terminé par défaut.

Ce contrat porte sur des nombres et objets TypeScript ; il ne valide pas un
payload JSON inconnu. La future API devra valider structure, types et bornes
des entrées avant d'appeler ces fonctions.

## Périmètre et décisions avant persistance

Guest : consultation, navigation et validation possibles dans la session React
courante ; aucune persistance, identité Guest ou reprise après F5 introduite.
Favoris, dates et progression globale/niveaux sont séparés de ce domaine.

Avant la persistance utilisateur : décider du traitement d'un changement de
nombre ou d'ordre des étapes (les indices ne portent pas une identité stable),
de la gestion des écritures concurrentes et de l'utilité des dates. Définir
également le contrat de validation API et son association à l'utilisateur
authentifié. Aucun schéma, endpoint ou stockage n'est ajouté ici.

## Couverture

`tests/unit/tutorial-progress.test.ts` formalise les états, ratios, indépendance
de la reprise, normalisation, indices invalides, actions, décomplétion,
navigation, tailles 4/5/6 et toutes les tailles du catalogue, immutabilité et
sérialisation. Les tests ont été écrits avant le module : l'exécution initiale
échouait sur l'import absent, puis les mêmes contrats ont été exécutés sur
l'implémentation.

Résultat : 32/32 tests de progression, 29/29 tests d'intégrité Tutoriels,
99/99 unitaires, 13/13 intégration, 112/112 pour `npm test`, sans test ignoré.
Typecheck, lint, build et contrôles de whitespace passent. Les tests
d'intégration créent puis nettoient leurs données temporaires ; aucun changement
de schéma, migration ou donnée durable n'est introduit par cette tâche.
Le diff et les fichiers préexistants sont préservés.
