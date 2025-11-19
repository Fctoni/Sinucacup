# LOTE 2: UI Base e Design System

## Objetivo
Implementar design system baseado no PRD e criar layout principal

## Tarefas

### 1. Configurar Cores no Tailwind

**tailwind.config.ts:**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores primarias (verde mesa de sinuca)
        'verde-mesa': '#1a5c4a',
        'verde-medio': '#2d7a63',
        'verde-claro': '#3a9978',
        
        // Cores de fundo
        'cinza-escuro': '#1a1a1a',
        'cinza-medio': '#2d2d2d',
        'cinza-card': '#333333',
        
        // Cores de texto
        'texto-principal': '#e0e0e0',
        'texto-secundario': '#b8b8b8',
        
        // Cores de acento
        'amarelo-destaque': '#f4d03f',
        'laranja-aviso': '#ff6b35',
        'azul-info': '#3a5ba0',
        'roxo-alternativo': '#7b2d8e',
        'vermelho-erro': '#e74c3c',
        
        // Cores de ranking
        'ouro': '#ffd700',
        'prata': '#c0c0c0',
        'bronze': '#cd7f32',
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 12px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}

export default config
```

### 2. Criar CSS Global

**app/globals.css:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-cinza-escuro text-texto-principal;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  h1 {
    @apply text-4xl font-bold text-amarelo-destaque;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  h2 {
    @apply text-3xl font-bold text-amarelo-destaque;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  h3 {
    @apply text-2xl font-semibold text-amarelo-destaque;
  }
}

@layer components {
  .card-base {
    @apply bg-cinza-card rounded-xl p-6 shadow-card border-2 border-transparent;
    @apply transition-all duration-300 hover:-translate-y-1 hover:border-amarelo-destaque;
  }
  
  .btn-primary {
    @apply bg-gradient-to-r from-verde-mesa to-verde-medio text-white;
    @apply px-6 py-3 rounded-xl font-semibold;
    @apply transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover;
  }
  
  .btn-secondary {
    @apply bg-cinza-medio text-texto-principal border-2 border-verde-medio;
    @apply px-6 py-3 rounded-xl font-semibold;
    @apply transition-all duration-300 hover:bg-verde-medio;
  }
  
  .btn-danger {
    @apply bg-vermelho-erro text-white;
    @apply px-6 py-3 rounded-xl font-semibold;
    @apply transition-all duration-300 hover:bg-red-600;
  }
  
  .badge {
    @apply inline-block rounded-full px-4 py-1 text-sm font-semibold;
  }
  
  .badge-inscricoes {
    @apply badge bg-azul-info text-white;
  }
  
  .badge-chaveamento {
    @apply badge bg-roxo-alternativo text-white;
  }
  
  .badge-andamento {
    @apply badge bg-laranja-aviso text-white;
  }
  
  .badge-finalizada {
    @apply badge bg-verde-medio text-white;
  }
}
```

### 3. Criar Componente: Header

**components/layout/Header.tsx:**

```typescript
export default function Header() {
  return (
    <header className="bg-cinza-medio shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🎱</span>
            <div>
              <h1 className="text-3xl font-bold">TecnoHard Sinuca Cup</h1>
              <p className="text-texto-secundario text-sm">Sistema de Gerenciamento de Torneios</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
```

### 4. Criar Componente: Navigation

**components/layout/Navigation.tsx:**

```typescript
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
```

### 5. Configurar Sonner (Notificacoes)

O Sonner e o componente de notificacoes recomendado pelo shadcn/ui (substituiu o Toast).

**Ja instalado no Lote 0:**
```bash
npx shadcn@latest add sonner
```

**Uso no projeto:**
O Sonner sera configurado no layout e usado via `toast()` em qualquer componente:

```typescript
import { toast } from 'sonner'

// Sucesso
toast.success('✅ Operacao realizada com sucesso!')

// Erro
toast.error('❌ Erro ao executar operacao')

// Info
toast.info('ℹ️ Informacao importante')

// Aviso
toast.warning('⚠️ Atencao necessaria')
```

### 6. Atualizar Layout Principal

**app/layout.tsx:**

