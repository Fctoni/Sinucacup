# LOTE 7: Formacao de Duplas - Parte 2 (Drag & Drop)

## Objetivo
Implementar edicao visual de duplas com drag & drop

## Tarefas

### 1. Instalar @dnd-kit

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. Criar Servico para Trocar Jogadores

**lib/services/duplas.ts (adicionar):**

```typescript
export async function trocarJogadoresEntreDuplas(
  dupla1Id: string,
  dupla2Id: string,
  jogadorOrigemPosicao: 1 | 2, // qual jogador da dupla1 vai trocar
  jogadorDestinoPosicao: 1 | 2  // qual jogador da dupla2 vai receber
) {
  // Buscar as duas duplas
  const { data: duplas, error } = await supabase
    .from('duplas')
    .select(`
      *,
      jogador1:jogadores!duplas_jogador1_id_fkey(*),
      jogador2:jogadores!duplas_jogador2_id_fkey(*)
    `)
    .in('id', [dupla1Id, dupla2Id])
  
  if (error) throw error
  
  const dupla1 = duplas.find(d => d.id === dupla1Id) as DuplaComJogadores
  const dupla2 = duplas.find(d => d.id === dupla2Id) as DuplaComJogadores
  
  // Identificar jogadores que vao trocar
  const jogadorOrigem = jogadorOrigemPosicao === 1 ? dupla1.jogador1 : dupla1.jogador2
  const jogadorDestino = jogadorDestinoPosicao === 1 ? dupla2.jogador1 : dupla2.jogador2
  
  // Construir novas duplas
  const novaDupla1 = {
    jogador1_id: jogadorOrigemPosicao === 1 ? jogadorDestino.id : dupla1.jogador1_id,
    jogador2_id: jogadorOrigemPosicao === 2 ? jogadorDestino.id : dupla1.jogador2_id,
    pontuacao_total: 0, // recalculado abaixo
    nome_dupla: '',
  }
  
  const novaDupla2 = {
    jogador1_id: jogadorDestinoPosicao === 1 ? jogadorOrigem.id : dupla2.jogador1_id,
    jogador2_id: jogadorDestinoPosicao === 2 ? jogadorOrigem.id : dupla2.jogador2_id,
    pontuacao_total: 0,
    nome_dupla: '',
  }
  
  // Buscar pontuacoes
  const { data: jogadoresData } = await supabase
    .from('jogadores')
    .select('id, nome, pontos_totais')
    .in('id', [
      novaDupla1.jogador1_id,
      novaDupla1.jogador2_id,
      novaDupla2.jogador1_id,
      novaDupla2.jogador2_id,
    ])
  
  const jogadoresMap = new Map(jogadoresData?.map(j => [j.id, j]))
  
  // Calcular pontuacao e nome
  const j1_d1 = jogadoresMap.get(novaDupla1.jogador1_id)!
  const j2_d1 = jogadoresMap.get(novaDupla1.jogador2_id)!
  novaDupla1.pontuacao_total = j1_d1.pontos_totais + j2_d1.pontos_totais
  novaDupla1.nome_dupla = `${j1_d1.nome} & ${j2_d1.nome}`
  
  const j1_d2 = jogadoresMap.get(novaDupla2.jogador1_id)!
  const j2_d2 = jogadoresMap.get(novaDupla2.jogador2_id)!
  novaDupla2.pontuacao_total = j1_d2.pontos_totais + j2_d2.pontos_totais
  novaDupla2.nome_dupla = `${j1_d2.nome} & ${j2_d2.nome}`
  
  // Atualizar no banco
  await Promise.all([
    supabase
      .from('duplas')
      .update({
        ...novaDupla1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dupla1Id),
    supabase
      .from('duplas')
      .update({
        ...novaDupla2,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dupla2Id),
  ])
  
  return { dupla1: novaDupla1, dupla2: novaDupla2 }
}

export async function reordenarDuplas(edicaoId: string, novaOrdem: string[]) {
  // novaOrdem = array de IDs de duplas na ordem desejada
  const updates = novaOrdem.map((duplaId, index) =>
    supabase
      .from('duplas')
      .update({ posicao: index + 1 })
      .eq('id', duplaId)
  )
  
  await Promise.all(updates)
}
```

### 3. Criar Componente: Dupla Card com Drag & Drop

**components/duplas/DuplaCardDraggable.tsx:**

