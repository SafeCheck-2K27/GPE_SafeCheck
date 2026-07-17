"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SafeCheckMark, ScButton } from "@/components/safecheck/primitives"
import { User, UserPlus, LogOut, Menu as MenuIcon, X, ListChecks } from "lucide-react"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { SignupModal } from "@/components/safecheck/SignupModal"
import { useI18n } from "@/components/safecheck/I18nProvider"
import { NavDropdown } from "@/components/safecheck/layout/NavDropdown"
import { MobileSection } from "@/components/safecheck/layout/MobileNav"
import { ThemeToggle, LanguageToggle } from "@/components/safecheck/layout/toggles"
import { NavbarLoginModal } from "@/components/safecheck/layout/NavbarLoginModal"
import { auditLinks, tutorielsLinks, essentielLinks, recommandationLinks, decouvrirLinks } from "@/components/safecheck/layout/nav-data"

interface NavbarProps {
  /**
   * Optional override. When omitted, the navbar reads the session from
   * <AuthProvider /> so it stays in sync across all pages automatically.
   */
  isLoggedIn?: boolean
  /**
   * Optional override for the "Connexion" button. When omitted, the navbar
   * opens its own login modal so the button works on every page.
   */
  onLoginClick?: () => void
  /**
   * Optional override for "Créer un compte". Defaults to navigating to
   * /compte/creer.
   */
  onSignupClick?: () => void
}

const logoTextClassName =
  "hidden sm:inline text-lg font-bold tracking-tight text-[color:var(--sc-text)] font-display transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-100"

const profileLinkClassName =
  "hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)] hover:bg-[color:var(--sc-bg-soft)] transition-colors"

const loginButtonClassName =
  "hidden sm:inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)] hover:bg-[color:var(--sc-bg-soft)] transition-colors cursor-pointer"

const mobileMenuButtonClassName =
  "xl:hidden p-2 rounded-lg text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)] hover:bg-[color:var(--sc-bg-soft)] transition-colors"

const mobileDrawerClassName =
  "xl:hidden border-t border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] max-h-[80vh] overflow-y-auto"

const mobileActionRowClassName =
  "p-4 border-t border-[color:var(--sc-border)] flex items-center gap-3"

const mobileLoginClassName =
  "text-sm font-medium text-[color:var(--sc-blue)] hover:underline cursor-pointer"

const mobileSignupClassName =
  "text-sm font-medium text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)] cursor-pointer"

const mobileProfileLinkClassName =
  "text-sm font-medium text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)]"

const mobileLogoutClassName =
  "text-sm font-medium text-[color:var(--sc-text-2)] hover:text-white hover:bg-[linear-gradient(180deg,#F87171_0%,#DC2626_100%)] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"


