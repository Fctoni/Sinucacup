# LOTE 1: Banco de Dados e Types

## Objetivo
Modelar dados e criar schema SQL completo no Supabase

## Tarefas

### 1. Criar Tabela: jogadores

```sql
CREATE TABLE jogadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  setor VARCHAR(255) NOT NULL,
  foto_url TEXT,
  pontos_totais INTEGER DEFAULT 0,
  vitorias INTEGER DEFAULT 0,
  participacoes INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indice para ordenacao por pontuacao
CREATE INDEX idx_jogadores_pontos ON jogadores(pontos_totais DESC);

-- Indice para buscar jogadores ativos
CREATE INDEX idx_jogadores_ativo ON jogadores(ativo);
```

### 2. Criar Tabela: edicoes

```sql
CREATE TABLE edicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  numero INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  data_inicio DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'inscricoes_abertas' CHECK (status IN ('inscricoes_abertas', 'chaveamento', 'em_andamento', 'finalizada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indice para ordenacao por numero/ano
CREATE INDEX idx_edicoes_numero ON edicoes(ano DESC, numero DESC);

-- Indice para filtrar por status
CREATE INDEX idx_edicoes_status ON edicoes(status);
```

### 3. Criar Tabela: inscricoes

```sql
CREATE TABLE inscricoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edicao_id UUID NOT NULL REFERENCES edicoes(id) ON DELETE CASCADE,
  jogador_id UUID NOT NULL REFERENCES jogadores(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraint para evitar duplicatas
  UNIQUE(edicao_id, jogador_id)
);

-- Indices para queries otimizadas
CREATE INDEX idx_inscricoes_edicao ON inscricoes(edicao_id);
CREATE INDEX idx_inscricoes_jogador ON inscricoes(jogador_id);
```

### 4. Criar Tabela: duplas

```sql
CREATE TABLE duplas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edicao_id UUID NOT NULL REFERENCES edicoes(id) ON DELETE CASCADE,
  jogador1_id UUID NOT NULL REFERENCES jogadores(id) ON DELETE CASCADE,
  jogador2_id UUID NOT NULL REFERENCES jogadores(id) ON DELETE CASCADE,
  nome_dupla VARCHAR(255),
  pontuacao_total INTEGER DEFAULT 0,
  posicao INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints de validacao
  CHECK (jogador1_id != jogador2_id)
);

-- Indices
CREATE INDEX idx_duplas_edicao ON duplas(edicao_id);
CREATE INDEX idx_duplas_posicao ON duplas(edicao_id, posicao);
```

### 5. Criar Tabela: partidas

```sql
CREATE TABLE partidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edicao_id UUID NOT NULL REFERENCES edicoes(id) ON DELETE CASCADE,
  fase VARCHAR(50) NOT NULL CHECK (fase IN ('oitavas', 'quartas', 'semifinal', 'final')),
  dupla1_id UUID REFERENCES duplas(id) ON DELETE CASCADE,
  dupla2_id UUID REFERENCES duplas(id) ON DELETE CASCADE,
  vencedor_id UUID REFERENCES duplas(id) ON DELETE SET NULL,
  posicao INTEGER,
  is_bye BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indices
CREATE INDEX idx_partidas_edicao ON partidas(edicao_id);
CREATE INDEX idx_partidas_fase ON partidas(edicao_id, fase);
CREATE INDEX idx_partidas_vencedor ON partidas(vencedor_id);
```

### 6. Criar Tabela: byes_temporarios

```sql
CREATE TABLE byes_temporarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edicao_id UUID NOT NULL REFERENCES edicoes(id) ON DELETE CASCADE,
  dupla_id UUID NOT NULL REFERENCES duplas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraint para evitar duplicatas
  UNIQUE(edicao_id, dupla_id)
);

-- Indice
CREATE INDEX idx_byes_edicao ON byes_temporarios(edicao_id);
```

### 7. Configurar Row Level Security (RLS)

**Politica: Acesso publico total (sem autenticacao)**

```sql
-- Ativar RLS em todas as tabelas
ALTER TABLE jogadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE edicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplas ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE byes_temporarios ENABLE ROW LEVEL SECURITY;

-- Politicas de acesso publico (sem autenticacao)
CREATE POLICY "Publico pode fazer tudo em jogadores" ON jogadores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Publico pode fazer tudo em edicoes" ON edicoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Publico pode fazer tudo em inscricoes" ON inscricoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Publico pode fazer tudo em duplas" ON duplas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Publico pode fazer tudo em partidas" ON partidas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Publico pode fazer tudo em byes_temporarios" ON byes_temporarios FOR ALL USING (true) WITH CHECK (true);
```

### 8. Criar Types TypeScript

**types/index.ts:**

```typescript
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
```

### 9. Criar Seeds (Dados de Exemplo - Opcional)

```sql
-- Inserir jogadores de exemplo
INSERT INTO jogadores (nome, setor, pontos_totais, vitorias, participacoes) VALUES
  ('Joao Silva', 'TI', 0, 0, 0),
  ('Maria Santos', 'RH', 0, 0, 0),
  ('Pedro Oliveira', 'Vendas', 0, 0, 0),
  ('Ana Costa', 'Marketing', 0, 0, 0),
  ('Carlos Lima', 'TI', 0, 0, 0),
  ('Julia Ferreira', 'Financeiro', 0, 0, 0),
  ('Rafael Souza', 'Vendas', 0, 0, 0),
  ('Beatriz Alves', 'RH', 0, 0, 0);
```

## Checklist de Validacao

- [ ] Todas as tabelas criadas no Supabase
- [ ] Indices configurados
- [ ] RLS ativado e politicas criadas
- [ ] Types TypeScript criados
- [ ] Testar query simples: `SELECT * FROM jogadores`
- [ ] Testar insert simples em cada tabela
- [ ] Seeds inseridos (opcional)

## Entregaveis

- ✅ Schema SQL completo no Supabase
- ✅ Tabelas com relacionamentos corretos
- ✅ RLS configurado (acesso publico)
- ✅ Types TypeScript definidos
- ✅ Pronto para Lote 2

## Proxima Etapa
➡️ LOTE 2: UI Base e Design System

