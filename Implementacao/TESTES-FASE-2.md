# 🧪 ROTEIRO DE TESTES MANUAIS - FASE 2
## Lotes 3, 4 e 5: CRUD Básico

---

## 📋 PRÉ-REQUISITOS

### 1. Iniciar o Servidor
```bash
cd sinucacup_v2
npm run dev
```

### 2. Verificar Acesso
- [ ] Servidor iniciou na porta 3001
- [ ] Console sem erros críticos
- [ ] Acessar: http://localhost:3001

### 3. Verificar Banco de Dados
- [x ] 8 jogadores já existem no banco (seeds do Lote 1)
- [x ] Supabase conectado (sem erros de conexão)

---

## 🧪 LOTE 3: GESTÃO DE JOGADORES

### **Teste 1: Acessar Página de Jogadores**
**URL:** `/jogadores`

**Passos:**
1. Clicar em "👥 Jogadores" no menu de navegação
2. Verificar carregamento

**Resultados Esperados:**
- [ ] Página carrega sem erros
- [ ] Mensagem "Carregando jogadores..." aparece brevemente
- [ ] 8 cards de jogadores são exibidos
- [ ] Jogadores ordenados por pontuação (do maior para menor)
- [ ] Botão "➕ Novo Jogador" visível no header

---

### **Teste 2: Visualizar Cards de Jogadores**

**Passos:**
1. Observar os cards exibidos

**Resultados Esperados:**
- [ ] Avatar padrão (emoji 👤) aparece para jogadores sem foto
- [ ] Nome do jogador exibido em destaque
- [ ] Setor exibido abaixo do nome
- [ ] Grid de estatísticas mostra:
  - Pontos (amarelo)
  - Vitórias (verde)
  - Jogos (azul)
- [ ] Todos os valores em zero (0)
- [ ] Cards com efeito hover (levanta e borda amarela)
- [ ] Grid responsivo:
  - Mobile: 1 coluna
  - Tablet: 2 colunas
  - Desktop: 3 colunas
  - Desktop XL: 4 colunas

---

### **Teste 3: Abrir Modal de Cadastro**

**Passos:**
1. Clicar no botão "➕ Novo Jogador"

**Resultados Esperados:**
- [ ] Modal abre com overlay escuro
- [ ] Título "👥 Novo Jogador" visível
- [ ] Formulário com 3 campos:
  - Nome *
  - Setor *
  - URL da Foto (opcional)
- [ ] Botões "✅ Salvar" e "❌ Cancelar"
- [ ] Focus automático no primeiro campo

---

### **Teste 4: Validar Campos Obrigatórios**

**Passos:**
1. Abrir modal
2. Clicar em "✅ Salvar" sem preencher nada

**Resultados Esperados:**
- [ ] Mensagem de erro aparece no campo "Nome"
- [ ] Mensagem de erro aparece no campo "Setor"
- [ ] Mensagens em vermelho abaixo dos campos
- [ ] Formulário não é enviado

---

### **Teste 5: Validar Tamanho Mínimo dos Campos**

**Passos:**
1. Nome: digitar "Jo" (2 caracte res)
2. Setor: digitar "T" (1 caractere)
3. Clicar em "✅ Salvar"

**Resultados Esperados:**
- [ ] Erro: "Nome deve ter pelo menos 3 caracteres"
- [ ] Erro: "Setor deve ter pelo menos 2 caracteres"
- [ ] Formulário não é enviado

---

### **Teste 6: Cadastrar Jogador Válido (Sem Foto)**

**Passos:**
1. Nome: "Roberto Silva"
2. Setor: "Operações"
3. URL da Foto: deixar vazio
4. Clicar em "✅ Salvar"

**Resultados Esperados:**
- [ ] Botão muda para "Salvando..."
- [ ] Modal fecha automaticamente
- [ ] Toast verde aparece: "✅ Jogador cadastrado com sucesso!"
- [ ] Novo card aparece na lista
- [ ] Novo jogador com avatar padrão (sem foto)
- [ ] Estatísticas zeradas (0 pts, 0 vitórias, 0 jogos)
- [ ] Lista recarrega automaticamente

---

