import { z } from 'zod'

export const jogadorSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome muito longo'),
  setor: z.string()
    .min(2, 'Setor deve ter pelo menos 2 caracteres')
    .max(255, 'Setor muito longo'),
  foto_url: z.string()
    .url('URL invalida')
    .optional()
    .or(z.literal('')),
})

export type JogadorFormData = z.infer<typeof jogadorSchema>

