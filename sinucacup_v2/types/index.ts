export type Jogador = {
  id: string
  nome: string
  setor: string
  foto_url: string | null
  pontos_totais: number
  vitorias: number
  participacoes: number
  ativo: boolean
  created_at: string
  updated_at: string
}

export type Edicao = {
  id: string
  nome: string
  numero: number
  ano: number
  data_inicio: string
  status: 'inscricoes_abertas' | 'chaveamento' | 'em_andamento' | 'finalizada'
  created_at: string
  updated_at: string
}

export type Inscricao = {
  id: string
  edicao_id: string
  jogador_id: string
  created_at: string
}

export type Dupla = {
  id: string
  edicao_id: string
  jogador1_id: string
  jogador2_id: string
  nome_dupla: string | null
  pontuacao_total: number
  posicao: number | null
  created_at: string
  updated_at: string
}

export type Partida = {
  id: string
  edicao_id: string
  fase: 'oitavas' | 'quartas' | 'semifinal' | 'final'
  dupla1_id: string | null
  dupla2_id: string | null
  vencedor_id: string | null
  posicao: number | null
  is_bye: boolean
  created_at: string
  updated_at: string
}

export type ByeTemporario = {
  id: string
  edicao_id: string
  dupla_id: string
  created_at: string
}

// Types com joins (para queries completas)
export type JogadorComDados = Jogador & {
  inscricoes?: Inscricao[]
}

export type DuplaComJogadores = Dupla & {
  jogador1?: Jogador
  jogador2?: Jogador
}

export type PartidaComDuplas = Partida & {
  dupla1?: DuplaComJogadores
  dupla2?: DuplaComJogadores
  vencedor?: DuplaComJogadores
}

