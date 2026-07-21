import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Résultats de l'audit",
  description:
    "Le détail de vos résultats d'audit : score global, points forts, points faibles et prochaines actions recommandées.",
  path: '/resultats',
  index: false,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
