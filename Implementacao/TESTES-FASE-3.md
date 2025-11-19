# 🧪 TESTES MANUAIS - FASE 3: Formação de Duplas

**Versão:** 1.0  
**Data:** Novembro 2025  
**Lotes:** 6 e 7

---

## 📋 PRÉ-REQUISITOS

Antes de iniciar os testes, certifique-se de:

- [ ] Ter o sistema rodando localmente (`npm run dev`)
- [ ] Ter pelo menos **6 jogadores cadastrados** no sistema
- [ ] Ter uma **edição criada**
- [ ] Ter **4-6 jogadores inscritos** nessa edição
- [ ] A edição estar com status **"chaveamento"** (clicar em "Iniciar Chaveamento")

---

## 🎯 ORDEM DE EXECUÇÃO DOS TESTES

Execute os testes na ordem apresentada para maximizar a cobertura:

1. ✅ **Teste 1** - Geração Automática de Duplas
2. ✅ **Teste 2** - Criação Manual de Dupla
3. ✅ **Teste 3** - Exclusão de Dupla
4. ⭐ **Teste 4** - Drag & Drop de Jogadores
5. ⭐ **Teste 5** - Modo Reordenar Duplas
6. ⚠️ **Teste 6** - Sobrescrever Duplas

---

## ✅ TESTE 1: Geração Automática de Duplas

### Objetivo
Validar o algoritmo de balanceamento automático de duplas.

### Pré-condição
- Edição com status "chaveamento"
- **Número PAR** de jogadores inscritos (4, 6, 8...)

### Passos
1. Acesse a página de detalhes da edição
2. Verifique que aparece a seção **"👥 Duplas Formadas (0)"**
3. Clique no botão **"🤖 Gerar Automaticamente"**
4. Aguarde o processamento

