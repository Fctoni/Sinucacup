# LOTE 14: Ranking Global

## Objetivo
Exibir classificacao dos jogadores com podio e tabela completa

## Tarefas

### 1. Criar Servico de Ranking

**lib/services/jogadores.ts (adicionar):**

```typescript
export async function getRanking() {
  const { data, error } = await supabase
    .from('jogadores')
    .select('*')
    .eq('ativo', true)
    .order('pontos_totais', { ascending: false })
    .order('vitorias', { ascending: false })
    .order('nome', { ascending: true })
  
  if (error) throw error
  return data as Jogador[]
}

export async function getTop3() {
  const ranking = await getRanking()
  return ranking.slice(0, 3)
}

export async function getEstatisticasGerais() {
  const { data: jogadores } = await supabase
    .from('jogadores')
    .select('pontos_totais, vitorias, participacoes')
    .eq('ativo', true)
  
  if (!jogadores) return null
  
  const totalPontos = jogadores.reduce((sum, j) => sum + j.pontos_totais, 0)
  const totalVitorias = jogadores.reduce((sum, j) => sum + j.vitorias, 0)
  const totalParticipacoes = jogadores.reduce((sum, j) => sum + j.participacoes, 0)
  const mediaParticipacoes = jogadores.length > 0 ? totalParticipacoes / jogadores.length : 0
  
  return {
    totalJogadores: jogadores.length,
    totalPontos,
    totalVitorias,
    mediaParticipacoes: Math.round(mediaParticipacoes * 10) / 10,
  }
}
```

### 2. Criar Componente: Podio

**components/ranking/Podio.tsx:**

```typescript
import { Jogador } from '@/types'
import Image from 'next/image'

type Props = {
  top3: Jogador[]
}

export default function Podio({ top3 }: Props) {
  const [primeiro, segundo, terceiro] = top3
  
  if (!primeiro) return null
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* 2º Lugar */}
      {segundo && (
        <div className="order-2 md:order-1 flex flex-col items-center">
          <div className="bg-gradient-to-br from-prata to-gray-400 p-6 rounded-xl w-full text-center border-4 border-prata shadow-card">
            <div className="text-6xl mb-3">🥈</div>
            
            {segundo.foto_url ? (
              <Image
                src={segundo.foto_url}
                alt={segundo.nome}
                width={80}
                height={80}
                className="rounded-full mx-auto mb-3 border-4 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-3 text-4xl">
                👤
              </div>
            )}
            
            <h3 className="text-2xl font-bold text-cinza-escuro mb-1">{segundo.nome}</h3>
            <p className="text-sm text-cinza-escuro opacity-70 mb-3">{segundo.setor}</p>
            
            <div className="bg-white bg-opacity-90 rounded-lg p-3">
              <p className="text-4xl font-bold text-prata">{segundo.pontos_totais}</p>
              <p className="text-sm text-cinza-escuro">pontos</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-white bg-opacity-70 rounded p-2">
                <p className="text-xs text-cinza-escuro">Vitorias</p>
                <p className="font-bold text-cinza-escuro">{segundo.vitorias}</p>
              </div>
              <div className="bg-white bg-opacity-70 rounded p-2">
                <p className="text-xs text-cinza-escuro">Jogos</p>
                <p className="font-bold text-cinza-escuro">{segundo.participacoes}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 1º Lugar */}
      <div className="order-1 md:order-2 flex flex-col items-center">
        <div className="bg-gradient-to-br from-ouro via-yellow-400 to-ouro p-8 rounded-xl w-full text-center border-4 border-ouro shadow-card-hover relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-ouro to-yellow-600 opacity-20 animate-pulse" />
          
          <div className="relative z-10">
            <div className="text-7xl mb-3 animate-bounce">🥇</div>
            
            {primeiro.foto_url ? (
              <Image
                src={primeiro.foto_url}
                alt={primeiro.nome}
                width={100}
                height={100}
                className="rounded-full mx-auto mb-4 border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-4 text-5xl">
                👤
              </div>
            )}
            
            <h3 className="text-3xl font-bold text-cinza-escuro mb-1">{primeiro.nome}</h3>
            <p className="text-sm text-cinza-escuro opacity-70 mb-4">{primeiro.setor}</p>
            
            <div className="bg-white bg-opacity-90 rounded-lg p-4">
              <p className="text-5xl font-bold text-ouro">{primeiro.pontos_totais}</p>
              <p className="text-sm text-cinza-escuro">pontos</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-white bg-opacity-80 rounded p-3">
                <p className="text-xs text-cinza-escuro">Vitorias</p>
                <p className="text-xl font-bold text-cinza-escuro">{primeiro.vitorias}</p>
              </div>
              <div className="bg-white bg-opacity-80 rounded p-3">
                <p className="text-xs text-cinza-escuro">Jogos</p>
                <p className="text-xl font-bold text-cinza-escuro">{primeiro.participacoes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 3º Lugar */}
      {terceiro && (
        <div className="order-3 flex flex-col items-center">
          <div className="bg-gradient-to-br from-bronze to-amber-700 p-6 rounded-xl w-full text-center border-4 border-bronze shadow-card">
            <div className="text-6xl mb-3">🥉</div>
            
            {terceiro.foto_url ? (
              <Image
                src={terceiro.foto_url}
                alt={terceiro.nome}
                width={80}
                height={80}
                className="rounded-full mx-auto mb-3 border-4 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-3 text-4xl">
                👤
              </div>
            )}
            
            <h3 className="text-2xl font-bold text-white mb-1">{terceiro.nome}</h3>
            <p className="text-sm text-white opacity-70 mb-3">{terceiro.setor}</p>
            
            <div className="bg-white bg-opacity-90 rounded-lg p-3">
              <p className="text-4xl font-bold text-bronze">{terceiro.pontos_totais}</p>
              <p className="text-sm text-cinza-escuro">pontos</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-white bg-opacity-70 rounded p-2">
                <p className="text-xs text-cinza-escuro">Vitorias</p>
                <p className="font-bold text-cinza-escuro">{terceiro.vitorias}</p>
              </div>
              <div className="bg-white bg-opacity-70 rounded p-2">
                <p className="text-xs text-cinza-escuro">Jogos</p>
                <p className="font-bold text-cinza-escuro">{terceiro.participacoes}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 3. Criar Componente: Tabela de Ranking

**components/ranking/TabelaRanking.tsx:**

```typescript
import { Jogador } from '@/types'

