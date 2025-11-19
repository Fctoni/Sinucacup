# LOTE 10: Registro de Resultados

## Objetivo
Registrar vencedores das partidas

## Tarefas

### 1. Criar Funcao de Registrar Vencedor

**lib/services/partidas.ts (adicionar):**

```typescript
export async function registrarVencedor(partidaId: string, vencedorId: string) {
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
  return data as Partida
}

export async function validarRegistroVencedor(partida: PartidaComDuplas): {
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
```

### 2. Criar Componente: Modal de Confirmar Vencedor

**components/chaveamento/ConfirmarVencedorModal.tsx:**

```typescript
'use client'

import { DuplaComJogadores } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (duplaId: string) => void
  dupla1: DuplaComJogadores
  dupla2: DuplaComJogadores
}

export default function ConfirmarVencedorModal({
  isOpen,
  onClose,
  onConfirm,
  dupla1,
  dupla2,
}: Props) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-cinza-card p-8 rounded-xl border-2 border-amarelo-destaque max-w-md w-full">
        <h2 className="text-2xl mb-6 text-center">🏆 Confirmar Vencedor</h2>
        
        <p className="text-texto-secundario text-center mb-6">
          Selecione a dupla vencedora desta partida:
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => onConfirm(dupla1.id)}
            className="w-full bg-verde-medio hover:bg-verde-claro text-white p-4 rounded-lg transition-all hover:scale-105"
          >
            <p className="font-bold text-lg">{dupla1.nome_dupla}</p>
            <p className="text-sm opacity-90">{dupla1.pontuacao_total} pts</p>
          </button>
          
          <button
            onClick={() => onConfirm(dupla2.id)}
            className="w-full bg-verde-medio hover:bg-verde-claro text-white p-4 rounded-lg transition-all hover:scale-105"
          >
            <p className="font-bold text-lg">{dupla2.nome_dupla}</p>
            <p className="text-sm opacity-90">{dupla2.pontuacao_total} pts</p>
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-6 btn-secondary"
        >
          ❌ Cancelar
        </button>
      </div>
    </div>
  )
}
```

### 3. Atualizar PartidaCard para ser Clicavel

**components/chaveamento/PartidaCard.tsx (atualizar):**

```typescript
// Adicionar props
type Props = {
  partida: PartidaComDuplas
  onClick?: () => void
  statusEdicao?: string
}

export default function PartidaCard({ partida, onClick, statusEdicao }: Props) {
  const podeJogar = partida.dupla1_id && partida.dupla2_id && !partida.vencedor_id && statusEdicao === 'em_andamento'
  const jaFinalizada = partida.vencedor_id !== null
  const aguardandoDefinicao = !partida.dupla1_id || !partida.dupla2_id
  
  const handleClick = () => {
    if (podeJogar && onClick) {
      onClick()
    } else if (aguardandoDefinicao) {
      alert('⏳ Aguardando definicao das duplas (TBD)')
    } else if (jaFinalizada) {
      alert('ℹ️ Partida ja finalizada. Use "Editar Resultado" para alterar.')
    } else if (statusEdicao !== 'em_andamento') {
      alert('⚠️ Campeonato ainda nao foi iniciado')
    }
  }
  
  return (
    <div
      onClick={handleClick}
      className={`
        bg-cinza-card p-4 rounded-lg border-2 transition-all
        ${podeJogar ? 'border-verde-medio hover:border-amarelo-destaque cursor-pointer hover:scale-105' : 'border-cinza-medio'}
        ${!podeJogar && !jaFinalizada && statusEdicao === 'em_andamento' ? 'cursor-not-allowed' : ''}
        ${jaFinalizada ? 'opacity-90' : ''}
      `}
    >
      {/* ... resto do componente igual ... */}
    </div>
  )
}
```

### 4. Atualizar Bracket para passar statusEdicao

**components/chaveamento/Bracket.tsx (atualizar):**

```typescript
type Props = {
  partidas: PartidaComDuplas[]
  onPartidaClick?: (partida: PartidaComDuplas) => void
  statusEdicao?: string
}

export default function Bracket({ partidas, onPartidaClick, statusEdicao }: Props) {
  // ... codigo existente ...
  
  return (
    // ... dentro do map de partidas:
    <PartidaCard
      key={partida.id}
      partida={partida}
      onClick={() => onPartidaClick?.(partida)}
      statusEdicao={statusEdicao}
    />
  )
}
```

