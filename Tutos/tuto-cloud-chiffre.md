---
title: "Utiliser un cloud chiffré"
summary: "Stocker ses fichiers dans le cloud est pratique, mais le fournisseur peut souvent y accéder. Le chiffrement de bout en bout fait que vous seul pouvez lire vos données. Ce guide vous montre comment protéger vos fichiers sensibles dans le cloud."
category: "Données personnelles"
os: "Tous"
level: "Intermédiaire"
estimatedTime: 15
tags: ["cloud", "chiffrement", "donnees", "confidentialite"]
---

# Utiliser un cloud chiffré

> Stocker ses fichiers dans le cloud est pratique, mais le fournisseur peut souvent y accéder. Le chiffrement de bout en bout fait que vous seul pouvez lire vos données. Ce guide vous montre comment protéger vos fichiers sensibles dans le cloud.

## Bénéfice attendu

À la fin de ce tutoriel, vos fichiers sensibles seront chiffrés avant même de quitter votre appareil. Même en cas de piratage du fournisseur cloud ou de demande d'accès, vos données resteront illisibles pour quiconque ne possède pas votre clé.

## Prérequis

- Avoir un espace de stockage cloud existant (Drive, Dropbox, OneDrive…) ou être prêt à créer un compte cloud chiffré
- Avoir lu le tutoriel « Choisir un mot de passe maître robuste » : le principe de la clé unique s'applique ici aussi

## Étapes

1. **Comprendre la différence entre cloud classique et cloud chiffré**
   Sur un cloud classique, le fournisseur détient la clé et peut techniquement lire vos fichiers. Avec le chiffrement de bout en bout, les fichiers sont chiffrés sur votre appareil : seul vous détenez la clé, le fournisseur ne stocke que des données illisibles.

2. **Choisir votre approche**
   Deux options : utiliser un cloud chiffré par conception (Proton Drive, Tresorit…), ou ajouter une couche de chiffrement par-dessus votre cloud actuel avec un outil comme Cryptomator, qui fonctionne sur Drive, Dropbox et OneDrive.

3. **Installer l'outil de chiffrement (approche surcouche)**
   Si vous gardez votre cloud actuel, installez Cryptomator sur votre ordinateur et votre téléphone depuis le site officiel. Il crée des « coffres » chiffrés à l'intérieur de votre dossier cloud synchronisé.

4. **Créer un coffre et définir sa clé**
   Créez un nouveau coffre dans votre dossier cloud et protégez-le par un mot de passe long et unique. Ce mot de passe est la clé : notez bien qu'il n'est récupérable par personne, pas même l'éditeur de l'outil.

5. **Y déplacer vos fichiers sensibles**
   Ouvrez le coffre (il apparaît comme un disque sur votre appareil) et déplacez-y vos documents sensibles : papiers d'identité, documents administratifs, données financières. Ils sont chiffrés automatiquement avant d'être synchronisés.

6. **Vérifier l'accès depuis un autre appareil**
   Installez l'outil sur un second appareil, ouvrez le même coffre avec le mot de passe et confirmez que vos fichiers s'affichent. Cela valide que la synchronisation chiffrée fonctionne de bout en bout.

## Rollback / retour arrière

Pour cesser d'utiliser le chiffrement, ouvrez le coffre, sortez vos fichiers vers un dossier non chiffré, puis supprimez le coffre. Vos fichiers redeviennent des documents classiques, lisibles par le cloud. Attention : si vous oubliez le mot de passe d'un coffre, son contenu est définitivement irrécupérable — c'est le revers du chiffrement de bout en bout. Conservez cette clé avec le même soin que votre mot de passe maître.

## Sources

- [CNIL — Chiffrement, sécuriser ses données](https://www.cnil.fr/fr/comprendre-les-grands-principes-de-la-cryptographie-et-du-chiffrement)
- [Cybermalveillance.gouv.fr — Protéger ses données](https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques)
- [ANSSI — Le chiffrement des données](https://cyber.gouv.fr/)

---

<!-- Champs gérés hors contenu :
     - localStatus : à faire / en cours / fait  → géré côté application (localStorage)
     - cta : "Lancer le tutoriel guidé"          → géré côté application
-->
