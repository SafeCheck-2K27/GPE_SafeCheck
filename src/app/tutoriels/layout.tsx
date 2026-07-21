import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Tutoriels",
  description:
    "Des tutoriels pas à pas pour sécuriser vos comptes, vos appareils et vos données, sur Windows comme sur macOS. Accessibles même aux grands débutants.",
  path: '/tutoriels',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