export default function Navbar({ isLoggedIn: isLoggedInProp, onLoginClick, onSignupClick }: NavbarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const router = useRouter()
  const auth = useAuth()
  const { t } = useI18n()

  // Prop wins if explicitly provided (e.g. forced "logged in" preview screens).
  // Otherwise we read the persistent session from the AuthProvider so the
  // navbar stays in sync across every page navigation automatically.
  const isLoggedIn = typeof isLoggedInProp === "boolean" ? isLoggedInProp : auth.isLoggedIn

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  const closeMenus = () => {
    setOpenMenu(null)
    setMobileOpen(false)
  }

  const handleLoginClick = () => {
    closeMenus()
    if (onLoginClick) {
      onLoginClick()
    } else {
      setLoginOpen(true)
    }
  }

  // The default behaviour is to open the unified SignupModal - the SAME
  // overlay used by the "Voir le tutoriel" CTA on the audit results page.
  // Pages can still pass `onSignupClick` to override (e.g. to send the user
  // to the long-form /compte/creer flow instead).
  const handleSignupClick = () => {
    closeMenus()
    if (onSignupClick) {
      onSignupClick()
    } else {
      setLoginOpen(false)
      setSignupOpen(true)
    }
  }

  const handleLogout = () => {
    closeMenus()
    auth.logout()
    router.push("/")
  }

  return (
    <>
    <nav
      className="sticky top-0 z-50 border-b border-[color:var(--sc-border)] bg-[color:var(--sc-surface)]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[color:var(--sc-surface)]/70"
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center h-16 gap-2">
        {/* Logo -> real homepage /accueil. On hover, the wordmark fades out
            and only the shield logo remains, for visual clarity. */}
        <Link
          href="/accueil"
          aria-label="Aller à la page d'accueil SafeCheck"
          title="SafeCheck - accueil"
          className="flex items-center gap-2 shrink-0 mr-0 sm:mr-3 group cursor-pointer"
          onClick={closeMenus}
        >
          <SafeCheckMark className="relative transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[-4deg]" />
          <span
            aria-hidden="false"
            className={logoTextClassName}
          >
            Safe<span className="sc-gradient-text">Check</span>
          </span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden xl:flex items-center gap-0.5 flex-1">
          <NavDropdown
            label={t("nav.audits")}
            id="audits"
            isOpen={openMenu === "audits"}
            onToggle={() => toggleMenu("audits")}
            items={auditLinks}
            onClose={closeMenus}
            wide
            footerCta={{
              label: t("nav.voirTousAudits"),
              href: "/audits",
              icon: ListChecks,
            }}
          />
          <NavDropdown
            label={t("nav.tutoriels")}
            id="tutoriels"
            isOpen={openMenu === "tutoriels"}
            onToggle={() => toggleMenu("tutoriels")}
            items={tutorielsLinks}
            onClose={closeMenus}
          />
          <NavDropdown
            label={t("nav.essentiels")}
            id="essentiels"
            isOpen={openMenu === "essentiels"}
            onToggle={() => toggleMenu("essentiels")}
            items={essentielLinks}
            onClose={closeMenus}
          />
          <NavDropdown
            label={t("nav.recommandations")}
            id="recommandations"
            isOpen={openMenu === "recommandations"}
            onToggle={() => toggleMenu("recommandations")}
            items={recommandationLinks}
            onClose={closeMenus}
          />
          <NavDropdown
            label={t("nav.decouvrir")}
            id="decouvrir"
            isOpen={openMenu === "decouvrir"}
            onToggle={() => toggleMenu("decouvrir")}
            items={decouvrirLinks}
            onClose={closeMenus}
            withIcons
          />

          {/* Removed: "Voir tous les audits" shortcut from desktop header.
              It's already available in the Audits dropdown footerCta. */}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <LanguageToggle />
          <ThemeToggle />

          {isLoggedIn ? (
            <>
              <Link
                href="/compte"
                className={profileLinkClassName}
                onClick={closeMenus}
              >
                <User className="w-3.5 h-3.5" />
                {t("nav.monProfil")}
              </Link>
              <ScButton
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                aria-label={t("nav.deconnexion")}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("nav.deconnexion")}</span>
              </ScButton>
            </>
          ) : (
            <>
              <button
                type="button"
                className={loginButtonClassName}
                onClick={handleLoginClick}
              >
                {t("nav.connexion")}
              </button>
              <ScButton
                variant="primary"
                size="sm"
                onClick={handleSignupClick}
                aria-label={t("nav.creerCompte")}
              >
                <UserPlus className="w-3.5 h-3.5 sm:hidden" />
                <span className="hidden sm:inline whitespace-nowrap">{t("nav.creerCompte")}</span>
              </ScButton>
            </>
          )}

          {/* Mobile burger */}
          <button
            className={mobileMenuButtonClassName}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("nav.menu")}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className={mobileDrawerClassName}>
          <MobileSection title={t("nav.audits")} items={auditLinks} onClose={closeMenus} />
          <MobileSection title={t("nav.tutoriels")} items={tutorielsLinks} onClose={closeMenus} />
          <MobileSection title={t("nav.essentiels")} items={essentielLinks} onClose={closeMenus} />
          <MobileSection title={t("nav.recommandations")} items={recommandationLinks} onClose={closeMenus} />
          <MobileSection title={t("nav.decouvrir")} items={decouvrirLinks} onClose={closeMenus} />
          {!isLoggedIn && (
            <div className={mobileActionRowClassName}>
              <button
                type="button"
                className={mobileLoginClassName}
                onClick={handleLoginClick}
              >
                {t("nav.connexion")}
              </button>
              <span className="text-[color:var(--sc-text-muted)]">·</span>
              <button
                type="button"
                className={mobileSignupClassName}
                onClick={handleSignupClick}
              >
                {t("nav.creerCompte")}
              </button>
            </div>
          )}
          {isLoggedIn && (
            <div className={mobileActionRowClassName}>
              <Link
                href="/compte"
                onClick={closeMenus}
                className={mobileProfileLinkClassName}
              >
                {t("nav.monProfil")}
              </Link>
              <span className="text-[color:var(--sc-text-muted)]">·</span>
              <button
                type="button"
                onClick={handleLogout}
                className={mobileLogoutClassName}
              >
                {t("nav.deconnexion")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click-outside overlay */}
      {openMenu && <div className="fixed inset-0 z-40" onClick={closeMenus} />}
    </nav>

    {/* Built-in login modal - works from any page that mounts the Navbar */}
    {loginOpen && (
      <NavbarLoginModal
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => {
          // "Pas encore de compte ? Créer un compte" inside the login modal
          // opens the SAME unified SignupModal as the top-right "Créer un
          // compte" button - never a separate page.
          setLoginOpen(false)
          setSignupOpen(true)
        }}
      />
    )}

    {/* Unified sign-up modal - shared with the "Voir le tutoriel" flow on
        /resultats so both entry points open the exact same overlay. */}
    <SignupModal
      open={signupOpen}
      onClose={() => setSignupOpen(false)}
      onSwitchToLogin={() => {
        setSignupOpen(false)
        setLoginOpen(true)
      }}
    />
    </>
  )
}
