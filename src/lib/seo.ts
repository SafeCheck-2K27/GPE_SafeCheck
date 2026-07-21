import type { Metadata } from 'next'

/*
   SafeCheck - Socle SEO partage (SC-057)

   Centralise les constantes du site et la fabrication des metadonnees de
   page, pour que titres, descriptions, canoniques et balises Open Graph
   restent coherents d'une page a l'autre.

   Rappel Next.js : `metadata` n'est exporte que depuis un Server
   Component. Nos pages etant majoritairement des Client Components
   ("use client"), les metadonnees sont portees par un `layout.tsx` place
   dans le meme segment de route.
 */

export const SITE_NAME = 'SafeCheck'

/*
   L'URL absolue est necessaire pour resoudre les canoniques et les
   images Open Graph. Elle est configurable par environnement : a definir
   dans `NEXT_PUBLIC_SITE_URL` au deploiement.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const SITE_DESCRIPTION =
  "SafeCheck vous aide à comprendre votre niveau de sécurité numérique, à identifier vos points faibles et à appliquer des actions concrètes pour mieux vous protéger sur Internet et sur votre ordinateur."

interface PageSeo {
  /** Titre de la page, sans le suffixe du site (ajoute automatiquement). */
  title: string
  /** Description affichee dans les resultats de recherche (150-160 caracteres). */
  description: string
  /** Chemin de la page, pour l'URL canonique (ex. "/audit"). */
  path: string
  /**
   * Passer `false` pour les pages qui ne doivent pas etre indexees :
   * espace compte et pages dont le contenu est personnalise.
   */
  index?: boolean
}

export function pageMetadata({ title, description, path, index = true }: PageSeo): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: index ? undefined : { index: false, follow: false },
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: path,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  }
}
