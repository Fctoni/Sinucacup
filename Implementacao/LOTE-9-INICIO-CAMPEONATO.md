# LOTE 9: Inicio do Campeonato e Travas

## Objetivo
Iniciar campeonato oficialmente e aplicar travas

## Tarefas

### 1. Criar Funcao de Iniciar Campeonato

**lib/services/edicoes.ts (adicionar):**

```typescript
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
```

### 2. Criar Componente: Modal de Confirmacao de Inicio

**components/edicoes/IniciarCampeonatoModal.tsx:**

```typescript
'use client'

import { DuplaComJogadores } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  numDuplas: number
  numPartidasPrimeiraFase: number
  duplasComBye: string[]
}

export default function IniciarCampeonatoModal({
  isOpen,
  onClose,
  onConfirm,
  numDuplas,
  numPartidasPrimeiraFase,
  duplasComBye,
}: Props) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-cinza-card p-8 rounded-xl border-2 border-laranja-aviso max-w-lg w-full">
        <h2 className="text-2xl mb-4">🎯 Iniciar Campeonato?</h2>
        
        <div className="bg-laranja-aviso bg-opacity-20 border-2 border-laranja-aviso p-4 rounded-lg mb-6">
          <p className="font-semibold mb-2">⚠️ ATENCAO!</p>
          <p className="text-sm">
            Apos iniciar, nao sera possivel:
          </p>
          <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
            <li>Editar duplas</li>
            <li>Regenerar chaveamento</li>
            <li>Reordenar chaveamento</li>
            <li>Excluir duplas</li>
          </ul>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="bg-cinza-medio p-3 rounded">
            <p className="text-sm text-texto-secundario">Duplas Participantes</p>
            <p className="text-2xl font-bold text-amarelo-destaque">{numDuplas}</p>
          </div>
          
          <div className="bg-cinza-medio p-3 rounded">
            <p className="text-sm text-texto-secundario">Partidas na Primeira Fase</p>
            <p className="text-2xl font-bold text-verde-claro">{numPartidasPrimeiraFase}</p>
          </div>
          
          {duplasComBye.length > 0 && (
            <div className="bg-azul-info bg-opacity-20 border border-azul-info p-3 rounded">
              <p className="text-sm font-semibold mb-1">Duplas com BYE:</p>
              <p className="text-sm">{duplasComBye.join(', ')}</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <button onClick={onConfirm} className="btn-primary flex-1">
            ✅ Confirmar Inicio
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 3. Atualizar Pagina com Botao de Iniciar

**app/edicoes/[id]/page.tsx (adicionar logica):**

```typescript
import { iniciarCampeonato } from '@/lib/services/edicoes'
import IniciarCampeonatoModal from '@/components/edicoes/IniciarCampeonatoModal'

// State
const [modalIniciarOpen, setModalIniciarOpen] = useState(false)

// Handler
const handleIniciarCampeonato = async () => {
  try {
    await iniciarCampeonato(edicaoId)
    alert('🎯 Campeonato iniciado! Boa sorte a todos!')
    fetchData() // Recarregar status
  } catch (error: any) {
    alert('Erro: ' + error.message)
  } finally {
    setModalIniciarOpen(false)
  }
}

// No JSX - adicionar botao de iniciar (apenas se status = chaveamento e tem partidas)
{edicao.status === 'chaveamento' && partidas.length > 0 && (
  <div className="mt-8">
    <div className="bg-gradient-to-r from-verde-medio to-verde-claro p-6 rounded-xl text-center">
      <h3 className="text-2xl font-bold mb-3">🎯 Pronto para Comecar?</h3>
      <p className="text-sm mb-4 opacity-90">
        Revise o chaveamento e clique abaixo para iniciar o campeonato
      </p>
      <button
        onClick={() => setModalIniciarOpen(true)}
        className="bg-white text-verde-mesa px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
      >
        🎯 Iniciar Campeonato
      </button>
    </div>
  </div>
)}

