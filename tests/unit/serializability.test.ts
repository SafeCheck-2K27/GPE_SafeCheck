import assert from "node:assert/strict"
import { test } from "node:test"
import {
  VULNERABILITY_EXAMPLES,
  VULNERABILITY_FACTORS,
} from "../../src/app/vulnerabilite/_data"
import {
  auditLinks,
  decouvrirLinks,
  essentielLinks,
  recommandationLinks,
  tutorielsLinks,
} from "../../src/components/safecheck/layout/nav-data"
import { AUDIT_LEVELS } from "../../src/features/audits/levels"
import { ESSENTIALS } from "../../src/features/essentials/data"
import { CATEGORY_LABELS, HABITUDES, TECH } from "../../src/features/recommendations/data"
import { scoreRecommendations } from "../../src/features/results/data"
import { mockTutos } from "../../src/lib/account-data"
import { tutoriels } from "../../src/lib/tutoriels-data"

function assertSerializable(value: unknown, path = "root", ancestors = new Set<object>()): void {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return
  }

  if (typeof value !== "object") {
    assert.fail(`${path} contains a non-serializable ${typeof value}`)
  }

  assert.ok(!ancestors.has(value), `${path} contains a circular reference`)
  ancestors.add(value)

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSerializable(item, `${path}[${index}]`, ancestors))
  } else {
    const prototype = Object.getPrototypeOf(value)
    assert.ok(
      prototype === Object.prototype || prototype === null,
      `${path} contains a non-plain ${prototype?.constructor?.name ?? "object"}`,
    )
    Object.entries(value).forEach(([key, item]) =>
      assertSerializable(item, `${path}.${key}`, ancestors),
    )
  }

  ancestors.delete(value)
}

test("exported content catalogs remain JSON-serializable", () => {
  const catalogs = {
    auditLevels: AUDIT_LEVELS,
    essentials: ESSENTIALS,
    navigation: {
      auditLinks,
      decouvrirLinks,
      essentielLinks,
      recommandationLinks,
      tutorielsLinks,
    },
    recommendations: { categories: CATEGORY_LABELS, habits: HABITUDES, technical: TECH },
    resultRecommendations: scoreRecommendations,
    tutorialHistory: mockTutos,
    tutorials: tutoriels,
    vulnerability: { examples: VULNERABILITY_EXAMPLES, factors: VULNERABILITY_FACTORS },
  }

  assert.doesNotThrow(() => assertSerializable(catalogs))
  assert.doesNotThrow(() => JSON.stringify(catalogs))
})
