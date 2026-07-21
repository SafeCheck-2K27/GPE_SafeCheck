import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Tous les audits",
  description:
    "Découvrez l'ensemble des audits SafeCheck : audit de qualification rapide, test de vulnérabilité et simulations pour mesurer votre sécurité numérique.",
  path: '/audits',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
