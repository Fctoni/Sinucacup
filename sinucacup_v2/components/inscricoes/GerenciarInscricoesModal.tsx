'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Jogador } from '@/types'
import { getJogadoresDisponiveis, getInscricoesPorEdicao, inscreverJogador } from '@/lib/services/inscricoes'

type Props = {
  isOpen: boolean
  onClose: () => void
  edicaoId: string
  edicaoNome: string
}

export default function GerenciarInscricoesModal({ isOpen, onClose, edicaoId, edicaoNome }: Props) {
  const [disponiveis, setDisponiveis] = useState<Jogador[]>([])
  const [inscritos, setInscritos] = useState<Jogador[]>([])
  const [loading, setLoading] = useState(true)
  
  const fetchData = async () => {
    try {
      setLoading(true)
      const [disponiveisData, inscritosData] = await Promise.all([
        getJogadoresDisponiveis(edicaoId),
        getInscricoesPorEdicao(edicaoId),
      ])
      
      setDisponiveis(disponiveisData)
      setInscritos(inscritosData.map((i: any) => i.jogador))
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen, edicaoId])
  
  const handleInscrever = async (jogadorId: string) => {
    try {
      await inscreverJogador(edicaoId, jogadorId)
      await fetchData() // Recarregar listas
    } catch (error) {
      toast.error('Erro ao inscrever jogador')
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-cinza-card p-6 rounded-xl border-2 border-amarelo-destaque max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl">📝 Gerenciar Inscricoes</h2>
          <button onClick={onClose} className="text-3xl hover:text-vermelho-erro">×</button>
        </div>
        
        <p className="text-texto-secundario mb-6">Edicao: {edicaoNome}</p>
        
        {loading ? (
          <p className="text-center py-8">Carregando...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Painel Esquerdo: Disponiveis */}
            <div>
              <h3 className="text-xl mb-4 text-texto-principal">
                👥 Jogadores Disponiveis ({disponiveis.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {disponiveis.length === 0 ? (
                  <p className="text-texto-secundario text-center py-4">
                    Todos os jogadores ja estao inscritos
                  </p>
                ) : (
                  disponiveis.map((jogador) => (
                    <div
                      key={jogador.id}
                      className="bg-cinza-medio p-3 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{jogador.nome}</p>
                        <p className="text-sm text-texto-secundario">
                          {jogador.setor} • {jogador.pontos_totais} pts
                        </p>
                      </div>
                      <button
                        onClick={() => handleInscrever(jogador.id)}
                        className="bg-verde-medio hover:bg-verde-claro text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        ➕ Inscrever
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Painel Direito: Inscritos */}
            <div>
              <h3 className="text-xl mb-4 text-verde-claro">
                ✅ Jogadores Inscritos ({inscritos.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {inscritos.length === 0 ? (
                  <p className="text-texto-secundario text-center py-4">
                    Nenhum jogador inscrito ainda
                  </p>
                ) : (
                  inscritos.map((jogador) => (
                    <div
                      key={jogador.id}
                      className="bg-verde-medio bg-opacity-20 border-2 border-verde-medio p-3 rounded-lg"
                    >
                      <p className="font-semibold">{jogador.nome}</p>
                      <p className="text-sm text-texto-secundario">
                        {jogador.setor} • {jogador.pontos_totais} pts
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-primary">
            ✅ Concluir
          </button>
        </div>
      </div>
    </div>
  )
}

