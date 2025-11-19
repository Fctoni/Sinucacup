import { Jogador } from '@/types'

type Props = {
  jogadores: Jogador[]
}

export default function TabelaRanking({ jogadores }: Props) {
  const getMedalha = (posicao: number) => {
    if (posicao === 1) return '🥇'
    if (posicao === 2) return '🥈'
    if (posicao === 3) return '🥉'
    return posicao
  }
  
  return (
    <div className="bg-cinza-card rounded-xl overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-verde-medio text-white sticky top-0">
            <tr>
              <th className="px-6 py-4 text-left font-bold">Pos.</th>
              <th className="px-6 py-4 text-left font-bold">Jogador</th>
              <th className="px-6 py-4 text-left font-bold">Setor</th>
              <th className="px-6 py-4 text-center font-bold">Pontos</th>
              <th className="px-6 py-4 text-center font-bold">Vitorias</th>
              <th className="px-6 py-4 text-center font-bold">Jogos</th>
            </tr>
          </thead>
          <tbody>
            {jogadores.map((jogador, index) => {
              const posicao = index + 1
              const isTop3 = posicao <= 3
              
              return (
                <tr
                  key={jogador.id}
                  className={`
                    border-b border-cinza-medio transition-colors hover:bg-cinza-medio
                    ${isTop3 ? 'bg-verde-medio bg-opacity-10' : ''}
                  `}
                >
                  <td className="px-6 py-4">
                    <span className={`text-xl ${isTop3 ? 'font-bold' : ''}`}>
                      {getMedalha(posicao)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-semibold ${isTop3 ? 'text-amarelo-destaque' : ''}`}>
                      {jogador.nome}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-texto-secundario">{jogador.setor}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-2xl font-bold text-amarelo-destaque">
                      {jogador.pontos_totais}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-lg text-verde-claro">{jogador.vitorias}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-lg text-azul-info">{jogador.participacoes}</p>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {jogadores.length === 0 && (
        <div className="text-center py-12 text-texto-secundario">
          Nenhum jogador com pontuacao ainda
        </div>
      )}
    </div>
  )
}

