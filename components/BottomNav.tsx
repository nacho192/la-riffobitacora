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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-2 z-50">
      <div className="max-w-2xl mx-auto flex justify-around items-center">
        {items.map((item) => {
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 min-w-[70px] py-2"
            >
              <img
                src={item.icon}
                alt={item.label}
                className={
                  active
                    ? 'w-8 h-8 opacity-100 scale-110 transition-all'
                    : 'w-7 h-7 opacity-70 transition-all'
                }
              />

              <span
                className={
                  active
                    ? 'text-xs font-semibold text-slate-950'
                    : 'text-xs text-slate-600'
                }
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}