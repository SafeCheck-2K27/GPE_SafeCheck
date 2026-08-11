# Validation visuelle et E2E - PATCH 6.8

Date : 21 juillet 2026

## Résumé

La dernière exécution automatisée Playwright avant son retrait est passée :

```text
12 tests passés
0 test échoué
0 test ignoré
Durée Playwright : 15,9 s
Commande complète avec build : 42,9 s
```

La revue visuelle interactive complète n'a pas pu être exécutée dans cette
session : aucun navigateur contrôlable n'était exposé à l'agent. Le présent
rapport sépare donc les assertions réellement automatisées des observations
visuelles encore à faire manuellement. Aucun statut PASS visuel global n'est
revendiqué.

## Environnement réellement utilisé

| Élément | Valeur |
|---|---|
| Système | Windows 10.0.19045 |
| Node.js | 22.17.1 |
| npm | 10.9.2 |
| Next.js | 16.2.9, build de production |
| Playwright | `@playwright/test` 1.61.1 |
| Navigateur résolu par la configuration | Opera GX 133.0.5932.39, exécutable système Chromium |
| Edge système | Non trouvé sur ce poste |
| Mode | Headless, un worker, aucun retry |
| Mouvement | `reducedMotion: reduce` |
| Serveur | `http://127.0.0.1:3100` via `next start` |

La configuration recherchait d'abord Edge puis Chrome, avant son fallback Opera
GX. Aucun navigateur n'a été téléchargé. L'exécution n'a donc pas utilisé Edge,
contrairement à l'environnement initialement souhaité ; ce point doit rester
visible dans la contre-revue.

## Commande et artefacts

Commande réellement exécutée :

```bash
npm run test:e2e
```

Cette commande a d'abord produit un build Next.js réussi des 20 routes, puis a
lancé les tests contre le serveur de production local.

Artefacts :

- `test-results/.last-run.json` indique `passed` et une liste vide de tests
  échoués ;
- aucune capture d'échec n'a été produite ;
- aucune trace n'a été conservée, car la configuration ne les garde qu'en cas
  d'échec ;
- aucune capture visuelle manuelle n'a été réalisée, faute de navigateur
  interactif disponible.

`test-results` était ignoré par Git pendant cette dernière exécution. L'artefact
et la règle d'exclusion exclusivement liée à Playwright ont été supprimés au
PATCH 6.9 ; ils ne font pas partie des livrables versionnés.

## Scénarios automatisés passés

1. Modale Connexion : portal, inertie, `aria-hidden`, scroll lock, Tab,
   Shift+Tab, fermeture bouton/backdrop/Échap, restauration du focus et des
   états préexistants.
2. Modales Tutoriel imbriquées : empilement, inertie de la modale inférieure,
   fermeture dans l'ordre, scroll lock et retour du focus.
3. Drawer Lexique : géométrie viewport en 390 px clair et 1280 px sombre.
4. Accueil responsive : contenu critique dans le viewport aux six largeurs, en
   clair et sombre, avec bouton Menu visible jusqu'à 390 px.
5. Vulnérabilité : absence de débordement horizontal à 320 px, clair et sombre.
6. Création de compte : labels visibles utilisés comme noms accessibles.
7. Essentiels : initialisation de la recherche par URL et fermeture de la modale
   par Échap.
8. Recommandations habitudes et techniques : absence de boutons imbriqués,
   actions détail/statut distinctes et modales fonctionnelles.
9. Compte : liens sémantiques, URL, conservation des paramètres, reload,
   précédent/suivant, fallback d'onglet, clavier et `aria-current`.
10. Authentification mockée : persistance de session et déconnexion.
11. Navigation landing -> accueil -> audit, puis parcours des dix questions ->
    personnalisation -> résultats.
12. Recherche Tutoriels -> route détail canonique.

Les douze scénarios surveillent les erreurs d'hydratation connues et les erreurs
JavaScript non capturées via `pageerror`. Aucun de ces signaux n'a été observé.
La suite ne collecte pas toutes les autres catégories de messages console ; une
revue générale de console reste donc manuelle.

## Couverture des viewports et thèmes

### Contrôles automatisés explicites

| Largeur | Accueil clair | Accueil sombre | Autre couverture explicite |
|---:|:---:|:---:|---|
| 320 px | PASS | PASS | `/vulnerabilite`, overflow : PASS dans les deux thèmes |
| 360 px | PASS | PASS | Non testée ailleurs |
| 390 px | PASS | PASS | Drawer `/lexique` clair : PASS |
| 768 px | PASS | PASS | Non testée ailleurs |
| 1024 px | PASS | PASS | Non testée ailleurs |
| 1280 px | PASS | PASS | Drawer `/lexique` sombre : PASS ; autres E2E au viewport par défaut |

