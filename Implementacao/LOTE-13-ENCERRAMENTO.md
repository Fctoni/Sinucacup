# LOTE 13: Encerramento e Distribuicao de Pontos

## Objetivo
Finalizar edicao e distribuir pontos automaticamente

## Tarefas

### 1. Criar Funcao de Distribuir Pontos

**lib/services/edicoes.ts (adicionar):**

```typescript
import { supabase } from '@/lib/supabase'

export async function encerrarEDistribuirPontos(edicaoId: string) {
  // Buscar a final
  const { data: final, error: errorFinal } = await supabase
    .from('partidas')
    .select(`
      *,
      dupla1:duplas!partidas_dupla1_id_fkey(*),
      dupla2:duplas!partidas_dupla2_id_fkey(*),
      vencedor:duplas!partidas_vencedor_id_fkey(*)
    `)
    .eq('edicao_id', edicaoId)
    .eq('fase', 'final')
    .single()
  
  if (errorFinal) throw errorFinal
  
  if (!final.vencedor_id) {
    throw new Error('Final ainda nao foi concluida')
  }
  
  // Identificar campeao e vice
  const duplasCampeaId = final.vencedor_id
  const duplasViceId = final.dupla1_id === duplasCampeaId ? final.dupla2_id : final.dupla1_id
  
  // Buscar jogadores das duplas
  const { data: duplaCampea } = await supabase
    .from('duplas')
    .select('jogador1_id, jogador2_id')
    .eq('id', duplasCampeaId)
    .single()
  
  const { data: duplaVice } = await supabase
    .from('duplas')
    .select('jogador1_id, jogador2_id')
    .eq('id', duplasViceId)
    .single()
  
  // Buscar todos inscritos
  const { data: inscritos } = await supabase
    .from('inscricoes')
    .select('jogador_id')
    .eq('edicao_id', edicaoId)
  
  const jogadoresCampeoes = [duplaCampea.jogador1_id, duplaCampea.jogador2_id]
  const jogadoresVice = [duplaVice.jogador1_id, duplaVice.jogador2_id]
  const todosInscritos = inscritos.map(i => i.jogador_id)
  const jogadoresDemais = todosInscritos.filter(
    id => !jogadoresCampeoes.includes(id) && !jogadoresVice.includes(id)
  )
  
  // Atualizar jogadores campeoes
  for (const jogadorId of jogadoresCampeoes) {
    const { data: jogador } = await supabase
      .from('jogadores')
      .select('pontos_totais, vitorias, participacoes')
      .eq('id', jogadorId)
      .single()
    
    await supabase
      .from('jogadores')
      .update({
        pontos_totais: jogador.pontos_totais + 10,
        vitorias: jogador.vitorias + 1,
        participacoes: jogador.participacoes + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jogadorId)
  }
  
  // Atualizar jogadores vice
  for (const jogadorId of jogadoresVice) {
    const { data: jogador } = await supabase
      .from('jogadores')
      .select('pontos_totais, vitorias, participacoes')
      .eq('id', jogadorId)
      .single()
    
    await supabase
      .from('jogadores')
      .update({
        pontos_totais: jogador.pontos_totais + 6,
        participacoes: jogador.participacoes + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jogadorId)
  }
  
  // Atualizar demais participantes
  for (const jogadorId of jogadoresDemais) {
    const { data: jogador } = await supabase
      .from('jogadores')
      .select('pontos_totais, vitorias, participacoes')
      .eq('id', jogadorId)
      .single()
    
    await supabase
      .from('jogadores')
      .update({
        pontos_totais: jogador.pontos_totais + 2,
        participacoes: jogador.participacoes + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jogadorId)
  }
  
  // Atualizar status da edicao
  await updateEdicaoStatus(edicaoId, 'finalizada')
  
  return {
    campeoes: jogadoresCampeoes.length,
    vice: jogadoresVice.length,
    demais: jogadoresDemais.length,
    duplasCampeaId,
    duplasViceId,
  }
}
```

### 2. Criar Componente: Card do Campeao

**components/edicoes/CampeaoCard.tsx:**

