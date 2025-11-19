# LOTE 8: Geracao de Chaveamento (Bracket)

## Objetivo
Criar chaveamento automatico com sistema de BYE

## Tarefas

### 1. Criar Servico de Partidas

**lib/services/partidas.ts:**

```typescript
import { supabase } from '@/lib/supabase'
import { Partida, PartidaComDuplas } from '@/types'
import { getDuplasPorEdicao } from './duplas'

export async function getPartidasPorEdicao(edicaoId: string) {
  const { data, error } = await supabase
    .from('partidas')
    .select(`
      *,
      dupla1:duplas!partidas_dupla1_id_fkey(
        *,
        jogador1:jogadores!duplas_jogador1_id_fkey(*),
        jogador2:jogadores!duplas_jogador2_id_fkey(*)
      ),
      dupla2:duplas!partidas_dupla2_id_fkey(
        *,
        jogador1:jogadores!duplas_jogador1_id_fkey(*),
        jogador2:jogadores!duplas_jogador2_id_fkey(*)
      ),
      vencedor:duplas!partidas_vencedor_id_fkey(
        *,
        jogador1:jogadores!duplas_jogador1_id_fkey(*),
        jogador2:jogadores!duplas_jogador2_id_fkey(*)
      )
    `)
    .eq('edicao_id', edicaoId)
    .order('fase', { ascending: true })
    .order('posicao', { ascending: true })
  
  if (error) throw error
  return data as PartidaComDuplas[]
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0
}

function getNextPowerOfTwo(n: number): number {
  let power = 1
  while (power < n) {
    power *= 2
  }
  return power
}

function getFaseInicial(numDuplas: number): string {
  if (numDuplas <= 2) return 'final'
  if (numDuplas <= 4) return 'semifinal'
  if (numDuplas <= 8) return 'quartas'
  return 'oitavas'
}

export async function gerarChaveamento(edicaoId: string) {
  // Buscar duplas
  const duplas = await getDuplasPorEdicao(edicaoId)
  
  if (duplas.length < 2) {
    throw new Error('Minimo 2 duplas para gerar chaveamento')
  }
  
  // Apagar chaveamento e byes anteriores
  await Promise.all([
    supabase.from('partidas').delete().eq('edicao_id', edicaoId),
    supabase.from('byes_temporarios').delete().eq('edicao_id', edicaoId),
  ])
  
  const numDuplas = duplas.length
  
  // Verificar se e potencia de 2
  if (isPowerOfTwo(numDuplas)) {
    // Caso simples: todas jogam
    return await gerarChaveamentoSimples(edicaoId, duplas)
  } else {
    // Caso com BYE
    return await gerarChaveamentoComBye(edicaoId, duplas)
  }
}

async function gerarChaveamentoSimples(edicaoId: string, duplas: any[]) {
  const fase = getFaseInicial(duplas.length)
  const partidas = []
  
  for (let i = 0; i < duplas.length; i += 2) {
    const partida = {
      edicao_id: edicaoId,
      fase,
      dupla1_id: duplas[i].id,
      dupla2_id: duplas[i + 1].id,
      vencedor_id: null,
      posicao: i / 2 + 1,
      is_bye: false,
    }
    partidas.push(partida)
  }
  
  const { error } = await supabase.from('partidas').insert(partidas)
  if (error) throw error
  
  return { byes: [], fase }
}

async function gerarChaveamentoComBye(edicaoId: string, duplas: any[]) {
  const numDuplas = duplas.length
  const proxPotencia = getNextPowerOfTwo(numDuplas)
  const numByes = proxPotencia - numDuplas
  const numJogam = numDuplas - numByes
  
  // Ordenar duplas por pontuacao (piores recebem BYE)
  const ordenadas = [...duplas].sort((a, b) => a.pontuacao_total - b.pontuacao_total)
  
  const duplasComBye = ordenadas.slice(0, numByes)
  const duplasQueJogam = ordenadas.slice(numByes)
  
  // Salvar byes temporarios
  const byes = duplasComBye.map(d => ({
    edicao_id: edicaoId,
    dupla_id: d.id,
  }))
  await supabase.from('byes_temporarios').insert(byes)
  
  // Criar partidas da primeira fase
  const fase = getFaseInicial(proxPotencia)
  const partidas = []
  
  for (let i = 0; i < duplasQueJogam.length; i += 2) {
    const partida = {
      edicao_id: edicaoId,
      fase,
      dupla1_id: duplasQueJogam[i].id,
      dupla2_id: duplasQueJogam[i + 1]?.id || null,
      vencedor_id: null,
      posicao: i / 2 + 1,
      is_bye: false,
    }
    partidas.push(partida)
  }
  
  const { error } = await supabase.from('partidas').insert(partidas)
  if (error) throw error
  
  return {
    byes: duplasComBye.map(d => d.nome_dupla),
    fase,
    numByes,
  }
}

export async function getByesDaEdicao(edicaoId: string) {
  const { data, error } = await supabase
    .from('byes_temporarios')
    .select(`
      *,
      dupla:duplas(*)
    `)
    .eq('edicao_id', edicaoId)
  
  if (error) throw error
  return data
}
```

