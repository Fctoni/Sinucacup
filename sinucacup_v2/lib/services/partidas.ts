import { supabase } from '@/lib/supabase'
import { Partida, PartidaComDuplas } from '@/types'
import { getDuplasPorEdicao } from './duplas'

export async function getPartidasPorEdicao(edicaoId: string) {
  const { data, error } = await supabase
    .from('partidas')
    .select(`
      *,
      dupla1:duplas!partidas_dupla1_id_fkey(
        *,
        jogador1:jogadores!duplas_jogador1_id_fkey(*),
        jogador2:jogadores!duplas_jogador2_id_fkey(*)
      ),
      dupla2:duplas!partidas_dupla2_id_fkey(
        *,
        jogador1:jogadores!duplas_jogador1_id_fkey(*),
        jogador2:jogadores!duplas_jogador2_id_fkey(*)
      ),
      vencedor:duplas!partidas_vencedor_id_fkey(
        *,
        jogador1:jogadores!duplas_jogador1_id_fkey(*),
        jogador2:jogadores!duplas_jogador2_id_fkey(*)
      )
    `)
    .eq('edicao_id', edicaoId)
    .order('fase', { ascending: true })
    .order('posicao', { ascending: true })
  
  if (error) throw error
  return data as PartidaComDuplas[]
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0
}

function getNextPowerOfTwo(n: number): number {
  let power = 1
  while (power < n) {
    power *= 2
  }
  return power
}

function getFaseInicial(numDuplas: number): string {
  if (numDuplas <= 2) return 'final'
  if (numDuplas <= 4) return 'semifinal'
  if (numDuplas <= 8) return 'quartas'
  return 'oitavas'
}

export async function gerarChaveamento(edicaoId: string) {
  // Buscar duplas
  const duplas = await getDuplasPorEdicao(edicaoId)
  
  if (duplas.length < 2) {
    throw new Error('Minimo 2 duplas para gerar chaveamento')
  }
  
  // Apagar chaveamento e byes anteriores
  await Promise.all([
    supabase.from('partidas').delete().eq('edicao_id', edicaoId),
    supabase.from('byes_temporarios').delete().eq('edicao_id', edicaoId),
  ])
  
  const numDuplas = duplas.length
  
  // Verificar se e potencia de 2
  if (isPowerOfTwo(numDuplas)) {
    // Caso simples: todas jogam
    return await gerarChaveamentoSimples(edicaoId, duplas)
  } else {
    // Caso com BYE
    return await gerarChaveamentoComBye(edicaoId, duplas)
  }
}

async function gerarChaveamentoSimples(edicaoId: string, duplas: any[]) {
  const fase = getFaseInicial(duplas.length)
  const partidas = []
  
  for (let i = 0; i < duplas.length; i += 2) {
    const partida = {
      edicao_id: edicaoId,
      fase,
      dupla1_id: duplas[i].id,
      dupla2_id: duplas[i + 1].id,
      vencedor_id: null,
      posicao: i / 2 + 1,
      is_bye: false,
    }
    partidas.push(partida)
  }
  
  const { error } = await supabase.from('partidas').insert(partidas)
  if (error) throw error
  
  return { byes: [], fase }
}

async function gerarChaveamentoComBye(edicaoId: string, duplas: any[]) {
  const numDuplas = duplas.length
  const proxPotencia = getNextPowerOfTwo(numDuplas)
  const numByes = proxPotencia - numDuplas
  const numJogam = numDuplas - numByes
  
  // Ordenar duplas por pontuacao (piores recebem BYE)
  const ordenadas = [...duplas].sort((a, b) => a.pontuacao_total - b.pontuacao_total)
  
  const duplasComBye = ordenadas.slice(0, numByes)
  const duplasQueJogam = ordenadas.slice(numByes)
  
  // Salvar byes temporarios
  const byes = duplasComBye.map(d => ({
    edicao_id: edicaoId,
    dupla_id: d.id,
  }))
  await supabase.from('byes_temporarios').insert(byes)
  
  // Criar partidas da primeira fase
  const fase = getFaseInicial(proxPotencia)
  const partidas = []
  
  for (let i = 0; i < duplasQueJogam.length; i += 2) {
    const partida = {
      edicao_id: edicaoId,
      fase,
      dupla1_id: duplasQueJogam[i].id,
      dupla2_id: duplasQueJogam[i + 1]?.id || null,
      vencedor_id: null,
      posicao: i / 2 + 1,
      is_bye: false,
    }
    partidas.push(partida)
  }
  
  const { error } = await supabase.from('partidas').insert(partidas)
  if (error) throw error
  
  return {
    byes: duplasComBye.map(d => d.nome_dupla),
    fase,
    numByes,
  }
}

