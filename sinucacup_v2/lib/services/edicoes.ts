import { supabase } from '@/lib/supabase'
import { Edicao } from '@/types'

export async function getEdicoes() {
  const { data, error } = await supabase
    .from('edicoes')
    .select('*')
    .order('ano', { ascending: false })
    .order('numero', { ascending: false })
  
  if (error) throw error
  return data as Edicao[]
}

export async function getEdicao(id: string) {
  const { data, error } = await supabase
    .from('edicoes')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Edicao
}

export async function createEdicao(edicao: Omit<Edicao, 'id' | 'created_at' | 'updated_at' | 'status'>) {
  const { data, error } = await supabase
    .from('edicoes')
    .insert({
      ...edicao,
      status: 'inscricoes_abertas',
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Edicao
}

export async function updateEdicaoStatus(id: string, status: Edicao['status']) {
  const { data, error } = await supabase
    .from('edicoes')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Edicao
}

export async function getProximoNumeroEdicao(ano: number) {
  const { data, error } = await supabase
    .from('edicoes')
    .select('numero')
    .eq('ano', ano)
    .order('numero', { ascending: false })
    .limit(1)
  
  if (error) throw error
  return data.length > 0 ? data[0].numero + 1 : 1
}