### 2. Criar Componente: Card de Partida

**components/chaveamento/PartidaCard.tsx:**

```typescript
import { PartidaComDuplas } from '@/types'

type Props = {
  partida: PartidaComDuplas
  onClick?: () => void
}

export default function PartidaCard({ partida, onClick }: Props) {
  const podeJogar = partida.dupla1_id && partida.dupla2_id && !partida.vencedor_id
  const jaFinalizada = partida.vencedor_id !== null
  
  return (
    <div
      onClick={onClick}
      className={`
        bg-cinza-card p-4 rounded-lg border-2 transition-all
        ${podeJogar ? 'border-verde-medio hover:border-amarelo-destaque cursor-pointer hover:scale-105' : 'border-cinza-medio'}
        ${jaFinalizada ? 'opacity-90' : ''}
      `}
    >
      {/* Dupla 1 */}
      <div className={`
        p-3 rounded mb-2 transition-all
        ${partida.vencedor_id === partida.dupla1_id ? 'bg-verde-medio text-white' : 'bg-cinza-medio'}
        ${partida.vencedor_id && partida.vencedor_id !== partida.dupla1_id ? 'opacity-50' : ''}
      `}>
        {partida.dupla1 ? (
          <div>
            <p className="font-semibold text-sm">{partida.dupla1.nome_dupla}</p>
            {partida.vencedor_id === partida.dupla1_id && <span className="text-xs">🏆 Vencedor</span>}
          </div>
        ) : (
          <p className="text-texto-secundario text-sm italic">TBD</p>
        )}
      </div>
      
      <div className="text-center text-xs text-texto-secundario my-1">VS</div>
      
      {/* Dupla 2 */}
      <div className={`
        p-3 rounded transition-all
        ${partida.vencedor_id === partida.dupla2_id ? 'bg-verde-medio text-white' : 'bg-cinza-medio'}
        ${partida.vencedor_id && partida.vencedor_id !== partida.dupla2_id ? 'opacity-50' : ''}
      `}>
        {partida.dupla2 ? (
          <div>
            <p className="font-semibold text-sm">{partida.dupla2.nome_dupla}</p>
            {partida.vencedor_id === partida.dupla2_id && <span className="text-xs">🏆 Vencedor</span>}
          </div>
        ) : (
          <p className="text-texto-secundario text-sm italic">TBD</p>
        )}
      </div>
    </div>
  )
}
```

### 3. Criar Componente: Bracket Visual

**components/chaveamento/Bracket.tsx:**

