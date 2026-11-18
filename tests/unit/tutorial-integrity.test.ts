import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import ts from "typescript"
import {
  auditLinks,
  decouvrirLinks,
  essentielLinks,
  recommandationLinks,
  tutorielsLinks,
} from "../../src/components/safecheck/layout/nav-data"
import { TERMS } from "../../src/features/lexicon/data"
import { resolveLexiconTutorial } from "../../src/features/lexicon/tutorials"
import { CATEGORY_LABELS, HABITUDES, TECH } from "../../src/features/recommendations/data"
import { scoreRecommendations } from "../../src/features/results/data"
import { RESULT_LEVELS } from "../../src/features/results/logic"
import { tutoriels as catalogTutorials } from "../../src/features/tutorials/data/catalog"
import {
  POPULAR_IDS,
  RECOMMENDED_IDS,
  RECOMMENDED_REASONS,
} from "../../src/features/tutorials/data"
import { resolveTutorialRoute } from "../../src/features/tutorials/detail/utils"
import { parseDuration } from "../../src/features/tutorials/sorting"
import { CATEGORY_LABEL, levels, tutoriels } from "../../src/lib/tutoriels-data"

function assertNonEmpty(value: string, context: string) {
  assert.ok(typeof value === "string" && value.trim().length > 0, context)
}

function normalizeMetadata(value: string) {
  // The lexicon uses accented level labels; the catalog uses unaccented keys.
  // This only compares spelling, never infers a tutorial's subject from its title.
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

const linkedReferences = [
  ...HABITUDES.flatMap((habit) => habit.linkedTutorials.map((link) => ({
    source: `HABITUDES[${habit.id}]`, ...link,
  }))),
  ...TECH.flatMap((recommendation) => recommendation.linkedTutorials.map((link) => ({
    source: `TECH[${recommendation.id}]`, ...link,
  }))),
]

const lexiconReferences = TERMS.flatMap((term) => term.tutoriels.map((link) => ({
  source: `TERMS[${term.slug}]`, id: link.tutorialId,
})))

test("tutorial ids are unique across the canonical catalog", () => {
  const ids = tutoriels.map(({ id }) => id)
  assert.equal(new Set(ids).size, ids.length, "Duplicate tutorial ids")
})

test("tutorial slugs are unique across the canonical catalog", () => {
  const slugs = tutoriels.map(({ slug }) => slug)
  assert.equal(new Set(slugs).size, slugs.length, "Duplicate tutorial slugs")
})

test("tutorial identities use positive safe integers and nonempty slugs", () => {
  assert.ok(tutoriels.length > 0, "The canonical catalog must not be empty")
  for (const tutorial of tutoriels) {
    assert.ok(Number.isSafeInteger(tutorial.id) && tutorial.id > 0, `Invalid id: ${tutorial.id}`)
    assert.ok(Number.isSafeInteger(tutorial.version) && tutorial.version > 0, `Invalid version: ${tutorial.version}`)
    assertNonEmpty(tutorial.slug, `tutorial ${tutorial.id}: empty slug`)
  }
})

test("canonical tutorial ids are explicit values rather than array-position expressions", () => {
  const path = new URL("../../src/lib/tutoriels-data.ts", import.meta.url)
  const source = ts.createSourceFile(path.pathname, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true)
  const declaration = source.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find((item) => ts.isIdentifier(item.name) && item.name.text === "tutoriels")
  const initializer = declaration?.initializer
  assert.ok(initializer && ts.isArrayLiteralExpression(initializer), "Keep an explicit catalog, not an index-generated array")
  const ids = initializer.elements.map((element) => {
    assert.ok(ts.isObjectLiteralExpression(element), "Each tutorial must declare its own identity")
    const id = element.properties.find((property) =>
      ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) && property.name.text === "id",
    )
    assert.ok(id && ts.isPropertyAssignment(id) && ts.isNumericLiteral(id.initializer), "Declare a literal id independent of the array index")
    const version = element.properties.find((property) =>
      ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) && property.name.text === "version",
    )
    assert.ok(version && ts.isPropertyAssignment(version) && ts.isNumericLiteral(version.initializer), "Declare an explicit version for each tutorial")
    return Number(id.initializer.text)
  })
  assert.deepEqual(ids, tutoriels.map(({ id }) => id))
})

test("tutorial metadata has nonempty text and supported durations", () => {
  for (const tutorial of tutoriels) {
    for (const field of ["title", "description", "duration"] as const) {
      assertNonEmpty(tutorial[field], `tutorial ${tutorial.id}: empty ${field}`)
    }
    assert.notEqual(parseDuration(tutorial.duration), null, `tutorial ${tutorial.id}: unsupported duration`)
  }
})

