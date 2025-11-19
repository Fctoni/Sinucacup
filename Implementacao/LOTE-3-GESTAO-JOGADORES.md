# LOTE 3: Gestao de Jogadores

## Objetivo
Implementar CRUD completo de jogadores com listagem e cadastro

## Tarefas

### 1. Criar Servico de Jogadores

**lib/services/jogadores.ts:**

```typescript
import { supabase } from '@/lib/supabase'
import { Jogador } from '@/types'

export async function getJogadores() {
  const { data, error } = await supabase
    .from('jogadores')
    .select('*')
    .order('pontos_totais', { ascending: false })
  
  if (error) throw error
  return data as Jogador[]
}

export async function getJogador(id: string) {
  const { data, error } = await supabase
    .from('jogadores')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Jogador
}

export async function createJogador(jogador: Omit<Jogador, 'id' | 'created_at' | 'updated_at' | 'pontos_totais' | 'vitorias' | 'participacoes' | 'ativo'>) {
  const { data, error } = await supabase
    .from('jogadores')
    .insert({
      ...jogador,
      pontos_totais: 0,
      vitorias: 0,
      participacoes: 0,
      ativo: true,
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Jogador
}

export async function updateJogador(id: string, updates: Partial<Jogador>) {
  const { data, error } = await supabase
    .from('jogadores')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Jogador
}
```

### 2. Criar Schema de Validacao

**lib/validations/jogador.ts:**

```typescript
import { z } from 'zod'

export const jogadorSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome muito longo'),
  setor: z.string()
    .min(2, 'Setor deve ter pelo menos 2 caracteres')
    .max(255, 'Setor muito longo'),
  foto_url: z.string()
    .url('URL invalida')
    .optional()
    .or(z.literal('')),
})

export type JogadorFormData = z.infer<typeof jogadorSchema>
```

### 3. Criar Componente: Card de Jogador

**components/jogadores/JogadorCard.tsx:**

```typescript
import { Jogador } from '@/types'
import Image from 'next/image'

type Props = {
  jogador: Jogador
}

export default function JogadorCard({ jogador }: Props) {
  return (
    <div className="card-base text-center">
      <div className="mb-4">
        {jogador.foto_url ? (
          <Image
            src={jogador.foto_url}
            alt={jogador.nome}
            width={100}
            height={100}
            className="rounded-full mx-auto border-4 border-verde-medio"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-verde-medio flex items-center justify-center mx-auto text-4xl">
            👤
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-bold mb-2 text-texto-principal">{jogador.nome}</h3>
      <p className="text-texto-secundario mb-4">{jogador.setor}</p>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-cinza-medio p-2 rounded">
          <p className="text-amarelo-destaque font-bold text-xl">{jogador.pontos_totais}</p>
          <p className="text-xs text-texto-secundario">Pontos</p>
        </div>
        <div className="bg-cinza-medio p-2 rounded">
          <p className="text-verde-claro font-bold text-xl">{jogador.vitorias}</p>
          <p className="text-xs text-texto-secundario">Vitorias</p>
        </div>
        <div className="bg-cinza-medio p-2 rounded">
          <p className="text-azul-info font-bold text-xl">{jogador.participacoes}</p>
          <p className="text-xs text-texto-secundario">Jogos</p>
        </div>
      </div>
      
      {!jogador.ativo && (
        <div className="mt-4">
          <span className="badge bg-cinza-medio text-texto-secundario">Inativo</span>
        </div>
      )}
    </div>
  )
}
```

### 4. Criar Componente: Modal de Cadastro

**components/jogadores/NovoJogadorModal.tsx:**

```typescript
'use client'

import { useState } from 'react'
import { jogadorSchema, JogadorFormData } from '@/lib/validations/jogador'
import { createJogador } from '@/lib/services/jogadores'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function NovoJogadorModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<JogadorFormData>({
    nome: '',
    setor: '',
    foto_url: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  
  if (!isOpen) return null
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    
    try {
      // Validar com Zod
      const validated = jogadorSchema.parse(formData)
      
      // Criar jogador
      await createJogador(validated)
      
      // Resetar form
      setFormData({ nome: '', setor: '', foto_url: '' })
      onSuccess()
      onClose()
    } catch (error: any) {
      if (error.errors) {
        // Erros de validacao Zod
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
      } else {
        alert('Erro ao cadastrar jogador: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-cinza-card p-8 rounded-xl border-2 border-amarelo-destaque max-w-md w-full mx-4">
        <h2 className="text-2xl mb-6">👥 Novo Jogador</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nome *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
              placeholder="Ex: João Silva"
            />
            {errors.nome && <p className="text-vermelho-erro text-sm mt-1">{errors.nome}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Setor *</label>
            <input
              type="text"
              value={formData.setor}
              onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
              placeholder="Ex: TI, RH, Vendas"
            />
            {errors.setor && <p className="text-vermelho-erro text-sm mt-1">{errors.setor}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">URL da Foto (opcional)</label>
            <input
              type="text"
              value={formData.foto_url}
              onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
              placeholder="https://exemplo.com/foto.jpg"
            />
            {errors.foto_url && <p className="text-vermelho-erro text-sm mt-1">{errors.foto_url}</p>}
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Salvando...' : '✅ Salvar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### 5. Atualizar Pagina de Jogadores

**app/jogadores/page.tsx:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getJogadores } from '@/lib/services/jogadores'
import { Jogador } from '@/types'
import JogadorCard from '@/components/jogadores/JogadorCard'
import NovoJogadorModal from '@/components/jogadores/NovoJogadorModal'

export default function JogadoresPage() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  
  const fetchJogadores = async () => {
    try {
      setLoading(true)
      const data = await getJogadores()
      setJogadores(data)
    } catch (error: any) {
      toast.error('Erro ao carregar jogadores')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchJogadores()
  }, [])
  
  const handleSuccess = () => {
    toast.success('✅ Jogador cadastrado com sucesso!')
    fetchJogadores()
  }
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">Carregando jogadores...</p>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl">👥 Gestao de Jogadores</h2>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          ➕ Novo Jogador
        </button>
      </div>
      
      {jogadores.length === 0 ? (
        <div className="card-base text-center py-12">
          <p className="text-xl text-texto-secundario mb-4">Nenhum jogador cadastrado</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            ➕ Cadastrar Primeiro Jogador
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {jogadores.map((jogador) => (
            <JogadorCard key={jogador.id} jogador={jogador} />
          ))}
        </div>
      )}
      
      <NovoJogadorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
```

