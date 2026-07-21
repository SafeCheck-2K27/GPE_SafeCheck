import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Personnalisation",
  description:
    "Adaptez SafeCheck à votre situation pour recevoir des recommandations et des tutoriels réellement pertinents pour vous.",
  path: '/personalisation',
  index: false,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
