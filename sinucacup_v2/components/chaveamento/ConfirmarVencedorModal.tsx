'use client'

import { DuplaComJogadores } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (duplaId: string) => void
  dupla1: DuplaComJogadores
  dupla2: DuplaComJogadores
}

export default function ConfirmarVencedorModal({
  isOpen,
  onClose,
  onConfirm,
  dupla1,
  dupla2,
}: Props) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-cinza-card p-8 rounded-xl border-2 border-amarelo-destaque max-w-md w-full">
        <h2 className="text-2xl mb-6 text-center">🏆 Confirmar Vencedor</h2>
        
        <p className="text-texto-secundario text-center mb-6">
          Selecione a dupla vencedora desta partida:
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => onConfirm(dupla1.id)}
            className="w-full bg-verde-medio hover:bg-verde-claro text-white p-4 rounded-lg transition-all hover:scale-105"
          >
            <p className="font-bold text-lg">{dupla1.nome_dupla}</p>
            <p className="text-sm opacity-90">{dupla1.pontuacao_total} pts</p>
          </button>
          
          <button
            onClick={() => onConfirm(dupla2.id)}
            className="w-full bg-verde-medio hover:bg-verde-claro text-white p-4 rounded-lg transition-all hover:scale-105"
          >
            <p className="font-bold text-lg">{dupla2.nome_dupla}</p>
            <p className="text-sm opacity-90">{dupla2.pontuacao_total} pts</p>
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-6 btn-secondary"
        >
          ❌ Cancelar
        </button>
      </div>
    </div>
  )
}

