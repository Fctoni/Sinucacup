# LOTE 6: Formacao de Duplas - Parte 1

## Objetivo
Criar duplas pelos metodos automatico e manual

## Tarefas

### 1. Criar Servico de Duplas

**lib/services/duplas.ts:**

```typescript
import { supabase } from '@/lib/supabase'
import { Dupla, DuplaComJogadores } from '@/types'
import { getInscricoesPorEdicao } from './inscricoes'

export async function getDuplasPorEdicao(edicaoId: string) {
  const { data, error } = await supabase
    .from('duplas')
    .select(`
      *,
      jogador1:jogadores!duplas_jogador1_id_fkey(*),
      jogador2:jogadores!duplas_jogador2_id_fkey(*)
    `)
    .eq('edicao_id', edicaoId)
    .order('posicao', { ascending: true })
  
  if (error) throw error
  return data as DuplaComJogadores[]
}

export async function createDupla(
  edicaoId: string,
  jogador1Id: string,
  jogador2Id: string,
  pontuacaoTotal: number,
  posicao: number
) {
  const { data: jogadores } = await supabase
    .from('jogadores')
    .select('nome')
    .in('id', [jogador1Id, jogador2Id])
  
  const nomeDupla = jogadores?.map(j => j.nome).join(' & ') || 'Dupla'
  
  const { data, error } = await supabase
    .from('duplas')
    .insert({
      edicao_id: edicaoId,
      jogador1_id: jogador1Id,
      jogador2_id: jogador2Id,
      nome_dupla: nomeDupla,
      pontuacao_total: pontuacaoTotal,
      posicao,
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Dupla
}

export async function deleteDupla(duplaId: string) {
  const { error } = await supabase
    .from('duplas')
    .delete()
    .eq('id', duplaId)
  
  if (error) throw error
}

export async function gerarDuplasAutomaticas(edicaoId: string) {
  // Buscar jogadores inscritos
  const inscritosData = await getInscricoesPorEdicao(edicaoId)
  const jogadores = inscritosData.map((i: any) => i.jogador)
  
  if (jogadores.length < 2) {
    throw new Error('Minimo 2 jogadores para formar duplas')
  }
  
  // Verificar numero par
  if (jogadores.length % 2 !== 0) {
    const sobrando = jogadores[jogadores.length - 1]
    throw new Error(`Numero impar de jogadores! Jogador sobrando: ${sobrando.nome}`)
  }
  
  // Ordenar por pontuacao (decrescente)
  const ordenados = [...jogadores].sort((a, b) => b.pontos_totais - a.pontos_totais)
  
  // Apagar duplas existentes
  await supabase
    .from('duplas')
    .delete()
    .eq('edicao_id', edicaoId)
  
  // Algoritmo de balanceamento
  const duplas = []
  const n = ordenados.length
  
  for (let i = 0; i < n / 2; i++) {
    const jogador1 = ordenados[i]
    const jogador2 = ordenados[n - 1 - i]
    const pontuacaoTotal = jogador1.pontos_totais + jogador2.pontos_totais
    
    await createDupla(edicaoId, jogador1.id, jogador2.id, pontuacaoTotal, i + 1)
    duplas.push({ jogador1, jogador2, pontuacaoTotal })
  }
  
  return duplas
}

export async function validarExclusaoDupla(duplaId: string) {
  // Verificar se dupla esta no chaveamento
  const { data: partidas, error } = await supabase
    .from('partidas')
    .select('id')
    .or(`dupla1_id.eq.${duplaId},dupla2_id.eq.${duplaId}`)
    .limit(1)
  
  if (error) throw error
  
  return partidas.length === 0 // true = pode excluir
}
```

### 2. Criar Componente: Card de Dupla

**components/duplas/DuplaCard.tsx:**

