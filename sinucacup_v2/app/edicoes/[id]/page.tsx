'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { getEdicao } from '@/lib/services/edicoes'
import { getInscricoesPorEdicao } from '@/lib/services/inscricoes'
import { Edicao } from '@/types'
import StatusBadge from '@/components/edicoes/StatusBadge'
import GerenciarInscricoesModal from '@/components/inscricoes/GerenciarInscricoesModal'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function EdicaoDetalhesPage() {
  const params = useParams()
  const edicaoId = params.id as string
  
  const [edicao, setEdicao] = useState<Edicao | null>(null)
  const [inscritosCount, setInscritosCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalInscricoesOpen, setModalInscricoesOpen] = useState(false)
  
  const fetchData = async () => {
    try {
      setLoading(true)
      const [edicaoData, inscritosData] = await Promise.all([
        getEdicao(edicaoId),
        getInscricoesPorEdicao(edicaoId),
      ])
      
      setEdicao(edicaoData)
      setInscritosCount(inscritosData.length)
    } catch (error) {
      toast.error('Erro ao carregar edicao')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [edicaoId])
  
  if (loading) {
    return <p className="text-center py-12">Carregando...</p>
  }
  
  if (!edicao) {
    return <p className="text-center py-12">Edicao nao encontrada</p>
  }
  
  const dataFormatada = format(new Date(edicao.data_inicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-3xl">{edicao.nome}</h2>
          <StatusBadge status={edicao.status} />
        </div>
        <p className="text-texto-secundario">
          Edicao #{edicao.numero} • {edicao.ano} • Inicio: {dataFormatada}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-base">
          <h3 className="text-xl mb-4">📊 Informacoes</h3>
          <div className="space-y-3">
            <div>
              <p className="text-texto-secundario text-sm">Status</p>
              <StatusBadge status={edicao.status} />
            </div>
            <div>
              <p className="text-texto-secundario text-sm">Jogadores Inscritos</p>
              <p className="text-2xl font-bold text-amarelo-destaque">{inscritosCount}</p>
            </div>
          </div>
        </div>
        
        <div className="card-base">
          <h3 className="text-xl mb-4">⚙️ Acoes</h3>
          <div className="space-y-3">
            {edicao.status === 'inscricoes_abertas' && (
              <button
                onClick={() => setModalInscricoesOpen(true)}
                className="btn-primary w-full"
              >
                📝 Gerenciar Inscricoes
              </button>
            )}
            
            {edicao.status === 'inscricoes_abertas' && inscritosCount >= 4 && (
              <button className="btn-secondary w-full">
                🎯 Iniciar Chaveamento
              </button>
            )}
            
            {edicao.status === 'chaveamento' && (
              <button className="btn-primary w-full">
                👥 Gerenciar Duplas
              </button>
            )}
          </div>
        </div>
      </div>
      
      <GerenciarInscricoesModal
        isOpen={modalInscricoesOpen}
        onClose={() => {
          setModalInscricoesOpen(false)
          fetchData() // Atualizar contador
        }}
        edicaoId={edicaoId}
        edicaoNome={edicao.nome}
      />
    </div>
  )
}

