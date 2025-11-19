# LOTE 12: Edicao de Resultados

## Objetivo
Corrigir erros em resultados ja registrados com validacao de impacto

## Tarefas

### 1. Criar Funcao de Validar Impacto

**lib/services/partidas.ts (adicionar):**

```typescript
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
```

### 2. Criar Componente: Modal de Edicao

**components/chaveamento/EditarResultadoModal.tsx:**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { PartidaComDuplas } from '@/types'
import { validarImpactoEdicao } from '@/lib/services/partidas'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (novoVencedorId: string) => void
  partida: PartidaComDuplas
}

export default function EditarResultadoModal({ isOpen, onClose, onConfirm, partida }: Props) {
  const [novoVencedorId, setNovoVencedorId] = useState('')
  const [impacto, setImpacto] = useState<any>(null)
  const [validando, setValidando] = useState(false)
  
  useEffect(() => {
    if (isOpen && novoVencedorId && novoVencedorId !== partida.vencedor_id) {
      validarImpacto()
    }
  }, [novoVencedorId, isOpen])
  
  const validarImpacto = async () => {
    setValidando(true)
    try {
      const resultado = await validarImpactoEdicao(partida.id, novoVencedorId)
      setImpacto(resultado)
    } catch (error) {
      console.error('Erro ao validar impacto:', error)
    } finally {
      setValidando(false)
    }
  }
  
  if (!isOpen) return null
  
  const handleConfirm = () => {
    if (!novoVencedorId) {
      alert('Selecione o novo vencedor')
      return
    }
    
    if (novoVencedorId === partida.vencedor_id) {
      alert('Selecione um vencedor diferente do atual')
      return
    }
    
    if (impacto?.temImpacto) {
      const confirmar = window.confirm(
        `⚠️ ATENCAO!\n\nVai limpar os resultados das fases: ${impacto.fasesAfetadas.join(', ').toUpperCase()}\n\n${impacto.partidasAfetadas} partida(s) serao afetadas.\n\nDeseja continuar?`
      )
      if (!confirmar) return
    }
    
    onConfirm(novoVencedorId)
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-cinza-card p-8 rounded-xl border-2 border-amarelo-destaque max-w-md w-full">
        <h2 className="text-2xl mb-6">✏️ Editar Resultado</h2>
        
        <div className="mb-6">
          <p className="text-sm text-texto-secundario mb-4">
            Vencedor atual: <span className="font-bold text-verde-claro">{partida.vencedor?.nome_dupla}</span>
          </p>
          
          <label className="block text-sm font-semibold mb-2">Novo Vencedor:</label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 bg-cinza-medio p-3 rounded-lg cursor-pointer hover:bg-cinza-medio-claro">
              <input
                type="radio"
                name="vencedor"
                value={partida.dupla1!.id}
                checked={novoVencedorId === partida.dupla1!.id}
                onChange={(e) => setNovoVencedorId(e.target.value)}
                className="w-4 h-4"
              />
              <span>{partida.dupla1!.nome_dupla}</span>
            </label>
            
            <label className="flex items-center gap-3 bg-cinza-medio p-3 rounded-lg cursor-pointer hover:bg-cinza-medio-claro">
              <input
                type="radio"
                name="vencedor"
                value={partida.dupla2!.id}
                checked={novoVencedorId === partida.dupla2!.id}
                onChange={(e) => setNovoVencedorId(e.target.value)}
                className="w-4 h-4"
              />
              <span>{partida.dupla2!.nome_dupla}</span>
            </label>
          </div>
        </div>
        
        {validando && (
          <p className="text-sm text-texto-secundario mb-4">Validando impacto...</p>
        )}
        
        {impacto?.temImpacto && !validando && (
          <div className="bg-laranja-aviso bg-opacity-20 border-2 border-laranja-aviso p-4 rounded-lg mb-6">
            <p className="font-bold mb-2">⚠️ Esta edicao tera impacto!</p>
            <p className="text-sm">
              Vai limpar os resultados das fases: <span className="font-bold">{impacto.fasesAfetadas.join(', ').toUpperCase()}</span>
            </p>
            <p className="text-sm mt-1">
              {impacto.partidasAfetadas} partida(s) serao afetadas
            </p>
          </div>
        )}
        
        <div className="flex gap-4">
          <button onClick={handleConfirm} disabled={validando} className="btn-primary flex-1">
            ✅ Confirmar Edicao
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

### 3. Adicionar Botao de Editar no Card

**components/chaveamento/PartidaCard.tsx (adicionar):**

```typescript
type Props = {
  partida: PartidaComDuplas
  onClick?: () => void
  onEdit?: () => void
  statusEdicao?: string
}

export default function PartidaCard({ partida, onClick, onEdit, statusEdicao }: Props) {
  // ... codigo existente ...
  
  const jaFinalizada = partida.vencedor_id !== null
  
  return (
    <div className="relative">
      {/* Botao de editar (se finalizada) */}
      {jaFinalizada && onEdit && statusEdicao === 'em_andamento' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="absolute top-2 right-2 bg-azul-info hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full transition-colors z-10"
        >
          ✏️ Editar
        </button>
      )}
      
      {/* Resto do card ... */}
    </div>
  )
}
```

### 4. Implementar na Pagina

**app/edicoes/[id]/page.tsx (adicionar):**

```typescript
import { editarResultado } from '@/lib/services/partidas'
import EditarResultadoModal from '@/components/chaveamento/EditarResultadoModal'

// States
const [modalEditarOpen, setModalEditarOpen] = useState(false)

// Handler editar
const handleEditarPartida = (partida: PartidaComDuplas) => {
  if (!partida.vencedor_id) {
    alert('Partida ainda nao foi finalizada')
    return
  }
  
  setPartidaSelecionada(partida)
  setModalEditarOpen(true)
}

// Handler confirmar edicao
const handleConfirmarEdicao = async (novoVencedorId: string) => {
  if (!partidaSelecionada) return
  
  try {
    const resultado = await editarResultado(partidaSelecionada.id, novoVencedorId)
    
    if (resultado.fasesLimpas.length > 0) {
      alert(`✅ Resultado editado!\n\n🔄 Fases limpas: ${resultado.fasesLimpas.join(', ').toUpperCase()}`)
    } else {
      alert('✅ Resultado editado com sucesso!')
    }
    
    setModalEditarOpen(false)
    setPartidaSelecionada(null)
    fetchPartidas()
  } catch (error: any) {
    alert('Erro ao editar resultado: ' + error.message)
  }
}

// Atualizar Bracket para passar callback de edicao
<PartidaCard
  key={partida.id}
  partida={partida}
  onClick={() => onPartidaClick?.(partida)}
  onEdit={() => handleEditarPartida(partida)}
  statusEdicao={statusEdicao}
/>

// Modal de edicao
{partidaSelecionada && modalEditarOpen && (
  <EditarResultadoModal
    isOpen={modalEditarOpen}
    onClose={() => {
      setModalEditarOpen(false)
      setPartidaSelecionada(null)
    }}
    onConfirm={handleConfirmarEdicao}
    partida={partidaSelecionada}
  />
)}
```

## Checklist de Validacao

- [ ] Botao "Editar" aparecendo em partidas finalizadas
- [ ] Modal de edicao abrindo
- [ ] Radio buttons para selecionar novo vencedor
- [ ] Validacao de impacto funcionando
- [ ] Aviso se tem impacto (fases afetadas)
- [ ] Confirmacao obrigatoria se tem impacto
- [ ] Edicao salvando no banco
- [ ] Partidas posteriores sendo atualizadas
- [ ] Vencedores trocados nas fases seguintes
- [ ] Resultados das fases afetadas limpos
- [ ] Bracket atualizando apos edicao
- [ ] Mensagem informativa sobre fases limpas

## Entregaveis

- ✅ Edicao de resultados funcional
- ✅ Validacao de impacto implementada
- ✅ Atualizacao em cascata
- ✅ Integridade mantida
- ✅ Pronto para Lote 13

## Tempo Estimado
⏱️ 120-150 minutos

## Proxima Etapa
➡️ LOTE 13: Encerramento e Distribuicao de Pontos

