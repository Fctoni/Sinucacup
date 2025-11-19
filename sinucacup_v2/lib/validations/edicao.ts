import { z } from 'zod'

export const edicaoSchema = z.object({
  nome: z.string()
    .min(5, 'Nome deve ter pelo menos 5 caracteres')
    .max(255, 'Nome muito longo'),
  numero: z.number()
    .int('Numero deve ser inteiro')
    .positive('Numero deve ser positivo'),
  ano: z.number()
    .int('Ano deve ser inteiro')
    .min(2020, 'Ano invalido')
    .max(2100, 'Ano invalido'),
  data_inicio: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Data invalida'),
})

export type EdicaoFormData = z.infer<typeof edicaoSchema>