### **Teste 7: Cadastrar Jogador com Foto Válida**

**⚠️ IMPORTANTE:** O domínio `i.pravatar.cc` foi configurado no `next.config.ts`. Se este teste falhar com erro de hostname não configurado, **reinicie o servidor** (Ctrl+C e `npm run dev` novamente).

**Passos:**
1. Clicar em "➕ Novo Jogador"
2. Nome: "Maria Oliveira"
3. Setor: "Marketing"
4. URL da Foto: "https://i.pravatar.cc/150?img=5"
5. Clicar em "✅ Salvar"

**Resultados Esperados:**
- [ ] Modal fecha
- [ ] Toast de sucesso aparece
- [ ] Novo card com foto real (não emoji)
- [ ] Foto carrega corretamente
- [ ] Borda verde ao redor da foto

---

### **Teste 8: Validar URL de Foto Inválida**

**Passos:**
1. Abrir modal
2. Nome: "Teste"
3. Setor: "TI"
4. URL da Foto: "foto-invalida"
5. Clicar em "✅ Salvar"

**Resultados Esperados:**
- [ ] Erro: "URL invalida"
- [ ] Formulário não é enviado

---

### **Teste 9: Cancelar Cadastro**

**Passos:**
1. Abrir modal
2. Preencher campos
3. Clicar em "❌ Cancelar"

**Resultados Esperados:**
- [ ] Modal fecha sem salvar
- [ ] Nenhum jogador novo aparece
- [ ] Dados preenchidos são descartados

---

### **Teste 10: Verificar Ordenação**

**Passos:**
1. Observar ordem dos jogadores na lista

**Resultados Esperados:**
- [ ] Jogadores ordenados por pontuação (maior → menor)
- [ ] Como todos têm 0 pontos, ordem alfabética ou ordem de cadastro

---

## 🧪 LOTE 4: GESTÃO DE EDIÇÕES

### **Teste 11: Acessar Página de Edições**
**URL:** `/edicoes`

**Passos:**
1. Clicar em "🏆 Edições" no menu
2. Verificar carregamento

**Resultados Esperados:**
- [ ] Página carrega sem erros
- [ ] Mensagem "Carregando edicoes..." aparece brevemente
- [ ] Empty state aparece (nenhuma edição ainda)
- [ ] Mensagem: "Nenhuma edicao criada"
- [ ] Botão "➕ Criar Primeira Edicao" visível

---

### **Teste 12: Abrir Modal de Nova Edição**

**Passos:**
1. Clicar em "➕ Nova Edicao"

**Resultados Esperados:**
- [ ] Modal abre com título "🏆 Nova Edicao"
- [ ] Formulário com 4 campos:
  - Nome da Edicao *
  - Numero * (preenchido automaticamente com "1")
  - Ano * (preenchido com ano atual: 2025)
  - Data de Inicio * (preenchida com data atual)
- [ ] Campos Número e Ano lado a lado (grid 2 colunas)
- [ ] Botões "✅ Criar Edicao" e "❌ Cancelar"

---

### **Teste 13: Validar Sugestão Automática de Número**

**Passos:**
1. Observar campo "Numero"

**Resultados Esperados:**
- [ ] Valor "1" aparece automaticamente (primeira edição)
- [ ] Valor não pode ser editado ou é editável

---

### **Teste 14: Validar Campos da Edição**

**Passos:**
1. Limpar todos os campos
2. Clicar em "✅ Criar Edicao"

**Resultados Esperados:**
- [ ] Erros de validação aparecem
- [ ] Nome: "Nome deve ter pelo menos 5 caracteres"
- [ ] Formulário não é enviado

---

### **Teste 15: Criar Primeira Edição**

**Passos:**
1. Nome: "Sinuca Cup 1º Trimestre 2025"
2. Numero: manter "1"
3. Ano: manter "2025"
4. Data de Inicio: manter data atual
5. Clicar em "✅ Criar Edicao"

**Resultados Esperados:**
- [ ] Botão muda para "Criando..."
- [ ] Modal fecha
- [ ] Toast: "✅ Edicao criada com sucesso!"
- [ ] Card da edição aparece na lista
- [ ] Badge "📝 Inscricoes Abertas" em azul
- [ ] Data formatada em português: "DD de MMMM de YYYY"
- [ ] Edicao #1 • 2025
- [ ] Botão "👁️ Ver Detalhes"

