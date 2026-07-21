import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Hall of Fame",
  description:
    "Les contributrices et contributeurs qui font vivre SafeCheck, et les progrès réalisés par la communauté en matière de sécurité numérique.",
  path: '/hall-of-fame',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
