# Liste des tutoriels du MVP — Windows et macOS

Arbitrage de la liste exacte des tutoriels retenus pour le MVP (SC-008) : **12 tutoriels Windows** et **8 tutoriels macOS**.

Les cinq thèmes rendus obligatoires par le ticket sont couverts sur les deux systèmes : mises à jour, double authentification (MFA), sauvegarde, navigateur et permissions.

## Comment lire ce document

Le catalogue actuel (`src/lib/tutoriels-data.tsx`) contient 34 tutoriels dont la plateforme est renseignée en texte libre (« Windows, macOS », « Tous services en ligne »…). Il n'existe donc aujourd'hui aucune segmentation par système exploitable par le produit.

La colonne **Source** indique le rattachement de chaque entrée au catalogue existant :

- **Existant** — le tutoriel existe déjà et convient tel quel ;
- **À décliner** — le tutoriel existe mais mélange les deux systèmes ; il doit être décliné en une version par système, les manipulations étant différentes ;
- **À écrire** — aucun équivalent dans le catalogue, contenu à produire.

## Windows — 12 tutoriels

| # | Thème | Tutoriel | Source | Réf. catalogue |
|---|---|---|---|---|
| 1 | **Mises à jour** | Mettre à jour Windows | À décliner | id 7 — `mises-a-jour` |
| 2 | **MFA** | Activer la double authentification sur ses comptes | Existant | id 1 — `double-authentification` |
| 3 | **Sauvegarde** | Sauvegarder ses fichiers avec l'Historique des fichiers | À décliner | id 5 — `sauvegardes` |
| 4 | **Navigateur** | Mettre à jour son navigateur | Existant | id 12 — `mettre-a-jour-son-navigateur` |
| 5 | **Permissions** | Configurer la confidentialité et les permissions de Windows | Existant | id 17 — `configurer-la-confidentialite-de-windows` |
| 6 | Mots de passe | Créer un mot de passe fort | Existant | id 2 — `creer-un-mot-de-passe-fort` |
| 7 | Mots de passe | Installer et utiliser Bitwarden | Existant | id 3 — `gestionnaire-mdp` |
| 8 | Phishing | Identifier un email de phishing | Existant | id 6 — `phishing` |
| 9 | Réseau | Sécuriser son Wi-Fi domestique | Existant | id 8 — `securiser-wifi` |
| 10 | Navigateur | Sécuriser son navigateur web | Existant | id 13 — `securiser-son-navigateur-web` |
| 11 | Données | Vérifier le chiffrement du disque (BitLocker) | À décliner | id 29 — `verifier-l-etat-du-chiffrement-disque` |
| 12 | Réseau | Comprendre et durcir le pare-feu Windows | À décliner | id 27 — `comprendre-et-durcir-son-pare-feu` |

## macOS — 8 tutoriels

| # | Thème | Tutoriel | Source | Réf. catalogue |
|---|---|---|---|---|
| 1 | **Mises à jour** | Mettre à jour macOS | À décliner | id 7 — `mises-a-jour` |
| 2 | **MFA** | Activer la double authentification sur ses comptes | Existant | id 1 — `double-authentification` |
| 3 | **Sauvegarde** | Sauvegarder ses fichiers avec Time Machine | À décliner | id 5 — `sauvegardes` |
| 4 | **Navigateur** | Mettre à jour son navigateur | Existant | id 12 — `mettre-a-jour-son-navigateur` |
| 5 | **Permissions** | Régler Confidentialité et sécurité sur macOS | À écrire | — |
| 6 | Mots de passe | Installer et utiliser Bitwarden | Existant | id 3 — `gestionnaire-mdp` |
| 7 | Phishing | Identifier un email de phishing | Existant | id 6 — `phishing` |
| 8 | Données | Activer et vérifier FileVault | À décliner | id 29 — `verifier-l-etat-du-chiffrement-disque` |

## Couverture des thèmes obligatoires

| Thème | Windows | macOS |
|---|---|---|
| Mises à jour | ✓ (1) | ✓ (1) |
| MFA | ✓ (2) | ✓ (2) |
| Sauvegarde | ✓ (3) | ✓ (3) |
| Navigateur | ✓ (4, 10) | ✓ (4) |
| Permissions | ✓ (5) | ✓ (5) |

## Charge de production restante

| Nature | Windows | macOS | Total |
|---|---|---|---|
| Existant, réutilisable tel quel | 8 | 4 | 12 entrées |
| À décliner par système | 4 | 3 | 7 déclinaisons |
| À écrire intégralement | 0 | 1 | 1 tutoriel |

Douze des vingt entrées s'appuient donc sur des tutoriels déjà rédigés. L'essentiel du travail restant porte sur les déclinaisons par système : les manipulations diffèrent trop entre Windows et macOS pour qu'un tutoriel commun reste utilisable par un public débutant, en particulier sur la sauvegarde (Historique des fichiers contre Time Machine) et le chiffrement du disque (BitLocker contre FileVault).

## Points soumis à l'équipe

**Le champ `platform` ne permet pas de filtrer par système.** Il est aujourd'hui en texte libre. Pour que le produit puisse proposer « les tutoriels Windows », il faudra un champ structuré (par exemple `os: ("windows" | "macos" | "mobile" | "tous")[]`). Ce point touche au modèle de données et rejoint SC-BDD-009 (GPE-88, tables Tutoriels) : à cadrer avec Tiago avant implémentation.

**Le catalogue compte 34 tutoriels pour 20 retenus au MVP.** Les 14 restants (niveaux avancés : télémétrie, ports ouverts, DNS chiffré, navigation cloisonnée…) sortent du périmètre grand public du MVP. Ils sont conservés dans le catalogue mais ne font pas partie des parcours Windows et macOS livrés.

**Quatre tutoriels sont comptés dans les deux listes** (MFA, mise à jour du navigateur, Bitwarden, phishing) car ils sont indépendants du système. Ils ne sont à produire qu'une fois, mais apparaissent dans les deux parcours : les vingt entrées correspondent donc à seize tutoriels distincts.
