'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '🏠 Inicio', emoji: '🏠' },
  { href: '/jogadores', label: '👥 Jogadores', emoji: '👥' },
  { href: '/edicoes', label: '🏆 Edicoes', emoji: '🏆' },
  { href: '/chaveamento', label: '📊 Chaveamento', emoji: '📊' },
  { href: '/ranking', label: '📈 Ranking', emoji: '📈' },
]

export default function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav className="bg-cinza-medio border-b-2 border-verde-medio">
      <div className="container mx-auto px-4">
        <ul className="flex flex-wrap gap-2 py-4">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  px-6 py-2 rounded-lg font-semibold transition-all duration-300
                  ${pathname === item.href 
                    ? 'bg-verde-medio text-white' 
                    : 'bg-cinza-card text-texto-secundario hover:bg-verde-medio hover:text-white'
                  }
                `}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

