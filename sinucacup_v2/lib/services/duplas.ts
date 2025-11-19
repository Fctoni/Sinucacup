import { supabase } from '@/lib/supabase'
import { Dupla, DuplaComJogadores } from '@/types'
import { getInscricoesPorEdicao } from './inscricoes'

export async function getDuplasPorEdicao(edicaoId: string) {
  const { data, error } = await supabase
    .from('duplas')
    .select(`
      *,
      jogador1:jogadores!duplas_jogador1_id_fkey(*),
      jogador2:jogadores!duplas_jogador2_id_fkey(*)
    `)
    .eq('edicao_id', edicaoId)
    .order('posicao', { ascending: true })
  
  if (error) throw error
  return data as DuplaComJogadores[]
}

export async function createDupla(
  edicaoId: string,
  jogador1Id: string,
  jogador2Id: string,
  pontuacaoTotal: number,
  posicao: number
) {
  const { data: jogadores } = await supabase
    .from('jogadores')
    .select('nome')
    .in('id', [jogador1Id, jogador2Id])
  
  const nomeDupla = jogadores?.map(j => j.nome).join(' & ') || 'Dupla'
  
  const { data, error } = await supabase
    .from('duplas')
    .insert({
      edicao_id: edicaoId,
      jogador1_id: jogador1Id,
      jogador2_id: jogador2Id,
      nome_dupla: nomeDupla,
      pontuacao_total: pontuacaoTotal,
      posicao,
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Dupla
}

export async function deleteDupla(duplaId: string) {
  const { error } = await supabase
    .from('duplas')
    .delete()
    .eq('id', duplaId)
  
  if (error) throw error
}

export async function gerarDuplasAutomaticas(edicaoId: string) {
  // Buscar jogadores inscritos
  const inscritosData = await getInscricoesPorEdicao(edicaoId)
  const jogadores = inscritosData.map((i: any) => i.jogador)
  
  if (jogadores.length < 2) {
    throw new Error('Minimo 2 jogadores para formar duplas')
  }
  
  // Verificar numero par
  if (jogadores.length % 2 !== 0) {
    const sobrando = jogadores[jogadores.length - 1]
    throw new Error(`Numero impar de jogadores! Jogador sobrando: ${sobrando.nome}`)
  }
  
  // Ordenar por pontuacao (decrescente)
  const ordenados = [...jogadores].sort((a, b) => b.pontos_totais - a.pontos_totais)
  
  // Apagar duplas existentes
  await supabase
    .from('duplas')
    .delete()
    .eq('edicao_id', edicaoId)
  
  // Algoritmo de balanceamento
  const duplas = []
  const n = ordenados.length
  
  for (let i = 0; i < n / 2; i++) {
    const jogador1 = ordenados[i]
    const jogador2 = ordenados[n - 1 - i]
    const pontuacaoTotal = jogador1.pontos_totais + jogador2.pontos_totais
    
    await createDupla(edicaoId, jogador1.id, jogador2.id, pontuacaoTotal, i + 1)
    duplas.push({ jogador1, jogador2, pontuacaoTotal })
  }
  
  return duplas
}

export async function validarExclusaoDupla(duplaId: string) {
  // Verificar se dupla esta no chaveamento
  const { data: partidas, error } = await supabase
    .from('partidas')
    .select('id')
    .or(`dupla1_id.eq.${duplaId},dupla2_id.eq.${duplaId}`)
    .limit(1)
  
  if (error) throw error
  
  return partidas.length === 0 // true = pode excluir
}

export async function trocarJogadoresEntreDuplas(
  dupla1Id: string,
  dupla2Id: string,
  jogadorOrigemPosicao: 1 | 2, // qual jogador da dupla1 vai trocar
  jogadorDestinoPosicao: 1 | 2  // qual jogador da dupla2 vai receber
) {
  // Buscar as duas duplas
  const { data: duplas, error } = await supabase
    .from('duplas')
    .select(`
      *,
      jogador1:jogadores!duplas_jogador1_id_fkey(*),
      jogador2:jogadores!duplas_jogador2_id_fkey(*)
    `)
    .in('id', [dupla1Id, dupla2Id])
  
  if (error) throw error
  
  const dupla1 = duplas.find(d => d.id === dupla1Id) as DuplaComJogadores
  const dupla2 = duplas.find(d => d.id === dupla2Id) as DuplaComJogadores
  
  // Identificar jogadores que vao trocar
  const jogadorOrigem = jogadorOrigemPosicao === 1 ? dupla1.jogador1 : dupla1.jogador2
  const jogadorDestino = jogadorDestinoPosicao === 1 ? dupla2.jogador1 : dupla2.jogador2
  
  // Construir novas duplas
  const novaDupla1 = {
    jogador1_id: jogadorOrigemPosicao === 1 ? jogadorDestino!.id : dupla1.jogador1_id,
    jogador2_id: jogadorOrigemPosicao === 2 ? jogadorDestino!.id : dupla1.jogador2_id,
    pontuacao_total: 0, // recalculado abaixo
    nome_dupla: '',
  }
  
  const novaDupla2 = {
    jogador1_id: jogadorDestinoPosicao === 1 ? jogadorOrigem!.id : dupla2.jogador1_id,
    jogador2_id: jogadorDestinoPosicao === 2 ? jogadorOrigem!.id : dupla2.jogador2_id,
    pontuacao_total: 0,
    nome_dupla: '',
  }
  
  // Buscar pontuacoes
  const { data: jogadoresData } = await supabase
    .from('jogadores')
    .select('id, nome, pontos_totais')
    .in('id', [
      novaDupla1.jogador1_id,
      novaDupla1.jogador2_id,
      novaDupla2.jogador1_id,
      novaDupla2.jogador2_id,
    ])
  
  const jogadoresMap = new Map(jogadoresData?.map(j => [j.id, j]))
  
  // Calcular pontuacao e nome
  const j1_d1 = jogadoresMap.get(novaDupla1.jogador1_id)!
  const j2_d1 = jogadoresMap.get(novaDupla1.jogador2_id)!
  novaDupla1.pontuacao_total = j1_d1.pontos_totais + j2_d1.pontos_totais
  novaDupla1.nome_dupla = `${j1_d1.nome} & ${j2_d1.nome}`
  
  const j1_d2 = jogadoresMap.get(novaDupla2.jogador1_id)!
  const j2_d2 = jogadoresMap.get(novaDupla2.jogador2_id)!
  novaDupla2.pontuacao_total = j1_d2.pontos_totais + j2_d2.pontos_totais
  novaDupla2.nome_dupla = `${j1_d2.nome} & ${j2_d2.nome}`
  
  // Atualizar no banco
  await Promise.all([
    supabase
      .from('duplas')
      .update({
        ...novaDupla1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dupla1Id),
    supabase
      .from('duplas')
      .update({
        ...novaDupla2,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dupla2Id),
  ])
  
  return { dupla1: novaDupla1, dupla2: novaDupla2 }
}

export async function reordenarDuplas(edicaoId: string, novaOrdem: string[]) {
  // novaOrdem = array de IDs de duplas na ordem desejada
  const updates = novaOrdem.map((duplaId, index) =>
    supabase
      .from('duplas')
      .update({ posicao: index + 1 })
      .eq('id', duplaId)
  )
  
  await Promise.all(updates)
}

export async function reorganizarPosicoesDuplas(edicaoId: string) {
  // Buscar todas as duplas da edição ordenadas por posição atual
  const { data: duplas, error } = await supabase
    .from('duplas')
    .select('id, posicao')
    .eq('edicao_id', edicaoId)
    .order('posicao', { ascending: true })
  
  if (error) throw error
  
  // Reorganizar posições sequencialmente (1, 2, 3, 4...)
  const updates = duplas.map((dupla, index) =>
    supabase
      .from('duplas')
      .update({ posicao: index + 1 })
      .eq('id', dupla.id)
  )
  
  await Promise.all(updates)
}

