import { supabase } from '../../../shared/services/supabase'
import type { Cover } from '../../../shared/types'
export const coversService = {
  getSystemCovers: async () => { const { data, error } = await supabase.from('covers').select('*').is('user_id', null).order('is_premium', { ascending: true }); if (error) throw error; return data as Cover[] },
  getUserCovers: async (userId: string) => { const { data, error } = await supabase.from('covers').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return data as Cover[] },
  uploadFromDevice: async (userId: string, uri: string) => {
    const blob = await (await fetch(uri)).blob()
    const ext = uri.split('.').pop() ?? 'jpg'; const fileName = `${userId}/${Date.now()}.${ext}`
    const { error: ue } = await supabase.storage.from('covers').upload(fileName, blob, { upsert: false })
    if (ue) throw ue
    const { data: urlData } = supabase.storage.from('covers').getPublicUrl(fileName)
    const { data, error } = await supabase.from('covers').insert({ user_id: userId, url: urlData.publicUrl, is_builtin: false }).select().single()
    if (error) throw error; return data as Cover
  },
}