```typescript
import { DuplaComJogadores } from '@/types'

type Props = {
  duplaCampea: DuplaComJogadores
}

export default function CampeaoCard({ duplaCampea }: Props) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-ouro via-yellow-400 to-ouro opacity-20 animate-pulse" />
      
      <div className="relative bg-gradient-to-br from-ouro to-yellow-600 p-8 rounded-xl text-center border-4 border-ouro shadow-card-hover">
        <div className="text-7xl mb-4 animate-bounce">🏆</div>
        
        <h3 className="text-3xl font-bold text-cinza-escuro mb-2">
          CAMPEOES!
        </h3>
        
        <p className="text-2xl font-bold text-white mb-6">
          {duplaCampea.nome_dupla}
        </p>
        
        <div className="bg-white bg-opacity-90 rounded-lg p-4 text-cinza-escuro">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-lg">{duplaCampea.jogador1?.nome}</p>
              <p className="text-sm opacity-70">{duplaCampea.jogador1?.setor}</p>
            </div>
            <div>
              <p className="font-semibold text-lg">{duplaCampea.jogador2?.nome}</p>
              <p className="text-sm opacity-70">{duplaCampea.jogador2?.setor}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white bg-opacity-20 rounded-lg p-3">
          <p className="text-white text-sm font-semibold">
            +10 pontos para cada jogador
          </p>
        </div>
      </div>
    </div>
  )
}
```

### 3. Criar Componente: Modal de Encerramento

**components/edicoes/EncerrarCampeonatoModal.tsx:**

```typescript
'use client'

import { DuplaComJogadores } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  duplaCampea: DuplaComJogadores
  duplaVice: DuplaComJogadores
  numDemaisParticipantes: number
}

export default function EncerrarCampeonatoModal({
  isOpen,
  onClose,
  onConfirm,
  duplaCampea,
  duplaVice,
  numDemaisParticipantes,
}: Props) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-cinza-card p-8 rounded-xl border-4 border-ouro max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🏆</div>
          <h2 className="text-3xl font-bold text-ouro">Encerrar Campeonato?</h2>
        </div>
        
        <div className="bg-ouro bg-opacity-10 border-2 border-ouro p-6 rounded-lg mb-6">
          <p className="font-bold text-lg mb-4 text-center">Distribuicao de Pontos:</p>
          
          <div className="space-y-4">
            <div className="bg-cinza-medio p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-texto-secundario">🥇 CAMPEOES</p>
                  <p className="font-bold text-ouro">{duplaCampea.nome_dupla}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-ouro">+10</p>
                  <p className="text-xs text-texto-secundario">pts cada</p>
                </div>
              </div>
            </div>
            
            <div className="bg-cinza-medio p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-texto-secundario">🥈 VICE-CAMPEOES</p>
                  <p className="font-bold text-prata">{duplaVice.nome_dupla}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-prata">+6</p>
                  <p className="text-xs text-texto-secundario">pts cada</p>
                </div>
              </div>
            </div>
            
            <div className="bg-cinza-medio p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-texto-secundario">📊 DEMAIS PARTICIPANTES</p>
                  <p className="font-bold">{numDemaisParticipantes} jogadores</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-verde-claro">+2</p>
                  <p className="text-xs text-texto-secundario">pts cada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-laranja-aviso bg-opacity-20 border-2 border-laranja-aviso p-4 rounded-lg mb-6">
          <p className="text-sm">
            ⚠️ Esta acao e <span className="font-bold">IRREVERSIVEL</span>. Os pontos serao distribuidos e a edicao sera marcada como finalizada.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button onClick={onConfirm} className="btn-primary flex-1 text-lg py-4">
            🏆 Confirmar Encerramento
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 4. Implementar na Pagina

**app/edicoes/[id]/page.tsx (adicionar):**

```typescript
import { encerrarEDistribuirPontos } from '@/lib/services/edicoes'
import CampeaoCard from '@/components/edicoes/CampeaoCard'
import EncerrarCampeonatoModal from '@/components/edicoes/EncerrarCampeonatoModal'

// States
const [modalEncerrarOpen, setModalEncerrarOpen] = useState(false)
const [finalConcluida, setFinalConcluida] = useState(false)
const [duplaCampea, setDuplaCampea] = useState<DuplaComJogadores | null>(null)
const [duplaVice, setDuplaVice] = useState<DuplaComJogadores | null>(null)

// Verificar se final foi concluida
useEffect(() => {
  if (partidas.length > 0) {
    const final = partidas.find(p => p.fase === 'final')
    if (final?.vencedor_id) {
      setFinalConcluida(true)
      setDuplaCampea(final.vencedor!)
      
      const vice = final.dupla1_id === final.vencedor_id ? final.dupla2! : final.dupla1!
      setDuplaVice(vice)
    }
  }
}, [partidas])

// Handler encerrar
const handleEncerrarCampeonato = async () => {
  try {
    const resultado = await encerrarEDistribuirPontos(edicaoId)
    
    alert(`🏆 CAMPEONATO FINALIZADO! 🎉\n\n🥇 Campeoes: ${duplaCampea?.nome_dupla}!\n📊 Pontos distribuidos! Veja o ranking atualizado.`)
    
    setModalEncerrarOpen(false)
    fetchData() // Atualizar status
  } catch (error: any) {
    alert('Erro: ' + error.message)
  }
}

