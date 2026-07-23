import assert from "node:assert/strict"
import { test } from "node:test"
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

test("normalizeSearch handles accents, case and repeated punctuation", () => {
  assert.equal(normalizeSearch("  SÉCURITÉ... Wi-Fi  "), "securite wi-fi")
})

test("searchTutorials matches synonyms and applies active filters", () => {
  assert.deepEqual(
    searchTutorials(tutorials, "mdp", DEFAULT_TUTORIAL_FILTERS).map(({ id }) => id),
    [1],
  )
  assert.deepEqual(
    searchTutorials(tutorials, "arnaque", filters({ levelFilter: "Intermediaire" })).map(({ id }) => id),
    [40],
  )
})

test("tutorial filters cover category, level, status, duration and type", () => {
  assert.equal(matchesTutorialFilters(tutorials[1], filters({ catFilter: "phishing" })), true)
  assert.equal(matchesTutorialFilters(tutorials[1], filters({ levelFilter: "Avance" })), false)
  assert.equal(matchesTutorialFilters(tutorials[0], filters({ statusFilter: "done" })), true)
  assert.equal(matchesTutorialFilters(tutorials[0], filters({ durationFilter: "quick" })), true)
  assert.equal(matchesTutorialFilters(tutorials[1], filters({ durationFilter: "medium" })), true)
  assert.equal(matchesTutorialFilters(tutorials[2], filters({ durationFilter: "long" })), true)
  assert.equal(matchesTutorialFilters(tutorials[3], filters({ durationFilter: "long" })), false)
  assert.equal(matchesTutorialFilters(tutorials[0], filters({ typeFilter: "essentiel" })), true)
  assert.equal(matchesTutorialFilters(tutorials[2], filters({ typeFilter: "technique" })), true)
  assert.equal(hasActiveTutorialFilters(DEFAULT_TUTORIAL_FILTERS), false)
  assert.equal(hasActiveTutorialFilters(filters({ typeFilter: "technique" })), true)
})

test("parseDuration accepts supported labels and rejects ambiguous values", () => {
  assert.equal(parseDuration("5 min"), 5)
  assert.equal(parseDuration("15 minutes"), 15)
  assert.equal(parseDuration(" 20 MIN "), 20)
  assert.equal(parseDuration("0 min"), null)
  assert.equal(parseDuration("about 10 min"), null)
  assert.equal(parseDuration(""), null)
})

test("sortTutorials covers every mode without mutating the source array", () => {
  const originalIds = tutorials.map(({ id }) => id)

  assert.deepEqual(sortTutorials(tutorials, "fastest").map(({ id }) => id), [1, 40, 50, 60])
  assert.equal(sortTutorials(tutorials, "recommended")[0].id, 1)
  assert.equal(sortTutorials(tutorials, "popular")[0].id, 1)
  assert.deepEqual(sortTutorials(tutorials, "level_asc").map(({ id }) => id), [1, 60, 40, 50])
  assert.deepEqual(sortTutorials(tutorials, "newest").map(({ id }) => id), [60, 50, 40, 1])
  assert.deepEqual(tutorials.map(({ id }) => id), originalIds)
})
