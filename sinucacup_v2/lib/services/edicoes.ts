import { supabase } from '@/lib/supabase'
import { Edicao } from '@/types'

export async function getEdicoes() {
  const { data, error } = await supabase
    .from('edicoes')
    .select('*')
    .order('ano', { ascending: false })
    .order('numero', { ascending: false })
  
  if (error) throw error
  return data as Edicao[]
}

export async function getEdicao(id: string) {
  const { data, error } = await supabase
    .from('edicoes')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Edicao
}

export async function createEdicao(edicao: Omit<Edicao, 'id' | 'created_at' | 'updated_at' | 'status'>) {
  const { data, error } = await supabase
    .from('edicoes')
    .insert({
      ...edicao,
      status: 'inscricoes_abertas',
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Edicao
}

export async function updateEdicaoStatus(id: string, status: Edicao['status']) {
  const { data, error } = await supabase
    .from('edicoes')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Edicao
}

export async function getProximoNumeroEdicao(ano: number) {
  const { data, error } = await supabase
    .from('edicoes')
    .select('numero')
    .eq('ano', ano)
    .order('numero', { ascending: false })
    .limit(1)
  
  if (error) throw error
  return data.length > 0 ? data[0].numero + 1 : 1
}

export async function iniciarCampeonato(edicaoId: string) {
  // Validar que tem chaveamento
  const { data: partidas, error: errorPartidas } = await supabase
    .from('partidas')
    .select('id')
    .eq('edicao_id', edicaoId)
    .limit(1)
  
  if (errorPartidas) throw errorPartidas
  
  if (!partidas || partidas.length === 0) {
    throw new Error('Nao ha chaveamento gerado para esta edicao')
  }
  
  // Atualizar status
  return await updateEdicaoStatus(edicaoId, 'em_andamento')
}

// 🛡️ CAMADA 4: Função que usa transação atômica SQL (100% segura)
export async function encerrarEDistribuirPontosAtomico(edicaoId: string) {
  try {
    const { data, error } = await supabase.rpc('encerrar_campeonato_atomico', {
      p_edicao_id: edicaoId
    })
    
    if (error) throw error
    
    return data
  } catch (error: any) {
    // Se erro contém "já foi finalizado", converter para mensagem amigável
    if (error.message?.includes('ja foi finalizado')) {
      throw new Error('Campeonato ja foi finalizado anteriormente!')
    }
    throw error
  }
}

// Função original com validação (mantida como backup)
export async function encerrarEDistribuirPontos(edicaoId: string) {
  // 🛡️ CAMADA 3: Validação de status para prevenir execuções duplicadas
  const { data: edicaoAtual, error: errorEdicao } = await supabase
    .from('edicoes')
    .select('status')
    .eq('id', edicaoId)
    .single()
  
  if (errorEdicao) throw errorEdicao
  
  if (edicaoAtual?.status === 'finalizada') {
    throw new Error('Campeonato ja foi finalizado anteriormente!')
  }
  
  // Buscar a final
  const { data: final, error: errorFinal } = await supabase
    .from('partidas')
    .select(`
      *,
      dupla1:duplas!partidas_dupla1_id_fkey(*),
      dupla2:duplas!partidas_dupla2_id_fkey(*),
      vencedor:duplas!partidas_vencedor_id_fkey(*)
    `)
    .eq('edicao_id', edicaoId)
    .eq('fase', 'final')
    .single()
  
  if (errorFinal) throw errorFinal
  
  if (!final.vencedor_id) {
    throw new Error('Final ainda nao foi concluida')
  }
  
  // Identificar campeao e vice
  const duplasCampeaId = final.vencedor_id
  const duplasViceId = final.dupla1_id === duplasCampeaId ? final.dupla2_id : final.dupla1_id
  
  // Buscar jogadores das duplas
  const { data: duplaCampea } = await supabase
    .from('duplas')
    .select('jogador1_id, jogador2_id')
    .eq('id', duplasCampeaId)
    .single()
  
  const { data: duplaVice } = await supabase
    .from('duplas')
    .select('jogador1_id, jogador2_id')
    .eq('id', duplasViceId)
    .single()
  
  if (!duplaCampea || !duplaVice) {
    throw new Error('Erro ao buscar dados das duplas finalistas')
  }
  
  // Buscar todos inscritos
  const { data: inscritos } = await supabase
    .from('inscricoes')
    .select('jogador_id')
    .eq('edicao_id', edicaoId)
  
  if (!inscritos) {
    throw new Error('Erro ao buscar inscritos da edicao')
  }
  
  const jogadoresCampeoes = [duplaCampea.jogador1_id, duplaCampea.jogador2_id]
  const jogadoresVice = [duplaVice.jogador1_id, duplaVice.jogador2_id]
  const todosInscritos = inscritos.map(i => i.jogador_id)
  const jogadoresDemais = todosInscritos.filter(
    id => !jogadoresCampeoes.includes(id) && !jogadoresVice.includes(id)
  )
  
  // Atualizar jogadores campeoes
  for (const jogadorId of jogadoresCampeoes) {
    const { data: jogador } = await supabase
      .from('jogadores')
      .select('pontos_totais, vitorias, participacoes')
      .eq('id', jogadorId)
      .single()
    
    if (!jogador) continue
    
    await supabase
      .from('jogadores')
      .update({
        pontos_totais: jogador.pontos_totais + 10,
        vitorias: jogador.vitorias + 1,
        participacoes: jogador.participacoes + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jogadorId)
  }
  
  // Atualizar jogadores vice
  for (const jogadorId of jogadoresVice) {
    const { data: jogador } = await supabase
      .from('jogadores')
      .select('pontos_totais, vitorias, participacoes')
      .eq('id', jogadorId)
      .single()
    
    if (!jogador) continue
    
    await supabase
      .from('jogadores')
      .update({
        pontos_totais: jogador.pontos_totais + 6,
        participacoes: jogador.participacoes + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jogadorId)
  }
  
  // Atualizar demais participantes
  for (const jogadorId of jogadoresDemais) {
    const { data: jogador } = await supabase
      .from('jogadores')
      .select('pontos_totais, vitorias, participacoes')
      .eq('id', jogadorId)
      .single()
    
    if (!jogador) continue
    
    await supabase
      .from('jogadores')
      .update({
        pontos_totais: jogador.pontos_totais + 2,
        participacoes: jogador.participacoes + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jogadorId)
  }
  
  // Atualizar status da edicao
  await updateEdicaoStatus(edicaoId, 'finalizada')
  
  return {
    campeoes: jogadoresCampeoes.length,
    vice: jogadoresVice.length,
    demais: jogadoresDemais.length,
    duplasCampeaId,
    duplasViceId,
  }
}