// No JSX - mostrar card do campeao e botao de encerrar
{finalConcluida && edicao.status === 'em_andamento' && duplaCampea && (
  <div className="mt-8 space-y-6">
    <CampeaoCard duplaCampea={duplaCampea} />
    
    <div className="text-center">
      <button
        onClick={() => setModalEncerrarOpen(true)}
        className="bg-gradient-to-r from-ouro via-yellow-500 to-ouro text-cinza-escuro px-12 py-4 rounded-xl text-xl font-bold hover:scale-105 transition-transform shadow-card-hover"
      >
        🏆 Encerrar Campeonato e Distribuir Pontos
      </button>
    </div>
  </div>
)}

{duplaCampea && duplaVice && (
  <EncerrarCampeonatoModal
    isOpen={modalEncerrarOpen}
    onClose={() => setModalEncerrarOpen(false)}
    onConfirm={handleEncerrarCampeonato}
    duplaCampea={duplaCampea}
    duplaVice={duplaVice}
    numDemaisParticipantes={(inscritosCount || 0) - 4}
  />
)}

{/* Badge de finalizada */}
{edicao.status === 'finalizada' && (
  <div className="bg-verde-medio p-6 rounded-xl text-center mb-6">
    <p className="text-3xl mb-2">✅</p>
    <p className="text-xl font-bold">Campeonato Finalizado</p>
    <p className="text-sm opacity-90 mt-1">Pontos foram distribuidos. Confira o ranking!</p>
  </div>
)}
```

## Checklist de Validacao

- [ ] Detectar quando final foi concluida
- [ ] Card dourado do campeao aparecendo
- [ ] Botao de encerrar aparecendo
- [ ] Modal de encerramento abrindo
- [ ] Informacoes corretas (campeao, vice, demais)
- [ ] Aviso de irreversibilidade
- [ ] Distribuicao de pontos funcionando
- [ ] Campeoes recebendo +10 pts e +1 vitoria
- [ ] Vice recebendo +6 pts
- [ ] Demais recebendo +2 pts
- [ ] Todos recebendo +1 participacao
- [ ] Status mudando para "finalizada"
- [ ] Badge verde de "finalizado" aparecendo
- [ ] Botao de encerrar desaparecendo apos finalizar

## Entregaveis

- ✅ Encerramento funcional
- ✅ Distribuicao automatica de pontos
- ✅ Card visual do campeao
- ✅ Modal informativo
- ✅ Pronto para Lote 14

## Tempo Estimado
⏱️ 120-150 minutos

## Proxima Etapa
➡️ LOTE 14: Ranking Global

## Progresso de implementação: **preencher aqui abaixo sempre tudo que foi feito ao final do lote**

✅ Tarefa 1: Função encerrarEDistribuirPontos criada em lib/services/edicoes.ts
   - Busca e valida final concluída
   - Identifica dupla campeã e vice automaticamente
   - Distribui pontos: +10 campeões, +6 vice, +2 demais
   - Atualiza vitórias e participações
   - Muda status para "finalizada"

✅ Tarefa 2: Componente CampeaoCard.tsx criado (depois removido a pedido do usuário)
   - Card dourado com animações (pulse, bounce)
   - Exibe troféu, nome da dupla e jogadores
   - Indica +10 pontos para cada jogador

✅ Tarefa 3: Componente EncerrarCampeonatoModal.tsx criado
   - Modal de confirmação com preview da distribuição
   - Cards coloridos: ouro (campeão), prata (vice), verde (demais)
   - Aviso de irreversibilidade destacado
   - Botões de confirmar/cancelar

✅ Tarefa 4: Integração completa na página app/edicoes/[id]/page.tsx
   - Import da função encerrarEDistribuirPontos
   - States: modalEncerrarOpen, finalConcluida, duplaCampea, duplaVice
   - Handler handleEncerrarCampeonato implementado
   - useEffect para detectar final concluída automaticamente
   - Card compacto inline dentro da div de chaveamento (logo após Bracket)
   - Badge verde "Finalizado" quando status = finalizada
   - Modal de confirmação integrado

**AJUSTES SOLICITADOS:**
✅ Card de campeões reduzido e movido para dentro da seção de chaveamento
✅ Posicionado logo abaixo do componente Bracket
✅ Tamanhos reduzidos: troféu (4xl), título (xl), padding (p-4)
✅ Botão integrado no card (não separado)
✅ Componente CampeaoCard.tsx removido (versão inline preferida)

**LOTE 13 - COMPLETO! ✅**