```typescript
import { DuplaComJogadores } from '@/types'

type Props = {
  dupla: DuplaComJogadores
  onDelete?: (duplaId: string) => void
  canDelete?: boolean
}

export default function DuplaCard({ dupla, onDelete, canDelete = true }: Props) {
  const handleDelete = async () => {
    if (!onDelete) return
    
    const confirmar = window.confirm(
      `Excluir dupla "${dupla.nome_dupla}"?\n\nEsta acao nao pode ser desfeita.`
    )
    
    if (confirmar) {
      onDelete(dupla.id)
    }
  }
  
  return (
    <div className="card-base">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-amarelo-destaque">
          Dupla #{dupla.posicao}
        </h3>
        {canDelete && onDelete && (
          <button
            onClick={handleDelete}
            className="text-vermelho-erro hover:bg-vermelho-erro hover:text-white px-3 py-1 rounded transition-colors"
          >
            🗑️ Excluir
          </button>
        )}
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="bg-cinza-medio p-3 rounded-lg">
          <p className="text-sm text-texto-secundario mb-1">Jogador 1</p>
          <p className="font-semibold">{dupla.jogador1?.nome}</p>
          <p className="text-xs text-texto-secundario">{dupla.jogador1?.setor}</p>
        </div>
        
        <div className="bg-cinza-medio p-3 rounded-lg">
          <p className="text-sm text-texto-secundario mb-1">Jogador 2</p>
          <p className="font-semibold">{dupla.jogador2?.nome}</p>
          <p className="text-xs text-texto-secundario">{dupla.jogador2?.setor}</p>
        </div>
      </div>
      
      <div className="bg-verde-medio bg-opacity-20 border-2 border-verde-medio p-3 rounded-lg text-center">
        <p className="text-sm text-texto-secundario">Pontuacao Total</p>
        <p className="text-2xl font-bold text-amarelo-destaque">{dupla.pontuacao_total} pts</p>
      </div>
    </div>
  )
}
```

### 3. Criar Componente: Modal de Dupla Manual

**components/duplas/CriarDuplaManualModal.tsx:**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Jogador } from '@/types'
import { getJogadores } from '@/lib/services/jogadores'
import { getInscricoesPorEdicao } from '@/lib/services/inscricoes'
import { createDupla } from '@/lib/services/duplas'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  edicaoId: string
}

