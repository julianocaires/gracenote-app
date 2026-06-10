import { supabase } from '../../../shared/services/supabase'
import type { Category } from '../../../shared/types'
export const categoriesService = {
  getAll: async (userId: string) => { const { data, error } = await supabase.from('categories').select('*').eq('user_id', userId).order('name'); if (error) throw error; return data as Category[] },
  create: async (userId: string, name: string, color?: string) => { const { data, error } = await supabase.from('categories').insert({ user_id: userId, name, color }).select().single(); if (error) throw error; return data as Category },
  update: async (id: string, updates: { name?: string; color?: string | null }) => { const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single(); if (error) throw error; return data as Category },
  delete: async (id: string) => { const { error } = await supabase.from('categories').delete().eq('id', id); if (error) throw error },
}
