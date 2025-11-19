# LOTE 5: Sistema de Inscricoes

## Objetivo
Controlar quais jogadores participarao de cada edicao

## Tarefas

### 1. Criar Servico de Inscricoes

**lib/services/inscricoes.ts:**

```typescript
import { supabase } from '@/lib/supabase'
import { Inscricao, Jogador } from '@/types'

export async function getInscricoesPorEdicao(edicaoId: string) {
  const { data, error } = await supabase
    .from('inscricoes')
    .select(`
      *,
      jogador:jogadores(*)
    `)
    .eq('edicao_id', edicaoId)
  
  if (error) throw error
  return data
}

export async function inscreverJogador(edicaoId: string, jogadorId: string) {
  const { data, error } = await supabase
    .from('inscricoes')
    .insert({
      edicao_id: edicaoId,
      jogador_id: jogadorId,
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Inscricao
}

export async function removerInscricao(edicaoId: string, jogadorId: string) {
  const { error } = await supabase
    .from('inscricoes')
    .delete()
    .eq('edicao_id', edicaoId)
    .eq('jogador_id', jogadorId)
  
  if (error) throw error
}

export async function getJogadoresDisponiveis(edicaoId: string) {
  // Buscar todos jogadores ativos
  const { data: todosJogadores, error: errorJogadores } = await supabase
    .from('jogadores')
    .select('*')
    .eq('ativo', true)
    .order('pontos_totais', { ascending: false })
  
  if (errorJogadores) throw errorJogadores
  
  // Buscar inscritos nesta edicao
  const { data: inscritos, error: errorInscritos } = await supabase
    .from('inscricoes')
    .select('jogador_id')
    .eq('edicao_id', edicaoId)
  
  if (errorInscritos) throw errorInscritos
  
  const inscritosIds = new Set(inscritos.map(i => i.jogador_id))
  
  // Filtrar jogadores nao inscritos
  const disponiveis = todosJogadores.filter(j => !inscritosIds.has(j.id))
  
  return disponiveis as Jogador[]
}
```

### 2. Criar Componente: Modal de Inscricoes

**components/inscricoes/GerenciarInscricoesModal.tsx:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Jogador } from '@/types'
import { getJogadoresDisponiveis, getInscricoesPorEdicao, inscreverJogador } from '@/lib/services/inscricoes'

type Props = {
  isOpen: boolean
  onClose: () => void
  edicaoId: string
  edicaoNome: string
}

