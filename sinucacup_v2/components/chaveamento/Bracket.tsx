'use client'

import { PartidaComDuplas } from '@/types'
import PartidaCard from './PartidaCard'

type Props = {
  partidas: PartidaComDuplas[]
  onPartidaClick?: (partida: PartidaComDuplas) => void
  onPartidaEdit?: (partida: PartidaComDuplas) => void
  statusEdicao?: string
}

const fasesOrdem = ['oitavas', 'quartas', 'semifinal', 'final']

export default function Bracket({ partidas, onPartidaClick, onPartidaEdit, statusEdicao }: Props) {
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
                  onEdit={() => onPartidaEdit?.(partida)}
                  statusEdicao={statusEdicao}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

