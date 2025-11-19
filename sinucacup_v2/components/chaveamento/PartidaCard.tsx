import { PartidaComDuplas } from '@/types'

type Props = {
  partida: PartidaComDuplas
  onClick?: () => void
  onEdit?: () => void
  statusEdicao?: string
  innerRef?: React.Ref<HTMLDivElement>
}

export default function PartidaCard({ partida, onClick, onEdit, statusEdicao, innerRef }: Props) {
  const podeJogar = partida.dupla1_id && partida.dupla2_id && !partida.vencedor_id && statusEdicao === 'em_andamento'
  const jaFinalizada = partida.vencedor_id !== null
  const aguardandoDefinicao = !partida.dupla1_id || !partida.dupla2_id
  
  // Detectar se e uma partida de BYE (is_bye = true ou dupla2 null)
  const isBye = partida.is_bye || (!partida.dupla2_id && partida.dupla1_id)
  
  const handleClick = () => {
    if (isBye) {
      alert('ℹ️ Esta dupla passou automaticamente (BYE)')
      return
    }
    
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
  
  // Card especial para BYE
  if (isBye) {
    return (
      <div className="relative">
        <div ref={innerRef} className="bg-blue-50 border-2 border-blue-300 rounded-lg overflow-hidden shadow-md">
          {/* Dupla com BYE (vencedor automatico) */}
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold px-4 py-3 border-b-2 border-blue-600">
            <div className="flex items-center justify-between">
              <span className="text-sm truncate max-w-[180px]">
                {partida.dupla1?.nome_dupla || 'Dupla'}
              </span>
              <span className="text-yellow-300 text-lg ml-2">✓</span>
            </div>
          </div>
          
          {/* Indicador BYE */}
          <div className="bg-blue-100 text-blue-800 px-4 py-3 flex items-center justify-center">
            <span className="text-sm font-semibold uppercase tracking-wide">
              🎯 BYE - Passou Automaticamente
            </span>
          </div>
        </div>
      </div>
    )
  }
  
  // Card normal para partidas regulares
  return (
    <div className="relative">
      {/* Botao de editar */}
      {jaFinalizada && onEdit && statusEdicao === 'em_andamento' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="absolute -top-2 -right-2 bg-azul-info hover:bg-blue-600 text-white text-xs px-2 py-1 rounded-md transition-colors z-10 shadow-lg"
        >
          ✏️
        </button>
      )}
      
      {/* Indicador: pode jogar */}
      {podeJogar && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-verde-claro text-white text-xs px-3 py-1 rounded-full shadow-lg animate-pulse">
            Clique aqui
          </span>
        </div>
      )}
      
      <div
        ref={innerRef}
        onClick={handleClick}
        className={`
          bg-white border-2 rounded-lg overflow-hidden transition-all shadow-md
          ${podeJogar ? 'border-verde-claro hover:border-amarelo-destaque cursor-pointer hover:shadow-xl hover:scale-105' : 'border-gray-300'}
          ${jaFinalizada ? 'shadow-sm' : ''}
        `}
      >
        {/* Dupla 1 */}
        <div className={`
          flex items-center justify-between px-4 py-3 border-b transition-all
          ${partida.vencedor_id === partida.dupla1_id 
            ? 'bg-gradient-to-r from-verde-medio to-verde-claro text-white font-bold' 
            : 'bg-gray-50 text-gray-800'}
          ${partida.vencedor_id && partida.vencedor_id !== partida.dupla1_id ? 'opacity-40' : ''}
        `}>
          {partida.dupla1 ? (
            <>
              <span className="text-sm truncate max-w-[180px]">
                {partida.dupla1.nome_dupla}
              </span>
              {partida.vencedor_id === partida.dupla1_id && (
                <span className="text-yellow-300 text-lg ml-2">🏆</span>
              )}
            </>
          ) : (
            <span className="text-gray-400 text-sm italic">Aguardando...</span>
          )}
        </div>
        
        {/* Dupla 2 */}
        <div className={`
          flex items-center justify-between px-4 py-3 transition-all
          ${partida.vencedor_id === partida.dupla2_id 
            ? 'bg-gradient-to-r from-verde-medio to-verde-claro text-white font-bold' 
            : 'bg-gray-50 text-gray-800'}
          ${partida.vencedor_id && partida.vencedor_id !== partida.dupla2_id ? 'opacity-40' : ''}
        `}>
          {partida.dupla2 ? (
            <>
              <span className="text-sm truncate max-w-[180px]">
                {partida.dupla2.nome_dupla}
              </span>
              {partida.vencedor_id === partida.dupla2_id && (
                <span className="text-yellow-300 text-lg ml-2">🏆</span>
              )}
            </>
          ) : (
            <span className="text-gray-400 text-sm italic">Aguardando...</span>
          )}
        </div>
      </div>
    </div>
  )
}
