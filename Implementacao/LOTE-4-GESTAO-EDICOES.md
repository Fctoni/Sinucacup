# LOTE 4: Gestao de Edicoes

## Objetivo
Implementar CRUD de edicoes com controle de status

## Tarefas

### 1. Criar Servico de Edicoes

**lib/services/edicoes.ts:**

```typescript
import { supabase } from '@/lib/supabase'
import { Edicao } from '@/types'

export async function getEdicoes() {
  const { data, error } = await supabase
    .from('edicoes')
    .select('*')
    .order('ano', { ascending: false })
    .order('numero', { ascending: false })
  
  if (error) throw error
  return data as Edicao[]
}

export async function getEdicao(id: string) {
  const { data, error } = await supabase
    .from('edicoes')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Edicao
}

export async function createEdicao(edicao: Omit<Edicao, 'id' | 'created_at' | 'updated_at' | 'status'>) {
  const { data, error } = await supabase
    .from('edicoes')
    .insert({
      ...edicao,
      status: 'inscricoes_abertas',
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Edicao
}

export async function updateEdicaoStatus(id: string, status: Edicao['status']) {
  const { data, error } = await supabase
    .from('edicoes')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Edicao
}

export async function getProximoNumeroEdicao(ano: number) {
  const { data, error } = await supabase
    .from('edicoes')
    .select('numero')
    .eq('ano', ano)
    .order('numero', { ascending: false })
    .limit(1)
  
  if (error) throw error
  return data.length > 0 ? data[0].numero + 1 : 1
}
```

### 2. Criar Schema de Validacao

**lib/validations/edicao.ts:**

```typescript
import { z } from 'zod'

export const edicaoSchema = z.object({
  nome: z.string()
    .min(5, 'Nome deve ter pelo menos 5 caracteres')
    .max(255, 'Nome muito longo'),
  numero: z.number()
    .int('Numero deve ser inteiro')
    .positive('Numero deve ser positivo'),
  ano: z.number()
    .int('Ano deve ser inteiro')
    .min(2020, 'Ano invalido')
    .max(2100, 'Ano invalido'),
  data_inicio: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Data invalida'),
})

export type EdicaoFormData = z.infer<typeof edicaoSchema>
```

### 3. Criar Componente: Badge de Status

**components/edicoes/StatusBadge.tsx:**

```typescript
import { Edicao } from '@/types'

type Props = {
  status: Edicao['status']
}

const statusConfig = {
  inscricoes_abertas: {
    label: '📝 Inscricoes Abertas',
    className: 'badge-inscricoes',
  },
  chaveamento: {
    label: '🔧 Chaveamento',
    className: 'badge-chaveamento',
  },
  em_andamento: {
    label: '🎯 Em Andamento',
    className: 'badge-andamento',
  },
  finalizada: {
    label: '🏆 Finalizada',
    className: 'badge-finalizada',
  },
}

export default function StatusBadge({ status }: Props) {
  const config = statusConfig[status]
  
  return (
    <span className={config.className}>
      {config.label}
    </span>
  )
}
```

### 4. Criar Componente: Card de Edicao

**components/edicoes/EdicaoCard.tsx:**

```typescript
import { Edicao } from '@/types'
import StatusBadge from './StatusBadge'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Props = {
  edicao: Edicao
}

export default function EdicaoCard({ edicao }: Props) {
  const dataFormatada = format(new Date(edicao.data_inicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  
  return (
    <div className="card-base">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-texto-principal mb-2">{edicao.nome}</h3>
          <p className="text-texto-secundario text-sm">Edicao #{edicao.numero} • {edicao.ano}</p>
        </div>
        <StatusBadge status={edicao.status} />
      </div>
      
      <div className="space-y-2 mb-6">
        <p className="text-texto-secundario">
          <span className="font-semibold">Data de Inicio:</span> {dataFormatada}
        </p>
      </div>
      
      <Link 
        href={`/edicoes/${edicao.id}`}
        className="btn-primary w-full block text-center"
      >
        👁️ Ver Detalhes
      </Link>
    </div>
  )
}
```

### 5. Criar Componente: Modal de Nova Edicao