---

### **Teste 16: Verificar Formatação de Data**

**Passos:**
1. Observar data no card da edição

**Resultados Esperados:**
- [ ] Data em português (ex: "19 de novembro de 2025")
- [ ] Formato completo com mês por extenso
- [ ] Sem erros de locale

---

### **Teste 17: Criar Segunda Edição**

**Passos:**
1. Clicar em "➕ Nova Edicao"
2. Observar campo "Numero"

**Resultados Esperados:**
- [ ] Campo "Numero" mostra "2" automaticamente
- [ ] Sistema incrementou automaticamente

**Continuar Cadastro:**
3. Nome: "Sinuca Cup 2º Trimestre 2025"
4. Numero: manter "2"
5. Ano: manter "2025"
6. Data: selecionar data futura
7. Clicar em "✅ Criar Edicao"

**Resultados Esperados:**
- [ ] Segunda edição criada
- [ ] Duas edições na lista
- [ ] Ordem: edição mais recente primeiro (2 antes de 1)

---

### **Teste 18: Verificar Grid Responsivo**

**Passos:**
1. Redimensionar janela do navegador

**Resultados Esperados:**
- [ ] Mobile: 1 coluna
- [ ] Tablet: 2 colunas
- [ ] Desktop: 3 colunas
- [ ] Cards ajustam automaticamente

---

### **Teste 19: Cancelar Criação de Edição**

**Passos:**
1. Abrir modal
2. Preencher campos
3. Clicar em "❌ Cancelar"

**Resultados Esperados:**
- [ ] Modal fecha
- [ ] Nenhuma edição nova é criada
- [ ] Lista permanece inalterada

---

## 🧪 LOTE 5: SISTEMA DE INSCRIÇÕES

### **Teste 20: Acessar Detalhes da Edição**
**URL:** `/edicoes/[id]`

**Passos:**
1. Na página de edições, clicar em "👁️ Ver Detalhes" da primeira edição

**Resultados Esperados:**
- [ ] Página de detalhes carrega
- [ ] URL muda para `/edicoes/[uuid]`
- [ ] Header mostra:
  - Nome completo da edição
  - Badge de status
  - "Edicao #1 • 2025 • Inicio: [data]"
- [ ] Grid com 2 cards:
  - Card "📊 Informacoes"
  - Card "⚙️ Acoes"

---

### **Teste 21: Verificar Card de Informações**

**Passos:**
1. Observar card "📊 Informacoes"

**Resultados Esperados:**
- [ ] Mostra status atual (badge)
- [ ] Mostra "Jogadores Inscritos: 0"
- [ ] Número em amarelo e destaque

---

### **Teste 22: Verificar Card de Ações (Status: Inscrições Abertas)**

**Passos:**
1. Observar card "⚙️ Acoes"

**Resultados Esperados:**
- [ ] Botão "📝 Gerenciar Inscricoes" visível
- [ ] Botão "🎯 Iniciar Chaveamento" NÃO aparece (menos de 4 inscritos)
- [ ] Outros botões não aparecem

---

### **Teste 23: Abrir Modal de Inscrições**

**Passos:**
1. Clicar em "📝 Gerenciar Inscricoes"

**Resultados Esperados:**
- [ ] Modal grande abre (max-width: 5xl)
- [ ] Título: "📝 Gerenciar Inscricoes"
- [ ] Subtítulo: "Edicao: [nome]"
- [ ] Botão X no canto superior direito
- [ ] Layout 2 colunas (em desktop):
  - Esquerda: "👥 Jogadores Disponiveis (10)"
  - Direita: "✅ Jogadores Inscritos (0)"

---

### **Teste 24: Verificar Painel de Disponíveis**

**Passos:**
1. Observar painel esquerdo

**Resultados Esperados:**
- [ ] Lista 10 jogadores (8 seeds + 2 cadastrados)
- [ ] Cada item mostra:
  - Nome (bold)
  - Setor • Pontuação (ex: "TI • 0 pts")
  - Botão "➕ Inscrever"