type Props = {
  jogadores: Jogador[]
}

export default function TabelaRanking({ jogadores }: Props) {
  const getMedalha = (posicao: number) => {
    if (posicao === 1) return '🥇'
    if (posicao === 2) return '🥈'
    if (posicao === 3) return '🥉'
    return posicao
  }
  
  return (
    <div className="bg-cinza-card rounded-xl overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-verde-medio text-white sticky top-0">
            <tr>
              <th className="px-6 py-4 text-left font-bold">Pos.</th>
              <th className="px-6 py-4 text-left font-bold">Jogador</th>
              <th className="px-6 py-4 text-left font-bold">Setor</th>
              <th className="px-6 py-4 text-center font-bold">Pontos</th>
              <th className="px-6 py-4 text-center font-bold">Vitorias</th>
              <th className="px-6 py-4 text-center font-bold">Jogos</th>
            </tr>
          </thead>
          <tbody>
            {jogadores.map((jogador, index) => {
              const posicao = index + 1
              const isTop3 = posicao <= 3
              
              return (
                <tr
                  key={jogador.id}
                  className={`
                    border-b border-cinza-medio transition-colors hover:bg-cinza-medio
                    ${isTop3 ? 'bg-verde-medio bg-opacity-10' : ''}
                  `}
                >
                  <td className="px-6 py-4">
                    <span className={`text-xl ${isTop3 ? 'font-bold' : ''}`}>
                      {getMedalha(posicao)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-semibold ${isTop3 ? 'text-amarelo-destaque' : ''}`}>
                      {jogador.nome}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-texto-secundario">{jogador.setor}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-2xl font-bold text-amarelo-destaque">
                      {jogador.pontos_totais}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-lg text-verde-claro">{jogador.vitorias}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-lg text-azul-info">{jogador.participacoes}</p>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {jogadores.length === 0 && (
        <div className="text-center py-12 text-texto-secundario">
          Nenhum jogador com pontuacao ainda
        </div>
      )}
    </div>
  )
}
```

### 4. Criar Componente: Estatisticas Gerais

**components/ranking/EstatisticasGerais.tsx:**

```typescript
type Props = {
  stats: {
    totalJogadores: number
    totalPontos: number
    totalVitorias: number
    mediaParticipacoes: number
  }
}

export default function EstatisticasGerais({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-cinza-card p-4 rounded-xl text-center">
        <p className="text-3xl mb-2">👥</p>
        <p className="text-3xl font-bold text-amarelo-destaque">{stats.totalJogadores}</p>
        <p className="text-sm text-texto-secundario">Jogadores</p>
      </div>
      
      <div className="bg-cinza-card p-4 rounded-xl text-center">
        <p className="text-3xl mb-2">⭐</p>
        <p className="text-3xl font-bold text-amarelo-destaque">{stats.totalPontos}</p>
        <p className="text-sm text-texto-secundario">Pontos Totais</p>
      </div>
      
      <div className="bg-cinza-card p-4 rounded-xl text-center">
        <p className="text-3xl mb-2">🏆</p>
        <p className="text-3xl font-bold text-verde-claro">{stats.totalVitorias}</p>
        <p className="text-sm text-texto-secundario">Campeonatos</p>
      </div>
      
      <div className="bg-cinza-card p-4 rounded-xl text-center">
        <p className="text-3xl mb-2">📊</p>
        <p className="text-3xl font-bold text-azul-info">{stats.mediaParticipacoes}</p>
        <p className="text-sm text-texto-secundario">Media Jogos</p>
      </div>
    </div>
  )
}
```

### 5. Criar Pagina de Ranking

**app/ranking/page.tsx:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getRanking, getTop3, getEstatisticasGerais } from '@/lib/services/jogadores'
import { Jogador } from '@/types'
import Podio from '@/components/ranking/Podio'
import TabelaRanking from '@/components/ranking/TabelaRanking'
import EstatisticasGerais from '@/components/ranking/EstatisticasGerais'

export default function RankingPage() {
  const [ranking, setRanking] = useState<Jogador[]>([])
  const [top3, setTop3] = useState<Jogador[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchRanking()
  }, [])
  
  const fetchRanking = async () => {
    try {
      setLoading(true)
      const [rankingData, top3Data, statsData] = await Promise.all([
        getRanking(),
        getTop3(),
        getEstatisticasGerais(),
      ])
      
      setRanking(rankingData)
      setTop3(top3Data)
      setStats(statsData)
    } catch (error) {
      alert('Erro ao carregar ranking')
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">Carregando ranking...</p>
      </div>
    )
  }
  
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-5xl mb-4">📈 Ranking Global</h1>
        <p className="text-texto-secundario text-lg">
          Classificacao geral dos jogadores - Ano atual
        </p>
      </div>
      
      {stats && <EstatisticasGerais stats={stats} />}
      
      <Podio top3={top3} />
      
      <div className="mb-6">
        <h3 className="text-2xl mb-4">📊 Classificacao Completa</h3>
      </div>
      
      <TabelaRanking jogadores={ranking} />
    </div>
  )
}
```

## Checklist de Validacao

- [ ] Pagina de ranking carregando
- [ ] Podio visual com 3 degraus
- [ ] 1º lugar maior e dourado
- [ ] 2º lugar prateado
- [ ] 3º lugar bronze
- [ ] Fotos ou avatares aparecendo
- [ ] Estatisticas no podio (pontos, vitorias, jogos)
- [ ] Estatisticas gerais aparecendo
- [ ] Tabela completa de ranking
- [ ] Medalhas nas 3 primeiras posicoes
- [ ] Top 3 destacado na tabela
- [ ] Ordenacao correta (pontos > vitorias > nome)
- [ ] Hover effect nas linhas
- [ ] Responsivo (podio em coluna no mobile)

## Entregaveis

- ✅ Ranking completo e visual
- ✅ Podio gamificado
- ✅ Tabela detalhada
- ✅ Estatisticas gerais
- ✅ Pronto para Lote 15

## Tempo Estimado
⏱️ 90-120 minutos

## Proxima Etapa
➡️ LOTE 15: Polimento e Testes

