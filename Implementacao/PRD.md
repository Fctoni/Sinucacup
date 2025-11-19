# 📋 PRD - TecnoHard Sinuca Cup

## Product Requirements Document

**Versão:** 1.0  
**Data:** Novembro 2025  
**Status:** Em Produção  
**Tecnologia:** Web Application ()

---


## 📑 Índice

01. [Visão Geral](#visão-geral)
02. [Objetivos e Propósito](#objetivos-e-propósito)
03. [Público-Alvo](#público-alvo)
04. [Regras do Torneio](#regras-do-torneio)
05. [Funcionalidades Principais](#funcionalidades-principais)
06. [Fluxos de Uso](#fluxos-de-uso)
07. [Design System](#design-system)
08. [Validações e Regras de Negócio](#validações-e-regras-de-negócio)
09. [Stack técnico](#stack-técnico)

---

## 🎯 Visão Geral

### O que é

O **TecnoHard Sinuca Cup** é um sistema web completo para gerenciamento de torneios trimestrais de sinuca em duplas, desenvolvido para fortalecer o espírito de equipe e criar momentos de descontração na empresa TecnoHard.

### Proposta de Valor

O sistema automatiza completamente a organização de campeonatos de sinuca, desde o cadastro de jogadores até a distribuição automática de pontos e atualização do ranking, eliminando trabalho manual e garantindo transparência e justiça no processo.

### Características Principais

- ✅ **Zero Instalação**: Funciona diretamente no navegador
- ✅ **Automação Inteligente**: Formação de duplas balanceadas e chaveamento automático
- ✅ **Interface Intuitiva**: Drag & drop para edição visual
- ✅ **Sistema de BYE**: Suporta qualquer número de duplas
- ✅ **Ranking Histórico**: Acumulativo ao longo das edições

### Alcance

- **Escopo Atual**: Empresa TecnoHard (uso interno)
- **Usuários**: Todos os colaboradores da empresa
- **Dispositivos**: Desktop, tablet e mobile (responsivo)

---

## 🎯 Objetivos e Propósito

### Objetivo Principal

Criar um sistema digital completo que automatize e profissionalize a organização dos torneios de sinuca da TecnoHard, garantindo transparência, justiça e engajamento dos colaboradores.

### Objetivos Específicos

1. **Eliminar Trabalho Manual**
   - Automatizar formação de duplas balanceadas
   - Gerar chaveamento automaticamente
   - Calcular e distribuir pontos sem intervenção humana

2. **Garantir Transparência**
   - Histórico completo de todas as edições
   - Ranking público e atualizado em tempo real
   - Registro de todos os resultados

3. **Promover Engajamento**
   - Interface visual atraente e intuitiva
   - Gamificação através do sistema de pontos
   - Reconhecimento dos melhores jogadores (pódio)

4. **Facilitar Gestão**
   - Controle de status das edições
   - Gestão de inscrições simplificada
   - Flexibilidade na organização (automático ou manual)

### Problema que Resolve

**Antes do Sistema:**
- Formação manual de duplas (demorado e sujeito a viés)
- Chaveamento em papel ou Excel (propenso a erros)
- Cálculo manual de pontos (trabalhoso)
- Ranking desatualizado ou inexistente
- Falta de histórico organizado

**Depois do Sistema:**
- Tudo automatizado em poucos cliques
- Sem erros de cálculo ou digitação
- Ranking sempre atualizado
- Histórico completo acessível
- Processo justo e transparente

---

## 👥 Público-Alvo

### Perfil dos Usuários

#### **Organizadores do Torneio**
- **Perfil**: RH, Gestores, Comitê de Eventos
- **Necessidades**:
  - Criar e gerenciar edições
  - Controlar inscrições
  - Registrar resultados
  - Encerrar campeonatos
  - Visualizar ranking
  - Acompanhar chaveamento
  - Ver histórico de edições

- **Nível Técnico**: Básico a intermediário

### Cenários de Uso

1. **Preparação do Torneio**: Organização inicial (cadastros, inscrições, duplas)
2. **Durante o Torneio**: Registro de resultados partida por partida
3. **Finalização**: Encerramento e distribuição de pontos
4. **Consulta**: Visualização de ranking e histórico entre torneios

---

## 🏆 Regras do Torneio

### Formato

**Tipo**: Eliminação Simples em Duplas
- Cada partida elimina a dupla perdedora
- Dupla vencedora avança para próxima fase
- Não há repescagem ou segunda chance

### Formação de Duplas

#### **Método Automático**

**Algoritmo de Balanceamento:**
1. Ordena jogadores inscritos por pontuação total (ranking)
2. 1º colocado forma dupla com o último
3. 2º colocado forma dupla com o penúltimo
4. E assim sucessivamente

**Objetivo:** Garantir que todas as duplas tenham pontuação total similar, promovendo competitividade equilibrada.

**Exemplo:**
```
Ranking: João (100), Maria (80), Pedro (60), Ana (40), Carlos (20), Julia (10)

Duplas formadas:
- Dupla 1: João (100) + Julia (10) = 110 pts
- Dupla 2: Maria (80) + Carlos (20) = 100 pts
- Dupla 3: Pedro (60) + Ana (40) = 100 pts
```

#### **Método Manual**

Permite ao organizador criar duplas manualmente, escolhendo livremente os parceiros. Útil para:
- Pedidos específicos de jogadores
- Ajustes estratégicos
- Casos especiais

#### **Método Híbrido**

Combina os dois métodos:
- Gera duplas automaticamente
- Edita/ajusta através de drag & drop
- Adiciona duplas manuais se necessário

### Sistema de BYE (Folga)

**Quando Ocorre:**
Quando o número de duplas não é uma potência de 2 (ex: 3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15 duplas).

**Mecânica:**
1. Sistema calcula a próxima potência de 2
2. Diferença = número de byes necessários
3. As **piores duplas** (menor pontuação) recebem BYE
4. Duplas com BYE passam automaticamente para a próxima fase

**Exemplos:**
- **6 duplas**: Próxima potência = 8 → 2 byes → 4 jogam, 2 passam direto
- **5 duplas**: Próxima potência = 8 → 3 byes → 2 jogam, 1 vence + 3 byes = 4 na próxima fase
- **7 duplas**: Próxima potência = 8 → 1 bye → 6 jogam, 3 vencem + 1 bye = 4 na semifinal

**Justiça:**
O BYE é um privilégio concedido aos piores jogadores historicamente (menor pontuação acumulada), incentivando balanceamento ao longo das edições.

### Fases do Chaveamento

Dependendo do número de duplas, as fases possíveis são:

- **2 duplas**: Final direta
- **3 - 4 duplas**: Semifinal → Final
- **5 - 8 duplas**: Quartas → Semifinal → Final
- **9 - 16 duplas**: Oitavas → Quartas → Semifinal → Final


### Sistema de Pontuação

**Pontos por Edição:**

| Colocação | Pontos | Observação |
|-----------|--------|------------|
| 🥇 **Campeão** | +10 pontos | Para cada jogador da dupla |
| 🥈 **Vice-Campeão** | +6 pontos | Para cada jogador da dupla |
| 📊 **Participante** | +2 pontos | Todos os demais inscritos |

**Características:**
- Pontuação é **individual** (cada jogador da dupla recebe)
- Pontos são **cumulativos** (somam ao histórico)
- Pontos definem o **ranking geral** da empresa
- Ranking influencia formação de duplas futuras

**Estatísticas Rastreadas:**
- Pontos totais (acumulativo)

### Premiação

**Valor por Edição:** Definido pela empresa, no registro do campeonato
**Distribuição:** Definida pela empresa (não gerenciado pelo sistema)

---

## ⚙️ Funcionalidades Principais

### 1. Página Inicial

**Objetivo:** Visão geral do sistema e acesso rápido às principais ações.

**Componentes:**

#### **Ações Rápidas**
- Botão: Nova Edição do Campeonato
- Botão: Cadastrar Jogador

#### **Informações do Torneio**
- Descrição do formato
- Regras de formação de duplas
- Sistema de pontuação
- Informação de premiação

**Experiência do Usuário:**
Primeira impressão profissional e informativa. Usuário entende rapidamente o que é o sistema e como usá-lo.

---

### 2. Gestão de Jogadores

**Objetivo:** Cadastro e visualização de todos os jogadores da empresa.

#### **Funcionalidades**

**Cadastrar Novo Jogador:**
- Modal com formulário simples
- Campos obrigatórios: Nome e Setor
- Campo opcional: URL da foto
- Validação de campos
- Inicialização automática de estatísticas em zero

**Visualizar Jogadores:**
- Grid responsivo de cards
- Cada card mostra:
  - Foto ou avatar padrão
  - Nome do jogador
  - Setor
  - Pontos totais
  - Número de vitórias
  - Número de participações
- Ordenação por pontuação (maiores primeiro)

**Estatísticas Individuais:**
Cada jogador tem seu histórico:
- Pontos totais acumulados no ano
- Campeonatos vencidos
- Partidas vencidas
- Edições participadas

**Regras de Negócio:**
- Jogador pode ser marcado como "ativo" ou "inativo"
- Jogadores inativos não aparecem para inscrição
- Histórico é preservado permanentemente
- Pontuação é acumulativa, anual (nunca diminui)

---

### 3. Gestão de Edições

**Objetivo:** Criar e controlar as edições trimestrais do campeonato.

#### **Criar Nova Edição**

**Campos do Formulário:**
- Nome da edição (ex: "Sinuca Cup 1º Trimestre 2025")
- Número da edição (sugerido automaticamente)
- Ano
- Data de início
- Orçamento 

**Status da Edição:**

| Status | Descrição | Ações Disponíveis |
|--------|-----------|-------------------|
|  **Inscrições Abertas** | Inicial, aceita inscrições | Gerenciar inscrições |
|  **Chaveamento** | Criação das duplas e chaveamento | Criação e edição das duplas, geração do chaveamento |
|  **Em Andamento** | Primeira partida registrada | Registrar resultados |
|  **Finalizada** | Campeonato encerrado | Apenas consulta |

**Transições de Status:**
- Criação → "Inscrições Abertas" (automático)
- Botão "Iniciar chaveamento" → "Chaveamento"
- Botão "Iniciar campeoneato" → "Em Andamento" 
- Botão "Encerrar Campeonato" → "Finalizada" 

#### **Visualizar Edições**

**Grid de Cards:**
- Nome da edição
- Badge colorido com status
- Data de início
- Botão "Ver Detalhes"

**Regras de Negócio:**
- Uma edição pode ter apenas um chaveamento
- Edição finalizada não pode ser alterada
- Não há limite de edições (histórico infinito)

---

### 4. Sistema de Inscrições

**Objetivo:** Controlar quais jogadores participarão da edição atual.
**Status**: Inscrições abertas 

#### **Interface**

**Modal com Dois Painéis:**

**Painel Esquerdo - Jogadores Disponíveis:**
- Lista todos os jogadores ativos
- Exclui jogadores já inscritos
- Mostra nome e pontuação
- Botão "➕ Inscrever" para cada um

**Painel Direito - Jogadores Inscritos:**
- Lista inscritos na edição
- Mostra nome e pontuação
- Contador de inscritos no título
- Indicador visual "✅ Inscrito"

#### **Funcionalidade**

**Inscrever Jogador:**
- Clique único no botão
- Transfere para painel de inscritos
- Atualiza contador
- Feedback visual instantâneo

**Regras de Negócio:**
- Inscrição é por edição (não carrega para próxima)
- Jogadores inativos não aparecem

**Validações:**
- Não permite inscrever jogador já inscrito
- Valida edição selecionada
- Feedback de erro claro

---

### 5. Formação de Duplas e chaveamento

**Objetivo:** Criar as duplas que participarão do chaveamento e criar o chaveamento.
**Status**: Chaveamento 

#### **5.1 Formação de duplas**
##### **5.1.1 Geração Automática**

**Processo:**
1. Usuário clica em "👥 Gerar Duplas Automáticas"
2. Sistema confirma ação (pode sobrescrever duplas existentes)
3. Busca jogadores inscritos
4. Ordena por pontuação total (decrescente)
5. Aplica algoritmo de balanceamento
6. Cria duplas com pontuação equilibrada
7. Salva com posição sequencial

**Algoritmo de Balanceamento:**
- Jogador[0] + Jogador[n-1] = Dupla 1
- Jogador[1] + Jogador[n-2] = Dupla 2
- E assim sucessivamente

**Resultado:**
- Duplas com pontuação total similar
- Competição equilibrada
- Justiça no processo

**Tratamento de Número Ímpar:**
- Se número ímpar de jogadores: último fica sem dupla
- Sistema avisa: "Jogador sobrando (bye): [Nome]"
- Esse jogador não participa dessa edição

##### **5.1.2 Criação Manual**

**Interface:**
- Botão "➕ Criar Dupla Manualmente"
- Modal com dois dropdowns
- Dropdown 1: Seleciona Jogador 1
- Dropdown 2: Seleciona Jogador 2
- Checkbox: "Mostrar apenas inscritos"

**Validações:**
- Jogadores devem ser diferentes
- Ambos os campos obrigatórios
- Não permite dupla duplicada

**Uso:**
- Criação de dupla específica a pedido
- Complemento ao modo automático
- Casos especiais ou estratégicos

##### **5.1.3 Edição Visual (Drag & Drop)**

**Funcionalidade Estrela:**
Interface intuitiva para trocar jogadores entre duplas.

**Como Funciona:**
1. Cada jogador tem ícone ⋮⋮ (arrastável)
2. Usuário clica e segura no jogador
3. Arrasta para outro jogador
4. Solta o mouse
5. Jogadores trocam instantaneamente

**Feedback Visual:**
- Jogador arrastado fica transparente (40% opacity)
- Jogador destino fica com borda amarela
- Cursor muda para "move" e "grabbing"
- Animação suave na troca

**Casos de Uso:**
- Trocar jogadores entre duplas diferentes
- Inverter ordem dentro da mesma dupla
- Ajustar balanceamento manualmente
- Corrigir erros

**Atualizações Automáticas:**
- Recalcula pontuação total das duplas
- Atualiza nome da dupla (Jogador1 & Jogador2)
- Se chaveamento existe, atualiza nomes no bracket
- Notificação de sucesso

**Proteções:**
- Não permite soltar no mesmo lugar
- Filtra apenas duplas da edição atual

##### **5.1.4 Exclusão de Duplas**

**Objetivo:** Remover duplas criadas erroneamente ou que não participarão do torneio.

**Botão:** 🗑️ Excluir (em cada card de dupla)

**Como Funciona:**
1. Usuário clica no botão "🗑️ Excluir" no card da dupla
2. Sistema valida se dupla pode ser excluída
3. Modal de confirmação aparece
4. Se confirmado, dupla é removida
5. Interface é atualizada

**Validações:**
- ❌ **Bloqueio Total:** Se dupla já está no chaveamento
- Mensagem: "Não é possível excluir! Dupla já está no chaveamento."
- Dica exibida: "Apague o chaveamento primeiro e depois a dupla"

**Se Permitido (Dupla SEM Chaveamento):**
- Modal de confirmação com nome da dupla
- Se confirmado: Remove dupla do sistema
- Atualiza contagem e visualização
- Notificação de sucesso

**Regras:**
- Só exclui duplas sem chaveamento gerado
- Protege integridade do torneio
- Evita situações inconsistentes
- Não afeta jogadores (podem ser reusados)


#### **5.2 Criação de chaveamento**

##### **5.2.1 Geração do Chaveamento**

**Objetivo:** Criar a tabela de jogos (bracket) do torneio com base nas duplas formadas.

**Processo:**
1. Usuário clica em "🎯 Gerar Chaveamento"
2. Sistema valida número de duplas (mínimo 2)
3. Sistema confirma ação (pode sobrescrever chaveamento existente)
4. Algoritmo distribui duplas nas partidas
5. Chaveamento é criado automaticamente

**Algoritmo de Distribuição:**

**Caso 1: Número de Duplas é Potência de 2** (2, 4, 8, 16)
- Processo simples e direto
- Emparelha duplas sequencialmente
- Dupla[0] vs Dupla[1], Dupla[2] vs Dupla[3], etc.
- Define fase inicial baseada no número:
  - 2 duplas → Final direta
  - 4 duplas → Semifinal + Final
  - 8 duplas → Quartas + Semifinal + Final
  - 16 duplas → Oitavas + Quartas + Semifinal + Final

**Caso 2: Número NÃO é Potência de 2** (3, 5, 6, 7, 9-15)
- Sistema identifica necessidade de BYE
- Calcula próxima potência de 2
- Ordena duplas por pontuação total
- Piores duplas (piores pontuação) recebem BYE
- Cria primeira fase apenas com duplas que jogam
- Duplas com BYE passam automaticamente para próxima fase
- Salva informação de byes temporariamente

**Estrutura Criada:**

Cada partida gerada contém:
- ID único da partida
- ID da edição (torneio)
- Fase (oitavas, quartas, semifinal, final)
- Dupla 1 (ID e nome)
- Dupla 2 (ID e nome)
- Vencedor (null inicialmente)
- Flag de BYE (se aplicável)
- Posicao no chaveamento 

**Visual do Bracket:**
- Layout horizontal com colunas por fase
- Scroll horizontal automático
- Cards de partidas empilhados verticalmente
- Banner azul informa duplas com BYE
- Responsivo: tabs no mobile para navegar entre fases

**Validações:**
- Mínimo 2 duplas formadas
- Edição deve estar selecionada
- Confirma sobrescrita se já houver chaveamento
- Limpa byes anteriores se regenerar

**Proteções:**
- Aviso de sobrescrita com confirmação obrigatória
- Apaga chaveamento anterior se confirmar
- Preserva duplas (não as deleta)
- Status da edição permanece "Chaveamento"

##### **5.2.2 Reordenação de Duplas (Antes do Chaveamento)**

**Objetivo:** Permitir reorganização estratégica das duplas antes de gerar o chaveamento.

**Ativação:**
- Botão "🔀 Modo: Reordenar Chaveamento"
- Botão fica amarelo quando ativo
- Banner laranja aparece: "Modo Reordenar Ativo"

**Como Funciona:**
1. Ativa modo de reordenação
2. CARDS inteiros ficam arrastáveis (não os jogadores)
3. Usuário arrasta card de uma dupla sobre outro card
4. Posições trocam instantaneamente
5. Define ordem que será usada no chaveamento

**Feedback Visual:**
- Card sendo arrastado fica transparente
- Card destino tem destaque amarelo
- Cursor muda para "move"
- Cards mostram ⋮⋮ no título indicando que são arrastáveis

**Desativação:**
- Botão muda para "✅ Salvar Ordem"
- Clique salva ordem definida
- Regenera chaveamento com nova ordem
- Modo reordenar é desativado

**Uso Estratégico:**
- Evitar confrontos precoces entre favoritos
- Distribuir duplas fortes em lados opostos do bracket
- Organização tática baseada em histórico
- Separar jogadores de mesmo setor

**Proteções:**
- Botão só aparece DURANTE A FASE DE CHAVEAMENTO (status = chaveamento)
- Após iniciar torneio, botão é escondido
- Não permite reordenar com torneio em andamento
- Preserva integridade do torneio já iniciado


---

### 6. Início do Campeonato

**Objetivo:** Iniciar oficialmente o campeonato, travando o chaveamento e permitindo o registro de resultados.
**Status:** Transição de "Chaveamento" para "Em Andamento"

#### **Quando Iniciar**

**Pré-requisitos:**
- Chaveamento completo gerado
- Todas as duplas definidas
- Bracket validado e conferido
- Organizadores confirmam que está correto

#### **Processo de Início**

**Ação:**
1. Organizador revisa o chaveamento final
2. Clica em botão "🎯 Iniciar Campeonato"
3. Modal de confirmação aparece
4. Sistema alerta sobre travas que serão aplicadas
5. Se confirmado, status muda para "Em Andamento"

**Modal de Confirmação:**
- Título: "Iniciar Campeonato?"
- Mensagem: "Após iniciar, não será possível editar duplas ou regenerar chaveamento"
- Informações exibidas:
  - Número de duplas participantes
  - Número de partidas na primeira fase
  - Duplas com BYE (se houver)
- Botões: "✅ Confirmar Início" | "❌ Cancelar"

#### **O que Acontece ao Iniciar**

**Travas Aplicadas:**
- ❌ Não permite mais editar duplas
- ❌ Não permite excluir duplas
- ❌ Não permite regenerar chaveamento
- ❌ Não permite reordenar chaveamento
- ❌ Botão "Gerar Duplas" é escondido
- ❌ Drag & drop é desabilitado

**Funcionalidades Liberadas:**
- ✅ Registro de resultados é habilitado
- ✅ Cards de partidas ficam clicáveis
- ✅ Botão "Editar Resultado" fica disponível

**Mudanças Visuais:**
- Badge muda para "🎯 Em Andamento" (laranja)
- Botão "Iniciar Campeonato" desaparece
- Interface do bracket fica otimizada para resultados
- Destaque visual nas partidas prontas para jogar

#### **Reversibilidade**

**Não é Possível Reverter:**
- Uma vez iniciado, o campeonato NÃO pode voltar para status "Chaveamento"
- Única opção é continuar registrando resultados
- Para refazer, seria necessário criar nova edição

**Proteção:**
- Sistema força a confirmação explícita
- Aviso claro sobre irreversibilidade
- Última chance de revisar antes de começar

---

### 7. Registro de Resultados

**Objetivo:** Registrar vencedores das partidas e avançar o torneio.

#### **Interface Intuitiva**

**Seleção de Vencedor:**
- Partidas prontas têm cards clicáveis
- Usuário clica na dupla vencedora
- Modal de confirmação aparece
- Confirma ou cancela

**Modal de Confirmação:**
- Título: "🏆 Confirmar Vencedor"
- Nome da dupla em destaque
- Botões: "✅ Sim, Confirmar" | "❌ Cancelar"

**Após Confirmação:**
- Vencedor fica verde
- Perdedor fica cinza (opacidade 50%)
- Notificação de sucesso

#### **Lógica de Avanço**

**Verificação Automática:**
Após cada resultado registrado, sistema verifica:
1. Todas as partidas da fase foram finalizadas?
2. Se sim, qual é a próxima fase?
3. Criar partidas da próxima fase automaticamente

**Criação de Próxima Fase:**
- Busca vencedores da fase atual
- Emparelha sequencialmente
- Se há byes salvos, inclui na próxima fase
- Cria novas partidas
- Notifica usuário

**Tratamento de BYE:**
- Na primeira fase, algumas duplas jogam
- Vencedores + Duplas com BYE = próxima fase
- Combina os dois grupos
- Todos jogam na próxima fase (sem mais byes)

#### **Status da Edição**

**Durante Registro:**
- Status permanece "🎯 Em Andamento" (já iniciado pelo botão)
- **Final concluída**: Botão de encerramento aparece
- **Encerramento**: Status muda para "🏆 Finalizada"

#### **Validações**

**Não Permite Registrar Se:**
- Dupla ainda é "TBD" (aguardando definição)
- Ambas as duplas não estão definidas
- Partida já tem vencedor (deve editar)
- Status da edição não é "Em Andamento"

**Feedback:**
- Cursor "not-allowed" em partidas não jogáveis
- Cursor "pointer" em partidas prontas
- Hover effect visual

---

### 8. Edição de Resultados

**Objetivo:** Corrigir erros em resultados já registrados.

#### **Acesso**

**Botão:** "✏️ Editar Resultado" (aparece em partidas finalizadas)

**Interface:**
- Modal com duas opções (dupla 1 e dupla 2)
- Usuário seleciona o novo vencedor
- Sistema valida impacto

#### **Validação de Impacto**

**Sistema Inteligente:**
1. Busca fases posteriores à partida editada
2. Verifica se vencedor antigo está em fases seguintes
3. Verifica se há resultados registrados nessas fases

**Se Há Impacto:**
- Lista fases que serão afetadas
- Modal de confirmação: "⚠️ ATENÇÃO! Vai limpar: Quartas, Semifinal"
- Usuário confirma ou cancela

**Se Não Há Impacto:**
- Apenas troca vencedor
- Atualização simples

#### **Processo de Edição**

**Quando Confirmado:**
1. Atualiza vencedor da partida editada
2. Busca partidas das fases seguintes
3. Substitui vencedor antigo pelo novo
4. Limpa resultados das fases afetadas (vencedor_id = null)
5. Atualiza nomes das duplas nas fases seguintes
6. Notifica sucesso

**Resultado:**
- Integridade mantida
- Bracket atualizado
- Possibilidade de jogar novamente as fases limpas

#### **Proteções**

- Confirmação obrigatória se há impacto
- Logs detalhados no console
- Notificações explicativas
- Reversibilidade (pode editar novamente)

---

### 9. Encerramento do Campeonato

**Objetivo:** Finalizar a edição e distribuir pontos aos participantes.

#### **Ativação**

**Trigger:**
- Final concluída (tem vencedor)
- Status ainda não é "Finalizada"

**Interface:**
- Card dourado do campeão aparece
- Logo abaixo: Botão grande "🏆 Encerrar Campeonato e Distribuir Pontos"
- Estilo destacado (gradiente dourado)

#### **Modal de Confirmação**

**Informações Exibidas:**
- Dupla campeã (+10 pontos cada)
- Dupla vice (+6 pontos cada)
- Demais participantes (+2 pontos)
- Confirmação necessária

#### **Processo de Distribuição**

**Ao Confirmar:**

**1. Identifica Duplas:**
- Campeã (vencedor da final)
- Vice (perdedor da final)
- Demais (todos os outros inscritos)

**2. Atualiza Jogadores:**
- Para cada jogador campeão:
  - pontos_totais += 10
  - vitorias += 1
  - participacoes += 1
  
- Para cada jogador vice:
  - pontos_totais += 6
  - participacoes += 1
  
- Para cada outro participante:
  - pontos_totais += 2
  - participacoes += 1

**3. Atualiza Edição:**
- status = "finalizada"

**4. Notificações:**
- "🏆 CAMPEONATO FINALIZADO! 🎉"
- "🥇 Campeões: [Nome da Dupla]!"
- "📊 Pontos distribuídos! Veja o ranking atualizado."

**5. Atualiza Interfaces:**
- Ranking é recalculado
- Lista de edições mostra status "Finalizada"
- Bracket não pode mais ser alterado

#### **Estado Pós-Encerramento**

**Edição Finalizada:**
- Mostra badge "✅ Campeonato Finalizado"
- Botão de encerramento desaparece
- Apenas visualização (sem edições)
- Histórico preservado permanentemente

**Ranking Global:**
- Todos os pontos foram somados
- Posições podem ter mudado
- Pódio atualizado
- Tabela completa reflete nova realidade

---

### 10. Ranking Global

**Objetivo:** Mostrar classificação geral dos jogadores ao longo das edições do ano atual.

#### **Interface**

**Pódio Visual:**
- 3 "degraus" com alturas diferentes
- 🥇 1º lugar: Maior, dourado
- 🥈 2º lugar: Médio, prateado
- 🥉 3º lugar: Menor, bronze
- Cada um mostra:
  - Medalha grande
  - Nome do jogador
  - Pontos totais

**Tabela Completa:**
- Cabeçalho fixo
- Colunas:
  - Posição (com medalha se top 3)
  - Jogador (nome em destaque)
  - Setor
  - Pontos (amarelo, bold)
  - Vitórias
  - Participações
- Ordenação: Pontos totais (decrescente)
- Hover effect nas linhas

#### **Cálculo**

**Ordenação:**
- Busca todos os jogadores
- Ordena por pontos_totais (maior primeiro)
- Empates mantêm ordem alfabética

**Atualização:**
- Recalcula ao carregar página
- Recalcula após encerramento de campeonato
- Recalcula ao cadastrar novo jogador (com 0 pts)

#### **Informações Exibidas**

**Para Cada Jogador:**
- **Pontos Totais**: Soma das edições do ano atual
- **Vitórias**: Quantos campeonatos ganhou
- **Participações**: Em quantas edições jogou

**Estatísticas Implícitas:**
- Taxa de vitória = vitorias / participacoes
- Média de pontos = pontos_totais / participacoes
- Consistência = frequência de participação

#### **Experiência do Usuário**

**Gamificação:**
- Reconhecimento visual dos top 3
- Incentivo para acumular pontos
- Competição saudável
- Transparência total
- Ranking anual (reseta a cada ano)

**Consulta:**
- Qualquer um pode ver o ranking
- Não requer login
- Atualização em tempo real
- Resultados históricos preservados

---

## 🔄 Fluxos de Uso

### Fluxo Completo: Organizar Campeonato

**Passo a Passo do Organizador:**

#### **Fase 1: Preparação (Antes do Torneio)**

1. **Cadastrar Jogadores** (se houver novos)
   - Ir em "👥 Jogadores"
   - Clicar "➕ Novo Jogador"
   - Preencher nome, setor, foto (opcional)
   - Salvar
   - Repetir para todos os novos

2. **Criar Nova Edição**
   - Ir em "🏆 Edições"
   - Clicar "➕ Nova Edição"
   - Preencher:
     - Nome: "Sinuca Cup 1º Trimestre 2025"
     - Número: 1 (sugerido automaticamente)
     - Ano: 2025
     - Data início: 2025-01-15
   - Salvar
   - Status inicial: "📝 Inscrições Abertas"

3. **Abrir Inscrições**
   - Ir em "📊 Chaveamento"
   - Selecionar a edição criada
   - Clicar "📝 Gerenciar Inscrições"
   - Para cada jogador interessado:
     - Clicar "➕ Inscrever" ao lado do nome
   - Fechar modal quando todos inscritos

4. **Formar Duplas**

   **Opção A - Automático (Recomendado):**
   - Clicar "👥 Gerar Duplas Automáticas"
   - Confirmar
   - Sistema cria duplas balanceadas
   - [Opcional] Ajustar via drag & drop se necessário

   **Opção B - Manual:**
   - Para cada dupla desejada:
     - Clicar "➕ Criar Dupla Manualmente"
     - Selecionar Jogador 1
     - Selecionar Jogador 2
     - Salvar

   **Opção C - Híbrida:**
   - Gerar automático
   - Ajustar algumas via drag & drop
   - Adicionar duplas extras manualmente

5. **[Opcional] Reordenar Posições**
   - Clicar "🔀 Modo: Reordenar Chaveamento"
   - Arrastar cards para definir ordem estratégica
   - Clicar "✅ Salvar Ordem"

6. **Gerar Chaveamento**
   - Clicar "🎯 Gerar Chaveamento"
   - Confirmar
   - Sistema cria bracket automaticamente
   - Se houver BYE, banner azul informa quem passou direto

7. **Iniciar Campeonato**
   - Revisar chaveamento final
   - Clicar "🎯 Iniciar Campeonato"
   - Confirmar no modal
   - Status muda para "Em Andamento"
   - Duplas e chaveamento ficam travados

**Resultado da Fase 1:**
- Edição criada
- Jogadores inscritos
- Duplas formadas
- Chaveamento gerado
- Campeonato iniciado
- Pronto para registrar resultados!

#### **Fase 2: Durante o Torneio**

8. **Registrar Resultados das Partidas**
   - Após cada jogo real de sinuca:
     - Acessar "📊 Chaveamento"
     - Selecionar a edição
     - Visualizar bracket
     - Clicar na dupla vencedora
     - Confirmar no modal
     - Sistema:
       - Marca vencedor em verde 🏆
       - Marca perdedor em cinza
       - Registra timestamp

9. **Acompanhar Avanço Automático**
   - Quando todas as partidas de uma fase terminam:
     - Sistema cria próxima fase automaticamente
     - Vencedores são emparelhados
     - Se havia BYE, duplas com BYE entram agora
     - Notificação: "🎯 Nova fase criada: SEMIFINAL!"

10. **[Se Necessário] Corrigir Erro**
    - Se registrou vencedor errado:
      - Clicar "✏️ Editar Resultado" na partida
      - Selecionar vencedor correto
      - Se há fases posteriores jogadas, sistema avisa
      - Confirmar
      - Sistema limpa fases afetadas e atualiza

11. **Repetir até a Final**
    - Continue registrando resultados
    - Sistema avança automaticamente: Oitavas → Quartas → Semifinal → Final

#### **Fase 3: Finalização**

12. **Final Concluída**
    - Registrar resultado da final
    - Card dourado do CAMPEÃO aparece
    - Botão "🏆 Encerrar Campeonato" aparece

13. **Encerrar Campeonato**
    - Clicar no botão
    - Modal mostra distribuição de pontos:
      - Campeões: +10 cada
      - Vice: +6 cada
      - Demais: +2 cada
    - Confirmar
    - Sistema:
      - Distribui pontos automaticamente
      - Atualiza estatísticas de todos
      - Muda status para "🏆 Finalizada"
      - Ranking é recalculado

14. **Verificar Ranking**
    - Ir em "📈 Ranking"
    - Ver novo pódio
    - Conferir tabela atualizada
    - Compartilhar com a empresa

**Resultado Final:**
- Campeonato completo
- Todos os resultados registrados
- Pontos distribuídos
- Ranking atualizado
- Resultados preservados (ranking anual)

**Tempo Estimado:**
- Preparação: 15-30 minutos
- Durante torneio: 2-5 minutos por partida
- Finalização: 2-3 minutos

---

### Fluxo Simplificado: Consultar Ranking

**Passo a Passo do Jogador:**

1. Abrir sistema
2. Clicar em "📈 Ranking"
3. Ver sua posição e pontos
4. Conferir estatísticas (vitórias, participações)
5. Comparar com outros jogadores

**Tempo:** < 1 minuto

---

### Fluxo Alternativo: Acompanhar Torneio

**Passo a Passo do Espectador:**

1. Abrir sistema
2. Clicar em "📊 Chaveamento"
3. Selecionar edição atual
4. Visualizar bracket
5. Ver resultados em tempo real
6. Acompanhar quem avançou

**Tempo:** < 2 minutos

---

## 🎨 Design System

### Paleta de Cores

**Baseada no Logo da Mesa de Sinuca:**

#### **Cores Primárias**
- **Verde Mesa**: `#1a5c4a` (principal)
- **Verde Médio**: `#2d7a63` (secundário)
- **Verde Claro**: `#3a9978` (terciário)

**Uso:** Fundo de cards, botões principais, elementos de destaque

#### **Cores de Fundo**
- **Cinza Escuro**: `#1a1a1a` (fundo geral)
- **Cinza Médio**: `#2d2d2d` (fundo claro)
- **Cinza Card**: `#333333` (cards e modais)

**Uso:** Backgrounds, sobreposições, hierarquia visual

#### **Cores de Texto**
- **Texto Principal**: `#e0e0e0` (alto contraste)
- **Texto Secundário**: `#b8b8b8` (menor destaque)

**Uso:** Conteúdo legível sobre fundos escuros

#### **Cores de Acento**
- **Amarelo**: `#f4d03f` (destaque, títulos)
- **Laranja**: `#ff6b35` (avisos, em andamento)
- **Azul**: `#3a5ba0` (informações, BYE)
- **Roxo**: `#7b2d8e` (alternativo)
- **Vermelho**: `#e74c3c` (erros, exclusão)

**Uso:** Estados, badges, botões secundários, alertas

#### **Cores de Ranking**
- **Ouro**: `#ffd700` (1º lugar)
- **Prata**: `#c0c0c0` (2º lugar)
- **Bronze**: `#cd7f32` (3º lugar)

**Uso:** Pódio, medalhas, campeão

### Tipografia

**Família:** `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- Universalmente disponível
- Legível e moderna
- Excelente em telas

**Hierarquia:**
- **H1 (Título Principal)**: 2rem, bold, sombra de texto
- **H2 (Títulos de Seção)**: 2rem, cor amarela, sombra
- **H3 (Subtítulos)**: 1.5rem, cor amarela
- **Corpo**: 1rem, cor texto principal
- **Pequeno**: 0.9rem, cor texto secundário

### Espaçamento

**Sistema:**
- Padding padrão: 20px
- Gap entre elementos: 20px
- Margem entre seções: 30px
- Espaçamento interno cards: 20px-40px

### Componentes Visuais

#### **Cards**
- Border radius: 12px (arredondado)
- Box shadow: `0 4px 6px rgba(0, 0, 0, 0.3)`
- Borda: 2px solid (transparente por padrão)
- Transition: all 0.3s ease
- Hover: translateY(-5px) + borda amarela

#### **Botões**
- Primário: Gradiente verde
- Secundário: Fundo com transparência
- Terciário: Outline apenas
- Border radius: 12px
- Padding: 12px 24px
- Hover: translateY(-2px) + sombra maior

#### **Modais**
- Overlay: rgba(0, 0, 0, 0.8)
- Background: Cinza card
- Border: 2px solid amarelo
- Animação: fadeIn 0.3s
- Centralizado com margem automática

#### **Badges**
- Border radius: 20px (pílula)
- Padding: 5px 12px
- Font size: 0.9rem
- Cores por status:
  - Inscrições: Azul
  - Chaveamento: Roxo
  - Em Andamento: Laranja
  - Finalizada: Verde

#### **Notificações Toast**
- Posição: Fixed top-right
- Animação: slideIn (da direita)
- Duração: 3 segundos
- Auto-dismiss
- Tipos:
  - Success: Verde
  - Error: Vermelho
  - Warning: Laranja
  - Info: Azul

### Responsividade

**Breakpoints:**
- Desktop: > 968px
- Tablet: 769px - 968px
- Mobile: ≤ 768px

**Adaptações:**

**Mobile:**
- Menu em coluna (não linha)
- Pódio em coluna (não lado a lado)
- Bracket com tabs (uma fase por vez)
- Cards em coluna única
- Font sizes reduzidos

**Tablet:**
- Grid de 2 colunas
- Bracket com scroll horizontal
- Todos os recursos funcionais

### Animações

**Princípios:**
- Suaves e rápidas (0.3s padrão)
- Easing: ease ou ease-in-out
- Não distraem, apenas melhoram UX

**Exemplos:**
- Fade in ao carregar páginas
- Slide in para notificações
- Scale no hover de cards
- TranslateY em botões
- Pulse no card do campeão

### Iconografia

**Uso de Emojis:**
Sistema usa emojis nativos para iconografia:
- 🎱 Sinuca
- 👥 Jogadores/Duplas
- 🏆 Edições/Campeão
- 📊 Chaveamento
- 📈 Ranking
- ➕ Adicionar
- 🗑️ Excluir
- ✏️ Editar
- 🔀 Reordenar
- 🥇🥈🥉 Medalhas

**Vantagens:**
- Universais (não dependem de biblioteca)
- Coloridos nativamente
- Acessíveis
- Zero dependências

### Acessibilidade

**Contraste:**
- Texto claro sobre fundo escuro
- Contraste mínimo WCAG AA atendido
- Cores de acento com boa legibilidade

**Interatividade:**
- Cursors claros (pointer, move, not-allowed)
- Hover states visíveis
- Focus states preservados
- Feedback visual imediato

**Semântica:**
- HTML5 semântico
- Estrutura lógica
- Títulos hierárquicos
- Labels em formulários

---

## ✅ Validações e Regras de Negócio

### Validações de Entrada

#### **Cadastro de Jogador**
- ✅ Nome obrigatório (não vazio)
- ✅ Setor obrigatório (não vazio)
- ⚠️ Foto opcional (URL válida se fornecida)
- ✅ Inicialização de estatísticas em zero

#### **Criação de Edição**
- ✅ Nome obrigatório
- ✅ Número obrigatório (inteiro positivo)
- ✅ Ano obrigatório (inteiro positivo)
- ✅ Data início obrigatória (formato date)
- ✅ Número sugerido automaticamente (último + 1)

#### **Inscrição de Jogador**
- ✅ Edição deve existir
- ✅ Jogador deve existir
- ✅ Jogador deve estar ativo
- ❌ Não permite duplicar inscrição
- ✅ Mínimo 2 jogadores para prosseguir

#### **Criação de Dupla Manual**
- ✅ Ambos jogadores obrigatórios
- ❌ Não permite mesmo jogador duas vezes
- ✅ Jogadores devem existir
- ⚠️ Avisa se não são inscritos (com checkbox desmarcado)

### Validações de Operação

#### **Gerar Duplas**
- ✅ Mínimo 2 jogadores inscritos
- ⚠️ Confirma se já existem duplas (sobrescreve)
- ✅ Apaga chaveamento junto se existir
- ⚠️ Avisa se número ímpar (jogador sobrando)

#### **Reordenar Chaveamento**
- ❌ Bloqueia se status não é "Chaveamento"
- ✅ Botão só aparece durante fase de Chaveamento
- ✅ Regenera chaveamento com nova ordem ao salvar

#### **Excluir Dupla**
- ❌ Bloqueia se dupla está no chaveamento
- ✅ Pede confirmação
- ✅ Dá dica de solução (apagar chaveamento primeiro)

#### **Gerar Chaveamento**
- ✅ Mínimo 2 duplas formadas
- ⚠️ Confirma se já existe chaveamento (sobrescreve)
- ✅ Limpa byes salvos
- ✅ Calcula BYE automaticamente se necessário

#### **Registrar Resultado**
- ❌ Não permite se duplas são "TBD"
- ❌ Não permite se já tem vencedor (deve editar)
- ❌ Não permite se status não é "Em Andamento"
- ✅ Pede confirmação
- ✅ Registra timestamp

#### **Editar Resultado**
- ⚠️ Avisa se há fases posteriores afetadas
- ✅ Lista fases que serão limpas
- ✅ Pede confirmação com impacto
- ✅ Atualiza em cascata

#### **Encerrar Campeonato**
- ✅ Apenas se final foi concluída
- ✅ Apenas se status não é "finalizada"
- ✅ Mostra distribuição de pontos
- ✅ Pede confirmação
- ✅ Distribui pontos automaticamente
- ❌ Não permite reverter (finalizada = permanente)

### Regras de Isolamento

#### **Por Edição**
- ✅ Duplas filtradas por edicao_id
- ✅ Partidas filtradas por edicao_id
- ✅ Inscrições filtradas por edicao_id
- ✅ Operações nunca cruzam edições
- ✅ Logs mostram contagem por edição


### Validações de Estado

#### **Status de Edição**
- 📝 **Inscrições**: Permite inscrever jogadores
- 🔧 **Chaveamento**: Permite criar/editar duplas e gerar chaveamento
- 🎯 **Em Andamento**: Permite registrar resultados
- 🏆 **Finalizada**: Apenas leitura, não permite alterações

#### **Estado do Bracket**
- ⏳ **Aguardando**: Dupla não definida (TBD)
- ⚪ **Pronto**: Ambas duplas definidas, sem vencedor
- 🟢 **Finalizado**: Tem vencedor

### Proteções Contra Erros

#### **Drag & Drop**
- ✅ Não permite soltar no mesmo lugar
- ✅ Valida IDs antes de trocar
- ✅ Recalcula pontuação após troca
- ✅ Logs detalhados para debug
- ✅ Filtra apenas duplas da edição atual

#### **Criação de Fases**
- ✅ Verifica se fase atual foi completada
- ✅ Identifica próxima fase corretamente
- ✅ Integra byes na hora certa
- ✅ Remove byes após uso

#### **Dados Inconsistentes**
- ✅ Recalcula totais ao atualizar
- ✅ Validação de FKs antes de salvar
- ✅ Mensagens de erro claras

### Mensagens de Feedback

#### **Sucesso** (Verde)
- "✅ Jogador cadastrado com sucesso!"
- "✅ Duplas geradas com sucesso!"
- "✅ Vencedor registrado com sucesso!"
- "🏆 CAMPEONATO FINALIZADO! 🎉"

#### **Erro** (Vermelho)
- "❌ Número insuficiente de jogadores"
- "❌ Não é possível excluir! Dupla já está no chaveamento."
- "❌ Os dois jogadores devem ser diferentes!"

#### **Aviso** (Laranja)
- "⚠️ Já existem duplas para esta edição!"
- "⚠️ Jogador sobrando (bye): [Nome]"
- "⚠️ ATENÇÃO! Vai limpar os resultados das fases seguintes"

#### **Info** (Azul)
- "ℹ️ 2 dupla(s) com BYE: João & Maria, Pedro & Ana"
- "🎯 Campeonato iniciado!"
- "🔄 Fases posteriores foram atualizadas"

---


### Priorização

**Essencial (Fazer Agora):**
1. 🔜 Implementação do backend e banco de dados
2. 🔜 Desenvolvimento do frontend

**Importante (Curto Prazo):**
3. 💡 Autenticação e controle de acesso
4. 💡 Backup e exportação de dados

**Desejável (Médio Prazo):**
5. 💡 Estatísticas avançadas
6. 💡 Galeria de fotos
7. 💡 Notificações

**Opcional (Longo Prazo):**
8. 💡 Modo ao vivo
9. 💡 Integrações externas
10. 💡 Mobile app nativo

---

## 🏗️ STACK TÉCNICO

### **1 Frontend**

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js** | 14+ (App Router) | Framework React full-stack |
| **TypeScript** | 5+ | Type safety |
| **Tailwind CSS** | 3+ | Estilização |
| **shadcn/ui** | Latest | Componentes UI base |
| **@dnd-kit** | Latest | Drag & drop |
| **date-fns** | Latest | Manipulação de datas |
| **Zod** | Latest | Validação de schemas |

### **2 Backend**

| Tecnologia | Propósito |
|------------|-----------|
| **Supabase** | Backend-as-a-Service |
| ├─ **PostgreSQL** | Banco de dados relacional |
| ├─ **Auth** | Sem autenticação (qualquer um tem acesso) |
| ├─ **Realtime** | Sincronização em tempo real |
| └─ **Edge Functions** | Opcional (lógica serverless) |

### **3 Ferramentas**

- **Cursor + MCP**: Acesso direto ao Supabase




## 📞 Contato e Suporte

### Documentação Disponível

- `INSTRUCOES-SIMPLES.md`: Guia de uso básico
- `GUIA-DRAG-DROP.md`: Explicação do sistema de drag & drop
- `GUIA-EDICAO-MANUAL.md`: Como editar duplas e chaveamento
- `CORRECOES-FINAIS.md`: Histórico de correções técnicas

### Como Usar

1. Acesse o sistema através do navegador
2. Faça login (se houver autenticação implementada)
3. Comece cadastrando jogadores
4. Siga o fluxo descrito na seção "Fluxos de Uso"

### Requisitos Técnicos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- JavaScript habilitado
- Conexão com backend/banco de dados
- Resolução mínima: 320px (mobile)

---

## 🎉 Conclusão

O **TecnoHard Sinuca Cup** é um sistema completo e profissional que transforma a organização de torneios de sinuca de um processo manual e trabalhoso em uma experiência automatizada, transparente e divertida.

**Diferenciais:**
- ✅ Automação inteligente de duplas e chaveamento
- ✅ Interface intuitiva com drag & drop
- ✅ Sistema de BYE que funciona com qualquer número de duplas
- ✅ Edição de resultados com validação de impacto
- ✅ Distribuição automática de pontos
- ✅ Ranking anual com histórico preservado
- ✅ Design profissional baseado na identidade da empresa
- ✅ Validações robustas de regras de negócio

**Impacto Esperado:**
- 90% menos tempo de organização
- 100% de transparência nos resultados
- Zero erros de cálculo
- Maior engajamento dos colaboradores
- Histórico completo preservado (rankings anuais + resultados por edição)

Este PRD documenta completamente as especificações do sistema, permitindo implementação em qualquer stack tecnológica moderna com banco de dados relacional.

---

**"O campeão é quem joga junto e inspira os outros"** 🎱🏆