- [ ] Fundo cinza médio
- [ ] Ordenados por pontuação

---

### **Teste 25: Verificar Painel de Inscritos (Vazio)**

**Passos:**
1. Observar painel direito

**Resultados Esperados:**
- [ ] Título em verde: "✅ Jogadores Inscritos (0)"
- [ ] Mensagem: "Nenhum jogador inscrito ainda"
- [ ] Painel vazio

---

### **Teste 26: Inscrever Primeiro Jogador**

**Passos:**
1. Clicar em "➕ Inscrever" ao lado de qualquer jogador

**Resultados Esperados:**
- [ ] Jogador desaparece do painel esquerdo
- [ ] Jogador aparece no painel direito
- [ ] Card no painel direito tem:
  - Fundo verde transparente
  - Borda verde (2px)
  - Nome e setor/pontos
- [ ] Contador atualiza:
  - Disponíveis: 9
  - Inscritos: 1

---

### **Teste 27: Inscrever Mais 3 Jogadores (Total: 4)**

**Passos:**
1. Inscrever mais 3 jogadores (um de cada vez)

**Resultados Esperados:**
- [ ] Cada clique transfere jogador instantaneamente
- [ ] Contadores atualizam a cada inscrição
- [ ] Ao final:
  - Disponíveis: 6
  - Inscritos: 4
- [ ] 4 jogadores no painel direito

---

### **Teste 28: Fechar Modal e Verificar Contador**

**Passos:**
1. Clicar em "✅ Concluir" ou no X
2. Modal fecha
3. Observar página de detalhes

**Resultados Esperados:**
- [ ] Modal fecha
- [ ] Página atualiza automaticamente
- [ ] Card "📊 Informacoes" mostra: "Jogadores Inscritos: 4"
- [ ] Número 4 em amarelo

---

### **Teste 29: Verificar Aparecimento do Botão "Iniciar Chaveamento"**

**Passos:**
1. Observar card "⚙️ Acoes"

**Resultados Esperados:**
- [ ] Botão "🎯 Iniciar Chaveamento" AGORA aparece
- [ ] Estilo secundário (cinza com borda)
- [ ] Posicionado abaixo do botão "Gerenciar Inscricoes"

---

### **Teste 30: Inscrever Mais Jogadores**

**Passos:**
1. Abrir modal de inscrições novamente
2. Inscrever mais 4 jogadores (total: 8)
3. Fechar modal

**Resultados Esperados:**
- [ ] Todos os jogadores transferidos corretamente
- [ ] Contador final: Inscritos: 8
- [ ] Página de detalhes mostra: 8 inscritos

---

### **Teste 31: Verificar Empty State "Todos Inscritos"**

**Passos:**
1. Inscrever todos os 10 jogadores
2. Abrir modal novamente

**Resultados Esperados:**
- [ ] Painel esquerdo mostra:
  - "👥 Jogadores Disponiveis (0)"
  - Mensagem: "Todos os jogadores ja estao inscritos"
- [ ] Painel direito mostra:
  - "✅ Jogadores Inscritos (10)"
  - 10 jogadores listados

---

### **Teste 32: Verificar Que Jogador Não Aparece Duplicado**

**Passos:**
1. Abrir modal de inscrições
2. Verificar listas

**Resultados Esperados:**
- [ ] Nenhum jogador aparece em ambos os painéis
- [ ] Cada jogador em apenas um painel
- [ ] Sistema filtra corretamente

---

### **Teste 33: Voltar para Lista de Edições**

**Passos:**
1. Clicar em "🏆 Edições" no menu
2. Observar lista

**Resultados Esperados:**
- [ ] Lista de edições aparece
- [ ] Todas as edições criadas estão lá
- [ ] Status badges corretos
- [ ] Nenhum erro

---

## 🧪 TESTES DE INTEGRAÇÃO

### **Teste 34: Criar Edição e Inscrever Jogadores (Fluxo Completo)**

**Passos:**
1. Criar nova edição: "Teste de Integração"
2. Acessar detalhes
3. Inscrever 6 jogadores
4. Verificar contador
5. Voltar para lista de edições
6. Acessar detalhes novamente