export async function getByesDaEdicao(edicaoId: string) {
  const { data, error } = await supabase
    .from('byes_temporarios')
    .select(`
      *,
      dupla:duplas(*)
    `)
    .eq('edicao_id', edicaoId)
  
  if (error) throw error
  return data
}

export async function verificarFaseCompleta(edicaoId: string, fase: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('partidas')
    .select('id, vencedor_id')
    .eq('edicao_id', edicaoId)
    .eq('fase', fase)
  
  if (error) throw error
  
  // Todas as partidas devem ter vencedor
  return data.every(p => p.vencedor_id !== null)
}

export function getProximaFase(faseAtual: string): string | null {
  const fases = ['oitavas', 'quartas', 'semifinal', 'final']
  const indiceAtual = fases.indexOf(faseAtual)
  
  if (indiceAtual === -1 || indiceAtual === fases.length - 1) {
    return null // Ja e a final
  }
  
  return fases[indiceAtual + 1]
}

export async function criarProximaFase(edicaoId: string, faseAtual: string) {
  const proximaFase = getProximaFase(faseAtual)
  
  if (!proximaFase) {
    // Final concluida - nao ha proxima fase
    return null
  }
  
  // Buscar vencedores da fase atual
  const { data: partidasAtuais, error: errorPartidas } = await supabase
    .from('partidas')
    .select('vencedor_id, posicao')
    .eq('edicao_id', edicaoId)
    .eq('fase', faseAtual)
    .order('posicao', { ascending: true })
  
  if (errorPartidas) throw errorPartidas
  
  const vencedores = partidasAtuais.map(p => p.vencedor_id).filter(Boolean)
  
  // Verificar se ha byes para integrar
  const { data: byes, error: errorByes } = await supabase
    .from('byes_temporarios')
    .select('dupla_id')
    .eq('edicao_id', edicaoId)
  
  if (errorByes) throw errorByes
  
  let duplas = [...vencedores]
  
  // Se havia byes, integra-los agora na proxima fase
  if (byes.length > 0) {
    const duplasBye = byes.map(b => b.dupla_id)
    duplas = [...duplasBye, ...vencedores]
    
    // Remover byes pois ja foram integrados
    await supabase
      .from('byes_temporarios')
      .delete()
      .eq('edicao_id', edicaoId)
  }
  
  // Criar partidas da proxima fase
  const novasPartidas = []
  
  for (let i = 0; i < duplas.length; i += 2) {
    const partida = {
      edicao_id: edicaoId,
      fase: proximaFase,
      dupla1_id: duplas[i] || null,
      dupla2_id: duplas[i + 1] || null,
      vencedor_id: null,
      posicao: i / 2 + 1,
      is_bye: false,
    }
    novasPartidas.push(partida)
  }
  
  const { data, error } = await supabase
    .from('partidas')
    .insert(novasPartidas)
    .select()
  
  if (error) throw error
  
  return {
    proximaFase,
    numPartidas: novasPartidas.length,
  }
}

