'use client'

import { DuplaComJogadores } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  numDuplas: number
  numPartidasPrimeiraFase: number
  duplasComBye: string[]
}

export default function IniciarCampeonatoModal({
  isOpen,
  onClose,
  onConfirm,
  numDuplas,
  numPartidasPrimeiraFase,
  duplasComBye,
}: Props) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-cinza-card p-8 rounded-xl border-2 border-laranja-aviso max-w-lg w-full">
        <h2 className="text-2xl mb-4">🎯 Iniciar Campeonato?</h2>
        
        <div className="bg-laranja-aviso bg-opacity-20 border-2 border-laranja-aviso p-4 rounded-lg mb-6">
          <p className="font-semibold mb-2">⚠️ ATENCAO!</p>
          <p className="text-sm">
            Apos iniciar, nao sera possivel:
          </p>
          <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
            <li>Editar duplas</li>
            <li>Regenerar chaveamento</li>
            <li>Reordenar chaveamento</li>
            <li>Excluir duplas</li>
          </ul>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="bg-cinza-medio p-3 rounded">
            <p className="text-sm text-texto-secundario">Duplas Participantes</p>
            <p className="text-2xl font-bold text-amarelo-destaque">{numDuplas}</p>
          </div>
          
          <div className="bg-cinza-medio p-3 rounded">
            <p className="text-sm text-texto-secundario">Partidas na Primeira Fase</p>
            <p className="text-2xl font-bold text-verde-claro">{numPartidasPrimeiraFase}</p>
          </div>
          
          {duplasComBye.length > 0 && (
            <div className="bg-azul-info bg-opacity-20 border border-azul-info p-3 rounded">
              <p className="text-sm font-semibold mb-1">Duplas com BYE:</p>
              <p className="text-sm">{duplasComBye.join(', ')}</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <button onClick={onConfirm} className="btn-primary flex-1">
            ✅ Confirmar Inicio
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

