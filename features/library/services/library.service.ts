import { supabase } from '../../../shared/services/supabase'
import type { Sermon } from '../../../shared/types'
export const libraryService = {
  search: async (userId: string, query: string) => {
    const { data, error } = await supabase.from('sermons').select('*').eq('user_id', userId).eq('archived', false).or(`title.ilike.%${query}%,plain_text.ilike.%${query}%`).order('created_at', { ascending: false })
    if (error) throw error; return data as Sermon[]
  },
  getFavorites: async (userId: string) => {
    const { data, error } = await supabase.from('sermons').select('*').eq('user_id', userId).eq('archived', false).eq('is_favorite', true).order('updated_at', { ascending: false })
    if (error) throw error; return data as Sermon[]
  },
}
