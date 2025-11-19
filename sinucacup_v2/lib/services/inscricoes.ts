import { supabase } from '@/lib/supabase'
import { Inscricao, Jogador } from '@/types'

export async function getInscricoesPorEdicao(edicaoId: string) {
  const { data, error } = await supabase
    .from('inscricoes')
    .select(`
      *,
      jogador:jogadores(*)
    `)
    .eq('edicao_id', edicaoId)
  
  if (error) throw error
  return data
}

export async function inscreverJogador(edicaoId: string, jogadorId: string) {
  const { data, error } = await supabase
    .from('inscricoes')
    .insert({
      edicao_id: edicaoId,
      jogador_id: jogadorId,
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Inscricao
}

export async function removerInscricao(edicaoId: string, jogadorId: string) {
  const { error } = await supabase
    .from('inscricoes')
    .delete()
    .eq('edicao_id', edicaoId)
    .eq('jogador_id', jogadorId)
  
  if (error) throw error
}

export async function getJogadoresDisponiveis(edicaoId: string) {
  // Buscar todos jogadores ativos
  const { data: todosJogadores, error: errorJogadores } = await supabase
    .from('jogadores')
    .select('*')
    .eq('ativo', true)
    .order('pontos_totais', { ascending: false })
  
  if (errorJogadores) throw errorJogadores
  
  // Buscar inscritos nesta edicao
  const { data: inscritos, error: errorInscritos } = await supabase
    .from('inscricoes')
    .select('jogador_id')
    .eq('edicao_id', edicaoId)
  
  if (errorInscritos) throw errorInscritos
  
  const inscritosIds = new Set(inscritos.map(i => i.jogador_id))
  
  // Filtrar jogadores nao inscritos
  const disponiveis = todosJogadores.filter(j => !inscritosIds.has(j.id))
  
  return disponiveis as Jogador[]
}

