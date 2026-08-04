"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useI18n } from "@/components/safecheck/I18nProvider"

/* Theme toggle (light/dark) */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const baseCls =
    "p-2 rounded-lg text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)] hover:bg-[color:var(--sc-bg-soft)] transition-colors cursor-pointer"
  if (!mounted) {
    return (
      <button aria-label={t("nav.changeTheme")} className={baseCls} type="button">
        <Sun className="w-4 h-4" />
      </button>
    )
  }
  const isDark = theme === "dark"
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("nav.themeLight") : t("nav.themeDark")}
      className={baseCls}
      type="button"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}

/**
 * LanguageToggle - single-click FR/EN switch shown next to the theme toggle.
 * Renders a compact pill segmented control so both options are always
 * visible and the active language is unambiguous.
 */
export function LanguageToggle() {
  const { lang, setLang, isHydrated } = useI18n()
  // Render a stable pre-hydration placeholder so SSR markup matches the
  // initial client render and avoids a hydration warning.
  const active: "fr" | "en" = isHydrated ? lang : "fr"

  const pillBase =
    "px-2 py-1 text-[11px] font-bold leading-none rounded-md transition-colors cursor-pointer"
  const activeCls =
    "bg-[color:var(--sc-blue)] text-white shadow-[0_2px_6px_-2px_rgba(37,99,235,0.45)]"
  const inactiveCls =
    "text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)]"

  return (
    <div
      role="group"
      aria-label={isHydrated ? "Interface language" : undefined}
      className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)]"
    >
      <button
        type="button"
        onClick={() => setLang("fr")}
        aria-pressed={active === "fr"}
        aria-label="Passer en français"
        className={`${pillBase} ${active === "fr" ? activeCls : inactiveCls}`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={active === "en"}
        aria-label="Switch to English"
        className={`${pillBase} ${active === "en" ? activeCls : inactiveCls}`}
      >
        EN
      </button>
    </div>
  )
}
