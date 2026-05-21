import type { Metadata } from 'next'
import './globals.css'

import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {

  title: 'La Riffobitácora',

  description: 'Bitácora de procedimientos de fisiatría UDD',

  manifest: '/manifest.json'
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