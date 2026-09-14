import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getSiteSettings } from '@/lib/site'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return {
    title: s.siteName,
    description: s.tagline,
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header settings={settings} />
          <main id="main-content" className="min-h-screen pt-16" tabIndex={-1}>{children}</main>
          <Footer settings={settings} />
        </Providers>
      </body>
    </html>
  )
}