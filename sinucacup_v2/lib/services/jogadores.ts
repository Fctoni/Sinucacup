import { supabase } from '@/lib/supabase'
import { Jogador } from '@/types'

export async function getJogadores() {
  const { data, error } = await supabase
    .from('jogadores')
    .select('*')
    .order('pontos_totais', { ascending: false })
  
  if (error) throw error
  return data as Jogador[]
}

export async function getJogador(id: string) {
  const { data, error } = await supabase
    .from('jogadores')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Jogador
}

export async function createJogador(jogador: Omit<Jogador, 'id' | 'created_at' | 'updated_at' | 'pontos_totais' | 'vitorias' | 'participacoes' | 'ativo'>) {
  const { data, error } = await supabase
    .from('jogadores')
    .insert({
      ...jogador,
      pontos_totais: 0,
      vitorias: 0,
      participacoes: 0,
      ativo: true,
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Jogador
}

export async function updateJogador(id: string, updates: Partial<Jogador>) {
  const { data, error } = await supabase
    .from('jogadores')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Jogador
}

export async function getRanking() {
  const { data, error } = await supabase
    .from('jogadores')
    .select('*')
    .eq('ativo', true)
    .order('pontos_totais', { ascending: false })
    .order('vitorias', { ascending: false })
    .order('nome', { ascending: true })
  
  if (error) throw error
  return data as Jogador[]
}

export async function getTop3() {
  const ranking = await getRanking()
  return ranking.slice(0, 3)
}

export async function getEstatisticasGerais() {
  const { data: jogadores } = await supabase
    .from('jogadores')
    .select('pontos_totais, vitorias, participacoes')
    .eq('ativo', true)
  
  if (!jogadores) return null
  
  const totalPontos = jogadores.reduce((sum, j) => sum + j.pontos_totais, 0)
  const totalVitorias = jogadores.reduce((sum, j) => sum + j.vitorias, 0)
  const totalParticipacoes = jogadores.reduce((sum, j) => sum + j.participacoes, 0)
  const mediaParticipacoes = jogadores.length > 0 ? totalParticipacoes / jogadores.length : 0
  
  return {
    totalJogadores: jogadores.length,
    totalPontos,
    totalVitorias,
    mediaParticipacoes: Math.round(mediaParticipacoes * 10) / 10,
  }
}

