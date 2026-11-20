---
title: "Sécuriser son Wi-Fi à la maison"
summary: "Votre réseau Wi-Fi est la porte d'entrée de tous vos appareils connectés. Mal protégé, il permet à un voisin ou à un attaquant d'intercepter votre trafic ou d'accéder à votre réseau. Ce guide vous montre comment le verrouiller en quelques réglages."
category: "Wi-Fi & réseaux"
os: "Tous"
level: "Débutant"
estimatedTime: 15
tags: ["wifi", "reseau", "box", "chiffrement"]
---

# Sécuriser son Wi-Fi à la maison

> Votre réseau Wi-Fi est la porte d'entrée de tous vos appareils connectés. Mal protégé, il permet à un voisin ou à un attaquant d'intercepter votre trafic ou d'accéder à votre réseau. Ce guide vous montre comment le verrouiller en quelques réglages.

## Bénéfice attendu

À la fin de ce tutoriel, votre réseau domestique utilisera un chiffrement moderne, un mot de passe d'administration personnalisé et n'exposera plus les fonctions vulnérables activées par défaut. Vous empêchez ainsi l'accès non autorisé et l'interception de vos données.

## Prérequis

- Avoir accès à l'interface d'administration de votre box ou routeur (identifiants souvent imprimés dessus)
- Être connecté au réseau que vous souhaitez sécuriser

## Étapes

1. **Accéder à l'interface d'administration de la box**
   Ouvrez un navigateur et saisissez l'adresse de la box, généralement « 192.168.1.1 » ou « 192.168.0.1 ». Connectez-vous avec les identifiants d'administration (différents du mot de passe Wi-Fi), souvent inscrits sur une étiquette de l'appareil.

2. **Changer le mot de passe administrateur par défaut**
   Le mot de passe d'usine est connu et parfois public. Remplacez-le par un mot de passe long et unique. C'est lui qui protège les réglages de votre réseau.

3. **Activer le chiffrement WPA3 ou WPA2-AES**
   Dans les réglages Wi-Fi, choisissez WPA3 si disponible, sinon WPA2-AES. Évitez absolument WEP et WPA1, cassables en quelques minutes. Donnez au réseau un mot de passe Wi-Fi robuste.

4. **Personnaliser le nom du réseau (SSID)**
   Évitez un nom qui révèle votre identité ou votre adresse (« Box-Dupont-3eEtage »). Un nom neutre complique le ciblage et ne donne aucune information utile à un attaquant.

5. **Désactiver le WPS**
   La fonction WPS, qui permet de connecter un appareil en appuyant sur un bouton, est pratique mais vulnérable. Désactivez-la dans les réglages : la connexion par mot de passe reste parfaitement simple.

6. **Créer un réseau invité pour les visiteurs et objets connectés**
   Si votre box le permet, activez un réseau invité séparé. Vous y connectez les visiteurs et les objets connectés (caméras, assistants), ce qui les isole de vos ordinateurs et téléphones contenant vos données.

## Rollback / retour arrière

Tous ces réglages se modifient depuis la même interface d'administration. Si un appareil ne se connecte plus après le passage en WPA3, repassez temporairement en WPA2-AES, plus largement compatible. Notez bien votre nouveau mot de passe administrateur : en cas de perte, un bouton de réinitialisation (reset) sur la box la ramène à ses réglages d'usine — mais cela rétablit aussi tous les réglages par défaut vulnérables, qu'il faudra refaire.

## Sources

- [Cybermalveillance.gouv.fr — Sécuriser son réseau Wi-Fi](https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/securiser-wifi)
- [ANSSI — Recommandations de sécurité Wi-Fi](https://cyber.gouv.fr/)
- [CNIL — Sécuriser son réseau domestique](https://www.cnil.fr/fr/securite-informatique)

---

<!-- Champs gérés hors contenu :
     - localStatus : à faire / en cours / fait  → géré côté application (localStorage)
     - cta : "Lancer le tutoriel guidé"          → géré côté application
-->