test("tutorial levels and categories belong to the existing catalog definitions", () => {
  const validLevels = new Set(levels.map(({ key }) => key))
  for (const tutorial of tutoriels) {
    assert.ok(validLevels.has(tutorial.level), `tutorial ${tutorial.id}: unknown level ${tutorial.level}`)
    assert.ok(Object.hasOwn(CATEGORY_LABEL, tutorial.category), `tutorial ${tutorial.id}: unknown category ${tutorial.category}`)
  }
})

test("every tutorial has steps with nonempty titles and descriptions", () => {
  for (const tutorial of tutoriels) {
    assert.ok(tutorial.steps.length > 0, `tutorial ${tutorial.id}: missing steps`)
    tutorial.steps.forEach((step, index) => {
      assertNonEmpty(step.title, `tutorial ${tutorial.id}, step ${index}: empty title`)
      assertNonEmpty(step.description, `tutorial ${tutorial.id}, step ${index}: empty description`)
    })
  }
})

test("every numeric tutorial route resolves the same canonical object", () => {
  for (const tutorial of tutoriels) {
    assert.equal(resolveTutorialRoute(tutoriels, String(tutorial.id)), tutorial)
  }
})

test("every tutorial slug resolves the same canonical object", () => {
  for (const tutorial of tutoriels) {
    assert.equal(resolveTutorialRoute(tutoriels, tutorial.slug), tutorial)
  }
})

test("tutorial resolution preserves identity when catalog order changes", () => {
  const reversed = [...tutoriels].reverse()
  for (const tutorial of tutoriels) {
    assert.equal(resolveTutorialRoute(reversed, String(tutorial.id)), tutorial)
    assert.equal(resolveTutorialRoute(reversed, tutorial.slug), tutorial)
  }
})

test("unknown tutorial routes do not fall back to an unrelated tutorial", () => {
  assert.equal(resolveTutorialRoute(tutoriels, undefined), undefined)
  assert.equal(resolveTutorialRoute(tutoriels, ""), undefined)
  assert.equal(resolveTutorialRoute(tutoriels, "missing-tutorial"), undefined)
  assert.equal(resolveTutorialRoute(tutoriels, String(Math.max(...tutoriels.map(({ id }) => id)) + 1)), undefined)
})

test("the public tutorial adapter reexports the canonical catalog without a copy", () => {
  assert.equal(catalogTutorials, tutoriels)
})

