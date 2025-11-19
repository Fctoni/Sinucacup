import { Jogador } from '@/types'
import Image from 'next/image'

type Props = {
  jogador: Jogador
}

export default function JogadorCard({ jogador }: Props) {
  return (
    <div className="card-base text-center">
      <div className="mb-4">
        {jogador.foto_url ? (
          <Image
            src={jogador.foto_url}
            alt={jogador.nome}
            width={100}
            height={100}
            className="rounded-full mx-auto border-4 border-verde-medio"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-verde-medio flex items-center justify-center mx-auto text-4xl">
            👤
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-bold mb-2 text-texto-principal">{jogador.nome}</h3>
      <p className="text-texto-secundario mb-4">{jogador.setor}</p>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-cinza-medio p-2 rounded">
          <p className="text-amarelo-destaque font-bold text-xl">{jogador.pontos_totais}</p>
          <p className="text-xs text-texto-secundario">Pontos</p>
        </div>
        <div className="bg-cinza-medio p-2 rounded">
          <p className="text-verde-claro font-bold text-xl">{jogador.vitorias}</p>
          <p className="text-xs text-texto-secundario">Vitorias</p>
        </div>
        <div className="bg-cinza-medio p-2 rounded">
          <p className="text-azul-info font-bold text-xl">{jogador.participacoes}</p>
          <p className="text-xs text-texto-secundario">Jogos</p>
        </div>
      </div>
      
      {!jogador.ativo && (
        <div className="mt-4">
          <span className="badge bg-cinza-medio text-texto-secundario">Inativo</span>
        </div>
      )}
    </div>
  )
}

