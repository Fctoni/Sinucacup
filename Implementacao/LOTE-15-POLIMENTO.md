# LOTE 15: Polimento e Testes

## Objetivo
Refinar UX, adicionar estados vazios e validar todo o sistema

## Tarefas

### 1. Estados de Loading

**components/shared/Loading.tsx:**

```typescript
export default function Loading({ mensagem = 'Carregando...' }: { mensagem?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-verde-medio border-t-transparent mb-4" />
      <p className="text-texto-secundario">{mensagem}</p>
    </div>
  )
}
```

### 2. Estados Vazios

**components/shared/EmptyState.tsx:**

```typescript
type Props = {
  emoji: string
  titulo: string
  descricao: string
  acaoBotao?: string
  onAcao?: () => void
}

export default function EmptyState({ emoji, titulo, descricao, acaoBotao, onAcao }: Props) {
  return (
    <div className="card-base text-center py-12">
      <p className="text-6xl mb-4">{emoji}</p>
      <h3 className="text-2xl font-bold mb-2">{titulo}</h3>
      <p className="text-texto-secundario mb-6">{descricao}</p>
      {acaoBotao && onAcao && (
        <button onClick={onAcao} className="btn-primary">
          {acaoBotao}
        </button>
      )}
    </div>
  )
}
```

### 3. Componente de Erro

**components/shared/ErrorMessage.tsx:**

```typescript
type Props = {
  mensagem: string
  onTentarNovamente?: () => void
}

export default function ErrorMessage({ mensagem, onTentarNovamente }: Props) {
  return (
    <div className="bg-vermelho-erro bg-opacity-20 border-2 border-vermelho-erro p-6 rounded-xl text-center">
      <p className="text-4xl mb-3">❌</p>
      <p className="text-xl font-bold mb-2">Ops! Algo deu errado</p>
      <p className="text-texto-secundario mb-4">{mensagem}</p>
      {onTentarNovamente && (
        <button onClick={onTentarNovamente} className="btn-secondary">
          🔄 Tentar Novamente
        </button>
      )}
    </div>
  )
}
```

### 4. Sistema de Notificacoes Global

**lib/contexts/ToastContext.tsx:**

```typescript
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import Toast from '@/components/shared/Toast'

type ToastType = 'success' | 'error' | 'warning' | 'info'

type ToastContextType = {
  showToast: (message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }
  
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider')
  }
  return context
}
```

**app/layout.tsx (adicionar provider):**

```typescript
import { ToastProvider } from '@/lib/contexts/ToastContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          <Header />
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  )
}
```

### 5. Melhorias de Acessibilidade

**components/shared/Button.tsx:**