**Resultados Esperados:**
- [ ] Todos os dados persistem
- [ ] 6 jogadores ainda inscritos
- [ ] Contador mantém valor correto
- [ ] Nenhuma perda de dados

---

### **Teste 35: Navegação Entre Páginas**

**Passos:**
1. Jogadores → Edições → Detalhes → Jogadores → Ranking → Chaveamento
2. Verificar menu de navegação

**Resultados Esperados:**
- [ ] Todas as rotas funcionam
- [ ] Menu sempre visível
- [ ] Página ativa destacada
- [ ] Sem erros 404
- [ ] Breadcrumb ou título correto em cada página

---

### **Teste 36: Verificar Dados no Banco (Opcional - Via Supabase)**

**Passos:**
1. Acessar Supabase Dashboard
2. Verificar tabelas:
   - jogadores
   - edicoes
   - inscricoes

**Resultados Esperados:**
- [ ] Jogadores cadastrados estão na tabela
- [ ] Edições criadas estão na tabela
- [ ] Inscrições registradas com foreign keys corretos
- [ ] Timestamps preenchidos

---

## 🧪 TESTES DE VALIDAÇÃO E EDGE CASES

### **Teste 37: Tentar Cadastrar Jogador Duplicado**

**Passos:**
1. Cadastrar jogador: "Teste Duplicado" (setor: "TI")
2. Tentar cadastrar novamente com mesmo nome: "Teste Duplicado" (setor: "RH")

**Resultados Esperados:**
- [ ] Sistema IMPEDE o cadastro (constraint UNIQUE no nome)
- [ ] Toast vermelho aparece: "❌ Já existe um jogador cadastrado com este nome!"
- [ ] Modal permanece aberto
- [ ] Nenhum novo registro é criado
- [ ] Nome deve ser único no sistema (independente do setor)

---

### **Teste 37.1: Nomes Similares São Aceitos (Complementar)**

**Passos:**
1. Cadastrar jogador: "João Silva"
2. Cadastrar jogador: "João Silva Junior" (nome diferente)

**Resultados Esperados:**
- [ ] Ambos são cadastrados com sucesso
- [ ] Sistema diferencia nomes similares mas não idênticos
- [ ] Dois registros diferentes criados

---

### **Teste 38: Campos com Caracteres Especiais**

**Passos:**
1. Cadastrar jogador:
   - Nome: "José da Silva Júnior"
   - Setor: "TI & Inovação"

**Resultados Esperados:**
- [ ] Aceita acentos
- [ ] Aceita caracteres especiais
- [ ] Salva corretamente
- [ ] Exibe sem problemas

---

### **Teste 39: Nomes Muito Longos**

**Passos:**
1. Nome: "Nome Com Mais de Duzentos e Cinquenta Caracteres Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua Ut Enim Ad Minim Veniam Quis Nostrud Exercitation Ullamco Laboris Nisi Ut Aliquip"

**Resultados Esperados:**
- [ ] Sistema aceita até 255 caracteres
- [ ] Se passar, erro de validação ou trunca

---

### **Teste 40: Data de Edição no Passado**

**Passos:**
1. Criar edição com data: 01/01/2020

**Resultados Esperados:**
- [ ] Sistema aceita (não valida se é passado)
- [ ] Edição criada normalmente

---

### **Teste 41: Ano Inválido**

**Passos:**
1. Tentar criar edição com ano: 1999

**Resultados Esperados:**
- [ ] Erro: "Ano invalido"
- [ ] Formulário não envia

---

### **Teste 42: Inscrever em Edição com Status Diferente**

**Passos:**
1. (Aguardar implementação de mudança de status)
2. Verificar que botão desaparece

**Resultados Esperados:**
- [ ] Botão "Gerenciar Inscricoes" só aparece em "Inscrições Abertas"

---

## 🧪 TESTES DE RESPONSIVIDADE

### **Teste 43: Mobile (≤ 768px)**

**Passos:**
1. Redimensionar para 375px (iPhone)
2. Navegar por todas as páginas

