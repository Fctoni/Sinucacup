'use client'

import { useEffect, useState } from 'react'
import { getRanking, getTop3, getEstatisticasGerais } from '@/lib/services/jogadores'
import { Jogador } from '@/types'
import Podio from '@/components/ranking/Podio'
import TabelaRanking from '@/components/ranking/TabelaRanking'
import EstatisticasGerais from '@/components/ranking/EstatisticasGerais'

export default function RankingPage() {
  const [ranking, setRanking] = useState<Jogador[]>([])
  const [top3, setTop3] = useState<Jogador[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchRanking()
  }, [])
  
  const fetchRanking = async () => {
    try {
      setLoading(true)
      const [rankingData, top3Data, statsData] = await Promise.all([
        getRanking(),
        getTop3(),
        getEstatisticasGerais(),
      ])
      
      setRanking(rankingData)
      setTop3(top3Data)
      setStats(statsData)
    } catch (error) {
      alert('Erro ao carregar ranking')
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">Carregando ranking...</p>
      </div>
    )
  }
  
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-5xl mb-4">📈 Ranking Global</h1>
        <p className="text-texto-secundario text-lg">
          Classificacao geral dos jogadores - Ano atual
        </p>
      </div>
      
      {stats && <EstatisticasGerais stats={stats} />}
      
      <Podio top3={top3} />
      
      <div className="mb-6">
        <h3 className="text-2xl mb-4">📊 Classificacao Completa</h3>
      </div>
      
      <TabelaRanking jogadores={ranking} />
    </div>
  )
}