```typescript
import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  }
  
  return (
    <button
      className={`${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          Carregando...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
```

### 6. Animacoes de Transicao

**app/globals.css (adicionar):**

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.3s ease-out;
}
```

### 7. Validacoes Finais

**Checklist Completo de Testes:**

#### **Jogadores**
- [ ] Cadastrar jogador com todos campos
- [ ] Cadastrar jogador sem foto (avatar padrao)
- [ ] Validacao de campos obrigatorios
- [ ] Listagem ordenada por pontos
- [ ] Cards exibindo estatisticas corretas

#### **Edicoes**
- [ ] Criar edicao nova
- [ ] Numero sugerido automaticamente
- [ ] Transicoes de status funcionando
- [ ] Badge de status correto
- [ ] Listagem ordenada por ano/numero

#### **Inscricoes**
- [ ] Inscrever jogadores
- [ ] Jogador indo para painel de inscritos
- [ ] Contador atualizando
- [ ] Nao permite duplicar inscricao

#### **Duplas**
- [ ] Gerar duplas automaticas
- [ ] Algoritmo de balanceamento correto
- [ ] Criar dupla manual
- [ ] Validacao: jogadores diferentes
- [ ] Drag & drop funcionando
- [ ] Recalculo de pontuacao apos troca
- [ ] Excluir dupla (sem chaveamento)
- [ ] Bloquear exclusao (com chaveamento)
- [ ] Modo reordenar funcionando

#### **Chaveamento**
- [ ] Gerar chaveamento (potencia de 2)
- [ ] Gerar chaveamento (com BYE)
- [ ] Piores duplas recebendo BYE
- [ ] Banner de BYE aparecendo
- [ ] Bracket visual renderizando
- [ ] Scroll horizontal funcionando

#### **Inicio do Campeonato**
- [ ] Modal de confirmacao
- [ ] Botoes de edicao desaparecendo
- [ ] Banner "Em Andamento" aparecendo
- [ ] Status mudando corretamente

#### **Resultados**
- [ ] Registrar vencedor
- [ ] Vencedor ficando verde
- [ ] Perdedor ficando cinza
- [ ] Avanco automatico de fases
- [ ] Integracao de BYEs
- [ ] Editar resultado
- [ ] Validacao de impacto
- [ ] Limpeza de fases posteriores

#### **Encerramento**
- [ ] Card do campeao aparecendo
- [ ] Modal de encerramento
- [ ] Distribuicao de pontos correta
- [ ] Status mudando para "finalizada"
- [ ] Badge verde aparecendo

#### **Ranking**
- [ ] Podio visual
- [ ] Ordenacao correta
- [ ] Estatisticas gerais
- [ ] Tabela completa
- [ ] Responsividade

#### **Geral**
- [ ] Navegacao funcionando
- [ ] Todas paginas acessiveis
- [ ] Toast de sucesso/erro
- [ ] Loading states
- [ ] Empty states
- [ ] Responsividade mobile
- [ ] Hover effects
- [ ] Animacoes suaves

### 8. Correcoes de Bugs Comuns

**lib/utils/debug.ts:**

```typescript
export function logError(contexto: string, error: any) {
  console.error(`[${contexto}]`, error)
  if (error.message) console.error('Mensagem:', error.message)
  if (error.details) console.error('Detalhes:', error.details)
}

export function logInfo(contexto: string, data: any) {
  console.log(`ℹ️ [${contexto}]`, data)
}
```

### 9. Performance

**Otimizacoes:**
- Adicionar `loading="lazy"` em todas as imagens
- Usar `React.memo` em componentes pesados
- Debounce em buscas (se houver)
- Evitar re-renders desnecessarios

### 10. Documentacao de Usuario

**GUIA-RAPIDO.md (criar na raiz):**

```markdown
# Guia Rapido - TecnoHard Sinuca Cup

## Como Organizar um Campeonato

### 1. Preparacao
1. Cadastre os jogadores (se houver novos)
2. Crie uma nova edicao
3. Gerencie as inscricoes

### 2. Formacao de Duplas
1. Gere duplas automaticamente OU
2. Crie manualmente
3. Ajuste via drag & drop se necessario

### 3. Chaveamento
1. Gere o chaveamento
2. Reordene se necessario
3. Inicie o campeonato

### 4. Durante o Torneio
1. Clique na dupla vencedora para registrar
2. Acompanhe o progresso
3. Edite resultados se necessario

### 5. Finalizacao
1. Aguarde a final ser concluida
2. Clique em "Encerrar Campeonato"
3. Confira o ranking atualizado
```

## Checklist Final

- [ ] Todos os componentes tem loading states
- [ ] Todos os componentes tem empty states
- [ ] Todos os erros tem mensagens claras
- [ ] Toast funcionando globalmente
- [ ] Animacoes suaves
- [ ] Responsividade mobile testada
- [ ] Acessibilidade (contraste, cursors)
- [ ] Todos os fluxos testados
- [ ] Sem erros no console
- [ ] Performance aceitavel

## Entregaveis

- ✅ Sistema polido e testado
- ✅ UX refinada
- ✅ Estados vazios e loading
- ✅ Notificacoes globais
- ✅ Documentacao de uso
- ✅ Pronto para Lote 16

## Tempo Estimado
⏱️ 120-180 minutos

## Proxima Etapa
➡️ LOTE 16: Deploy e Documentacao

