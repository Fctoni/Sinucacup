'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { getEdicao, updateEdicaoStatus, iniciarCampeonato, encerrarEDistribuirPontosAtomico } from '@/lib/services/edicoes'
import { getInscricoesPorEdicao } from '@/lib/services/inscricoes'
import { getDuplasPorEdicao, gerarDuplasAutomaticas, deleteDupla, validarExclusaoDupla, trocarJogadoresEntreDuplas, reordenarDuplas, reorganizarPosicoesDuplas } from '@/lib/services/duplas'
import { gerarChaveamento, getPartidasPorEdicao, getByesDaEdicao, registrarVencedor, validarRegistroVencedor, editarResultado } from '@/lib/services/partidas'
import { Edicao, DuplaComJogadores, PartidaComDuplas } from '@/types'
import StatusBadge from '@/components/edicoes/StatusBadge'
import GerenciarInscricoesModal from '@/components/inscricoes/GerenciarInscricoesModal'
import DuplaCardDraggable from '@/components/duplas/DuplaCardDraggable'
import CriarDuplaManualModal from '@/components/duplas/CriarDuplaManualModal'
import IniciarCampeonatoModal from '@/components/edicoes/IniciarCampeonatoModal'
import EncerrarCampeonatoModal from '@/components/edicoes/EncerrarCampeonatoModal'
import Bracket from '@/components/chaveamento/Bracket'
import ConfirmarVencedorModal from '@/components/chaveamento/ConfirmarVencedorModal'
import EditarResultadoModal from '@/components/chaveamento/EditarResultadoModal'
import ProgressoFases from '@/components/chaveamento/ProgressoFases'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function EdicaoDetalhesPage() {
  const params = useParams()
  const edicaoId = params.id as string
  
  const [edicao, setEdicao] = useState<Edicao | null>(null)
  const [inscritosCount, setInscritosCount] = useState(0)
  const [duplas, setDuplas] = useState<DuplaComJogadores[]>([])
  const [partidas, setPartidas] = useState<PartidaComDuplas[]>([])
  const [byes, setByes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalInscricoesOpen, setModalInscricoesOpen] = useState(false)
  const [modalDuplaManualOpen, setModalDuplaManualOpen] = useState(false)
  const [modalIniciarOpen, setModalIniciarOpen] = useState(false)
  const [modoReordenar, setModoReordenar] = useState(false)
  const [partidaSelecionada, setPartidaSelecionada] = useState<PartidaComDuplas | null>(null)
  const [modalVencedorOpen, setModalVencedorOpen] = useState(false)
  const [modalEditarOpen, setModalEditarOpen] = useState(false)
  const [modalEncerrarOpen, setModalEncerrarOpen] = useState(false)
  const [finalConcluida, setFinalConcluida] = useState(false)
  const [duplaCampea, setDuplaCampea] = useState<DuplaComJogadores | null>(null)
  const [duplaVice, setDuplaVice] = useState<DuplaComJogadores | null>(null)
  const [encerrandoCampeonato, setEncerrandoCampeonato] = useState(false)
  
  const fetchData = async () => {
    try {
      setLoading(true)
      const [edicaoData, inscritosData] = await Promise.all([
        getEdicao(edicaoId),
        getInscricoesPorEdicao(edicaoId),
      ])
      
      setEdicao(edicaoData)
      setInscritosCount(inscritosData.length)
      
      // Buscar duplas e partidas se status for chaveamento, em_andamento ou finalizada (historico)
      if (edicaoData.status === 'chaveamento' || edicaoData.status === 'em_andamento' || edicaoData.status === 'finalizada') {
        await fetchDuplas()
        await fetchPartidas()
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
  
  const fetchPartidas = async () => {
    try {
      const [partidasData, byesData] = await Promise.all([
        getPartidasPorEdicao(edicaoId),
        getByesDaEdicao(edicaoId),
      ])
      setPartidas(partidasData)
      setByes(byesData)
    } catch (error) {
      console.error('Erro ao carregar partidas:', error)
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
      
      // Se já existe chaveamento, regenerar automaticamente
      if (partidas.length > 0) {
        await gerarChaveamento(edicaoId)
        await fetchPartidas()
        toast.success('✅ Ordem salva e chaveamento regenerado!')
      } else {
        toast.success('✅ Ordem salva com sucesso!')
      }
      
      setModoReordenar(false)
      fetchDuplas()
    } catch (error: any) {
      toast.error('Erro ao salvar ordem: ' + error.message)
    }
  }
  
  const handleGerarChaveamento = async () => {
    if (partidas.length > 0) {
      const confirmar = window.confirm(
        '⚠️ Ja existe chaveamento! Deseja sobrescrever?\n\nIsso apagara todas as partidas.'
      )
      if (!confirmar) return
    }
    
    if (duplas.length < 2) {
      toast.error('❌ Minimo 2 duplas para gerar chaveamento')
      return
    }
    
    try {
      const resultado = await gerarChaveamento(edicaoId)
      
      if (resultado.byes && resultado.byes.length > 0) {
        toast.info(`ℹ️ ${resultado.numByes} dupla(s) com BYE: ${resultado.byes.join(', ')}`)
      }
      
      toast.success('✅ Chaveamento gerado com sucesso!')
      fetchPartidas()
    } catch (error: any) {
      toast.error('Erro ao gerar chaveamento: ' + error.message)
    }
  }
  
  const handleIniciarCampeonato = async () => {
    try {
      await iniciarCampeonato(edicaoId)
      toast.success('🎯 Campeonato iniciado! Boa sorte a todos!')
      fetchData()
    } catch (error: any) {
      toast.error('Erro: ' + error.message)
    } finally {
      setModalIniciarOpen(false)
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
  
  const handlePartidaClick = (partida: PartidaComDuplas) => {
    const validacao = validarRegistroVencedor(partida)
    
    if (!validacao.podeRegistrar) {
      toast.error(validacao.mensagem || 'Nao e possivel registrar vencedor')
      return
    }
    
    setPartidaSelecionada(partida)
    setModalVencedorOpen(true)
  }
  
  const handleConfirmarVencedor = async (vencedorId: string) => {
    if (!partidaSelecionada) return
    
    try {
      const resultado = await registrarVencedor(partidaSelecionada.id, vencedorId)
      
      toast.success(resultado.mensagem)
      
      setModalVencedorOpen(false)
      setPartidaSelecionada(null)
      
      // Recarregar dados
      await Promise.all([
        fetchPartidas(),
        fetchDuplas(),
        fetchData(),
      ])
    } catch (error: any) {
      toast.error('Erro ao registrar vencedor: ' + error.message)
    }
  }
  
  const handleEditarPartida = (partida: PartidaComDuplas) => {
    if (!partida.vencedor_id) {
      toast.error('Partida ainda nao foi finalizada')
      return
    }
    
    setPartidaSelecionada(partida)
    setModalEditarOpen(true)
  }
  
  const handleConfirmarEdicao = async (novoVencedorId: string) => {
    if (!partidaSelecionada) return
    
    try {
      const resultado = await editarResultado(partidaSelecionada.id, novoVencedorId)
      
      if (resultado.fasesLimpas.length > 0) {
        toast.success(`✅ Resultado editado!\n\n🔄 Fases limpas: ${resultado.fasesLimpas.join(', ').toUpperCase()}`)
      } else {
        toast.success('✅ Resultado editado com sucesso!')
      }
      
      setModalEditarOpen(false)
      setPartidaSelecionada(null)
      fetchPartidas()
    } catch (error: any) {
      toast.error('Erro ao editar resultado: ' + error.message)
    }
  }
  
  const handleEncerrarCampeonato = async () => {
    // 🛡️ CAMADA 1: Proteção contra múltiplos cliques
    if (encerrandoCampeonato) {
      console.log('⚠️ Encerramento já em andamento, ignorando clique')
      return
    }
    
    setEncerrandoCampeonato(true)
    
    try {
      // 🛡️ CAMADA 4: Usando função atômica SQL (100% segura contra race conditions)
      const resultado = await encerrarEDistribuirPontosAtomico(edicaoId)
      
      toast.success(`🏆 CAMPEONATO FINALIZADO! 🎉\n\n🥇 Campeoes: ${duplaCampea?.nome_dupla}!\n📊 Pontos distribuidos! Veja o ranking atualizado.`)
      
      setModalEncerrarOpen(false)
      fetchData() // Atualizar status
    } catch (error: any) {
      toast.error('Erro: ' + error.message)
    } finally {
      setEncerrandoCampeonato(false)
    }
  }
  
  // Verificar se final foi concluida
  useEffect(() => {
    if (partidas.length > 0) {
      const final = partidas.find(p => p.fase === 'final')
      if (final?.vencedor_id) {
        setFinalConcluida(true)
        setDuplaCampea(final.vencedor!)
        
        const vice = final.dupla1_id === final.vencedor_id ? final.dupla2! : final.dupla1!
        setDuplaVice(vice)
      }
    }
  }, [partidas])
  
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
  
  // Controle de travas
  const podeEditarDuplas = edicao.status === 'chaveamento'
  const podeGerarChaveamento = edicao.status === 'chaveamento'
  const modoReordenarDisponivel = edicao.status === 'chaveamento'
  
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
      
      {/* Card do Campeao - PRIMEIRO quando final concluida (em andamento OU finalizado) */}
      {(edicao.status === 'em_andamento' || edicao.status === 'finalizada') && finalConcluida && duplaCampea && (
        <div className="mb-6">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-ouro via-yellow-400 to-ouro opacity-20 animate-pulse" />
            
            <div className="relative bg-gradient-to-br from-ouro to-yellow-600 p-4 rounded-lg text-center border-2 border-ouro">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="text-xl font-bold text-cinza-escuro mb-1">CAMPEOES!</h3>
              <p className="text-lg font-bold text-white mb-3">{duplaCampea.nome_dupla}</p>
              
              <div className="bg-white bg-opacity-90 rounded-lg p-3 text-cinza-escuro mb-3">
                <div className="flex justify-around text-sm">
                  <div>
                    <p className="font-semibold">{duplaCampea.jogador1?.nome}</p>
                    <p className="text-xs opacity-70">{duplaCampea.jogador1?.setor}</p>
                  </div>
                  <div>
                    <p className="font-semibold">{duplaCampea.jogador2?.nome}</p>
                    <p className="text-xs opacity-70">{duplaCampea.jogador2?.setor}</p>
                  </div>
                </div>
              </div>
              
              {/* Botao de encerrar so aparece se ainda nao foi finalizado */}
              {edicao.status === 'em_andamento' && (
                <button
                  onClick={() => setModalEncerrarOpen(true)}
                  className="bg-gradient-to-r from-verde-medio to-verde-claro text-white px-6 py-2 rounded-lg text-sm font-bold hover:scale-105 transition-transform w-full"
                >
                  🏆 Encerrar Campeonato e Distribuir Pontos
                </button>
              )}
              
              {/* Badge de finalizado dentro do card do campeao */}
              {edicao.status === 'finalizada' && (
                <div className="bg-white bg-opacity-90 p-2 rounded-lg">
                  <p className="text-xs font-semibold text-verde-medio">✅ Campeonato Finalizado - Pontos Distribuídos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Bracket - SEGUNDO quando em andamento OU finalizado */}
      {(edicao.status === 'em_andamento' || edicao.status === 'finalizada') && partidas.length > 0 && (
        <div className="mb-6">
          {byes.length > 0 && (
            <div className="bg-azul-info bg-opacity-20 border-2 border-azul-info p-4 rounded-lg mb-6">
              <p className="font-semibold">ℹ️ Duplas com BYE (passam direto):</p>
              <p className="text-sm">{byes.map(b => b.dupla?.nome_dupla).join(', ')}</p>
            </div>
          )}
          
          <Bracket 
            partidas={partidas} 
            onPartidaClick={handlePartidaClick}
            onPartidaEdit={handleEditarPartida}
            statusEdicao={edicao.status}
          />
        </div>
      )}
      
      {/* Progresso das Fases - TERCEIRO quando em andamento OU finalizado */}
      {(edicao.status === 'em_andamento' || edicao.status === 'finalizada') && partidas.length > 0 && (
        <div className="mb-6">
          <ProgressoFases partidas={partidas} />
        </div>
      )}
      
      {/* Informacoes Gerais - QUARTO */}
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
          </div>
        </div>
      </div>
      
      {/* Secao de Duplas - se status = chaveamento, em_andamento ou finalizada (historico) */}
      {(edicao.status === 'chaveamento' || edicao.status === 'em_andamento' || edicao.status === 'finalizada') && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl">👥 Duplas Formadas ({duplas.length})</h3>
            {podeEditarDuplas && (
              <div className="flex gap-3">
                <button onClick={handleGerarDuplasAutomaticas} className="btn-primary">
                  🤖 Gerar Automaticamente
                </button>
                <button onClick={() => setModalDuplaManualOpen(true)} className="btn-secondary">
                  ➕ Criar Manual
                </button>
              </div>
            )}
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
              {/* Botao de reordenar (apenas se modoReordenarDisponivel) */}
              {modoReordenarDisponivel && duplas.length > 0 && (
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
                    onDelete={podeEditarDuplas ? handleExcluirDupla : undefined}
                    canDelete={podeEditarDuplas && !modoReordenar}
                    modoReordenar={modoReordenar}
                    posicaoVisual={modoReordenar ? index + 1 : undefined}
                  />
                ))}
              </div>
            </DndContext>
          )}
        </div>
      )}
      
      {/* Secao de Chaveamento - apenas para status CHAVEAMENTO (preparacao) */}
      {edicao.status === 'chaveamento' && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl">🎯 Chaveamento</h3>
            {podeGerarChaveamento && (
              <button onClick={handleGerarChaveamento} className="btn-primary">
                🎯 Gerar Chaveamento
              </button>
            )}
          </div>
          
          {byes.length > 0 && (
            <div className="bg-azul-info bg-opacity-20 border-2 border-azul-info p-4 rounded-lg mb-6">
              <p className="font-semibold">ℹ️ Duplas com BYE (passam direto):</p>
              <p className="text-sm">{byes.map(b => b.dupla?.nome_dupla).join(', ')}</p>
            </div>
          )}
          
          {partidas.length === 0 ? (
            <div className="card-base text-center py-8">
              <p className="text-texto-secundario">Chaveamento ainda nao foi gerado</p>
            </div>
          ) : (
            <>
              <Bracket 
                partidas={partidas} 
                onPartidaClick={handlePartidaClick}
                onPartidaEdit={handleEditarPartida}
                statusEdicao={edicao.status}
              />
              
              {/* Botao de iniciar campeonato */}
              <div className="mt-8">
                <div className="bg-gradient-to-r from-verde-medio to-verde-claro p-6 rounded-xl text-center">
                  <h3 className="text-2xl font-bold mb-3">🎯 Pronto para Comecar?</h3>
                  <p className="text-sm mb-4 opacity-90">
                    Revise o chaveamento e clique abaixo para iniciar o campeonato
                  </p>
                  <button
                    onClick={() => setModalIniciarOpen(true)}
                    className="bg-white text-verde-mesa px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                  >
                    🎯 Iniciar Campeonato
                  </button>
                </div>
              </div>
            </>
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
      
      <IniciarCampeonatoModal
        isOpen={modalIniciarOpen}
        onClose={() => setModalIniciarOpen(false)}
        onConfirm={handleIniciarCampeonato}
        numDuplas={duplas.length}
        numPartidasPrimeiraFase={partidas.filter(p => p.fase === partidas[0]?.fase).length}
        duplasComBye={byes.map(b => b.dupla?.nome_dupla || '')}
      />
      
      {partidaSelecionada && partidaSelecionada.dupla1 && partidaSelecionada.dupla2 && (
        <ConfirmarVencedorModal
          isOpen={modalVencedorOpen}
          onClose={() => {
            setModalVencedorOpen(false)
            setPartidaSelecionada(null)
          }}
          onConfirm={handleConfirmarVencedor}
          dupla1={partidaSelecionada.dupla1}
          dupla2={partidaSelecionada.dupla2}
        />
      )}
      
      {partidaSelecionada && modalEditarOpen && (
        <EditarResultadoModal
          isOpen={modalEditarOpen}
          onClose={() => {
            setModalEditarOpen(false)
            setPartidaSelecionada(null)
          }}
          onConfirm={handleConfirmarEdicao}
          partida={partidaSelecionada}
        />
      )}
      
      {duplaCampea && duplaVice && (
        <EncerrarCampeonatoModal
          isOpen={modalEncerrarOpen}
          onClose={() => setModalEncerrarOpen(false)}
          onConfirm={handleEncerrarCampeonato}
          duplaCampea={duplaCampea}
          duplaVice={duplaVice}
          numDemaisParticipantes={(inscritosCount || 0) - 4}
          isLoading={encerrandoCampeonato}
        />
      )}
    </div>
  )
}


