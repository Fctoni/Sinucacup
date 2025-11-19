'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getEdicoes } from '@/lib/services/edicoes'
import { Edicao } from '@/types'
import EdicaoCard from '@/components/edicoes/EdicaoCard'
import NovaEdicaoModal from '@/components/edicoes/NovaEdicaoModal'

export default function EdicoesPage() {
  const [edicoes, setEdicoes] = useState<Edicao[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  
  const fetchEdicoes = async () => {
    try {
      setLoading(true)
      const data = await getEdicoes()
      setEdicoes(data)
    } catch (error: any) {
      toast.error('Erro ao carregar edicoes')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchEdicoes()
  }, [])
  
  const handleSuccess = () => {
    toast.success('✅ Edicao criada com sucesso!')
    fetchEdicoes()
  }
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">Carregando edicoes...</p>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl">🏆 Gestao de Edicoes</h2>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          ➕ Nova Edicao
        </button>
      </div>
      
      {edicoes.length === 0 ? (
        <div className="card-base text-center py-12">
          <p className="text-xl text-texto-secundario mb-4">Nenhuma edicao criada</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            ➕ Criar Primeira Edicao
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {edicoes.map((edicao) => (
            <EdicaoCard key={edicao.id} edicao={edicao} />
          ))}
        </div>
      )}
      
      <NovaEdicaoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
