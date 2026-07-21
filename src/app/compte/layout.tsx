import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Mon compte",
  description:
    "Votre espace personnel SafeCheck : profil, historique de vos audits, préférences et suivi de votre progression.",
  path: '/compte',
  index: false,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