```typescript
import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'TecnoHard Sinuca Cup',
  description: 'Sistema de gerenciamento de torneios de sinuca',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
```

### 7. Criar Pagina Inicial

**app/page.tsx:**

```typescript
export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-5xl mb-4">🎱 TecnoHard Sinuca Cup</h1>
        <p className="text-texto-secundario text-xl">
          Sistema completo de gerenciamento de torneios trimestrais de sinuca
        </p>
      </section>
      
      <section className="grid md:grid-cols-2 gap-6">
        <div className="card-base">
          <h3 className="text-2xl mb-4">🚀 Acoes Rapidas</h3>
          <div className="space-y-4">
            <button className="btn-primary w-full">
              ➕ Nova Edicao do Campeonato
            </button>
            <button className="btn-secondary w-full">
              👥 Cadastrar Jogador
            </button>
          </div>
        </div>
        
        <div className="card-base">
          <h3 className="text-2xl mb-4">ℹ️ Como Funciona</h3>
          <ul className="space-y-3 text-texto-secundario">
            <li>✅ Torneios trimestrais em duplas</li>
            <li>✅ Formacao automatica de duplas balanceadas</li>
            <li>✅ Chaveamento com sistema de BYE</li>
            <li>✅ Ranking acumulativo anual</li>
            <li>✅ Distribuicao automatica de pontos</li>
          </ul>
        </div>
      </section>
      
      <section className="card-base">
        <h3 className="text-2xl mb-4">🏆 Sistema de Pontuacao</h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-cinza-medio rounded-lg">
            <div className="text-4xl mb-2">🥇</div>
            <h4 className="text-xl font-bold text-ouro mb-2">Campeao</h4>
            <p className="text-3xl font-bold">+10 pontos</p>
          </div>
          <div className="p-6 bg-cinza-medio rounded-lg">
            <div className="text-4xl mb-2">🥈</div>
            <h4 className="text-xl font-bold text-prata mb-2">Vice-Campeao</h4>
            <p className="text-3xl font-bold">+6 pontos</p>
          </div>
          <div className="p-6 bg-cinza-medio rounded-lg">
            <div className="text-4xl mb-2">📊</div>
            <h4 className="text-xl font-bold text-verde-claro mb-2">Participante</h4>
            <p className="text-3xl font-bold">+2 pontos</p>
          </div>
        </div>
      </section>
    </div>
  )
}
```

### 8. Criar Paginas Placeholder

**app/jogadores/page.tsx:**
```typescript
export default function JogadoresPage() {
  return <h2>👥 Gestao de Jogadores</h2>
}
```

**app/edicoes/page.tsx:**
```typescript
export default function EdicoesPage() {
  return <h2>🏆 Gestao de Edicoes</h2>
}
```

**app/chaveamento/page.tsx:**
```typescript
export default function ChaveamentoPage() {
  return <h2>📊 Chaveamento</h2>
}
```

**app/ranking/page.tsx:**
```typescript
export default function RankingPage() {
  return <h2>📈 Ranking Global</h2>
}
```

### 9. Adicionar Animacoes ao Tailwind

**tailwind.config.ts (adicionar):**

```typescript
theme: {
  extend: {
    keyframes: {
      'slide-in-right': {
        '0%': { transform: 'translateX(100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
    },
    animation: {
      'slide-in-right': 'slide-in-right 0.3s ease-out',
    },
  },
}
```

## Checklist de Validacao

- [ ] Cores do PRD aplicadas no Tailwind
- [ ] Header com logo e titulo
- [ ] Navegacao funcionando entre paginas
- [ ] Pagina inicial visual e informativa
- [ ] Classes utilitarias (card-base, btn-primary) funcionando
- [ ] Responsividade basica (mobile/desktop)
- [ ] Sonner configurado no layout
- [ ] Animacoes suaves

## Entregaveis

- ✅ Design system implementado
- ✅ Layout navegavel
- ✅ Paginas criadas (placeholders)
- ✅ Componentes reutilizaveis
- ✅ Pronto para Lote 3


## Proxima Etapa
➡️ LOTE 3: Gestao de Jogadores

