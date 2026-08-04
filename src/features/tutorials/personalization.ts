import type { Niveau, Tutoriel } from "@/lib/tutoriels-data"
import type { PersonalizedTutorialGroup } from "./types"

export function getPersonalizedTutorialGroups(
  userLevel: Niveau,
  tutorials: Tutoriel[],
): Record<string, PersonalizedTutorialGroup> {
  if (userLevel === "Debutant") {
    return {
      "Les bases (mots de passe et comptes)": {
        tutos: tutorials
          .filter(
            (tutorial) =>
              tutorial.level === "Debutant" &&
              ["motsdepasse", "comptes"].includes(tutorial.category),
          )
          .slice(0, 4),
        description: "Demarre par tes comptes et tes mots de passe",
        priority: "Priorite haute",
      },
      "Reconnaitre les menaces": {
        tutos: tutorials
          .filter(
            (tutorial) =>
              tutorial.level === "Debutant" &&
              tutorial.category === "phishing",
          )
          .slice(0, 3),
        description: "Phishing, faux liens, arnaques courantes",
        priority: "Essentiel",
      },
      "Reseau et Wi-Fi": {
        tutos: tutorials
          .filter(
            (tutorial) =>
              tutorial.level === "Debutant" &&
              tutorial.category === "reseau",
          )
          .slice(0, 2),
        description: "Securise ton point d'entree internet",
        priority: "Important",
      },
      "Donnees et sauvegardes": {
        tutos: tutorials
          .filter(
            (tutorial) =>
              tutorial.level === "Debutant" &&
              ["donnees", "sauvegardes"].includes(tutorial.category),
          )
          .slice(0, 3),
        description: "Protege et garde tes fichiers importants",
        priority: "Recommande",
      },
    }
  }

  if (userLevel === "Intermediaire") {
    return {
      "Confidentialite et navigation": {
        tutos: tutorials.filter(
          (tutorial) =>
            tutorial.level === "Intermediaire" &&
            ["navigateur", "donnees"].includes(tutorial.category),
        ),
        description: "Va plus loin que les bases",
        priority: "Priorite haute",
      },
      "Permissions et mobile": {
        tutos: tutorials.filter(
          (tutorial) =>
            tutorial.level === "Intermediaire" &&
            ["mobile", "comptes"].includes(tutorial.category),
        ),
        description: "Reprends le controle de tes apps",
        priority: "Important",
      },
      "Reseau et VPN": {
        tutos: tutorials.filter(
          (tutorial) =>
            tutorial.level === "Intermediaire" &&
            ["reseau"].includes(tutorial.category),
        ),
        description: "Comprendre vraiment ce qui circule",
        priority: "Etape suivante",
      },
      "Sauvegardes et systeme": {
        tutos: tutorials.filter(
          (tutorial) =>
            tutorial.level === "Intermediaire" &&
            ["sauvegardes", "os", "phishing"].includes(
              tutorial.category,
            ),
        ),
        description: "Routine durable et menaces ciblees",
        priority: "Recommande",
      },
    }
  }

  return {
    "Durcissement systeme": {
      tutos: tutorials.filter(
        (tutorial) =>
          tutorial.level === "Avance" && tutorial.category === "os",
      ),
      description: "Telemetrie, services, persistance",
      priority: "Priorite haute",
    },
    "Reseau avance": {
      tutos: tutorials.filter(
        (tutorial) =>
          tutorial.level === "Avance" && tutorial.category === "reseau",
      ),
      description: "Surface d'exposition, pare-feu, DNS chiffre",
      priority: "Essentiel",
    },
    "Mobile et navigation cloisonnee": {
      tutos: tutorials.filter(
        (tutorial) =>
          tutorial.level === "Avance" &&
          ["mobile", "navigateur"].includes(tutorial.category),
      ),
      description: "Profils, conteneurs, manifestes Android",
      priority: "Important",
    },
    "Comptes et donnees": {
      tutos: tutorials.filter(
        (tutorial) =>
          tutorial.level === "Avance" &&
          ["comptes", "donnees"].includes(tutorial.category),
      ),
      description: "Compartimentation et chiffrement disque",
      priority: "Recommande",
    },
  }
}
