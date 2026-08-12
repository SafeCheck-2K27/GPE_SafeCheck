import { describe, expect, it } from "vitest"
import {
  DEFAULT_TUTORIAL_FILTERS,
  hasActiveTutorialFilters,
  matchesTutorialFilters,
} from "../../src/features/tutorials/filters"
import {
  normalizeSearch,
  searchTutorials,
} from "../../src/features/tutorials/search"
import {
  parseDuration,
  sortTutorials,
} from "../../src/features/tutorials/sorting"
import type { Tutoriel } from "../../src/features/tutorials/data/catalog"
import type { TutorialFilters } from "../../src/features/tutorials/types"

function tutorial(overrides: Partial<Tutoriel> & Pick<Tutoriel, "id" | "title">): Tutoriel {
  const { id, title, ...optionalOverrides } = overrides

  return {
    id,
    slug: `tutorial-${id}`,
    title,
    duration: "10 min",
    level: "Debutant",
    description: "Description générique",
    category: "comptes",
    tags: ["comptes"],
    icon: "shield",
    steps: [],
    ...optionalOverrides,
  }
}

const tutorials = [
  tutorial({
    id: 1,
    title: "Sécuriser son mot de passe",
    duration: "5 min",
    isEssential: true,
    isRecommended: true,
  }),
  tutorial({
    id: 40,
    title: "Reconnaître un faux message",
    duration: "15 minutes",
    level: "Intermediaire",
    category: "phishing",
    tags: ["phishing"],
  }),
  tutorial({
    id: 50,
    title: "Configurer un système avancé",
    duration: "30 min",
    level: "Avance",
    category: "os",
    tags: ["systeme", "technique"],
  }),
  tutorial({ id: 60, title: "Durée inconnue", duration: "bientôt" }),
]

function filters(overrides: Partial<TutorialFilters>): TutorialFilters {
  return { ...DEFAULT_TUTORIAL_FILTERS, ...overrides }
}

describe("tutorial search, filters, and sorting", () => {
  it("normalizeSearch handles accents, case and repeated punctuation", () => {
    expect(normalizeSearch("  SÉCURITÉ... Wi-Fi  ")).toBe("securite wi-fi")
  })

  it("searchTutorials matches synonyms and applies active filters", () => {
    expect(
      searchTutorials(tutorials, "mdp", DEFAULT_TUTORIAL_FILTERS).map(({ id }) => id),
    ).toEqual([1])
    expect(
      searchTutorials(tutorials, "arnaque", filters({ levelFilter: "Intermediaire" })).map(
        ({ id }) => id,
      ),
    ).toEqual([40])
  })

  it("tutorial filters cover category, level, status, duration and type", () => {
    expect(matchesTutorialFilters(tutorials[1], filters({ catFilter: "phishing" }))).toBe(true)
    expect(matchesTutorialFilters(tutorials[1], filters({ levelFilter: "Avance" }))).toBe(false)
    expect(matchesTutorialFilters(tutorials[0], filters({ statusFilter: "done" }))).toBe(true)
    expect(matchesTutorialFilters(tutorials[0], filters({ durationFilter: "quick" }))).toBe(true)
    expect(matchesTutorialFilters(tutorials[1], filters({ durationFilter: "medium" }))).toBe(true)
    expect(matchesTutorialFilters(tutorials[2], filters({ durationFilter: "long" }))).toBe(true)
    expect(matchesTutorialFilters(tutorials[3], filters({ durationFilter: "long" }))).toBe(false)
    expect(matchesTutorialFilters(tutorials[0], filters({ typeFilter: "essentiel" }))).toBe(true)
    expect(matchesTutorialFilters(tutorials[2], filters({ typeFilter: "technique" }))).toBe(true)
    expect(hasActiveTutorialFilters(DEFAULT_TUTORIAL_FILTERS)).toBe(false)
    expect(hasActiveTutorialFilters(filters({ typeFilter: "technique" }))).toBe(true)
  })

  it("parseDuration accepts supported labels and rejects ambiguous values", () => {
    expect(parseDuration("5 min")).toBe(5)
    expect(parseDuration("15 minutes")).toBe(15)
    expect(parseDuration(" 20 MIN ")).toBe(20)
    expect(parseDuration("0 min")).toBeNull()
    expect(parseDuration("about 10 min")).toBeNull()
    expect(parseDuration("")).toBeNull()
  })

  it("sortTutorials covers every mode without mutating the source array", () => {
    const originalIds = tutorials.map(({ id }) => id)

    expect(sortTutorials(tutorials, "fastest").map(({ id }) => id)).toEqual([1, 40, 50, 60])
    expect(sortTutorials(tutorials, "recommended")[0].id).toBe(1)
    expect(sortTutorials(tutorials, "popular")[0].id).toBe(1)
    expect(sortTutorials(tutorials, "level_asc").map(({ id }) => id)).toEqual([1, 60, 40, 50])
    expect(sortTutorials(tutorials, "newest").map(({ id }) => id)).toEqual([60, 50, 40, 1])
    expect(tutorials.map(({ id }) => id)).toEqual(originalIds)
  })
})
