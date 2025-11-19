import { DuplaComJogadores } from '@/types'

type Props = {
  dupla: DuplaComJogadores
  onDelete?: (duplaId: string) => void
  canDelete?: boolean
}

export default function DuplaCard({ dupla, onDelete, canDelete = true }: Props) {
  const handleDelete = async () => {
    if (!onDelete) return
    
    const confirmar = window.confirm(
      `Excluir dupla "${dupla.nome_dupla}"?\n\nEsta acao nao pode ser desfeita.`
    )
    
    if (confirmar) {
      onDelete(dupla.id)
    }
  }
  
  return (
    <div className="card-base">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-amarelo-destaque">
          Dupla #{dupla.posicao}
        </h3>
        {canDelete && onDelete && (
          <button
            onClick={handleDelete}
            className="text-vermelho-erro hover:bg-vermelho-erro hover:text-white px-3 py-1 rounded transition-colors"
          >
            🗑️ Excluir
          </button>
        )}
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="bg-cinza-medio p-3 rounded-lg">
          <p className="text-sm text-texto-secundario mb-1">Jogador 1</p>
          <p className="font-semibold">{dupla.jogador1?.nome}</p>
          <p className="text-xs text-texto-secundario">{dupla.jogador1?.setor}</p>
        </div>
        
        <div className="bg-cinza-medio p-3 rounded-lg">
          <p className="text-sm text-texto-secundario mb-1">Jogador 2</p>
          <p className="font-semibold">{dupla.jogador2?.nome}</p>
          <p className="text-xs text-texto-secundario">{dupla.jogador2?.setor}</p>
        </div>
      </div>
      
      <div className="bg-verde-medio bg-opacity-20 border-2 border-verde-medio p-3 rounded-lg text-center">
        <p className="text-sm text-texto-secundario">Pontuacao Total</p>
        <p className="text-2xl font-bold text-amarelo-destaque">{dupla.pontuacao_total} pts</p>
      </div>
    </div>
  )
}

