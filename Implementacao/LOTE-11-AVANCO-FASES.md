# LOTE 11: Logica de Avanco de Fases

## Objetivo
Criar proximas fases automaticamente quando fase atual terminar

## Tarefas

### 1. Criar Funcao de Verificar Fase Completa

**lib/services/partidas.ts (adicionar):**

```typescript
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

export async function getProximaFase(faseAtual: string): string | null {
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
  
  // Se for a segunda fase E havia byes, integra-los agora
  if (byes.length > 0 && faseAtual === partidasAtuais[0]?.fase) {
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
```

### 2. Atualizar Funcao de Registrar Vencedor

**lib/services/partidas.ts (atualizar):**

```typescript
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
```

### 3. Atualizar Handler de Registro

**app/edicoes/[id]/page.tsx (atualizar):**

```typescript
const handleConfirmarVencedor = async (vencedorId: string) => {
  if (!partidaSelecionada) return
  
  try {
    const resultado = await registrarVencedor(partidaSelecionada.id, vencedorId)
    
    alert(resultado.mensagem)
    
    setModalVencedorOpen(false)
    setPartidaSelecionada(null)
    
    // Recarregar dados
    await Promise.all([
      fetchPartidas(),
      fetchDuplas(),
      fetchData(),
    ])
  } catch (error: any) {
    alert('Erro ao registrar vencedor: ' + error.message)
  }
}
```

### 4. Criar Componente de Notificacao de Nova Fase

**components/chaveamento/NovaFaseNotificacao.tsx:**

```typescript
'use client'

import { useEffect } from 'react'

type Props = {
  fase: string
  onClose: () => void
}

export default function NovaFaseNotificacao({ fase, onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [onClose])
  
  return (
    <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-verde-medio to-verde-claro p-6 rounded-xl shadow-card-hover animate-slide-in-right max-w-sm">
      <div className="text-center">
        <p className="text-4xl mb-2">🎯</p>
        <p className="font-bold text-xl mb-1">Nova Fase Criada!</p>
        <p className="text-2xl font-bold uppercase">{fase}</p>
        <p className="text-sm mt-2 opacity-90">
          Proximas partidas ja estao disponiveis
        </p>
      </div>
    </div>
  )
}
```

### 5. Adicionar Indicador de Progresso

**components/chaveamento/ProgressoFases.tsx:**

```typescript
import { PartidaComDuplas } from '@/types'

type Props = {
  partidas: PartidaComDuplas[]
}

const fasesOrdem = ['oitavas', 'quartas', 'semifinal', 'final']

export default function ProgressoFases({ partidas }: Props) {
  const partidasPorFase = partidas.reduce((acc, p) => {
    if (!acc[p.fase]) acc[p.fase] = []
    acc[p.fase].push(p)
    return acc
  }, {} as Record<string, PartidaComDuplas[]>)
  
  const fasesPresentes = fasesOrdem.filter(f => partidasPorFase[f])
  
  return (
    <div className="bg-cinza-card p-6 rounded-xl mb-6">
      <h4 className="text-lg font-bold mb-4">📊 Progresso do Campeonato</h4>
      
      <div className="space-y-3">
        {fasesPresentes.map((fase) => {
          const partidas = partidasPorFase[fase]
          const finalizadas = partidas.filter(p => p.vencedor_id).length
          const total = partidas.length
          const percentual = (finalizadas / total) * 100
          
          return (
            <div key={fase}>
              <div className="flex justify-between mb-1">
                <span className="font-semibold capitalize">{fase}</span>
                <span className="text-sm text-texto-secundario">
                  {finalizadas}/{total} partidas
                </span>
              </div>
              <div className="w-full bg-cinza-medio rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-verde-medio to-verde-claro h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentual}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### 6. Adicionar Progresso na Pagina

**app/edicoes/[id]/page.tsx (adicionar):**

```typescript
import ProgressoFases from '@/components/chaveamento/ProgressoFases'

// No JSX, antes do Bracket
{edicao.status === 'em_andamento' && partidas.length > 0 && (
  <ProgressoFases partidas={partidas} />
)}
```

## Checklist de Validacao

- [ ] Funcao verifica se fase esta completa
- [ ] Funcao identifica proxima fase corretamente
- [ ] Ao registrar ultimo resultado da fase, proxima fase e criada
- [ ] Vencedores sao emparelhados corretamente
- [ ] Duplas com BYE sao integradas na segunda fase
- [ ] Byes sao removidos apos integracao
- [ ] Notificacao de nova fase aparecendo
- [ ] Bracket atualiza automaticamente
- [ ] Progresso visual por fase funcionando
- [ ] Final nao cria proxima fase (retorna null)
- [ ] Mensagem especial quando final e concluida

## Entregaveis

- ✅ Avanco automatico de fases
- ✅ Integracao de byes na hora certa
- ✅ Notificacoes de progresso
- ✅ Indicador visual de progresso
- ✅ Pronto para Lote 12

## Tempo Estimado
⏱️ 120-150 minutos

## Proxima Etapa
➡️ LOTE 12: Edicao de Resultados