export default function GerenciarInscricoesModal({ isOpen, onClose, edicaoId, edicaoNome }: Props) {
  const [disponiveis, setDisponiveis] = useState<Jogador[]>([])
  const [inscritos, setInscritos] = useState<Jogador[]>([])
  const [loading, setLoading] = useState(true)
  
  const fetchData = async () => {
    try {
      setLoading(true)
      const [disponiveisData, inscritosData] = await Promise.all([
        getJogadoresDisponiveis(edicaoId),
        getInscricoesPorEdicao(edicaoId),
      ])
      
      setDisponiveis(disponiveisData)
      setInscritos(inscritosData.map((i: any) => i.jogador))
    } catch (error) {
      alert('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen, edicaoId])
  
  const handleInscrever = async (jogadorId: string) => {
    try {
      await inscreverJogador(edicaoId, jogadorId)
      await fetchData() // Recarregar listas
    } catch (error) {
      alert('Erro ao inscrever jogador')
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-cinza-card p-6 rounded-xl border-2 border-amarelo-destaque max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl">📝 Gerenciar Inscricoes</h2>
          <button onClick={onClose} className="text-3xl hover:text-vermelho-erro">×</button>
        </div>
        
        <p className="text-texto-secundario mb-6">Edicao: {edicaoNome}</p>
        
        {loading ? (
          <p className="text-center py-8">Carregando...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Painel Esquerdo: Disponiveis */}
            <div>
              <h3 className="text-xl mb-4 text-texto-principal">
                👥 Jogadores Disponiveis ({disponiveis.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {disponiveis.length === 0 ? (
                  <p className="text-texto-secundario text-center py-4">
                    Todos os jogadores ja estao inscritos
                  </p>
                ) : (
                  disponiveis.map((jogador) => (
                    <div
                      key={jogador.id}
                      className="bg-cinza-medio p-3 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{jogador.nome}</p>
                        <p className="text-sm text-texto-secundario">
                          {jogador.setor} • {jogador.pontos_totais} pts
                        </p>
                      </div>
                      <button
                        onClick={() => handleInscrever(jogador.id)}
                        className="bg-verde-medio hover:bg-verde-claro text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        ➕ Inscrever
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Painel Direito: Inscritos */}
            <div>
              <h3 className="text-xl mb-4 text-verde-claro">
                ✅ Jogadores Inscritos ({inscritos.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {inscritos.length === 0 ? (
                  <p className="text-texto-secundario text-center py-4">
                    Nenhum jogador inscrito ainda
                  </p>
                ) : (
                  inscritos.map((jogador) => (
                    <div
                      key={jogador.id}
                      className="bg-verde-medio bg-opacity-20 border-2 border-verde-medio p-3 rounded-lg"
                    >
                      <p className="font-semibold">{jogador.nome}</p>
                      <p className="text-sm text-texto-secundario">
                        {jogador.setor} • {jogador.pontos_totais} pts
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-primary">
            ✅ Concluir
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 3. Criar Pagina de Detalhes da Edicao

**app/edicoes/[id]/page.tsx:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getEdicao } from '@/lib/services/edicoes'
import { getInscricoesPorEdicao } from '@/lib/services/inscricoes'
import { Edicao } from '@/types'
import StatusBadge from '@/components/edicoes/StatusBadge'
import GerenciarInscricoesModal from '@/components/inscricoes/GerenciarInscricoesModal'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function EdicaoDetalhesPage() {
  const params = useParams()
  const edicaoId = params.id as string
  
  const [edicao, setEdicao] = useState<Edicao | null>(null)
  const [inscritosCount, setInscritosCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalInscricoesOpen, setModalInscricoesOpen] = useState(false)
  
  const fetchData = async () => {
    try {
      setLoading(true)
      const [edicaoData, inscritosData] = await Promise.all([
        getEdicao(edicaoId),
        getInscricoesPorEdicao(edicaoId),
      ])
      
      setEdicao(edicaoData)
      setInscritosCount(inscritosData.length)
    } catch (error) {
      alert('Erro ao carregar edicao')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [edicaoId])
  
  if (loading) {
    return <p className="text-center py-12">Carregando...</p>
  }
  
  if (!edicao) {
    return <p className="text-center py-12">Edicao nao encontrada</p>
  }
  
  const dataFormatada = format(new Date(edicao.data_inicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-3xl">{edicao.nome}</h2>
          <StatusBadge status={edicao.status} />
        </div>
        <p className="text-texto-secundario">
          Edicao #{edicao.numero} • {edicao.ano} • Inicio: {dataFormatada}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-base">
          <h3 className="text-xl mb-4">📊 Informacoes</h3>
          <div className="space-y-3">
            <div>
              <p className="text-texto-secundario text-sm">Status</p>
              <StatusBadge status={edicao.status} />
            </div>
            <div>
              <p className="text-texto-secundario text-sm">Jogadores Inscritos</p>
              <p className="text-2xl font-bold text-amarelo-destaque">{inscritosCount}</p>
            </div>
          </div>
        </div>
        
        <div className="card-base">
          <h3 className="text-xl mb-4">⚙️ Acoes</h3>
          <div className="space-y-3">
            {edicao.status === 'inscricoes_abertas' && (
              <button
                onClick={() => setModalInscricoesOpen(true)}
                className="btn-primary w-full"
              >
                📝 Gerenciar Inscricoes
              </button>
            )}
            
            {edicao.status === 'inscricoes_abertas' && inscritosCount >= 4 && (
              <button className="btn-secondary w-full">
                🎯 Iniciar Chaveamento
              </button>
            )}
            
            {edicao.status === 'chaveamento' && (
              <button className="btn-primary w-full">
                👥 Gerenciar Duplas
              </button>
            )}
          </div>
        </div>
      </div>
      
      <GerenciarInscricoesModal
        isOpen={modalInscricoesOpen}
        onClose={() => {
          setModalInscricoesOpen(false)
          fetchData() // Atualizar contador
        }}
        edicaoId={edicaoId}
        edicaoNome={edicao.nome}
      />
    </div>
  )
}
```

## Checklist de Validacao

- [x] Modal de inscricoes abrindo
- [x] Paineis lado a lado (disponiveis vs inscritos)
- [x] Botao de inscrever funcionando
- [x] Jogador sendo transferido entre paineis
- [x] Contador de inscritos atualizando
- [x] Nao permite duplicar inscricao
- [x] Apenas jogadores ativos aparecem
- [x] Pagina de detalhes mostrando informacoes
- [x] Botao "Gerenciar Inscricoes" apenas em status correto

## Entregaveis

- ✅ Sistema de inscricoes funcional
- ✅ Interface intuitiva com 2 paineis
- ✅ Validacoes implementadas
- ✅ Pagina de detalhes da edicao
- ✅ Pronto para Lote 6


## Proxima Etapa
➡️ LOTE 6: Formacao de Duplas - Parte 1

## Progresso de implementação: **preencher aqui abaixo sempre tudo que foi feito ao final do lote**

✅ Serviço de inscrições criado (lib/services/inscricoes.ts)
  - getInscricoesPorEdicao(edicaoId): Busca inscritos com join de jogador
  - inscreverJogador(edicaoId, jogadorId): Cria inscrição
  - removerInscricao(edicaoId, jogadorId): Remove inscrição (implementado mas não usado ainda)
  - getJogadoresDisponiveis(edicaoId): Retorna jogadores ativos não inscritos
    * Busca todos jogadores ativos
    * Busca inscritos da edição
    * Filtra removendo inscritos dos disponíveis

✅ Modal GerenciarInscricoesModal criado (components/inscricoes/GerenciarInscricoesModal.tsx)
  - Layout de 2 painéis lado a lado (grid md:grid-cols-2)
  - Painel Esquerdo: Jogadores Disponíveis
    * Lista ordenada por pontuação
    * Botão "➕ Inscrever" para cada jogador
    * Contador dinâmico de disponíveis
    * Empty state quando todos inscritos
  - Painel Direito: Jogadores Inscritos
    * Fundo verde com borda
    * Contador dinâmico de inscritos
    * Empty state quando nenhum inscrito
  - Informações exibidas por jogador:
    * Nome (bold)
    * Setor • Pontuação
  - Modal responsivo com max-height e scroll
  - Botão X para fechar no header
  - Botão "Concluir" no footer
  - Recarregamento automático após inscrição

✅ Página de detalhes da edição criada (app/edicoes/[id]/page.tsx)
  - Rota dinâmica: /edicoes/[id]
  - useParams() para capturar ID da URL
  - Header com título e status badge
  - Informações da edição:
    * Nome completo
    * Número e ano
    * Data formatada em português
  - Grid 2 colunas (md:grid-cols-2):
    * Card Informações: Status + Contador de inscritos
    * Card Ações: Botões contextuais por status
  - Botões condicionais por status:
    * "Gerenciar Inscrições" (status = inscricoes_abertas)
    * "Iniciar Chaveamento" (status = inscricoes_abertas + mín. 4 inscritos)
    * "Gerenciar Duplas" (status = chaveamento)
  - Estado de loading
  - Tratamento de edição não encontrada
  - Atualização do contador após fechar modal
  - Integração com GerenciarInscricoesModal

**Arquivos Criados:**
- lib/services/inscricoes.ts (70 linhas)
- components/inscricoes/GerenciarInscricoesModal.tsx (142 linhas)
- app/edicoes/[id]/page.tsx (117 linhas)

**Funcionalidades Implementadas:**
- ✅ Sistema de inscrições com 2 painéis
- ✅ Inscrição de jogadores com um clique
- ✅ Filtragem automática de jogadores já inscritos
- ✅ Apenas jogadores ativos aparecem
- ✅ Contador de inscritos em tempo real
- ✅ Página de detalhes com rotas dinâmicas
- ✅ Botões contextuais baseados no status
- ✅ Validação de número mínimo de inscritos (4)
- ✅ Loading states
- ✅ Empty states em ambos os painéis
- ✅ Modal responsivo com scroll
- ✅ Formatação de data em português

**Integrações Realizadas:**
- ✅ Link do EdicaoCard para página de detalhes
- ✅ Comunicação entre modal e página (atualização de contador)
- ✅ Uso de componentes compartilhados (StatusBadge)

**LOTE 5 - COMPLETO! ✅**

**🎉 FASE 2 (LOTES 3-5) - COMPLETA! 🎉**

