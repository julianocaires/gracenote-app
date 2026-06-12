import { supabase } from '../../../shared/services/supabase'
export const profileService = {
  getProfile: async (userId: string) => { const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single(); if (error) throw error; return data },
  updateProfile: async (userId: string, updates: { name?: string; avatar_url?: string | null; theme?: string }) => { const { data, error } = await supabase.from('profiles').update(updates).eq('user_id', userId).select().single(); if (error) throw error; return data },
  uploadAvatar: async (userId: string, uri: string) => {
    const ext = uri.split('.').pop() ?? 'jpg'
    const filePath = `${userId}/avatar.${ext}`
    const formData = new FormData()
    formData.append('file', { uri, name: `avatar.${ext}`, type: `image/${ext === 'png' ? 'png' : 'jpeg'}` } as any)
    const { error: ue } = await supabase.storage.from('avatars').upload(filePath, formData, { upsert: true })
    if (ue) throw ue
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
    return urlData.publicUrl
  },
}
