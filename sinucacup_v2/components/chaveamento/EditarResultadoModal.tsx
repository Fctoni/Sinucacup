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
            <label className="flex items-center gap-3 bg-cinza-medio p-3 rounded-lg cursor-pointer hover:bg-opacity-80">
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
            
            <label className="flex items-center gap-3 bg-cinza-medio p-3 rounded-lg cursor-pointer hover:bg-opacity-80">
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

