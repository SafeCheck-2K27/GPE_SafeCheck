/** Auth redirects are internal root-relative paths, never arbitrary URLs. */
export function internalAuthHref(href: string | undefined): string | undefined {
  if (!href) return undefined
  let decoded = href
  try {
    for (let depth = 0; depth < 5; depth += 1) {
      if (!decoded.startsWith("/") || decoded.startsWith("//") || /[\\\s\u0000-\u001f\u007f]/u.test(decoded)) return undefined
      const next = decodeURIComponent(decoded)
      if (next === decoded) return href
      decoded = next
    }
  } catch {
    return undefined
  }
  return undefined
}

export function getAuthDestination(href: string | undefined, flow: "signup" | "login"): string {
  return internalAuthHref(href) ?? (flow === "signup" ? "/compte" : "/accueil")
}