export default function CriarDuplaManualModal({ isOpen, onClose, onSuccess, edicaoId }: Props) {
  const [jogador1Id, setJogador1Id] = useState('')
  const [jogador2Id, setJogador2Id] = useState('')
  const [apenasInscritos, setApenasInscritos] = useState(true)
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      fetchJogadores()
    }
  }, [isOpen, apenasInscritos])
  
  const fetchJogadores = async () => {
    try {
      if (apenasInscritos) {
        const inscritosData = await getInscricoesPorEdicao(edicaoId)
        setJogadores(inscritosData.map((i: any) => i.jogador))
      } else {
        const todosJogadores = await getJogadores()
        setJogadores(todosJogadores.filter(j => j.ativo))
      }
    } catch (error) {
      alert('Erro ao carregar jogadores')
    }
  }
  
  if (!isOpen) return null
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!jogador1Id || !jogador2Id) {
      alert('Selecione ambos os jogadores')
      return
    }
    
    if (jogador1Id === jogador2Id) {
      alert('Os dois jogadores devem ser diferentes!')
      return
    }
    
    try {
      setLoading(true)
      
      const j1 = jogadores.find(j => j.id === jogador1Id)
      const j2 = jogadores.find(j => j.id === jogador2Id)
      const pontuacaoTotal = (j1?.pontos_totais || 0) + (j2?.pontos_totais || 0)
      
      // Buscar proxima posicao
      const { data: duplasExistentes } = await supabase
        .from('duplas')
        .select('posicao')
        .eq('edicao_id', edicaoId)
        .order('posicao', { ascending: false })
        .limit(1)
      
      const proximaPosicao = duplasExistentes && duplasExistentes.length > 0
        ? duplasExistentes[0].posicao + 1
        : 1
      
      await createDupla(edicaoId, jogador1Id, jogador2Id, pontuacaoTotal, proximaPosicao)
      
      setJogador1Id('')
      setJogador2Id('')
      onSuccess()
      onClose()
    } catch (error: any) {
      alert('Erro ao criar dupla: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-cinza-card p-8 rounded-xl border-2 border-amarelo-destaque max-w-md w-full">
        <h2 className="text-2xl mb-6">👥 Criar Dupla Manualmente</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Jogador 1 *</label>
            <select
              value={jogador1Id}
              onChange={(e) => setJogador1Id(e.target.value)}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
            >
              <option value="">Selecione...</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome} ({j.pontos_totais} pts)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Jogador 2 *</label>
            <select
              value={jogador2Id}
              onChange={(e) => setJogador2Id(e.target.value)}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
            >
              <option value="">Selecione...</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome} ({j.pontos_totais} pts)
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="apenasInscritos"
              checked={apenasInscritos}
              onChange={(e) => setApenasInscritos(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="apenasInscritos" className="text-sm">
              Mostrar apenas jogadores inscritos
            </label>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Criando...' : '✅ Criar Dupla'}
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

### 4. Atualizar Pagina de Detalhes com Duplas

**app/edicoes/[id]/page.tsx (adicionar seção de duplas):**

```typescript
// ... imports existentes
import { getDuplasPorEdicao, gerarDuplasAutomaticas, deleteDupla, validarExclusaoDupla } from '@/lib/services/duplas'
import DuplaCard from '@/components/duplas/DuplaCard'
import CriarDuplaManualModal from '@/components/duplas/CriarDuplaManualModal'

// ... adicionar states
const [duplas, setDuplas] = useState<DuplaComJogadores[]>([])
const [modalDuplaManualOpen, setModalDuplaManualOpen] = useState(false)

// Adicionar fetchDuplas no fetchData
const fetchDuplas = async () => {
  const duplasData = await getDuplasPorEdicao(edicaoId)
  setDuplas(duplasData)
}

// Handler para gerar duplas automaticas
const handleGerarDuplasAutomaticas = async () => {
  if (duplas.length > 0) {
    const confirmar = window.confirm(
      '⚠️ Ja existem duplas! Deseja sobrescrever?\n\nIsso apagara as duplas atuais e o chaveamento.'
    )
    if (!confirmar) return
  }
  
  try {
    await gerarDuplasAutomaticas(edicaoId)
    alert('✅ Duplas geradas com sucesso!')
    fetchDuplas()
  } catch (error: any) {
    alert(error.message)
  }
}

// Handler para excluir dupla
const handleExcluirDupla = async (duplaId: string) => {
  try {
    const podeExcluir = await validarExclusaoDupla(duplaId)
    
    if (!podeExcluir) {
      alert('❌ Nao e possivel excluir! Dupla ja esta no chaveamento.\n\n💡 Dica: Apague o chaveamento primeiro.')
      return
    }
    
    await deleteDupla(duplaId)
    alert('✅ Dupla excluida com sucesso!')
    fetchDuplas()
  } catch (error: any) {
    alert('Erro ao excluir dupla: ' + error.message)
  }
}

// Adicionar secao de duplas no JSX
{edicao.status === 'chaveamento' && (
  <div className="mt-8">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl">👥 Duplas Formadas ({duplas.length})</h3>
      <div className="flex gap-3">
        <button onClick={handleGerarDuplasAutomaticas} className="btn-primary">
          🤖 Gerar Automaticamente
        </button>
        <button onClick={() => setModalDuplaManualOpen(true)} className="btn-secondary">
          ➕ Criar Manual
        </button>
      </div>
    </div>
    
    {duplas.length === 0 ? (
      <div className="card-base text-center py-8">
        <p className="text-texto-secundario">Nenhuma dupla formada ainda</p>
      </div>
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {duplas.map((dupla) => (
          <DuplaCard
            key={dupla.id}
            dupla={dupla}
            onDelete={handleExcluirDupla}
          />
        ))}
      </div>
    )}
  </div>
)}

<CriarDuplaManualModal
  isOpen={modalDuplaManualOpen}
  onClose={() => setModalDuplaManualOpen(false)}
  onSuccess={() => {
    alert('✅ Dupla criada com sucesso!')
    fetchDuplas()
  }}
  edicaoId={edicaoId}
/>
```

## Checklist de Validacao

- [ ] Botao de gerar duplas automaticas funcionando
- [ ] Algoritmo de balanceamento correto (1º+ultimo, 2º+penultimo)
- [ ] Aviso de numero impar de jogadores
- [ ] Confirmacao ao sobrescrever duplas existentes
- [ ] Modal de criacao manual funcionando
- [ ] Dropdowns com jogadores carregando
- [ ] Checkbox "apenas inscritos" funcionando
- [ ] Validacao: jogadores diferentes
- [ ] Botao de excluir dupla funcionando
- [ ] Bloqueio de exclusao se dupla esta no chaveamento
- [ ] Cards de dupla exibindo informacoes corretas

## Entregaveis

- ✅ Geracao automatica de duplas
- ✅ Criacao manual de duplas
- ✅ Exclusao com validacoes
- ✅ Interface visual completa
- ✅ Pronto para Lote 7

## Tempo Estimado
⏱️ 120-150 minutos

## Proxima Etapa
➡️ LOTE 7: Formacao de Duplas - Parte 2 (Drag & Drop)