```typescript
'use client'

import { DuplaComJogadores } from '@/types'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

type Props = {
  dupla: DuplaComJogadores
  onDelete?: (duplaId: string) => void
  canDelete?: boolean
  modoReordenar?: boolean
}

type JogadorDraggableProps = {
  jogadorId: string
  nome: string
  setor: string
  duplaId: string
  posicao: 1 | 2
}

function JogadorDraggable({ jogadorId, nome, setor, duplaId, posicao }: JogadorDraggableProps) {
  const draggableId = `jogador-${jogadorId}-dupla-${duplaId}-pos-${posicao}`
  
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: draggableId,
    data: {
      jogadorId,
      duplaId,
      posicao,
    },
  })
  
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${draggableId}`,
    data: {
      jogadorId,
      duplaId,
      posicao,
    },
  })
  
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
  }
  
  return (
    <div
      ref={(node) => {
        setDragRef(node)
        setDropRef(node)
      }}
      style={style}
      className={`
        bg-cinza-medio p-3 rounded-lg transition-all
        ${isOver ? 'border-2 border-amarelo-destaque' : 'border-2 border-transparent'}
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl opacity-50">⋮⋮</span>
        <div className="flex-1">
          <p className="font-semibold">{nome}</p>
          <p className="text-xs text-texto-secundario">{setor}</p>
        </div>
      </div>
    </div>
  )
}

export default function DuplaCardDraggable({ dupla, onDelete, canDelete = true, modoReordenar = false }: Props) {
  const { setNodeRef, transform, isDragging } = useDraggable({
    id: `dupla-card-${dupla.id}`,
    data: { duplaId: dupla.id },
    disabled: !modoReordenar,
  })
  
  const { isOver: isOverCard } = useDroppable({
    id: `drop-dupla-card-${dupla.id}`,
    data: { duplaId: dupla.id },
    disabled: !modoReordenar,
  })
  
  const style = modoReordenar ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  } : {}
  
  const handleDelete = async () => {
    if (!onDelete) return
    const confirmar = window.confirm(`Excluir dupla "${dupla.nome_dupla}"?`)
    if (confirmar) onDelete(dupla.id)
  }
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        card-base
        ${modoReordenar ? 'cursor-move' : ''}
        ${isOverCard ? 'border-amarelo-destaque scale-105' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-amarelo-destaque flex items-center gap-2">
          {modoReordenar && <span className="text-xl opacity-50">⋮⋮</span>}
          Dupla #{dupla.posicao}
        </h3>
        {canDelete && onDelete && !modoReordenar && (
          <button onClick={handleDelete} className="text-vermelho-erro hover:bg-vermelho-erro hover:text-white px-3 py-1 rounded transition-colors">
            🗑️
          </button>
        )}
      </div>
      
      <div className="space-y-3 mb-4">
        {!modoReordenar ? (
          <>
            <JogadorDraggable
              jogadorId={dupla.jogador1!.id}
              nome={dupla.jogador1!.nome}
              setor={dupla.jogador1!.setor}
              duplaId={dupla.id}
              posicao={1}
            />
            <JogadorDraggable
              jogadorId={dupla.jogador2!.id}
              nome={dupla.jogador2!.nome}
              setor={dupla.jogador2!.setor}
              duplaId={dupla.id}
              posicao={2}
            />
          </>
        ) : (
          <>
            <div className="bg-cinza-medio p-3 rounded-lg">
              <p className="font-semibold">{dupla.jogador1?.nome}</p>
              <p className="text-xs text-texto-secundario">{dupla.jogador1?.setor}</p>
            </div>
            <div className="bg-cinza-medio p-3 rounded-lg">
              <p className="font-semibold">{dupla.jogador2?.nome}</p>
              <p className="text-xs text-texto-secundario">{dupla.jogador2?.setor}</p>
            </div>
          </>
        )}
      </div>
      
      <div className="bg-verde-medio bg-opacity-20 border-2 border-verde-medio p-3 rounded-lg text-center">
        <p className="text-sm text-texto-secundario">Pontuacao Total</p>
        <p className="text-2xl font-bold text-amarelo-destaque">{dupla.pontuacao_total} pts</p>
      </div>
    </div>
  )
}
```

### 4. Atualizar Pagina com DnD Context

**app/edicoes/[id]/page.tsx (adicionar DnD):**

```typescript
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core'
import DuplaCardDraggable from '@/components/duplas/DuplaCardDraggable'
import { trocarJogadoresEntreDuplas, reordenarDuplas } from '@/lib/services/duplas'

// State adicional
const [modoReordenar, setModoReordenar] = useState(false)

// Handler de drag end (trocar jogadores)
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event
  
  if (!over || active.id === over.id) return
  
  if (modoReordenar) {
    // Modo reordenar: trocar posicao de duplas
    const activeId = active.data.current?.duplaId
    const overId = over.data.current?.duplaId
    
    if (!activeId || !overId) return
    
    const activeIndex = duplas.findIndex(d => d.id === activeId)
    const overIndex = duplas.findIndex(d => d.id === overId)
    
    const novaDuplas = [...duplas]
    const [removed] = novaDuplas.splice(activeIndex, 1)
    novaDuplas.splice(overIndex, 0, removed)
    
    setDuplas(novaDuplas)
  } else {
    // Modo normal: trocar jogadores
    const origem = active.data.current
    const destino = over.data.current
    
    if (!origem || !destino) return
    if (origem.duplaId === destino.duplaId) return // mesma dupla
    
    try {
      await trocarJogadoresEntreDuplas(
        origem.duplaId,
        destino.duplaId,
        origem.posicao,
        destino.posicao
      )
      
      alert('✅ Jogadores trocados com sucesso!')
      fetchDuplas()
    } catch (error: any) {
      alert('Erro ao trocar jogadores: ' + error.message)
    }
  }
}

const handleSalvarOrdem = async () => {
  try {
    const novaOrdem = duplas.map(d => d.id)
    await reordenarDuplas(edicaoId, novaOrdem)
    setModoReordenar(false)
    alert('✅ Ordem salva! Chaveamento sera regenerado.')
    fetchDuplas()
  } catch (error: any) {
    alert('Erro ao salvar ordem: ' + error.message)
  }
}

// No JSX, substituir o grid de duplas por:
<DndContext onDragEnd={handleDragEnd}>
  {/* Botao de reordenar (apenas se status = chaveamento) */}
  {edicao.status === 'chaveamento' && duplas.length > 0 && (
    <button
      onClick={() => modoReordenar ? handleSalvarOrdem() : setModoReordenar(true)}
      className={`mb-4 ${modoReordenar ? 'btn-primary' : 'bg-laranja-aviso text-white px-6 py-3 rounded-xl font-semibold'}`}
    >
      {modoReordenar ? '✅ Salvar Ordem' : '🔀 Modo: Reordenar Chaveamento'}
    </button>
  )}
  
  {modoReordenar && (
    <div className="bg-laranja-aviso p-4 rounded-lg mb-4">
      <p className="font-semibold">⚠️ Modo Reordenar Ativo</p>
      <p className="text-sm">Arraste os cards de duplas para definir a ordem no chaveamento</p>
    </div>
  )}
  
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {duplas.map((dupla) => (
      <DuplaCardDraggable
        key={dupla.id}
        dupla={dupla}
        onDelete={handleExcluirDupla}
        canDelete={!modoReordenar}
        modoReordenar={modoReordenar}
      />
    ))}
  </div>
</DndContext>
```

## Checklist de Validacao

- [ ] Icones ⋮⋮ aparecendo nos jogadores
- [ ] Drag de jogadores funcionando
- [ ] Feedback visual durante drag (opacity, borders)
- [ ] Troca de jogadores entre duplas funcionando
- [ ] Recalculo de pontuacao apos troca
- [ ] Atualizacao de nome da dupla
- [ ] Botao "Reordenar Chaveamento" aparecendo
- [ ] Modo reordenar ativando/desativando
- [ ] Banner laranja aparecendo no modo reordenar
- [ ] Drag de cards inteiros funcionando
- [ ] Salvando nova ordem
- [ ] Cursor mudando (grab/grabbing)

## Entregaveis

- ✅ Drag & drop de jogadores funcionando
- ✅ Modo de reordenacao de duplas
- ✅ Feedback visual adequado
- ✅ Atualizacao automatica de dados
- ✅ Pronto para Lote 8

## Tempo Estimado
⏱️ 120-150 minutos

## Proxima Etapa
➡️ LOTE 8: Geracao de Chaveamento (Bracket)

