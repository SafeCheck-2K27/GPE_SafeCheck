import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { tutoriels } from '@/lib/tutoriels-data'

/*
   Metadonnees par tutoriel : chaque fiche merite son propre titre et sa
   propre description, ce sont les pages a plus fort potentiel de
   referencement du site. La page elle-meme est un Client Component,
   d'ou ce layout qui porte les metadonnees.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const tuto = tutoriels.find((t) => t.slug === id || t.id === Number(id))

  if (!tuto) {
    return pageMetadata({
      title: 'Tutoriel introuvable',
      description: "Ce tutoriel n'existe pas ou a été déplacé. Retrouvez l'ensemble des tutoriels SafeCheck.",
      path: `/tutoriels/${id}`,
      index: false,
    })
  }

  return pageMetadata({
    title: tuto.title,
    description: tuto.description,
    path: `/tutoriels/${tuto.slug}`,
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
