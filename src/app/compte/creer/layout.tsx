import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Créer un compte",
  description:
    "Créez votre compte SafeCheck pour conserver votre progression, retrouver vos audits et suivre vos actions sur tous vos appareils.",
  path: '/compte/creer',
  index: false,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
