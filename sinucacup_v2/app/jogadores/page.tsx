'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getJogadores } from '@/lib/services/jogadores'
import { Jogador } from '@/types'
import JogadorCard from '@/components/jogadores/JogadorCard'
import NovoJogadorModal from '@/components/jogadores/NovoJogadorModal'

export default function JogadoresPage() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  
  const fetchJogadores = async () => {
    try {
      setLoading(true)
      const data = await getJogadores()
      setJogadores(data)
    } catch (error: any) {
      toast.error('Erro ao carregar jogadores')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchJogadores()
  }, [])
  
  const handleSuccess = () => {
    toast.success('✅ Jogador cadastrado com sucesso!')
    fetchJogadores()
  }
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">Carregando jogadores...</p>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl">👥 Gestao de Jogadores</h2>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          ➕ Novo Jogador
        </button>
      </div>
      
      {jogadores.length === 0 ? (
        <div className="card-base text-center py-12">
          <p className="text-xl text-texto-secundario mb-4">Nenhum jogador cadastrado</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            ➕ Cadastrar Primeiro Jogador
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {jogadores.map((jogador) => (
            <JogadorCard key={jogador.id} jogador={jogador} />
          ))}
        </div>
      )}
      
      <NovoJogadorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
