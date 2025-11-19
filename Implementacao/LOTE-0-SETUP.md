# LOTE 0: Setup e Fundacao

## Objetivo
Preparar ambiente e estrutura base do projeto

## Tarefas

### 1. Inicializar Projeto Next.js 14 com TypeScript
```bash
npx create-next-app@latest sinucacup_v2 --typescript --tailwind --app --no-src-dir
cd sinucacup_v2
```

Configuracoes:
- ✅ TypeScript: Sim
- ✅ ESLint: Sim
- ✅ Tailwind CSS: Sim
- ✅ App Router: Sim
- ❌ src/ directory: Nao
- ✅ Import alias (@/*): Sim

### 2. Instalar Dependencias Base
```bash
npm install @supabase/supabase-js
npm install date-fns zod
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
```

### 3. Configurar shadcn/ui
```bash
npx shadcn-ui@latest init
```

Componentes iniciais a instalar:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
```

### 4. Configurar Supabase

**4.1. Criar projeto no Supabase:**
- Acessar https://supabase.com
- Criar novo projeto
- Anotar URL e anon key

**4.2. Configurar Cliente Supabase (Aplicação Next.js):**

Para a aplicação funcionar, crie as variáveis de ambiente:

**Arquivo .env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

**Arquivo .env.example:**
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

**4.3. Criar lib/supabase.ts:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**💡 Resumo:**
- **MCP** → Cursor/AI interage com Supabase (criar tabelas, testar)
- **Cliente JS** → Aplicação Next.js funciona em runtime (browser/servidor)

### 5. Criar Estrutura de Pastas

```
sinucacup_v2/
├── app/
│   ├── layout.tsx (ja existe)
│   ├── page.tsx (ja existe)
│   ├── jogadores/
│   │   └── page.tsx
│   ├── edicoes/
│   │   └── page.tsx
│   ├── chaveamento/
│   │   └── page.tsx
│   └── ranking/
│       └── page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Navigation.tsx
│   └── shared/
│       └── Toast.tsx
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── .env.local
├── .env.example
└── .gitignore
```

### 6. Atualizar .gitignore

Adicionar ao .gitignore:
```
.env.local
.env*.local
```

### 7. Configurar tailwind.config.ts

Adicionar cores customizadas do PRD:
```typescript
export default {
  theme: {
    extend: {
      colors: {
        'verde-mesa': '#1a5c4a',
        'verde-medio': '#2d7a63',
        'verde-claro': '#3a9978',
        'cinza-escuro': '#1a1a1a',
        'cinza-medio': '#2d2d2d',
        'cinza-card': '#333333',
      },
    },
  },
}
```

### 8. Criar página inicial basica

**app/page.tsx:**
Pagina simples com titulo e navegacao para testar setup.

## Checklist de Validacao

- [ ] Projeto Next.js 14 rodando (`npm run dev`)
- [ ] TypeScript configurado sem erros
- [ ] Tailwind CSS funcionando
- [ ] shadcn/ui componentes instalados
- [ ] Supabase conectado (testar query simples)
- [ ] Estrutura de pastas criada
- [ ] Variaveis de ambiente configuradas
- [ ] .gitignore protegendo .env.local

## Entregaveis

- ✅ Projeto rodando em http://localhost:3001
- ✅ Supabase conectado
- ✅ Estrutura de pastas pronta
- ✅ Dependencias instaladas
- ✅ Pronto para Lote 1


## Proxima Etapa
➡️ LOTE 1: Banco de Dados e Types

## Progresso de implementação: **preencher aqui abaixo sempre tudo que foi feito ao final do lote**     

O usuário (humano) as tarefas 1, 2 e 3