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
import { getJogadores } from '@/lib/services/jogadores'
import { Jogador } from '@/types'
import JogadorCard from '@/components/jogadores/JogadorCard'
import NovoJogadorModal from '@/components/jogadores/NovoJogadorModal'
import Toast from '@/components/shared/Toast'

export default function JogadoresPage() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const fetchJogadores = async () => {
    try {
      setLoading(true)
      const data = await getJogadores()
      setJogadores(data)
    } catch (error: any) {
      setToast({ message: 'Erro ao carregar jogadores', type: 'error' })
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchJogadores()
  }, [])
  
  const handleSuccess = () => {
    setToast({ message: '✅ Jogador cadastrado com sucesso!', type: 'success' })
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
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
```

## Checklist de Validacao

- [ ] Listagem de jogadores funcionando
- [ ] Cards exibindo informacoes corretas
- [ ] Modal de cadastro abrindo/fechando
- [ ] Validacao de campos com Zod
- [ ] Mensagens de erro aparecendo
- [ ] Jogador sendo inserido no banco
- [ ] Toast de sucesso aparecendo
- [ ] Grid responsivo (1 col mobile, 4 cols desktop)
- [ ] Avatar padrao para jogadores sem foto
- [ ] Estatisticas zeradas em novos jogadores

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

