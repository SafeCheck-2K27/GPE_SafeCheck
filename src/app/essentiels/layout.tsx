import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Les essentiels",
  description:
    "Les actions de sécurité les plus rentables : 20 % des efforts pour 80 % de la protection. Guides, réglages, notions clés et habitudes à adopter.",
  path: '/essentiels',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