**components/edicoes/NovaEdicaoModal.tsx:**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { edicaoSchema, EdicaoFormData } from '@/lib/validations/edicao'
import { createEdicao, getProximoNumeroEdicao } from '@/lib/services/edicoes'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function NovaEdicaoModal({ isOpen, onClose, onSuccess }: Props) {
  const anoAtual = new Date().getFullYear()
  const [formData, setFormData] = useState<EdicaoFormData>({
    nome: '',
    numero: 1,
    ano: anoAtual,
    data_inicio: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      // Buscar proximo numero automaticamente
      getProximoNumeroEdicao(anoAtual).then((numero) => {
        setFormData((prev) => ({ ...prev, numero }))
      })
    }
  }, [isOpen, anoAtual])
  
  if (!isOpen) return null
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    
    try {
      const validated = edicaoSchema.parse(formData)
      await createEdicao(validated)
      
      setFormData({
        nome: '',
        numero: 1,
        ano: anoAtual,
        data_inicio: new Date().toISOString().split('T')[0],
      })
      onSuccess()
      onClose()
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
      } else {
        alert('Erro ao criar edicao: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-cinza-card p-8 rounded-xl border-2 border-amarelo-destaque max-w-md w-full mx-4">
        <h2 className="text-2xl mb-6">🏆 Nova Edicao</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nome da Edicao *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
              placeholder="Ex: Sinuca Cup 1º Trimestre 2025"
            />
            {errors.nome && <p className="text-vermelho-erro text-sm mt-1">{errors.nome}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Numero *</label>
              <input
                type="number"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: parseInt(e.target.value) })}
                className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
              />
              {errors.numero && <p className="text-vermelho-erro text-sm mt-1">{errors.numero}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Ano *</label>
              <input
                type="number"
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
                className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
              />
              {errors.ano && <p className="text-vermelho-erro text-sm mt-1">{errors.ano}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Data de Inicio *</label>
            <input
              type="date"
              value={formData.data_inicio}
              onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
            />
            {errors.data_inicio && <p className="text-vermelho-erro text-sm mt-1">{errors.data_inicio}</p>}
          </div>
          
          <div className="flex gap-4 mt-6">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Criando...' : '✅ Criar Edicao'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### 6. Atualizar Pagina de Edicoes

**app/edicoes/page.tsx:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getEdicoes } from '@/lib/services/edicoes'
import { Edicao } from '@/types'
import EdicaoCard from '@/components/edicoes/EdicaoCard'
import NovaEdicaoModal from '@/components/edicoes/NovaEdicaoModal'

export default function EdicoesPage() {
  const [edicoes, setEdicoes] = useState<Edicao[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  
  const fetchEdicoes = async () => {
    try {
      setLoading(true)
      const data = await getEdicoes()
      setEdicoes(data)
    } catch (error: any) {
      toast.error('Erro ao carregar edicoes')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchEdicoes()
  }, [])
  
  const handleSuccess = () => {
    toast.success('✅ Edicao criada com sucesso!')
    fetchEdicoes()
  }
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">Carregando edicoes...</p>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl">🏆 Gestao de Edicoes</h2>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          ➕ Nova Edicao
        </button>
      </div>
      
      {edicoes.length === 0 ? (
        <div className="card-base text-center py-12">
          <p className="text-xl text-texto-secundario mb-4">Nenhuma edicao criada</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            ➕ Criar Primeira Edicao
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {edicoes.map((edicao) => (
            <EdicaoCard key={edicao.id} edicao={edicao} />
          ))}
        </div>
      )}
      
      <NovaEdicaoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
```

### 7. Instalar date-fns (se ainda nao instalado)

```bash
npm install date-fns
```

## Checklist de Validacao

- [ ] Listagem de edicoes funcionando
- [ ] Cards com badges de status corretas
- [ ] Modal de criacao funcionando
- [ ] Numero de edicao sugerido automaticamente
- [ ] Validacao de formulario
- [ ] Data formatada em pt-BR
- [ ] Notificacoes (toast) do Sonner funcionando
- [ ] Grid responsivo
- [ ] Link para detalhes (mesmo sem pagina ainda)

## Entregaveis

- ✅ CRUD de edicoes funcional
- ✅ Sistema de status implementado
- ✅ Validacoes corretas
- ✅ Interface intuitiva
- ✅ Pronto para Lote 5

## Proxima Etapa
➡️ LOTE 5: Sistema de Inscricoes

