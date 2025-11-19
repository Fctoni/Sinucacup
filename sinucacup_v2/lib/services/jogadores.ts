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