## Checklist de Validacao

- [x] Listagem de jogadores funcionando
- [x] Cards exibindo informacoes corretas
- [x] Modal de cadastro abrindo/fechando
- [x] Validacao de campos com Zod
- [x] Mensagens de erro aparecendo
- [x] Jogador sendo inserido no banco
- [x] Notificacoes (toast) do Sonner funcionando
- [x] Grid responsivo (1 col mobile, 4 cols desktop)
- [x] Avatar padrao para jogadores sem foto
- [x] Estatisticas zeradas em novos jogadores

## Entregaveis

- ✅ CRUD de jogadores funcional
- ✅ Validacoes implementadas
- ✅ Interface intuitiva
- ✅ Feedback visual adequado
- ✅ Pronto para Lote 4

## Tempo Estimado
⏱️ 90-120 minutos

## Proxima Etapa
➡️ LOTE 4: Gestao de Edicoes

## Progresso de implementação: **preencher aqui abaixo sempre tudo que foi feito ao final do lote**

✅ Serviço de jogadores criado (lib/services/jogadores.ts)
  - getJogadores(): Busca todos ordenados por pontuação
  - getJogador(id): Busca por ID
  - createJogador(): Cria novo com valores padrão (0 pts, 0 vitórias, ativo)
  - updateJogador(): Atualiza dados e timestamp

✅ Schema de validação Zod criado (lib/validations/jogador.ts)
  - Nome: mínimo 3 caracteres, máximo 255
  - Setor: mínimo 2 caracteres, máximo 255
  - Foto URL: opcional, valida URL ou aceita string vazia

✅ Componente JogadorCard criado (components/jogadores/JogadorCard.tsx)
  - Exibe foto ou avatar padrão (emoji 👤)
  - Grid de estatísticas: Pontos, Vitórias, Jogos
  - Badge "Inativo" para jogadores inativos
  - Estilos do Design System aplicados

✅ Modal NovoJogadorModal criado (components/jogadores/NovoJogadorModal.tsx)
  - Formulário com 3 campos (nome*, setor*, foto_url)
  - Validação em tempo real com Zod
  - Mensagens de erro específicas por campo
  - Estados de loading durante salvamento
  - Reset do formulário após sucesso

✅ Página de jogadores atualizada (app/jogadores/page.tsx)
  - Estado de loading com mensagem
  - Botão "Novo Jogador" no header
  - Grid responsivo: 1 col (mobile) → 4 cols (desktop XL)
  - Empty state quando não há jogadores
  - Integração com toast (Sonner) para feedbacks
  - Recarregamento automático após cadastro

**Arquivos Criados:**
- lib/services/jogadores.ts (57 linhas)
- lib/validations/jogador.ts (18 linhas)
- components/jogadores/JogadorCard.tsx (52 linhas)
- components/jogadores/NovoJogadorModal.tsx (122 linhas)

**Arquivos Modificados:**
- app/jogadores/page.tsx (68 linhas)

**Funcionalidades Implementadas:**
- ✅ Listagem de jogadores com ordenação por pontuação
- ✅ Cadastro de novos jogadores
- ✅ Validação de formulários
- ✅ Avatar padrão para jogadores sem foto
- ✅ Grid responsivo
- ✅ Toast notifications
- ✅ Loading states
- ✅ Empty states

**LOTE 3 - COMPLETO! ✅**

---

## 🔧 Correções Pós-Implementação

### Correção 1: Constraint UNIQUE para Nomes (Data: Implementação Fase 2)

**Problema Identificado:**
- Sistema permitia cadastrar jogadores com nomes duplicados
- Teste 37 identificou a ausência de validação

**Solução Implementada:**

**1. Migration no Supabase:**
```sql
-- Migration: add_unique_constraint_jogador_nome
ALTER TABLE jogadores 
ADD CONSTRAINT jogadores_nome_unique UNIQUE (nome);

CREATE INDEX IF NOT EXISTS idx_jogadores_nome ON jogadores(nome);
```

**2. Tratamento de Erro no Frontend:**
```typescript
// components/jogadores/NovoJogadorModal.tsx
if (error.code === '23505' || error.message?.includes('jogadores_nome_unique')) {
  toast.error('❌ Já existe um jogador cadastrado com este nome!')
}
```

**Regra de Negócio:**
- ✅ Nome do jogador deve ser único no sistema
- ✅ Não permite duplicação independente do setor
- ✅ Mensagem de erro amigável via toast
- ✅ Código de erro PostgreSQL: 23505 (unique violation)

**Testes Atualizados:**
- Teste 37: Agora valida que sistema IMPEDE duplicação
- Teste 37.1: Valida que nomes similares mas diferentes são aceitos