<IniciarCampeonatoModal
  isOpen={modalIniciarOpen}
  onClose={() => setModalIniciarOpen(false)}
  onConfirm={handleIniciarCampeonato}
  numDuplas={duplas.length}
  numPartidasPrimeiraFase={partidas.filter(p => p.fase === partidas[0]?.fase).length}
  duplasComBye={byes.map(b => b.dupla?.nome_dupla || '')}
/>
```

### 4. Aplicar Travas Visuais

**app/edicoes/[id]/page.tsx (adicionar condicoes):**

```typescript
// Condicao para esconder botoes quando "em_andamento" ou "finalizada"
const podeEditarDuplas = edicao.status === 'chaveamento'
const podeGerarChaveamento = edicao.status === 'chaveamento'
const modoReordenarDisponivel = edicao.status === 'chaveamento'

// Modificar botoes:
{podeEditarDuplas && (
  <button onClick={handleGerarDuplasAutomaticas} className="btn-primary">
    🤖 Gerar Automaticamente
  </button>
)}

{podeEditarDuplas && (
  <button onClick={() => setModalDuplaManualOpen(true)} className="btn-secondary">
    ➕ Criar Manual
  </button>
)}

{podeGerarChaveamento && (
  <button onClick={handleGerarChaveamento} className="btn-primary">
    🎯 Gerar Chaveamento
  </button>
)}

// No DuplaCard, passar canDelete baseado no status
<DuplaCardDraggable
  key={dupla.id}
  dupla={dupla}
  onDelete={podeEditarDuplas ? handleExcluirDupla : undefined}
  canDelete={podeEditarDuplas}
  modoReordenar={modoReordenar}
/>

// Botao reordenar apenas se podeEditarDuplas
{modoReordenarDisponivel && duplas.length > 0 && (
  <button ...>
    {modoReordenar ? '✅ Salvar Ordem' : '🔀 Modo: Reordenar Chaveamento'}
  </button>
)}
```

### 5. Criar Badge/Banner de Status Ativo

**components/shared/BannerEmAndamento.tsx:**

```typescript
export default function BannerEmAndamento() {
  return (
    <div className="bg-laranja-aviso bg-opacity-20 border-2 border-laranja-aviso p-4 rounded-lg mb-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎯</span>
        <div>
          <p className="font-bold text-lg">Campeonato em Andamento</p>
          <p className="text-sm opacity-90">
            Duplas e chaveamento estao travados. Registre os resultados das partidas abaixo.
          </p>
        </div>
      </div>
    </div>
  )
}
```

**app/edicoes/[id]/page.tsx (adicionar banner):**

```typescript
import BannerEmAndamento from '@/components/shared/BannerEmAndamento'

// No JSX, logo apos o cabecalho
{edicao.status === 'em_andamento' && <BannerEmAndamento />}
```

## Checklist de Validacao

- [ ] Botao "Iniciar Campeonato" aparecendo
- [ ] Botao apenas se status = chaveamento
- [ ] Modal de confirmacao abrindo
- [ ] Informacoes corretas no modal (duplas, partidas, byes)
- [ ] Aviso claro sobre travas
- [ ] Inicio confirmado atualiza status para "em_andamento"
- [ ] Badge muda para "Em Andamento"
- [ ] Banner laranja aparece
- [ ] Botoes de editar duplas desaparecem
- [ ] Botao de gerar chaveamento desaparece
- [ ] Botao de reordenar desaparece
- [ ] Icones de excluir dupla desaparecem
- [ ] Drag & drop desabilitado

## Entregaveis

- ✅ Funcao de iniciar campeonato
- ✅ Modal de confirmacao
- ✅ Travas aplicadas corretamente
- ✅ Feedback visual adequado
- ✅ Pronto para Lote 10

## Tempo Estimado
⏱️ 60-90 minutos

## Proxima Etapa
➡️ LOTE 10: Registro de Resultados

