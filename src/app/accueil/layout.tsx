import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "Accueil",
  description:
    "Votre tableau de bord SafeCheck : reprenez votre audit là où vous l'avez laissé, suivez vos actions réalisées et accédez aux tutoriels adaptés à votre niveau.",
  path: '/accueil',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