**Resultados Esperados:**
- [ ] Jogadores: 1 coluna
- [ ] Edições: 1 coluna
- [ ] Modal de inscrições: colunas empilham verticalmente
- [ ] Botões acessíveis
- [ ] Texto legível
- [ ] Sem scroll horizontal

---

### **Teste 44: Tablet (768px - 968px)**

**Passos:**
1. Redimensionar para 768px (iPad)

**Resultados Esperados:**
- [ ] Jogadores: 2 colunas
- [ ] Edições: 2 colunas
- [ ] Modal mantém 2 colunas
- [ ] Layout confortável

---

### **Teste 45: Desktop (> 968px)**

**Passos:**
1. Redimensionar para 1920px

**Resultados Esperados:**
- [ ] Jogadores: 4 colunas (XL)
- [ ] Edições: 3 colunas
- [ ] Modal usa largura máxima (5xl)
- [ ] Espaçamento adequado

---

## 🧪 TESTES DE PERFORMANCE

### **Teste 46: Carregar Página com Muitos Dados**

**Passos:**
1. Cadastrar 20+ jogadores
2. Criar 10+ edições
3. Recarregar páginas

**Resultados Esperados:**
- [ ] Carregamento rápido (< 2s)
- [ ] Loading state aparece
- [ ] Sem travamentos
- [ ] Scroll suave

---

### **Teste 47: Inscrever/Desinscrever Múltiplas Vezes**

**Passos:**
1. Abrir modal
2. Inscrever 5 jogadores
3. (Aguardar funcionalidade de remover)

**Resultados Esperados:**
- [ ] Operações rápidas
- [ ] Sem delays perceptíveis

---

## 🧪 TESTES DE TOASTS (SONNER)

### **Teste 48: Verificar Toasts de Sucesso**

**Passos:**
1. Executar ações de sucesso (cadastros, inscrições)

**Resultados Esperados:**
- [ ] Toast verde aparece no canto superior direito
- [ ] Mensagem clara e específica
- [ ] Auto-dismiss após 3-5 segundos
- [ ] Animação suave (slide-in)

---

### **Teste 49: Verificar Toasts de Erro**

**Passos:**
1. Desconectar Supabase ou forçar erro
2. Tentar carregar dados

**Resultados Esperados:**
- [ ] Toast vermelho aparece
- [ ] Mensagem de erro clara
- [ ] Não trava a aplicação

---

## 📊 RESUMO DE VALIDAÇÃO

### ✅ Checklist Final

**LOTE 3 - Jogadores:**
- [ ] Listagem funcional
- [ ] Cadastro funcional
- [ ] Validações funcionando
- [ ] Grid responsivo
- [ ] Toasts funcionando

**LOTE 4 - Edições:**
- [ ] Listagem funcional
- [ ] Criação funcional
- [ ] Status badges corretos
- [ ] Sugestão automática de número
- [ ] Data em português
- [ ] Link para detalhes

**LOTE 5 - Inscrições:**
- [ ] Modal de 2 painéis
- [ ] Inscrição funcional
- [ ] Transferência entre painéis
- [ ] Contador atualiza
- [ ] Botões contextuais
- [ ] Página de detalhes

**Integração:**
- [ ] Navegação entre páginas
- [ ] Dados persistem
- [ ] Sem erros de console

**Qualidade:**
- [ ] 0 erros de lint
- [ ] 0 erros de TypeScript
- [ ] Design consistente
- [ ] Responsivo em todos os tamanhos

---

## 🐛 REPORTAR BUGS

Se encontrar algum problema:

1. **Anotar:**
   - Teste que falhou
   - Resultado esperado
   - Resultado obtido
   - Mensagem de erro (se houver)
   
2. **Console:**
   - Abrir DevTools (F12)
   - Verificar erros no Console
   - Verificar Network (requisições falhando)

3. **Informar:**
   - Navegador e versão
   - Tamanho da tela
   - Passos para reproduzir

---

## ✅ CRITÉRIOS DE APROVAÇÃO

**FASE 2 está completa se:**
- [ ] Todos os 49 testes passam
- [ ] Nenhum erro crítico
- [ ] Funcionalidades principais operacionais
- [ ] Interface responsiva
- [ ] Dados persistem corretamente

---

**Boa sorte nos testes! 🚀**

