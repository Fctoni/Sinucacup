'use client'

import { DuplaComJogadores } from '@/types'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

type Props = {
  dupla: DuplaComJogadores
  onDelete?: (duplaId: string) => void
  canDelete?: boolean
  modoReordenar?: boolean
  posicaoVisual?: number  // Posição visual durante reordenação
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

export default function DuplaCardDraggable({ dupla, onDelete, canDelete = true, modoReordenar = false, posicaoVisual }: Props) {
  const { setNodeRef, transform, isDragging, attributes, listeners } = useDraggable({
    id: `dupla-card-${dupla.id}`,
    data: { duplaId: dupla.id },
    disabled: !modoReordenar,
  })
  
  const { setNodeRef: setDropRef, isOver: isOverCard } = useDroppable({
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
      ref={(node) => {
        setNodeRef(node)
        setDropRef(node)
      }}
      style={style}
      className={`
        card-base
        ${modoReordenar ? 'cursor-move' : ''}
        ${isOverCard ? 'border-amarelo-destaque scale-105' : ''}
      `}
      {...(modoReordenar ? listeners : {})}
      {...(modoReordenar ? attributes : {})}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-amarelo-destaque flex items-center gap-2">
          {modoReordenar && <span className="text-xl opacity-50">⋮⋮</span>}
          Dupla #{posicaoVisual !== undefined ? posicaoVisual : dupla.posicao}
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

