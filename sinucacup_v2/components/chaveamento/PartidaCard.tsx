import { PartidaComDuplas } from '@/types'

type Props = {
  partida: PartidaComDuplas
  onClick?: () => void
  onEdit?: () => void
  statusEdicao?: string
}

export default function PartidaCard({ partida, onClick, onEdit, statusEdicao }: Props) {
  const podeJogar = partida.dupla1_id && partida.dupla2_id && !partida.vencedor_id && statusEdicao === 'em_andamento'
  const jaFinalizada = partida.vencedor_id !== null
  const aguardandoDefinicao = !partida.dupla1_id || !partida.dupla2_id
  
  const handleClick = () => {
    if (podeJogar && onClick) {
      onClick()
    } else if (aguardandoDefinicao) {
      alert('⏳ Aguardando definicao das duplas (TBD)')
    } else if (jaFinalizada) {
      alert('ℹ️ Partida ja finalizada. Use "Editar Resultado" para alterar.')
    } else if (statusEdicao !== 'em_andamento') {
      alert('⚠️ Campeonato ainda nao foi iniciado')
    }
  }
  
  return (
    <div
      onClick={handleClick}
      className={`
        bg-cinza-card p-4 rounded-lg border-2 transition-all relative
        ${podeJogar ? 'border-verde-medio hover:border-amarelo-destaque cursor-pointer hover:scale-105' : 'border-cinza-medio'}
        ${!podeJogar && !jaFinalizada && statusEdicao === 'em_andamento' ? 'cursor-not-allowed' : ''}
        ${jaFinalizada ? 'opacity-90' : ''}
      `}
    >
      {/* Botao de editar (se finalizada) */}
      {jaFinalizada && onEdit && statusEdicao === 'em_andamento' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="absolute top-2 right-2 bg-azul-info hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full transition-colors z-10"
        >
          ✏️ Editar
        </button>
      )}
      
      {/* Indicador: pode jogar */}
      {podeJogar && (
        <div className="absolute top-2 right-2">
          <span className="bg-verde-claro text-white text-xs px-2 py-1 rounded-full">
            Clique para registrar
          </span>
        </div>
      )}
      
      {/* Dupla 1 */}
      <div className={`
        p-3 rounded mb-2 transition-all
        ${partida.vencedor_id === partida.dupla1_id ? 'bg-verde-medio text-white font-bold' : 'bg-cinza-medio'}
        ${partida.vencedor_id && partida.vencedor_id !== partida.dupla1_id ? 'opacity-30' : ''}
      `}>
        {partida.dupla1 ? (
          <div>
            <p className="text-sm">{partida.dupla1.nome_dupla}</p>
            {partida.vencedor_id === partida.dupla1_id && (
              <span className="text-xs flex items-center gap-1">
                🏆 Vencedor
              </span>
            )}
          </div>
        ) : (
          <p className="text-texto-secundario text-sm italic">TBD</p>
        )}
      </div>
      
      <div className="text-center text-xs text-texto-secundario my-1">VS</div>
      
      {/* Dupla 2 */}
      <div className={`
        p-3 rounded transition-all
        ${partida.vencedor_id === partida.dupla2_id ? 'bg-verde-medio text-white font-bold' : 'bg-cinza-medio'}
        ${partida.vencedor_id && partida.vencedor_id !== partida.dupla2_id ? 'opacity-30' : ''}
      `}>
        {partida.dupla2 ? (
          <div>
            <p className="text-sm">{partida.dupla2.nome_dupla}</p>
            {partida.vencedor_id === partida.dupla2_id && (
              <span className="text-xs flex items-center gap-1">
                🏆 Vencedor
              </span>
            )}
          </div>
        ) : (
          <p className="text-texto-secundario text-sm italic">TBD</p>
        )}
      </div>
    </div>
  )
}

