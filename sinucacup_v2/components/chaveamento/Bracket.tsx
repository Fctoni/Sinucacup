'use client'

import { useEffect, useRef, useState } from 'react'
import { PartidaComDuplas } from '@/types'
import PartidaCard from './PartidaCard'

type Props = {
  partidas: PartidaComDuplas[]
  onPartidaClick?: (partida: PartidaComDuplas) => void
  onPartidaEdit?: (partida: PartidaComDuplas) => void
  statusEdicao?: string
}

const fasesOrdem = ['oitavas', 'quartas', 'semifinal', 'final']

const fasesNomes: Record<string, string> = {
  oitavas: 'Oitavas de Final',
  quartas: 'Quartas de Final',
  semifinal: 'Semifinal',
  final: 'FINAL'
}

type CardPosition = {
  top: number
  height: number
  centerY: number
}

export default function Bracket({ partidas, onPartidaClick, onPartidaEdit, statusEdicao }: Props) {
  const partidasPorFase = partidas.reduce((acc, partida) => {
    if (!acc[partida.fase]) acc[partida.fase] = []
    acc[partida.fase].push(partida)
    return acc
  }, {} as Record<string, PartidaComDuplas[]>)
  
  const fasesPresentes = fasesOrdem.filter(f => partidasPorFase[f])
  const isSoFinal = fasesPresentes.length === 1 && fasesPresentes[0] === 'final'
  
  // Refs para MEDIR as posições reais
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [cardPositions, setCardPositions] = useState<Record<string, CardPosition>>({})
  
  // Altura estimada dos cards (APENAS para posicionamento inicial)
  const CARD_HEIGHT = 120
  const SPACING = 40
  
  // Calcular posição ESTIMADA do CENTRO do card (para posicionamento inicial)
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
    
    // Medir após render com delay para garantir que tudo foi renderizado
    const timer = setTimeout(measurePositions, 200)
    window.addEventListener('resize', measurePositions)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', measurePositions)
    }
  }, [partidas])
  
  return (
    <div className="w-full overflow-x-auto pb-8">
      <div 
        ref={containerRef}
        className={`flex items-start gap-0 min-w-max px-4 py-8 ${isSoFinal ? 'justify-center' : ''}`}
      >
        {fasesPresentes.map((fase, faseIndex) => {
          const partidasFase = partidasPorFase[fase]
          const numPartidas = partidasFase.length
          const isFinalFase = fase === 'final'
          const temProximaFase = faseIndex < fasesPresentes.length - 1
          
          return (
            <div key={fase} className="relative flex items-start">
              {/* Coluna da Fase */}
              <div className="flex flex-col items-center relative">
                {/* Titulo da Fase */}
                <div className={`
                  mb-8 text-center px-6 py-3 rounded-lg shadow-lg
                  ${isFinalFase 
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900' 
                    : 'bg-gradient-to-r from-verde-medio to-verde-claro text-white'}
                `}>
                  <h4 className={`font-bold uppercase tracking-wide ${isFinalFase ? 'text-xl' : 'text-lg'}`}>
                    {fasesNomes[fase]}
                  </h4>
                  {!isFinalFase && (
                    <p className="text-xs mt-1 opacity-90">
                      {numPartidas} {numPartidas === 1 ? 'partida' : 'partidas'}
                    </p>
                  )}
                </div>
                
                {/* Partidas da Fase - POSITIONING ABSOLUTO */}
                <div className="relative z-10" style={{ minHeight: '800px', width: '240px' }}>
                  {partidasFase.map((partida, index) => {
                    // Calcular centro Y ESTIMADO do card (para posicionamento inicial)
                    const centroY = calcularCentroY(faseIndex, index)
                    const topPosition = centroY - (CARD_HEIGHT / 2)
                    
                    return (
                      <div 
                        key={partida.id}
                        className="absolute w-full"
                        style={{ 
                          top: `${topPosition}px`
                        }}
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
              </div>
              
              {/* Linhas conectoras - usando posições MEDIDAS REAIS */}
              {temProximaFase && Object.keys(cardPositions).length > 0 && (() => {
                const proximaFase = fasesPresentes[faseIndex + 1]
                const partidasProximaFase = partidasPorFase[proximaFase]
                
                return (
                  <div className="hidden md:block relative" style={{ width: '80px', height: '100%', minHeight: '800px' }}>
                    <svg 
                      width="80" 
                      height="2000"
                      className="absolute left-0 top-0"
                      style={{ overflow: 'visible' }}
                    >
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
                            <line 
                              x1="0" 
                              y1={y1} 
                              x2="30" 
                              y2={y1} 
                              stroke="#9ca3af" 
                              strokeWidth="3" 
                            />
                            
                            {/* Linha horizontal saindo do centro REAL da partida 2 (se existir) */}
                            {pos2 && (
                              <line 
                                x1="0" 
                                y1={y2} 
                                x2="30" 
                                y2={y2} 
                                stroke="#9ca3af" 
                                strokeWidth="3" 
                              />
                            )}
                            
                            {/* Linha vertical conectando os dois centros REAIS */}
                            {pos2 && (
                              <line 
                                x1="30" 
                                y1={y1} 
                                x2="30" 
                                y2={y2} 
                                stroke="#9ca3af" 
                                strokeWidth="3" 
                              />
                            )}
                            
                            {/* Linha horizontal indo para o centro REAL da partida de destino */}
                            <line 
                              x1="30" 
                              y1={yDestino} 
                              x2="80" 
                              y2={yDestino} 
                              stroke="#9ca3af" 
                              strokeWidth="3" 
                            />
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>
      
      {/* Mensagem de Mobile */}
      <div className="md:hidden text-center text-texto-secundario text-sm mt-4">
        💡 Dica: Deslize horizontalmente para ver todas as fases
      </div>
    </div>
  )
}
