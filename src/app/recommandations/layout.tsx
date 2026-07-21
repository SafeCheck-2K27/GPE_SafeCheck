import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Mes recommandations",
  description:
    "Vos recommandations personnalisées : les actions prioritaires à mener d'après les résultats de votre audit SafeCheck.",
  path: '/recommandations',
  index: false,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
