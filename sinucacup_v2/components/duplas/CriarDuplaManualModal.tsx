'use client'

import { useState, useEffect } from 'react'
import { Jogador } from '@/types'
import { getJogadores } from '@/lib/services/jogadores'
import { getInscricoesPorEdicao } from '@/lib/services/inscricoes'
import { createDupla, getDuplasPorEdicao, reorganizarPosicoesDuplas } from '@/lib/services/duplas'
import { supabase } from '@/lib/supabase'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  edicaoId: string
}

export default function CriarDuplaManualModal({ isOpen, onClose, onSuccess, edicaoId }: Props) {
  const [jogador1Id, setJogador1Id] = useState('')
  const [jogador2Id, setJogador2Id] = useState('')
  const [apenasInscritos, setApenasInscritos] = useState(true)
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      fetchJogadores()
    }
  }, [isOpen, apenasInscritos, edicaoId])
  
  const fetchJogadores = async () => {
    try {
      // Buscar duplas existentes para filtrar jogadores já alocados
      const duplasExistentes = await getDuplasPorEdicao(edicaoId)
      const jogadoresEmDuplas = new Set<string>()
      
      duplasExistentes.forEach(dupla => {
        jogadoresEmDuplas.add(dupla.jogador1_id)
        jogadoresEmDuplas.add(dupla.jogador2_id)
      })
      
      if (apenasInscritos) {
        const inscritosData = await getInscricoesPorEdicao(edicaoId)
        const jogadoresInscritos = inscritosData.map((i: any) => i.jogador)
        // Filtrar apenas jogadores que NÃO estão em duplas
        setJogadores(jogadoresInscritos.filter((j: Jogador) => !jogadoresEmDuplas.has(j.id)))
      } else {
        const todosJogadores = await getJogadores()
        // Filtrar apenas jogadores ativos que NÃO estão em duplas
        setJogadores(todosJogadores.filter(j => j.ativo && !jogadoresEmDuplas.has(j.id)))
      }
    } catch (error) {
      alert('Erro ao carregar jogadores')
    }
  }
  
  if (!isOpen) return null
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!jogador1Id || !jogador2Id) {
      alert('Selecione ambos os jogadores')
      return
    }
    
    if (jogador1Id === jogador2Id) {
      alert('Os dois jogadores devem ser diferentes!')
      return
    }
    
    try {
      setLoading(true)
      
      const j1 = jogadores.find(j => j.id === jogador1Id)
      const j2 = jogadores.find(j => j.id === jogador2Id)
      const pontuacaoTotal = (j1?.pontos_totais || 0) + (j2?.pontos_totais || 0)
      
      // Buscar proxima posicao
      const { data: duplasExistentes } = await supabase
        .from('duplas')
        .select('posicao')
        .eq('edicao_id', edicaoId)
        .order('posicao', { ascending: false })
        .limit(1)
      
      const proximaPosicao = duplasExistentes && duplasExistentes.length > 0
        ? duplasExistentes[0].posicao + 1
        : 1
      
      await createDupla(edicaoId, jogador1Id, jogador2Id, pontuacaoTotal, proximaPosicao)
      
      // Reorganizar posições para manter sequência contínua
      await reorganizarPosicoesDuplas(edicaoId)
      
      setJogador1Id('')
      setJogador2Id('')
      onSuccess()
      onClose()
    } catch (error: any) {
      alert('Erro ao criar dupla: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-cinza-card p-8 rounded-xl border-2 border-amarelo-destaque max-w-md w-full">
        <h2 className="text-2xl mb-6">👥 Criar Dupla Manualmente</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Jogador 1 * 
              <span className="text-xs text-texto-secundario ml-2">
                ({jogadores.length} disponíveis)
              </span>
            </label>
            <select
              value={jogador1Id}
              onChange={(e) => setJogador1Id(e.target.value)}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
            >
              <option value="">Selecione...</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome} ({j.pontos_totais} pts)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">
              Jogador 2 *
              <span className="text-xs text-texto-secundario ml-2">
                ({jogadores.length} disponíveis)
              </span>
            </label>
            <select
              value={jogador2Id}
              onChange={(e) => setJogador2Id(e.target.value)}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
            >
              <option value="">Selecione...</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome} ({j.pontos_totais} pts)
                </option>
              ))}
            </select>
          </div>
          
          {jogadores.length === 0 && (
            <div className="bg-laranja-aviso bg-opacity-20 border border-laranja-aviso p-3 rounded-lg">
              <p className="text-sm text-laranja-aviso font-semibold">
                ⚠️ Nenhum jogador disponível
              </p>
              <p className="text-xs text-texto-secundario mt-1">
                Todos os jogadores já estão em duplas ou não há jogadores {apenasInscritos ? 'inscritos' : 'ativos'}.
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="apenasInscritos"
              checked={apenasInscritos}
              onChange={(e) => setApenasInscritos(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="apenasInscritos" className="text-sm">
              Mostrar apenas jogadores inscritos
            </label>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Criando...' : '✅ Criar Dupla'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

