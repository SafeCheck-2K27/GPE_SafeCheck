import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Tester ma vulnérabilité",
  description:
    "Testez votre exposition aux risques numériques les plus courants et découvrez les failles à corriger en priorité sur vos comptes et vos appareils.",
  path: '/vulnerabilite',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
