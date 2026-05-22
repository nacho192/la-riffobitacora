import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bitácora',
  description: 'Bitácora digital de procedimientos para fisiatría',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Bitácora',
    statusBarStyle: 'default'
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-icon.png'
  }
}

export const viewport: Viewport = {
  themeColor: '#071B34'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
}