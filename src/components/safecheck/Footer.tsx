import Link from "next/link"
import { Shield } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[color:var(--sc-surface)] border-t border-[color:var(--sc-border)]">
      {/* Footer links grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/accueil" className="inline-flex items-center gap-2 mb-4 group">
            <span
              className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg text-white bg-[linear-gradient(135deg,#3B82F6,#2563EB_60%,#6366F1)] shadow-[0_6px_16px_-6px_rgba(37,99,235,0.55)] transition-transform group-hover:scale-105"
            >
              <Shield className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-[color:var(--sc-text)]">
              Safe<span className="sc-gradient-text">Check</span>
            </span>
          </Link>
          <p className="text-xs text-[color:var(--sc-text-muted)] leading-relaxed mb-4 max-w-[260px]">
            Comprendre votre niveau, identifier vos points faibles et passer à l&apos;action - à votre rythme.
          </p>
          <ul className="space-y-1.5 text-sm text-[color:var(--sc-text-2)]">
            <li>
              <FooterLink href="/accueil">Accueil</FooterLink>
            </li>
            <li>
              <FooterLink href="/wip?feature=qui-sommes-nous">Qui sommes-nous&nbsp;?</FooterLink>
            </li>
            <li>
              <FooterLink href="/hall-of-fame">Hall of Fame</FooterLink>
            </li>
            <li>
              <FooterLink href="/wip?feature=patch-notes">Patch de mise à jour</FooterLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold text-sm mb-3 text-[color:var(--sc-text)]">
            Audits & tests
          </h3>
          <ul className="space-y-1.5 text-sm text-[color:var(--sc-text-2)]">
            <li>
              <FooterLink href="/audits">Tous les audits</FooterLink>
            </li>
            <li>
              <FooterLink href="/audit">Audit qualification rapide</FooterLink>
            </li>
            <li>
              <FooterLink href="/vulnerabilite">Tester ma vulnérabilité</FooterLink>
            </li>
            <li>
              <FooterLink href="/simulations">Simulations & jeux</FooterLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold text-sm mb-3 text-[color:var(--sc-text)]">
            Apprendre
          </h3>
          <ul className="space-y-1.5 text-sm text-[color:var(--sc-text-2)]">
            <li>
              <FooterLink href="/essentiels">Les essentiels</FooterLink>
            </li>
            <li>
              <FooterLink href="/tutoriels">Tutoriels</FooterLink>
            </li>
            <li>
              <FooterLink href="/recommandations">Recommandations</FooterLink>
            </li>
            <li>
              <FooterLink href="/culture-cyber">Culture cyber</FooterLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold text-sm mb-3 text-[color:var(--sc-text)]">
            Mon espace
          </h3>
          <ul className="space-y-1.5 text-sm text-[color:var(--sc-text-2)]">
            <li>
              <FooterLink href="/compte">Mon profil</FooterLink>
            </li>
            <li>
              <FooterLink href="/compte?tab=historique">Mon historique</FooterLink>
            </li>
            <li>
              <FooterLink href="/compte/creer">Créer un compte</FooterLink>
            </li>
          </ul>
          <h3 className="font-display font-semibold text-sm mt-5 mb-3 text-[color:var(--sc-text)]">
            Langue
          </h3>
          <ul className="space-y-1.5 text-sm">
            <li>
              <span className="text-[color:var(--sc-blue)] font-medium">Français</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[color:var(--sc-border)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[color:var(--sc-text-muted)]">
          <span>© {new Date().getFullYear()} SafeCheck - Maquette pédagogique</span>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {[
              "Mentions légales",
              "CGU",
              "Données personnelles",
              "Cookies",
              "Accessibilité",
              "Sécurité",
            ].map((item, i) => (
              <span key={item} className="flex items-center gap-3">
                {i > 0 && (
                  <span className="text-[color:var(--sc-border-strong)]" aria-hidden>
                    |
                  </span>
                )}
                <FooterLink href="/wip?feature=legal">{item}</FooterLink>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hover:text-[color:var(--sc-blue)] transition-colors"
    >
      {children}
    </Link>
  )
}
