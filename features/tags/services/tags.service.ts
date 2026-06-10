import { supabase } from '../../../shared/services/supabase'
import type { Tag } from '../../../shared/types'
export const tagsService = {
  getAll: async (userId: string) => { const { data, error } = await supabase.from('tags').select('*').eq('user_id', userId).order('name'); if (error) throw error; return data as Tag[] },
  create: async (userId: string, name: string) => { const { data, error } = await supabase.from('tags').insert({ user_id: userId, name }).select().single(); if (error) throw error; return data as Tag },
  update: async (id: string, name: string) => { const { data, error } = await supabase.from('tags').update({ name }).eq('id', id).select().single(); if (error) throw error; return data as Tag },
  delete: async (id: string) => { const { error } = await supabase.from('tags').delete().eq('id', id); if (error) throw error },
}
