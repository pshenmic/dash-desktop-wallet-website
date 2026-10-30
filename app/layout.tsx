import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })

// Absolute URLs for og:image; Vercel provides the production domain
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Dash Desktop Wallet',
  description:
    'Dash Desktop Wallet — Core payments, Platform identities and shielded transactions. Non-custodial and open source for macOS, Windows and Linux.',
  openGraph: {
    title: 'Dash Desktop Wallet',
    description: 'Dash Desktop Wallet — Core payments, Platform identities and shielded transactions.',
    images: '/icon.png'
  },
  icons: { icon: { url: '/icon.png', type: 'image/png' } }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#008de4'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