### 5. Implementar Registro na Pagina

**app/edicoes/[id]/page.tsx (adicionar logica):**

```typescript
import { registrarVencedor, validarRegistroVencedor } from '@/lib/services/partidas'
import ConfirmarVencedorModal from '@/components/chaveamento/ConfirmarVencedorModal'

// States
const [partidaSelecionada, setPartidaSelecionada] = useState<PartidaComDuplas | null>(null)
const [modalVencedorOpen, setModalVencedorOpen] = useState(false)

// Handler click na partida
const handlePartidaClick = (partida: PartidaComDuplas) => {
  const validacao = validarRegistroVencedor(partida)
  
  if (!validacao.podeRegistrar) {
    alert(validacao.mensagem)
    return
  }
  
  setPartidaSelecionada(partida)
  setModalVencedorOpen(true)
}

// Handler confirmar vencedor
const handleConfirmarVencedor = async (vencedorId: string) => {
  if (!partidaSelecionada) return
  
  try {
    await registrarVencedor(partidaSelecionada.id, vencedorId)
    alert('✅ Vencedor registrado com sucesso!')
    setModalVencedorOpen(false)
    setPartidaSelecionada(null)
    fetchPartidas() // Recarregar bracket
  } catch (error: any) {
    alert('Erro ao registrar vencedor: ' + error.message)
  }
}

// No JSX - passar callback para Bracket
<Bracket
  partidas={partidas}
  onPartidaClick={handlePartidaClick}
  statusEdicao={edicao.status}
/>

// Modal
{partidaSelecionada && (
  <ConfirmarVencedorModal
    isOpen={modalVencedorOpen}
    onClose={() => {
      setModalVencedorOpen(false)
      setPartidaSelecionada(null)
    }}
    onConfirm={handleConfirmarVencedor}
    dupla1={partidaSelecionada.dupla1!}
    dupla2={partidaSelecionada.dupla2!}
  />
)}
```

### 6. Adicionar Feedback Visual no Card

**components/chaveamento/PartidaCard.tsx (melhorar visual):**

```typescript
// No JSX, adicionar indicador de "pode jogar"
{podeJogar && (
  <div className="absolute top-2 right-2">
    <span className="bg-verde-claro text-white text-xs px-2 py-1 rounded-full">
      Clique para registrar
    </span>
  </div>
)}

// Ajustar estilos das duplas finalizadas
<div className={`
  p-3 rounded mb-2 transition-all relative
  ${partida.vencedor_id === partida.dupla1_id ? 'bg-verde-medio text-white font-bold' : 'bg-cinza-medio'}
  ${partida.vencedor_id && partida.vencedor_id !== partida.dupla1_id ? 'opacity-30' : ''}
`}>
  {partida.dupla1 ? (
    <div>
      <p className="text-sm">{partida.dupla1.nome_dupla}</p>
      {partida.vencedor_id === partida.dupla1_id && (
        <span className="text-xs flex items-center gap-1">
          🏆 Vencedor
        </span>
      )}
    </div>
  ) : (
    <p className="text-texto-secundario text-sm italic">TBD</p>
  )}
</div>
```

## Checklist de Validacao

- [ ] Partidas clicaveis apenas se status = "em_andamento"
- [ ] Partidas clicaveis apenas se ambas duplas definidas
- [ ] Partidas clicaveis apenas se nao tem vencedor ainda
- [ ] Cursor "pointer" em partidas jogaveis
- [ ] Cursor "not-allowed" em partidas TBD
- [ ] Modal de confirmar vencedor abrindo
- [ ] Botoes grandes para selecionar dupla vencedora
- [ ] Registro salvando no banco
- [ ] Vencedor ficando verde
- [ ] Perdedor ficando cinza (opacity)
- [ ] Toast de sucesso
- [ ] Bracket atualizando apos registro
- [ ] Validacoes funcionando corretamente

## Entregaveis

- ✅ Registro de resultados funcional
- ✅ Interface intuitiva (clique na dupla)
- ✅ Modal de confirmacao
- ✅ Validacoes implementadas
- ✅ Feedback visual adequado
- ✅ Pronto para Lote 11

## Tempo Estimado
⏱️ 90-120 minutos

## Proxima Etapa
➡️ LOTE 11: Logica de Avanco de Fases

