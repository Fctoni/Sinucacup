type Props = {
  stats: {
    totalJogadores: number
    totalPontos: number
    totalVitorias: number
    mediaParticipacoes: number
  }
}

export default function EstatisticasGerais({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-cinza-card p-4 rounded-xl text-center">
        <p className="text-3xl mb-2">👥</p>
        <p className="text-3xl font-bold text-amarelo-destaque">{stats.totalJogadores}</p>
        <p className="text-sm text-texto-secundario">Jogadores</p>
      </div>
      
      <div className="bg-cinza-card p-4 rounded-xl text-center">
        <p className="text-3xl mb-2">⭐</p>
        <p className="text-3xl font-bold text-amarelo-destaque">{stats.totalPontos}</p>
        <p className="text-sm text-texto-secundario">Pontos Totais</p>
      </div>
      
      <div className="bg-cinza-card p-4 rounded-xl text-center">
        <p className="text-3xl mb-2">🏆</p>
        <p className="text-3xl font-bold text-verde-claro">{stats.totalVitorias}</p>
        <p className="text-sm text-texto-secundario">Campeonatos</p>
      </div>
      
      <div className="bg-cinza-card p-4 rounded-xl text-center">
        <p className="text-3xl mb-2">📊</p>
        <p className="text-3xl font-bold text-azul-info">{stats.mediaParticipacoes}</p>
        <p className="text-sm text-texto-secundario">Media Jogos</p>
      </div>
    </div>
  )
}

