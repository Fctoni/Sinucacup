'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { jogadorSchema, JogadorFormData } from '@/lib/validations/jogador'
import { createJogador } from '@/lib/services/jogadores'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function NovoJogadorModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<JogadorFormData>({
    nome: '',
    setor: '',
    foto_url: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  
  if (!isOpen) return null
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    
    try {
      // Validar com Zod
      const validated = jogadorSchema.parse(formData)
      
      // Criar jogador (converter undefined para null)
      await createJogador({
        nome: validated.nome,
        setor: validated.setor,
        foto_url: validated.foto_url || null
      })
      
      // Resetar form
      setFormData({ nome: '', setor: '', foto_url: '' })
      onSuccess()
      onClose()
    } catch (error: any) {
      if (error.errors) {
        // Erros de validacao Zod
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
      } else {
        // Verificar se é erro de duplicação
        if (error.code === '23505' || error.message?.includes('jogadores_nome_unique')) {
          toast.error('❌ Já existe um jogador cadastrado com este nome!')
        } else {
          toast.error('Erro ao cadastrar jogador: ' + error.message)
        }
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-cinza-card p-8 rounded-xl border-2 border-amarelo-destaque max-w-md w-full mx-4">
        <h2 className="text-2xl mb-6">👥 Novo Jogador</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nome *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
              placeholder="Ex: João Silva"
            />
            {errors.nome && <p className="text-vermelho-erro text-sm mt-1">{errors.nome}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Setor *</label>
            <input
              type="text"
              value={formData.setor}
              onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
              placeholder="Ex: TI, RH, Vendas"
            />
            {errors.setor && <p className="text-vermelho-erro text-sm mt-1">{errors.setor}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">URL da Foto (opcional)</label>
            <input
              type="text"
              value={formData.foto_url}
              onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
              className="w-full bg-cinza-medio text-texto-principal px-4 py-2 rounded-lg border-2 border-transparent focus:border-verde-medio outline-none"
              placeholder="https://exemplo.com/foto.jpg"
            />
            {errors.foto_url && <p className="text-vermelho-erro text-sm mt-1">{errors.foto_url}</p>}
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Salvando...' : '✅ Salvar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

