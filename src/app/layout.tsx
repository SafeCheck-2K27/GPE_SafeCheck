import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/safecheck/ThemeProvider'
import { AuthProvider } from '@/components/safecheck/AuthProvider'
import { I18nProvider } from '@/components/safecheck/I18nProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'SafeCheck - La cybersécurité, sereinement.',
  description:
    'SafeCheck vous aide à comprendre votre niveau de sécurité numérique, à identifier vos points faibles et à appliquer des actions concrètes pour mieux vous protéger sur Internet et sur votre ordinateur.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>{children}</AuthProvider>
          </I18nProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