```typescript
'use client'

import { PartidaComDuplas } from '@/types'
import PartidaCard from './PartidaCard'

type Props = {
  partidas: PartidaComDuplas[]
  onPartidaClick?: (partida: PartidaComDuplas) => void
}

const fasesOrdem = ['oitavas', 'quartas', 'semifinal', 'final']

export default function Bracket({ partidas, onPartidaClick }: Props) {
  const partidasPorFase = partidas.reduce((acc, partida) => {
    if (!acc[partida.fase]) acc[partida.fase] = []
    acc[partida.fase].push(partida)
    return acc
  }, {} as Record<string, PartidaComDuplas[]>)
  
  const fasesPresentes = fasesOrdem.filter(f => partidasPorFase[f])
  
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {fasesPresentes.map((fase) => (
          <div key={fase} className="min-w-[250px]">
            <h4 className="text-xl font-bold text-amarelo-destaque mb-4 capitalize">
              {fase}
            </h4>
            <div className="space-y-4">
              {partidasPorFase[fase].map((partida) => (
                <PartidaCard
                  key={partida.id}
                  partida={partida}
                  onClick={() => onPartidaClick?.(partida)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 4. Atualizar Pagina com Chaveamento

**app/edicoes/[id]/page.tsx (adicionar chaveamento):**

```typescript
import { gerarChaveamento, getPartidasPorEdicao, getByesDaEdicao } from '@/lib/services/partidas'
import Bracket from '@/components/chaveamento/Bracket'

// States
const [partidas, setPartidas] = useState<PartidaComDuplas[]>([])
const [byes, setByes] = useState<any[]>([])

// Fetch partidas
const fetchPartidas = async () => {
  const [partidasData, byesData] = await Promise.all([
    getPartidasPorEdicao(edicaoId),
    getByesDaEdicao(edicaoId),
  ])
  setPartidas(partidasData)
  setByes(byesData)
}

// Handler gerar chaveamento
const handleGerarChaveamento = async () => {
  if (partidas.length > 0) {
    const confirmar = window.confirm(
      '⚠️ Ja existe chaveamento! Deseja sobrescrever?\n\nIsso apagara todas as partidas.'
    )
    if (!confirmar) return
  }
  
  if (duplas.length < 2) {
    alert('❌ Minimo 2 duplas para gerar chaveamento')
    return
  }
  
  try {
    const resultado = await gerarChaveamento(edicaoId)
    
    if (resultado.byes && resultado.byes.length > 0) {
      alert(`ℹ️ ${resultado.numByes} dupla(s) com BYE: ${resultado.byes.join(', ')}`)
    }
    
    alert('✅ Chaveamento gerado com sucesso!')
    fetchPartidas()
  } catch (error: any) {
    alert('Erro ao gerar chaveamento: ' + error.message)
  }
}

// No JSX (adicionar secao de chaveamento)
{edicao.status === 'chaveamento' && (
  <div className="mt-8">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl">🎯 Chaveamento</h3>
      <button onClick={handleGerarChaveamento} className="btn-primary">
        🎯 Gerar Chaveamento
      </button>
    </div>
    
    {byes.length > 0 && (
      <div className="bg-azul-info bg-opacity-20 border-2 border-azul-info p-4 rounded-lg mb-6">
        <p className="font-semibold">ℹ️ Duplas com BYE (passam direto):</p>
        <p className="text-sm">{byes.map(b => b.dupla?.nome_dupla).join(', ')}</p>
      </div>
    )}
    
    {partidas.length === 0 ? (
      <div className="card-base text-center py-8">
        <p className="text-texto-secundario">Chaveamento ainda nao foi gerado</p>
      </div>
    ) : (
      <Bracket partidas={partidas} />
    )}
  </div>
)}
```

## Checklist de Validacao

- [ ] Botao "Gerar Chaveamento" funcionando
- [ ] Validacao: minimo 2 duplas
- [ ] Confirmacao ao sobrescrever chaveamento
- [ ] Chaveamento simples (potencia de 2) funcionando
- [ ] Chaveamento com BYE funcionando
- [ ] Calculo correto de numero de byes
- [ ] Piores duplas recebendo BYE
- [ ] Banner azul informando duplas com BYE
- [ ] Bracket visual renderizando
- [ ] Colunas por fase (oitavas, quartas, semi, final)
- [ ] Scroll horizontal funcionando
- [ ] Cards de partidas exibindo duplas corretas
- [ ] "TBD" aparecendo quando dupla nao definida

## Entregaveis

- ✅ Algoritmo de chaveamento completo
- ✅ Sistema de BYE automatico
- ✅ Bracket visual funcionando
- ✅ Validacoes implementadas
- ✅ Pronto para Lote 9

## Tempo Estimado
⏱️ 150-180 minutos

## Proxima Etapa
➡️ LOTE 9: Inicio do Campeonato e Travas

