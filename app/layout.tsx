import type { Metadata, Viewport } from 'next'
import './globals.css'

import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Bitácora',

  description: 'Bitácora de procedimientos de fisiatría UDD',

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
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (

    <html lang="es">

      <body>

        {children}

        <BottomNav />

      </body>

    </html>
  )
}