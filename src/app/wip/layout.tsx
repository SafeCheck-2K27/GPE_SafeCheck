import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Fonctionnalité en cours",
  description:
    "Cette fonctionnalité de SafeCheck est en cours de préparation et sera disponible prochainement.",
  path: '/wip',
  index: false,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
