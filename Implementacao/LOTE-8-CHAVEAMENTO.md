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

---

## MELHORIAS VISUAIS DO BRACKET (Implementado posteriormente)

### Problema Identificado
O bracket visual inicial estava funcional, mas não tinha o visual de "Copa do Mundo" com linhas conectoras profissionais. As linhas não estavam perfeitamente alinhadas com os centros dos cards de partidas.

### Solução Implementada

#### 1. Sistema de Medição Real com Refs

**Modificado `PartidaCard.tsx`:**
- Adicionado suporte para `innerRef` como prop
- Ref aplicado diretamente na div branca principal (`bg-white border-2 rounded-lg`)
- Também aplicado no card BYE (`bg-blue-50 border-2 border-blue-300`)

```typescript
type Props = {
  partida: PartidaComDuplas
  onClick?: () => void
  onEdit?: () => void
  statusEdicao?: string
  innerRef?: React.Ref<HTMLDivElement>  // ← NOVO
}

export default function PartidaCard({ partida, onClick, onEdit, statusEdicao, innerRef }: Props) {
  // ... código existente ...
  
  // Card de BYE com ref
  if (isBye) {
    return (
      <div className="relative">
        <div ref={innerRef} className="bg-blue-50 border-2 border-blue-300 rounded-lg overflow-hidden shadow-md">
          {/* ... conteúdo ... */}
        </div>
      </div>
    )
  }
  
  // Card normal com ref
  return (
    <div className="relative">
      {/* ... botões ... */}
      <div
        ref={innerRef}  // ← REF NA DIV BRANCA
        onClick={handleClick}
        className="bg-white border-2 rounded-lg overflow-hidden transition-all shadow-md"
      >
        {/* ... conteúdo ... */}
      </div>
    </div>
  )
}
```

#### 2. Bracket com Linhas SVG Dinâmicas

**Modificado `Bracket.tsx`:**

**A) Sistema de Medição Real:**
```typescript
// Refs para MEDIR as posições reais
const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
const containerRef = useRef<HTMLDivElement | null>(null)
const [cardPositions, setCardPositions] = useState<Record<string, CardPosition>>({})

// Altura estimada dos cards (APENAS para posicionamento inicial)
const CARD_HEIGHT = 120
const SPACING = 40

// Calcular posição ESTIMADA do CENTRO (para posicionamento inicial)
const calcularCentroY = (faseIndex: number, partidaIndex: number): number => {
  if (faseIndex === 0) {
    return partidaIndex * (CARD_HEIGHT + SPACING) + (CARD_HEIGHT / 2)
  }
  
  const faseAnterior = fasesPresentes[faseIndex - 1]
  const partidasFaseAnterior = partidasPorFase[faseAnterior]
  
  const card1Index = partidaIndex * 2
  const card2Index = partidaIndex * 2 + 1
  
  const centro1 = calcularCentroY(faseIndex - 1, card1Index)
  const centro2 = card2Index < partidasFaseAnterior.length 
    ? calcularCentroY(faseIndex - 1, card2Index)
    : centro1
  
  return (centro1 + centro2) / 2
}

// MEDIR as posições REAIS após render
useEffect(() => {
  const measurePositions = () => {
    if (!containerRef.current) return
    
    const positions: Record<string, CardPosition> = {}
    const containerRect = containerRef.current.getBoundingClientRect()
    
    Object.entries(cardRefs.current).forEach(([id, element]) => {
      if (element) {
        const rect = element.getBoundingClientRect()
        
        // Posições REAIS medidas
        positions[id] = {
          top: rect.top - containerRect.top,
          height: rect.height,
          centerY: rect.top - containerRect.top + rect.height / 2
        }
      }
    })
    
    setCardPositions(positions)
  }
  
  const timer = setTimeout(measurePositions, 200)
  window.addEventListener('resize', measurePositions)
  
  return () => {
    clearTimeout(timer)
    window.removeEventListener('resize', measurePositions)
  }
}, [partidas])
```

