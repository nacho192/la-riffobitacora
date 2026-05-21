'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  const items = [
    { href: '/', label: 'Inicio', icon: '🏠' },
    { href: '/nuevo', label: 'Nuevo', icon: '➕' },
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/exportar', label: 'Exportar', icon: '📄' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 z-50">
      <div className="max-w-xl mx-auto flex justify-around">
        {items.map((item) => {
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center
                px-4 py-2 rounded-2xl transition-all min-w-[70px]
                ${active ? 'bg-slate-900 text-white' : 'text-slate-700'}
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}