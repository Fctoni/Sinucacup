'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { getEdicao, updateEdicaoStatus } from '@/lib/services/edicoes'
import { getInscricoesPorEdicao } from '@/lib/services/inscricoes'
import { getDuplasPorEdicao, gerarDuplasAutomaticas, deleteDupla, validarExclusaoDupla, trocarJogadoresEntreDuplas, reordenarDuplas, reorganizarPosicoesDuplas } from '@/lib/services/duplas'
import { Edicao, DuplaComJogadores } from '@/types'
import StatusBadge from '@/components/edicoes/StatusBadge'
import GerenciarInscricoesModal from '@/components/inscricoes/GerenciarInscricoesModal'
import DuplaCardDraggable from '@/components/duplas/DuplaCardDraggable'
import CriarDuplaManualModal from '@/components/duplas/CriarDuplaManualModal'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function EdicaoDetalhesPage() {
  const params = useParams()
  const edicaoId = params.id as string
  
  const [edicao, setEdicao] = useState<Edicao | null>(null)
  const [inscritosCount, setInscritosCount] = useState(0)
  const [duplas, setDuplas] = useState<DuplaComJogadores[]>([])
  const [loading, setLoading] = useState(true)
  const [modalInscricoesOpen, setModalInscricoesOpen] = useState(false)
  const [modalDuplaManualOpen, setModalDuplaManualOpen] = useState(false)
  const [modoReordenar, setModoReordenar] = useState(false)
  
  const fetchData = async () => {
    try {
      setLoading(true)
      const [edicaoData, inscritosData] = await Promise.all([
        getEdicao(edicaoId),
        getInscricoesPorEdicao(edicaoId),
      ])
      
      setEdicao(edicaoData)
      setInscritosCount(inscritosData.length)
      
      // Buscar duplas se status for chaveamento ou posterior
      if (edicaoData.status === 'chaveamento' || edicaoData.status === 'em_andamento' || edicaoData.status === 'finalizada') {
        await fetchDuplas()
      }
    } catch (error) {
      toast.error('Erro ao carregar edicao')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchDuplas = async () => {
    try {
      const duplasData = await getDuplasPorEdicao(edicaoId)
      setDuplas(duplasData)
    } catch (error) {
      console.error('Erro ao carregar duplas:', error)
    }
  }
  
  const handleGerarDuplasAutomaticas = async () => {
    if (duplas.length > 0) {
      const confirmar = window.confirm(
        '⚠️ Ja existem duplas! Deseja sobrescrever?\n\nIsso apagara as duplas atuais e o chaveamento.'
      )
      if (!confirmar) return
    }
    
    try {
      await gerarDuplasAutomaticas(edicaoId)
      toast.success('✅ Duplas geradas com sucesso!')
      fetchDuplas()
    } catch (error: any) {
      toast.error(error.message)
    }
  }
  
  const handleExcluirDupla = async (duplaId: string) => {
    try {
      const podeExcluir = await validarExclusaoDupla(duplaId)
      
      if (!podeExcluir) {
        toast.error('❌ Nao e possivel excluir! Dupla ja esta no chaveamento.\n\n💡 Dica: Apague o chaveamento primeiro.')
        return
      }
      
      await deleteDupla(duplaId)
      
      // Reorganizar posições após exclusão
      await reorganizarPosicoesDuplas(edicaoId)
      
      toast.success('✅ Dupla excluida com sucesso!')
      fetchDuplas()
    } catch (error: any) {
      toast.error('Erro ao excluir dupla: ' + error.message)
    }
  }
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return
    
    if (modoReordenar) {
      // Modo reordenar: trocar posicao de duplas
      const activeId = active.data.current?.duplaId
      const overId = over.data.current?.duplaId
      
      if (!activeId || !overId) return
      
      const activeIndex = duplas.findIndex(d => d.id === activeId)
      const overIndex = duplas.findIndex(d => d.id === overId)
      
      const novaDuplas = [...duplas]
      const [removed] = novaDuplas.splice(activeIndex, 1)
      novaDuplas.splice(overIndex, 0, removed)
      
      setDuplas(novaDuplas)
    } else {
      // Modo normal: trocar jogadores
      const origem = active.data.current
      const destino = over.data.current
      
      if (!origem || !destino) return
      if (origem.duplaId === destino.duplaId) return // mesma dupla
      
      try {
        await trocarJogadoresEntreDuplas(
          origem.duplaId,
          destino.duplaId,
          origem.posicao,
          destino.posicao
        )
        
        toast.success('✅ Jogadores trocados com sucesso!')
        fetchDuplas()
      } catch (error: any) {
        toast.error('Erro ao trocar jogadores: ' + error.message)
      }
    }
  }
  
  const handleSalvarOrdem = async () => {
    try {
      const novaOrdem = duplas.map(d => d.id)
      await reordenarDuplas(edicaoId, novaOrdem)
      setModoReordenar(false)
      toast.success('✅ Ordem salva! Chaveamento sera regenerado.')
      fetchDuplas()
    } catch (error: any) {
      toast.error('Erro ao salvar ordem: ' + error.message)
    }
  }
  
  const handleIniciarChaveamento = async () => {
    if (inscritosCount < 4) {
      toast.error('Minimo de 4 jogadores inscritos necessario')
      return
    }
    
    const confirmar = window.confirm(
      '🎯 Iniciar fase de chaveamento?\n\nVoce podera formar duplas e gerar o bracket.'
    )
    
    if (!confirmar) return
    
    try {
      await updateEdicaoStatus(edicaoId, 'chaveamento')
      toast.success('🎯 Chaveamento iniciado! Agora voce pode formar duplas.')
      fetchData() // Recarregar para atualizar o status
    } catch (error: any) {
      toast.error('Erro ao iniciar chaveamento: ' + error.message)
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
              <button 
                onClick={handleIniciarChaveamento}
                className="btn-secondary w-full"
              >
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
      
      {/* Secao de Duplas - apenas se status = chaveamento */}
      {edicao.status === 'chaveamento' && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl">👥 Duplas Formadas ({duplas.length})</h3>
            <div className="flex gap-3">
              <button onClick={handleGerarDuplasAutomaticas} className="btn-primary">
                🤖 Gerar Automaticamente
              </button>
              <button onClick={() => setModalDuplaManualOpen(true)} className="btn-secondary">
                ➕ Criar Manual
              </button>
            </div>
          </div>
          
          {duplas.length === 0 ? (
            <div className="card-base text-center py-8">
              <p className="text-texto-secundario">Nenhuma dupla formada ainda</p>
              <p className="text-sm text-texto-secundario mt-2">
                Use o botao "Gerar Automaticamente" para criar duplas balanceadas
              </p>
            </div>
          ) : (
            <DndContext onDragEnd={handleDragEnd}>
              {/* Botao de reordenar (apenas se status = chaveamento) */}
              {edicao.status === 'chaveamento' && duplas.length > 0 && (
                <button
                  onClick={() => modoReordenar ? handleSalvarOrdem() : setModoReordenar(true)}
                  className={`mb-4 ${modoReordenar ? 'btn-primary' : 'bg-laranja-aviso text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform'}`}
                >
                  {modoReordenar ? '✅ Salvar Ordem' : '🔀 Modo: Reordenar Chaveamento'}
                </button>
              )}
              
              {modoReordenar && (
                <div className="bg-laranja-aviso p-4 rounded-lg mb-4">
                  <p className="font-semibold">⚠️ Modo Reordenar Ativo</p>
                  <p className="text-sm">Arraste os cards de duplas para definir a ordem no chaveamento</p>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {duplas.map((dupla, index) => (
                  <DuplaCardDraggable
                    key={dupla.id}
                    dupla={dupla}
                    onDelete={handleExcluirDupla}
                    canDelete={!modoReordenar}
                    modoReordenar={modoReordenar}
                    posicaoVisual={modoReordenar ? index + 1 : undefined}
                  />
                ))}
              </div>
            </DndContext>
          )}
        </div>
      )}
      
      <GerenciarInscricoesModal
        isOpen={modalInscricoesOpen}
        onClose={() => {
          setModalInscricoesOpen(false)
          fetchData() // Atualizar contador
        }}
        edicaoId={edicaoId}
        edicaoNome={edicao.nome}
      />
      
      <CriarDuplaManualModal
        isOpen={modalDuplaManualOpen}
        onClose={() => setModalDuplaManualOpen(false)}
        onSuccess={() => {
          toast.success('✅ Dupla criada com sucesso!')
          fetchDuplas()
        }}
        edicaoId={edicaoId}
      />
    </div>
  )
}

