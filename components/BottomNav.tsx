'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  const items = [
    {
      href: '/',
      label: 'Inicio',
      icon: '/icon-home.png'
    },
    {
      href: '/nuevo',
      label: 'Nuevo',
      icon: '/icon-new.png'
    },
    {
      href: '/mis-procedimientos',
      label: 'Mis procedimientos',
      icon: '/icon-mis-procedimientos.png'
    },
    {
      href: '/dashboard',
      label: 'Estadísticas',
      icon: '/icon-dashboard.png'
    },
    {
      href: '/exportar',
      label: 'Exportar',
      icon: '/icon-export.png'
    }
  ]

  return (
    <