Le test Accueil vérifie la présence et les limites géométriques du titre, le CTA
principal et le bouton Menu mobile. Il ne constitue pas une comparaison visuelle
pixel par pixel.

### Matrice visuelle humaine

| Largeur | Clair | Sombre |
|---:|:---:|:---:|
| 320 px | NON EXÉCUTÉE | NON EXÉCUTÉE |
| 360 px | NON EXÉCUTÉE | NON EXÉCUTÉE |
| 390 px | NON EXÉCUTÉE | NON EXÉCUTÉE |
| 768 px | NON EXÉCUTÉE | NON EXÉCUTÉE |
| 1024 px | NON EXÉCUTÉE | NON EXÉCUTÉE |
| 1280 px | NON EXÉCUTÉE | NON EXÉCUTÉE |

Raison : le runtime de cette session ne proposait aucun navigateur interactif à
l'agent. Le serveur local répondait correctement, mais une inspection humaine
ou pilotée et des captures représentatives n'étaient pas possibles via l'outil
disponible.

## Couverture par zone demandée

| Zone | Signal obtenu | Limite restante |
|---|---|---|
| Navbar | CTA et Menu mobile présents ; navigation landing/accueil/audit passée | Menus desktop et drawer mobile ouverts non inspectés visuellement aux six largeurs |
| Menu/zone Audits | Liens de navigation présents dans les parcours | États ouvert/fermé et overflow non mesurés |
| Landing | Navigation principale passée à 1280 px | Pas de revue visuelle multi-viewport |
| Accueil | Six largeurs x deux thèmes, géométrie critique passée | Pas de capture ni revue de toutes les sections |
| Audit | Parcours complet des dix questions passé | Pas de revue visuelle multi-viewport de la progression |
| Personnalisation | Transition et paramètres conservés | Contrôles visuels/formulaire non inspectés |
| Résultats | Route finale chargée sans erreur | Tous les niveaux et modale d'inscription non inspectés visuellement |
| Recommandations | Deux vues, actions et modales passées | Pas de matrice thème/viewport |
| Tutoriels catalogue/détail | Recherche, détail et modales imbriquées passés | Pas de revue visuelle complète des filtres et étapes |
| Essentiels | URL de recherche et modale passées | Pas de matrice thème/viewport |
| Lexique | Drawer 390 clair et 1280 sombre passé | Autres dix combinaisons non testées |
| Compte | URL, historique et clavier passés | Contenus des quatre sections non inspectés visuellement |
| Création de compte | Noms accessibles des champs passés | Formulaire complet non inspecté aux six largeurs |
| Modales | Portal, inertie, focus, scroll, backdrop et empilement couverts sur les scénarios principaux | Suppression de compte et toutes variantes visuelles non parcourues |
| Focus | Piège, restitution et navigation Compte couverts | Revue tabulation exhaustive de chaque route non faite |
| Overflow | Accueil critique et `/vulnerabilite` 320 contrôlés | Pas de mesure globale de toutes les routes |
| Hydratation/runtime | Aucun signal dans les 12 scénarios | Pas de navigation exhaustive hors scénarios |
| Console | Aucune erreur d'hydratation ou `pageerror` | Les autres erreurs console n'étaient pas toutes collectées |

## Risques et décisions

- Le PASS E2E sur Opera GX Chromium ne remplace pas une vérification Edge réelle.
- L'absence de captures sur succès limite la contre-vérification visuelle
  différée.
- Les états ouverts de la Navbar et de la zone Audits restent prioritaires dans
  la prochaine recette manuelle, notamment à 320, 360 et 390 px.
- Les routes non couvertes par les 12 scénarios doivent être parcourues avec la
  checklist durable avant une mise en production.
- Aucun correctif produit ou changement de configuration Playwright n'a été
  effectué pendant ce sous-patch.

## Verdict limité au PATCH 6.8

```text
SUITE E2E : PASS (12/12)
BUILD DE LA SUITE : PASS
REVUE VISUELLE HUMAINE COMPLÈTE : NON EXÉCUTÉE
VALIDATION GLOBALE : PASS AVEC RÉSERVES DOCUMENTÉES
```

La source de vérité pour les prochaines recettes est
`docs/qa/manual-regression-checklist.md`.