**B) Posicionamento Absoluto com Média dos Centros:**
```typescript
// Partidas posicionadas absolutamente
<div className="relative z-10" style={{ minHeight: '800px', width: '240px' }}>
  {partidasFase.map((partida, index) => {
    const centroY = calcularCentroY(faseIndex, index)
    const topPosition = centroY - (CARD_HEIGHT / 2)
    
    return (
      <div 
        key={partida.id}
        className="absolute w-full"
        style={{ top: `${topPosition}px` }}
      >
        <PartidaCard
          innerRef={(el) => { cardRefs.current[partida.id] = el }}
          partida={partida}
          onClick={() => onPartidaClick?.(partida)}
          onEdit={() => onPartidaEdit?.(partida)}
          statusEdicao={statusEdicao}
        />
      </div>
    )
  })}
</div>
```

**C) Linhas SVG com Posições Medidas:**
```typescript
{/* Linhas conectoras - usando posições MEDIDAS REAIS */}
{temProximaFase && Object.keys(cardPositions).length > 0 && (() => {
  const proximaFase = fasesPresentes[faseIndex + 1]
  const partidasProximaFase = partidasPorFase[proximaFase]
  
  return (
    <div className="hidden md:block relative" style={{ width: '80px', minHeight: '800px' }}>
      <svg width="80" height="2000" className="absolute left-0 top-0" style={{ overflow: 'visible' }}>
        {Array.from({ length: Math.ceil(numPartidas / 2) }).map((_, pairIndex) => {
          const partida1 = partidasFase[pairIndex * 2]
          const partida2 = partidasFase[pairIndex * 2 + 1]
          const partidaDestino = partidasProximaFase?.[pairIndex]
          
          // Usar posições MEDIDAS REAIS
          const pos1 = partida1 ? cardPositions[partida1.id] : null
          const pos2 = partida2 ? cardPositions[partida2.id] : null
          const posDestino = partidaDestino ? cardPositions[partidaDestino.id] : null
          
          if (!pos1 || !posDestino) return null
          
          // Centro Y REAL medido
          const y1 = pos1.centerY
          const y2 = pos2 ? pos2.centerY : y1
          const yDestino = posDestino.centerY
          
          return (
            <g key={pairIndex}>
              {/* Linha horizontal saindo do centro REAL da partida 1 */}
              <line x1="0" y1={y1} x2="30" y2={y1} stroke="#9ca3af" strokeWidth="3" />
              
              {/* Linha horizontal saindo do centro REAL da partida 2 */}
              {pos2 && <line x1="0" y1={y2} x2="30" y2={y2} stroke="#9ca3af" strokeWidth="3" />}
              
              {/* Linha vertical conectando os dois centros REAIS */}
              {pos2 && <line x1="30" y1={y1} x2="30" y2={y2} stroke="#9ca3af" strokeWidth="3" />}
              
              {/* Linha horizontal indo para o centro REAL da partida de destino */}
              <line x1="30" y1={yDestino} x2="80" y2={yDestino} stroke="#9ca3af" strokeWidth="3" />
            </g>
          )
        })}
      </svg>
    </div>
  )
})()}
```

### Resultado Final

✅ **Posicionamento dos Cards:**
- Cards posicionados absolutamente com base na média dos centros das partidas anteriores
- Semifinal fica exatamente no meio entre as duas quartas que a alimentam
- Final fica exatamente no meio entre as duas semifinais

✅ **Linhas Conectoras:**
- Linhas SVG desenhadas usando `getBoundingClientRect()` para medir posições reais
- Saem **exatamente do centro** da div branca de cada partida (ponto de partida)
- Entram **exatamente no centro** da div branca da partida de destino (ponto de chegada)
- Alinhamento perfeito independente do tamanho da tela
- Responsivo com listener de resize

✅ **Visual Profissional:**
- Estilo "Copa do Mundo" com linhas conectoras limpas
- Cores cinza médio (`#9ca3af`) para as linhas
- Espessura de 3px para boa visibilidade
- Alinhamento pixel-perfect

### Aprendizados Importantes

1. **Não "imaginar" posições**: Sempre medir posições reais com `getBoundingClientRect()` ao invés de usar valores estimados
2. **Refs no elemento correto**: Aplicar ref na div que você realmente quer medir (não em wrappers)
3. **Delay no useEffect**: Aguardar 200ms para garantir que tudo foi renderizado antes de medir
4. **Listener de resize**: Recalcular posições quando a janela redimensionar
5. **Position absolute**: Usar posicionamento absoluto para ter controle total sobre a posição Y de cada card

