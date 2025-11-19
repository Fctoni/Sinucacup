'use client'

import { DuplaComJogadores } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  duplaCampea: DuplaComJogadores
  duplaVice: DuplaComJogadores
  numDemaisParticipantes: number
  isLoading?: boolean
}

export default function EncerrarCampeonatoModal({
  isOpen,
  onClose,
  onConfirm,
  duplaCampea,
  duplaVice,
  numDemaisParticipantes,
  isLoading = false,
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
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className={`btn-primary flex-1 text-lg py-4 transition-all ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            {isLoading ? '⏳ Encerrando e Distribuindo Pontos...' : '🏆 Confirmar Encerramento'}
          </button>
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className={`btn-secondary flex-1 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

