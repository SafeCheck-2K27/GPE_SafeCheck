import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Audit rapide",
  description:
    "Évaluez votre niveau de sécurité numérique en répondant à des questions simples, sans jargon. Résultat immédiat et actions concrètes à mettre en place.",
  path: '/audit',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