### Validações
- [ ] Toast verde **"✅ Duplas geradas com sucesso!"** aparece
- [ ] Cards de duplas aparecem no grid (3 colunas no desktop)
- [ ] Cada dupla mostra:
  - [ ] Número da dupla (Dupla #1, #2, #3...)
  - [ ] Jogador 1 com nome e setor
  - [ ] Jogador 2 com nome e setor
  - [ ] Pontuação total (soma dos 2 jogadores)
  - [ ] Botão "🗑️ Excluir"
- [ ] Duplas estão balanceadas (algoritmo: 1º + último, 2º + penúltimo...)
- [ ] Contador mostra o número correto **"(X)"**

### Algoritmo de Balanceamento Esperado
Se você tem jogadores com pontos: 100, 80, 60, 40, 20, 10:
- **Dupla 1:** 100 pts + 10 pts = 110 pts
- **Dupla 2:** 80 pts + 20 pts = 100 pts
- **Dupla 3:** 60 pts + 40 pts = 100 pts

### Caso de Erro - Número Ímpar
1. Inscreva um número **ímpar** de jogadores (ex: 5)
2. Tente gerar duplas
3. **Validar:**
   - [ ] Toast vermelho com erro aparece
   - [ ] Mensagem informa: **"Numero impar de jogadores! Jogador sobrando: [Nome]"**
   - [ ] Duplas NÃO são criadas

### Status
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU (descrever o erro):

---

## ✅ TESTE 2: Criação Manual de Dupla

### Objetivo
Validar criação manual de duplas pelo organizador.

### Pré-condição
- Edição com status "chaveamento"

### Passos
1. Clique no botão **"➕ Criar Manual"**
2. Modal **"👥 Criar Dupla Manualmente"** abre
3. No dropdown "Jogador 1", selecione um jogador
4. No dropdown "Jogador 2", selecione outro jogador
5. Clique em **"✅ Criar Dupla"**

### Validações
- [ ] Modal abre corretamente
- [ ] Dropdowns carregam a lista de jogadores **disponíveis**
- [ ] Jogadores aparecem com formato: **"Nome (X pts)"**
- [ ] Label mostra contador: **"(X disponíveis)"**
- [ ] **Apenas jogadores SEM dupla** aparecem na lista
- [ ] Checkbox **"Mostrar apenas jogadores inscritos"** está marcado por padrão
- [ ] Após criar:
  - [ ] Modal fecha
  - [ ] Toast verde **"✅ Dupla criada com sucesso!"**
  - [ ] Nova dupla aparece no grid
  - [ ] Nome da dupla: **"Jogador1 & Jogador2"**
  - [ ] Pontuação total está correta
  - [ ] Posição sequencial (próximo número disponível)

### Caso de Erro - Jogadores Iguais
1. Abra o modal de criação
2. Selecione o **mesmo jogador** nos 2 dropdowns
3. Tente criar
4. **Validar:**
   - [ ] Alert de erro aparece
   - [ ] Mensagem: **"Os dois jogadores devem ser diferentes!"**
   - [ ] Dupla NÃO é criada

### Caso Especial - Todos Jogadores Alocados
1. Crie duplas até que **todos os jogadores inscritos** estejam em duplas
2. Tente abrir o modal de criação manual
3. **Validar:**
   - [ ] Modal abre normalmente
   - [ ] Dropdowns estão vazios (apenas "Selecione...")
   - [ ] Banner laranja aparece com:
     - [ ] Ícone ⚠️
     - [ ] Título: **"Nenhum jogador disponível"**
     - [ ] Mensagem explicativa
   - [ ] Contador mostra: **(0 disponíveis)**
   - [ ] Não é possível criar dupla (botão fica desabilitado se implementado)

### Funcionalidade Extra - Checkbox e Filtragem Inteligente
1. Abra o modal
2. Observe a lista inicial (apenas inscritos disponíveis)
3. **Desmarque** o checkbox "Mostrar apenas jogadores inscritos"
4. **Validar:**
   - [ ] Lista de jogadores aumenta (mostra todos os jogadores ativos **disponíveis**)
   - [ ] Jogadores que já estão em duplas **NÃO aparecem**
   - [ ] Contador atualiza: **(X disponíveis)**
5. **Marque** o checkbox novamente
6. **Validar:**
   - [ ] Lista volta a mostrar apenas inscritos **disponíveis**
   - [ ] Jogadores em duplas continuam ocultos
   - [ ] Contador atualiza

### Validação Extra - Reorganização ao Criar
1. Após criar uma dupla manual
2. **Validar:**
   - [ ] Nova dupla recebe **posição sequencial correta**
   - [ ] Se havia buracos na numeração, são corrigidos
   - [ ] Numeração sempre fica 1, 2, 3, 4... (sem pular números)

### Status
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU (descrever o erro):

---

## ✅ TESTE 3: Exclusão de Dupla

### Objetivo
Validar exclusão de duplas e suas proteções.

### Pré-condição
- Ter pelo menos 1 dupla criada
- NÃO ter chaveamento gerado (isso será testado na FASE 4)

### Passos
1. Identifique uma dupla no grid
2. Clique no botão **"🗑️ Excluir"** no card
3. Alert de confirmação aparece
4. Clique em **"OK"** para confirmar

### Validações
- [ ] Alert pergunta: **"Excluir dupla 'Nome & Nome'?"**
- [ ] Após confirmar:
  - [ ] Toast verde **"✅ Dupla excluida com sucesso!"**
  - [ ] Card da dupla desaparece do grid
  - [ ] Contador atualiza **"(X-1)"**

### Caso de Cancelamento
1. Clique em "🗑️ Excluir"
2. Clique em **"Cancelar"** no alert
3. **Validar:**
   - [ ] Dupla permanece no grid
   - [ ] Nenhum toast aparece

### Validação Extra - Reorganização Automática de Posições
1. Após excluir uma dupla, observe a numeração das duplas restantes
2. **Validar:**
   - [ ] Posições são **reorganizadas automaticamente**
   - [ ] Numeração fica **sequencial** (1, 2, 3, 4...)
   - [ ] **Sem "buracos"** na sequência (não fica 1, 3, 5...)
3. Exclua mais algumas duplas aleatoriamente
4. **Validar:**
   - [ ] Sempre reorganiza mantendo sequência contínua

### Status
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU (descrever o erro):

---

## ⭐ TESTE 4: Drag & Drop - Trocar Jogadores Entre Duplas

### Objetivo
Validar a troca de jogadores entre duplas através de drag & drop.

### Pré-condição
- Ter **pelo menos 2 duplas** criadas

### Passos
1. Observe os ícones **⋮⋮** em cada jogador (dentro dos cards)
2. **Clique e segure** em um jogador (ex: Jogador A da Dupla 1)
3. **Arraste** o mouse até outro jogador de **dupla diferente** (ex: Jogador C da Dupla 2)
4. **Solte o mouse**
5. Aguarde o processamento

### Validações Durante o Drag
- [ ] Cursor muda para **"grab"** ao passar sobre jogador
- [ ] Cursor muda para **"grabbing"** ao segurar
- [ ] Jogador sendo arrastado fica **transparente (40% opacity)**
- [ ] Jogador destino fica com **borda amarela (border-amarelo-destaque)**

### Validações Após Soltar
- [ ] Toast verde **"✅ Jogadores trocados com sucesso!"**
- [ ] Jogadores trocaram de dupla visualmente
- [ ] Pontuação total das duplas foi **recalculada**
- [ ] Nome das duplas foi **atualizado** (Jogador1 & Jogador2)

### Exemplo Prático
**Antes:**
- Dupla 1: João (100 pts) + Maria (80 pts) = **180 pts**
- Dupla 2: Pedro (60 pts) + Ana (40 pts) = **100 pts**

**Ação:** Arrastar "Maria" sobre "Pedro"

**Depois:**
- Dupla 1: João (100 pts) + Pedro (60 pts) = **160 pts**
- Dupla 2: Maria (80 pts) + Ana (40 pts) = **120 pts**

### Caso Especial - Mesma Dupla
1. Tente arrastar um jogador sobre outro da **mesma dupla**
2. **Validar:**
   - [ ] Jogadores trocam de posição dentro da dupla (1 vira 2, 2 vira 1)
   - [ ] Pontuação total permanece igual
   - [ ] Nome da dupla é invertido

### Status
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU (descrever o erro):

---

## ⭐ TESTE 5: Modo Reordenar - Trocar Posição das Duplas

### Objetivo
Validar o modo de reordenação estratégica das duplas.

### Pré-condição
- Ter **pelo menos 3 duplas** criadas
- Status da edição = "chaveamento"

### Passos
1. Localize o botão **"🔀 Modo: Reordenar Chaveamento"**
2. Clique no botão
3. Observe as mudanças na interface
4. **Arraste um CARD INTEIRO** sobre outro card
5. Solte e observe a troca de posição
6. Arraste mais alguns cards para definir a ordem desejada
7. Clique no botão **"✅ Salvar Ordem"**

### Validações ao Ativar Modo
- [ ] Botão muda de laranja para verde
- [ ] Texto muda para **"✅ Salvar Ordem"**
- [ ] Banner laranja aparece com:
  - [ ] Título: **"⚠️ Modo Reordenar Ativo"**
  - [ ] Mensagem explicativa
- [ ] Ícone **⋮⋮** aparece no **título** de cada dupla
- [ ] Botões **"🗑️ Excluir"** desaparecem
- [ ] **Jogadores individuais NÃO são mais arrastáveis**
- [ ] Cards inteiros ficam arrastáveis

### Validações Durante o Drag
- [ ] Cursor muda para **"move"**
- [ ] Card arrastado fica **transparente (40%)**
- [ ] Card destino tem **escala 105% (scale-105)**
- [ ] Posições trocam visualmente

### Validações ao Salvar Ordem
- [ ] Toast verde **"✅ Ordem salva! Chaveamento sera regenerado."**
- [ ] Banner laranja desaparece
- [ ] Botão volta a ser laranja **"🔀 Modo: Reordenar Chaveamento"**
- [ ] Botões "🗑️" voltam a aparecer
- [ ] Números das duplas (#1, #2, #3...) foram atualizados
- [ ] Ordem é persistida (recarregar página mantém a ordem)

### Uso Estratégico
Este modo serve para:
- Evitar confrontos precoces entre favoritos
- Distribuir duplas fortes em lados opostos do bracket
- Separar jogadores do mesmo setor

### Status
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU (descrever o erro):

---

## ⚠️ TESTE 6: Sobrescrever Duplas Existentes

### Objetivo
Validar confirmação ao sobrescrever duplas.

### Pré-condição
- Ter duplas já criadas

### Passos
1. Clique novamente em **"🤖 Gerar Automaticamente"**
2. Alert de confirmação aparece
3. Leia a mensagem
4. Clique em **"OK"**

### Validações
- [ ] Alert aparece com mensagem:
  - [ ] **"⚠️ Ja existem duplas! Deseja sobrescrever?"**
  - [ ] **"Isso apagara as duplas atuais e o chaveamento."**
- [ ] Após confirmar:
  - [ ] Duplas antigas são **deletadas**
  - [ ] Novas duplas são criadas
  - [ ] Chaveamento é apagado (se existir)
  - [ ] Toast de sucesso aparece

### Caso de Cancelamento
1. Clique em "Gerar Automaticamente"
2. Clique em **"Cancelar"** no alert
3. **Validar:**
   - [ ] Duplas antigas permanecem
   - [ ] Nenhuma alteração é feita

### Status
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU (descrever o erro):

---

## 🔄 TESTE 7: Fluxo Completo (Cenário Real)

### Objetivo
Simular um fluxo completo de uso real do sistema.

### Cenário: Organizar um torneio do zero

#### Etapa 1: Preparação
1. [ ] Criar uma nova edição
2. [ ] Inscrever 6 jogadores
3. [ ] Clicar em "Iniciar Chaveamento"

#### Etapa 2: Formação Automática
4. [ ] Gerar duplas automaticamente
5. [ ] Validar balanceamento

#### Etapa 3: Ajustes Manuais
6. [ ] Trocar 2 jogadores via drag & drop
7. [ ] Criar 1 dupla manual adicional (se tiver mais jogadores)

#### Etapa 4: Ordenação Estratégica
8. [ ] Ativar modo reordenar
9. [ ] Reorganizar as duplas (colocar favoritos em posições estratégicas)
10. [ ] Salvar ordem

#### Etapa 5: Correções
11. [ ] Excluir 1 dupla (se necessário)
12. [ ] Recriar manualmente

#### Validação Final
- [ ] Todas as duplas estão corretas
- [ ] Ordem está estratégica
- [ ] Pronto para gerar chaveamento (FASE 4)

### Status
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU (descrever o erro):

---

## ❌ TESTES DE CASOS DE ERRO

### Erro 1: Número Ímpar de Jogadores
- [ ] ✅ Testado e validado
- [ ] ❌ Falhou:

### Erro 2: Jogadores Iguais na Criação Manual
- [ ] ✅ Testado e validado
- [ ] ❌ Falhou:

### Caso 4: Filtragem de Jogadores em Duplas
- [ ] ✅ Testado e validado (jogadores em duplas não aparecem)
- [ ] ❌ Falhou:

### Erro 3: Menos de 2 Jogadores Inscritos
- [ ] ✅ Testado e validado
- [ ] ❌ Falhou:

---

## 📊 RESUMO DOS TESTES

| # | Teste | Status | Observações |
|---|-------|--------|-------------|
| 1 | Geração Automática | ⏳ Pendente | |
| 2 | Criação Manual | ⏳ Pendente | |
| 3 | Exclusão de Dupla | ⏳ Pendente | |
| 4 | Drag & Drop Jogadores | ⏳ Pendente | |
| 5 | Modo Reordenar | ⏳ Pendente | |
| 6 | Sobrescrever Duplas | ⏳ Pendente | |
| 7 | Fluxo Completo | ⏳ Pendente | |

**Legenda:**
- ⏳ Pendente
- ✅ Passou
- ❌ Falhou
- ⚠️ Passou com ressalvas

---

## 🐛 BUGS ENCONTRADOS

### Bug #1
**Descrição:**

**Passos para reproduzir:**

**Comportamento esperado:**

**Comportamento observado:**

**Severidade:** [ ] Crítico [ ] Alto [ ] Médio [ ] Baixo

---

### Bug #2
(adicionar conforme necessário)

---

## ✅ CHECKLIST FINAL

Antes de considerar a FASE 3 concluída:

- [ ] Todos os testes principais (1-6) passaram
- [ ] Teste de fluxo completo (7) passou
- [ ] Todos os casos de erro foram validados
- [ ] Feedback visual está funcionando corretamente
- [ ] Performance está adequada (drag & drop fluido)
- [ ] Nenhum erro no console do navegador
- [ ] Dados são persistidos corretamente no banco

---

## 📝 OBSERVAÇÕES GERAIS

(Use este espaço para anotações durante os testes)

---

## 🎯 PRÓXIMOS PASSOS

Após concluir todos os testes da FASE 3:
- [ ] Documentar bugs encontrados
- [ ] Corrigir bugs críticos
- [ ] Prosseguir para **FASE 4: Chaveamento e Início** (Lotes 8-9)

---

**Testado por:** _________________  
**Data:** ___/___/2025  
**Tempo total:** _______ minutos  
**Resultado Final:** [ ] ✅ Aprovado [ ] ❌ Reprovado

