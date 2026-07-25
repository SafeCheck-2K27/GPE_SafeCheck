/*
   Statut d'un essentiel côté utilisateur (SC-026).

   État local persisté dans le navigateur, pas une donnée backend : « à
   faire » est la valeur par défaut et n'est pas stockée, ce qui garde le
   JSON compact et facilite une future migration.
 */

export type EssentialStatus = "a_faire" | "fait" | "a_revoir"

export const ESSENTIAL_STATUSES: readonly EssentialStatus[] = ["a_faire", "fait", "a_revoir"]

export const ESSENTIAL_STATUS_LABEL: Record<EssentialStatus, string> = {
  a_faire: "À faire",
  fait: "Fait",
  a_revoir: "À revoir",
}

export type EssentialStatusMap = Record<number, EssentialStatus>

function isEssentialStatus(value: unknown): value is EssentialStatus {
  return typeof value === "string" && (ESSENTIAL_STATUSES as readonly string[]).includes(value)
}

/*
   Le contenu du localStorage est une entrée non fiable : on ne le caste
   jamais directement. On ne recopie que les paires (id numérique ->
   statut connu), ce qui écarte les clés spéciales (`__proto__`) et les
   statuts devenus obsolètes.
 */
export function parseEssentialStatusMap(raw: string | null): EssentialStatusMap {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return {}

    const clean: EssentialStatusMap = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const id = Number(key)
      if (!Number.isInteger(id) || id < 0) continue
      if (!isEssentialStatus(value)) continue
      clean[id] = value
    }
    return clean
  } catch {
    return {}
  }
}

export function countByStatus(
  statuses: EssentialStatusMap,
  status: EssentialStatus,
): number {
  return Object.values(statuses).filter((value) => value === status).length
}