export async function registrarVencedor(partidaId: string, vencedorId: string) {
  // Buscar a partida para saber a edicao e fase
  const { data: partida, error: errorPartida } = await supabase
    .from('partidas')
    .select('edicao_id, fase')
    .eq('id', partidaId)
    .single()
  
  if (errorPartida) throw errorPartida
  
  // Registrar vencedor
  const { data, error } = await supabase
    .from('partidas')
    .update({
      vencedor_id: vencedorId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', partidaId)
    .select()
    .single()
  
  if (error) throw error
  
  // Verificar se fase foi completada
  const faseCompleta = await verificarFaseCompleta(partida.edicao_id, partida.fase)
  
  if (faseCompleta) {
    // Criar proxima fase
    const resultado = await criarProximaFase(partida.edicao_id, partida.fase)
    
    return {
      partida: data,
      proximaFaseCriada: resultado !== null,
      proximaFase: resultado?.proximaFase,
      mensagem: resultado
        ? `🎯 Nova fase criada: ${resultado.proximaFase.toUpperCase()}!`
        : '🏆 FINAL CONCLUIDA! Campeonato pode ser encerrado.',
    }
  }
  
  return {
    partida: data,
    proximaFaseCriada: false,
    mensagem: '✅ Vencedor registrado!',
  }
}

export function validarRegistroVencedor(partida: PartidaComDuplas): {
  podeRegistrar: boolean
  mensagem?: string
} {
  // Validar se ambas duplas estao definidas
  if (!partida.dupla1_id || !partida.dupla2_id) {
    return {
      podeRegistrar: false,
      mensagem: 'Aguardando definicao das duplas (TBD)',
    }
  }
  
  // Validar se ja tem vencedor
  if (partida.vencedor_id) {
    return {
      podeRegistrar: false,
      mensagem: 'Partida ja finalizada. Use "Editar Resultado" para alterar.',
    }
  }
  
  return { podeRegistrar: true }
}

export async function validarImpactoEdicao(
  partidaId: string,
  novoVencedorId: string
): Promise<{
  temImpacto: boolean
  fasesAfetadas: string[]
  partidasAfetadas: number
}> {
  // Buscar partida atual
  const { data: partidaAtual, error: errorPartida } = await supabase
    .from('partidas')
    .select('*')
    .eq('id', partidaId)
    .single()
  
  if (errorPartida) throw errorPartida
  
  const vencedorAntigoId = partidaAtual.vencedor_id
  
  if (!vencedorAntigoId) {
    return { temImpacto: false, fasesAfetadas: [], partidasAfetadas: 0 }
  }
  
  // Buscar fases posteriores
  const fasesOrdem = ['oitavas', 'quartas', 'semifinal', 'final']
  const indiceAtual = fasesOrdem.indexOf(partidaAtual.fase)
  const fasesPosteriores = fasesOrdem.slice(indiceAtual + 1)
  
  if (fasesPosteriores.length === 0) {
    return { temImpacto: false, fasesAfetadas: [], partidasAfetadas: 0 }
  }
  
  // Verificar se vencedor antigo esta em fases posteriores
  const { data: partidasPosteriores, error: errorPosteriores } = await supabase
    .from('partidas')
    .select('id, fase, vencedor_id')
    .eq('edicao_id', partidaAtual.edicao_id)
    .in('fase', fasesPosteriores)
    .or(`dupla1_id.eq.${vencedorAntigoId},dupla2_id.eq.${vencedorAntigoId}`)
  
  if (errorPosteriores) throw errorPosteriores
  
  if (partidasPosteriores.length === 0) {
    return { temImpacto: false, fasesAfetadas: [], partidasAfetadas: 0 }
  }
  
  const fasesAfetadas = [...new Set(partidasPosteriores.map(p => p.fase))]
  
  return {
    temImpacto: true,
    fasesAfetadas,
    partidasAfetadas: partidasPosteriores.length,
  }
}

export async function editarResultado(
  partidaId: string,
  novoVencedorId: string
) {
  // Buscar partida
  const { data: partidaAtual, error: errorPartida } = await supabase
    .from('partidas')
    .select('*')
    .eq('id', partidaId)
    .single()
  
  if (errorPartida) throw errorPartida
  
  const vencedorAntigoId = partidaAtual.vencedor_id
  
  // Atualizar vencedor da partida atual
  await supabase
    .from('partidas')
    .update({
      vencedor_id: novoVencedorId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', partidaId)
  
  if (!vencedorAntigoId) {
    return { fasesLimpas: [] }
  }
  
  // Buscar fases posteriores
  const fasesOrdem = ['oitavas', 'quartas', 'semifinal', 'final']
  const indiceAtual = fasesOrdem.indexOf(partidaAtual.fase)
  const fasesPosteriores = fasesOrdem.slice(indiceAtual + 1)
  
  if (fasesPosteriores.length === 0) {
    return { fasesLimpas: [] }
  }
  
  // Buscar partidas das fases posteriores que tem o vencedor antigo
  const { data: partidasAfetadas } = await supabase
    .from('partidas')
    .select('id, fase, dupla1_id, dupla2_id')
    .eq('edicao_id', partidaAtual.edicao_id)
    .in('fase', fasesPosteriores)
    .or(`dupla1_id.eq.${vencedorAntigoId},dupla2_id.eq.${vencedorAntigoId}`)
  
  if (!partidasAfetadas || partidasAfetadas.length === 0) {
    return { fasesLimpas: [] }
  }
  
  // Atualizar partidas: trocar vencedor antigo pelo novo
  for (const partida of partidasAfetadas) {
    const updates: any = {
      vencedor_id: null, // Limpar vencedor
      updated_at: new Date().toISOString(),
    }
    
    if (partida.dupla1_id === vencedorAntigoId) {
      updates.dupla1_id = novoVencedorId
    }
    
    if (partida.dupla2_id === vencedorAntigoId) {
      updates.dupla2_id = novoVencedorId
    }
    
    await supabase
      .from('partidas')
      .update(updates)
      .eq('id', partida.id)
  }
  
  const fasesLimpas = [...new Set(partidasAfetadas.map(p => p.fase))]
  
  return { fasesLimpas }
}

