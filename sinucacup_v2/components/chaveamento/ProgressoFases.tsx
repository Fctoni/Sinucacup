import { PartidaComDuplas } from '@/types'

type Props = {
  partidas: PartidaComDuplas[]
}

const fasesOrdem = ['oitavas', 'quartas', 'semifinal', 'final']

export default function ProgressoFases({ partidas }: Props) {
  const partidasPorFase = partidas.reduce((acc, p) => {
    if (!acc[p.fase]) acc[p.fase] = []
    acc[p.fase].push(p)
    return acc
  }, {} as Record<string, PartidaComDuplas[]>)
  
  const fasesPresentes = fasesOrdem.filter(f => partidasPorFase[f])
  
  return (
    <div className="bg-cinza-card p-6 rounded-xl mb-6">
      <h4 className="text-lg font-bold mb-4">📊 Progresso do Campeonato</h4>
      
      <div className="space-y-3">
        {fasesPresentes.map((fase) => {
          const partidasFase = partidasPorFase[fase]
          const finalizadas = partidasFase.filter(p => p.vencedor_id).length
          const total = partidasFase.length
          const percentual = (finalizadas / total) * 100
          
          return (
            <div key={fase}>
              <div className="flex justify-between mb-1">
                <span className="font-semibold capitalize">{fase}</span>
                <span className="text-sm text-texto-secundario">
                  {finalizadas}/{total} partidas
                </span>
              </div>
              <div className="w-full bg-cinza-medio rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-verde-medio to-verde-claro h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentual}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

