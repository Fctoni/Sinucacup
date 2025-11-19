import { Edicao } from '@/types'

type Props = {
  status: Edicao['status']
}

const statusConfig = {
  inscricoes_abertas: {
    label: '📝 Inscricoes Abertas',
    className: 'badge-inscricoes',
  },
  chaveamento: {
    label: '🔧 Chaveamento',
    className: 'badge-chaveamento',
  },
  em_andamento: {
    label: '🎯 Em Andamento',
    className: 'badge-andamento',
  },
  finalizada: {
    label: '🏆 Finalizada',
    className: 'badge-finalizada',
  },
}

export default function StatusBadge({ status }: Props) {
  const config = statusConfig[status]
  
  return (
    <span className={config.className}>
      {config.label}
    </span>
  )
}

