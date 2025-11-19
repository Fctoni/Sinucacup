'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { edicaoSchema, EdicaoFormData } from '@/lib/validations/edicao'
import { createEdicao, getProximoNumeroEdicao } from '@/lib/services/edicoes'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function NovaEdicaoModal({ isOpen, onClose, onSuccess }: Props) {
  const anoAtual = new Date().getFullYear()
  const [formData, setFormData] = useState<EdicaoFormData>({
    nome: '',
    numero: 1,
    ano: anoAtual,
    data_inicio: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      // Buscar proximo numero automaticamente
      getProximoNumeroEdicao(anoAtual).then((numero) => {
        setFormData((prev) => ({ ...prev, numero }))
      })
    }
  }, [isOpen, anoAtual])
  
  if (!isOpen) return null
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    
    try {
      const validated = edicaoSchema.parse(formData)
      await createEdicao(validated)
      
      setFormData({
        nome: '',
        numero: 1,
        ano: anoAtual,
        data_inicio: new Date().toISOString().split('T')[0],
      })
      onSuccess()
      onClose()
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
      } else {
        toast.error('Erro ao criar edicao: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-cinza-card p-8 rounded-xl border-2 border-amarelo-destaque max-w-md w-full mx-4">
        <h2 className="text-2xl mb-6">🏆 Nova Edicao</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nome da Edicao *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
              placeholder="Ex: Sinuca Cup 1º Trimestre 2025"
            />
            {errors.nome && <p className="text-vermelho-erro text-sm mt-1">{errors.nome}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Numero *</label>
              <input
                type="number"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: parseInt(e.target.value) })}
                className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
              />
              {errors.numero && <p className="text-vermelho-erro text-sm mt-1">{errors.numero}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Ano *</label>
              <input
                type="number"
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
                className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
              />
              {errors.ano && <p className="text-vermelho-erro text-sm mt-1">{errors.ano}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Data de Inicio *</label>
            <input
              type="date"
              value={formData.data_inicio}
              onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
            />
            {errors.data_inicio && <p className="text-vermelho-erro text-sm mt-1">{errors.data_inicio}</p>}
          </div>
          
          <div className="flex gap-4 mt-6">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Criando...' : '✅ Criar Edicao'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

