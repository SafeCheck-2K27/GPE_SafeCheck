"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"

/*
   SafeCheck - État persisté dans le localStorage, compatible SSR.

   Hook technique transversal, sur le même modèle que l'AuthProvider :
   `useSyncExternalStore` avec un snapshot serveur stable, plutôt qu'un
   `useEffect` de montage qui masquerait un désaccord d'hydratation.

   Le snapshot exposé par le store est la **chaîne brute** du localStorage
   (une primitive, donc référentiellement stable) : c'est ce qui évite la
   boucle infinie de `useSyncExternalStore`. Le parsing vers un objet est
   fait à part, mémoïsé sur cette chaîne.

   Le store vit au niveau module : plusieurs composants qui appellent le
   même hook partagent le même état, sans provider global à câbler.
 */

type Raw = string | null

const listenersByKey = new Map<string, Set<() => void>>()
/*
   Copie mémoire, repli quand le localStorage est indisponible (mode privé,
   quota) : l'état reste cohérent le temps de la session.
 */
const memoryByKey = new Map<string, Raw>()

function listenersFor(key: string): Set<() => void> {
  let set = listenersByKey.get(key)
  if (!set) {
    set = new Set()
    listenersByKey.set(key, set)
  }
  return set
}

function readRaw(key: string): Raw {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return memoryByKey.get(key) ?? null
  }
}

function writeRaw(key: string, value: Raw): void {
  memoryByKey.set(key, value)

  if (typeof window !== "undefined") {
    try {
      if (value === null) window.localStorage.removeItem(key)
      else window.localStorage.setItem(key, value)
    } catch {
      /* on ignore les erreurs de quota / navigation privée */
    }
  }

  listenersFor(key).forEach((listener) => listener())
}

export interface PersistentStateOptions<T> {
  /** Reconstruit la valeur à partir de la chaîne stockée (null si absente). */
  parse: (raw: Raw) => T
  /** Sérialise la valeur ; `null` efface la clé. Par défaut, JSON. */
  serialize?: (value: T) => Raw
}

export interface PersistentState<T> {
  value: T
  /** Passe à `true` une fois le premier snapshot client lu (évite un flash). */
  isHydrated: boolean
  /** Remplace la valeur, ou la dérive de l'actuelle via une fonction. */
  set: (updater: T | ((current: T) => T)) => void
}

/*
   `parse` et `serialize` doivent être stables (définis au niveau module
   par l'appelant), sinon les mémoïsations ci-dessous se recalculent à
   chaque rendu.
 */
export function usePersistentState<T>(
  key: string,
  options: PersistentStateOptions<T>,
): PersistentState<T> {
  const { parse, serialize } = options

  const subscribe = useMemo(
    () => (listener: () => void) => {
      const set = listenersFor(key)
      set.add(listener)

      const onStorage = (event: StorageEvent) => {
        if (event.key === key) listener()
      }
      if (typeof window !== "undefined") {
        window.addEventListener("storage", onStorage)
      }

      return () => {
        set.delete(listener)
        if (typeof window !== "undefined") {
          window.removeEventListener("storage", onStorage)
        }
      }
    },
    [key],
  )

  const getClientSnapshot = useCallback((): Raw | undefined => readRaw(key), [key])
  // Snapshot serveur constant : identique au premier rendu client (évite un mismatch).
  const getServerSnapshot = useCallback((): Raw | undefined => undefined, [])

  const snapshot = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

  const isHydrated = snapshot !== undefined
  const value = useMemo(() => parse(snapshot ?? null), [parse, snapshot])

  const set = useCallback(
    (updater: T | ((current: T) => T)) => {
      const current = parse(readRaw(key))
      const next =
        typeof updater === "function" ? (updater as (current: T) => T)(current) : updater
      const encoded = serialize ? serialize(next) : JSON.stringify(next)
      writeRaw(key, encoded)
    },
    [key, parse, serialize],
  )

  return { value, isHydrated, set }
}