test("all result recommendation destinations are resolvable tutorial routes", () => {
  for (const recommendation of scoreRecommendations) {
    assertNonEmpty(recommendation.tutorielLink, `${recommendation.key}: missing destination`)
    const match = /^\/tutoriels\/([^/?#]+)$/.exec(recommendation.tutorielLink)
    assert.ok(match, `${recommendation.key}: invalid tutorial URL ${recommendation.tutorielLink}`)
    assert.ok(resolveTutorialRoute(tutoriels, match[1]), `${recommendation.key}: unresolved destination ${recommendation.tutorielLink}`)
  }
})

test("result recommendation keys point to their intended canonical tutorials", () => {
  const expectedSlugs = {
    "double-auth": "double-authentification",
    "password-manager": "gestionnaire-mdp",
    backup: "sauvegardes",
    "auto-updates": "mises-a-jour",
    wifi: "securiser-wifi",
    phishing: "phishing",
  } as const
  assert.deepEqual(scoreRecommendations.map(({ key }) => key).sort(), Object.keys(expectedSlugs).sort())
  for (const recommendation of scoreRecommendations) {
    const target = resolveTutorialRoute(tutoriels, recommendation.tutorielLink.slice("/tutoriels/".length))
    assert.equal(target?.slug, expectedSlugs[recommendation.key], `${recommendation.key}: wrong tutorial`)
  }
})

test("every configured result level references existing recommendation ids", () => {
  const ids = new Set(scoreRecommendations.map(({ id }) => id))
  for (const level of RESULT_LEVELS) {
    for (const id of level.scoreRecommendationIds) {
      assert.ok(ids.has(id), `result level ${level.id}: missing recommendation ${id}`)
    }
  }
})

test("all habit and technical recommendation tutorial references resolve", () => {
  for (const link of linkedReferences) {
    assert.ok(resolveTutorialRoute(tutoriels, String(link.id)), `${link.source}: missing tutorial ${link.id}`)
  }
})

// Regression contracts for the links whose displayed subjects were found to be
// inconsistent. Slugs express explicit destinations; there is no title matching.
const associationContracts = [
  { family: "habit", id: "mdp-partage", slugs: ["creer-un-mot-de-passe-fort"] },
  { family: "habit", id: "mdp-reuse", slugs: ["creer-un-mot-de-passe-fort", "gestionnaire-mdp"] },
  { family: "habit", id: "wifi", slugs: ["securiser-son-navigateur-web"] },
  { family: "technical", id: 1, slugs: ["gestionnaire-mdp"] },
  { family: "technical", id: 3, slugs: ["securiser-son-navigateur-web"] },
  { family: "technical", id: 9, slugs: ["securiser-son-navigateur-web"] },
] as const

for (const contract of associationContracts) {
  test(`${contract.family} ${contract.id} links target the declared tutorial subjects`, () => {
    const source = contract.family === "habit"
      ? HABITUDES.find(({ id }) => id === contract.id)
      : TECH.find(({ id }) => id === contract.id)
    assert.ok(source, `Missing recommendation ${contract.family} ${contract.id}`)
    assert.deepEqual(
      source.linkedTutorials.map(({ id }) => resolveTutorialRoute(tutoriels, String(id))?.slug).sort(),
      [...contract.slugs].sort(),
      `${contract.family} ${contract.id}: linkedTutorials disagree with their declared subjects`,
    )
  })
}

test("all lexicon tutorial references resolve to canonical tutorials", () => {
  assert.equal(resolveLexiconTutorial({ tutorialId: -1 }), undefined)
  for (const link of lexiconReferences) {
    assert.ok(resolveTutorialRoute(tutoriels, String(link.id)), `${link.source}: missing tutorial ${link.id}`)
    const displayed = resolveLexiconTutorial({ tutorialId: link.id })
    assert.ok(displayed, `${link.source}: missing displayed tutorial ${link.id}`)
    assert.equal(displayed.id, link.id)
  }
})

for (const field of ["title", "difficulty", "duration"] as const) {
  test(`lexicon tutorial ${field} metadata agrees with the canonical catalog`, () => {
    const divergences: string[] = []
    for (const link of lexiconReferences) {
      const tutorial = resolveTutorialRoute(tutoriels, String(link.id))
      assert.ok(tutorial, `${link.source}: missing tutorial ${link.id}`)
      const displayed = resolveLexiconTutorial({ tutorialId: link.id })
      assert.ok(displayed, `${link.source}: missing displayed metadata for tutorial ${link.id}`)
      const expected = field === "difficulty" ? tutorial.level : tutorial[field]
      if (normalizeMetadata(displayed[field]) !== normalizeMetadata(expected)) {
        divergences.push(`${link.source}, tutorial ${link.id}: expected ${JSON.stringify(expected)}, actual ${JSON.stringify(displayed[field])}`)
      }
    }
    assert.equal(divergences.length, 0, divergences.join("\n"))
  })
}

test("editorial tutorial selections reference canonical tutorial ids", () => {
  const references = [
    ...RECOMMENDED_IDS,
    ...POPULAR_IDS,
    ...Object.keys(RECOMMENDED_REASONS).map(Number),
  ]
  for (const id of references) {
    assert.ok(resolveTutorialRoute(tutoriels, String(id)), `Editorial reference to missing tutorial ${id}`)
  }
})

test("all known static tutorial link families resolve through the same route contract", () => {
  const links = [
    ...linkedReferences.map((link) => ({ label: link.source, href: `/tutoriels/${link.id}` })),
    ...lexiconReferences.map((link) => ({ label: link.source, href: `/tutoriels/${link.id}` })),
    ...scoreRecommendations.map((link) => ({ label: link.key, href: link.tutorielLink })),
    ...auditLinks, ...decouvrirLinks, ...essentielLinks, ...recommandationLinks, ...tutorielsLinks,
  ]
  for (const link of links) {
    const url = new URL(link.href, "https://safecheck.test")
    if (!url.pathname.startsWith("/tutoriels/")) continue
    const segment = url.pathname.slice("/tutoriels/".length)
    assert.ok(resolveTutorialRoute(tutoriels, segment), `${link.label}: unresolved tutorial route ${link.href}`)
  }
})

test("recommendation category navigation selects the technical view and a known category", () => {
  const divergences: string[] = []
  for (const link of recommandationLinks) {
    const url = new URL(link.href, "https://safecheck.test")
    const category = url.searchParams.get("cat")
    if (category === null) continue
    assert.equal(url.pathname, "/recommandations")
    assert.ok(category !== "all" && Object.hasOwn(CATEGORY_LABELS, category), `Unknown technical category ${category}`)
    if (url.searchParams.get("type") !== "techniques") {
      divergences.push(`${link.label}: expected type=techniques with cat=${category}, actual ${link.href}`)
    }
  }
  assert.equal(divergences.length, 0, divergences.join("\n"))
})
