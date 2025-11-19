import { Edicao } from '@/types'
import StatusBadge from './StatusBadge'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Props = {
  edicao: Edicao
}

export default function EdicaoCard({ edicao }: Props) {
  const dataFormatada = format(new Date(edicao.data_inicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  
  return (
    <div className="card-base">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-texto-principal mb-2">{edicao.nome}</h3>
          <p className="text-texto-secundario text-sm">Edicao #{edicao.numero} • {edicao.ano}</p>
        </div>
        <StatusBadge status={edicao.status} />
      </div>
      
      <div className="space-y-2 mb-6">
        <p className="text-texto-secundario">
          <span className="font-semibold">Data de Inicio:</span> {dataFormatada}
        </p>
      </div>
      
      <Link 
        href={`/edicoes/${edicao.id}`}
        className="btn-primary w-full block text-center"
      >
        👁️ Ver Detalhes
      </Link>
    </div>
  )
}

