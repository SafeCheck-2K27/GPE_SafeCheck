import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Lexique",
  description:
    "Toutes les notions de la cybersécurité expliquées simplement : double authentification, phishing, VPN, chiffrement, rançongiciel et bien d'autres.",
  path: '/lexique',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
