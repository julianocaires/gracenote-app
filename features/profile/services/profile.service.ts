import { supabase } from '../../../shared/services/supabase'

function getExt(uri: string): string {
  const parts = uri.split('.')
  const last = parts[parts.length - 1]?.toLowerCase()
  if (last === 'png' || last === 'jpg' || last === 'jpeg' || last === 'webp') return last
  return 'jpg' // default for camera/gallery content URIs
}

function extractPath(url: string): string | null {
  const match = url.match(/\/avatars\/(.+?)(?:\?|$)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function signAvatarUrl(url: string): Promise<string> {
  if (!url || url.includes('/object/sign/')) return url
  const path = extractPath(url)
  if (path) {
    const { data } = await supabase.storage.from('avatars').createSignedUrl(path, 31536000) // 1 year
    if (data?.signedUrl) return data.signedUrl
  }
  return url
}

export const profileService = {
  getProfile: async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
    if (error) throw error
    // Convert stored public URL to signed URL for React Native compatibility
    if (data?.avatar_url && !data.avatar_url.includes('/object/sign/')) {
      const signed = await signAvatarUrl(data.avatar_url)
      return { ...data, avatar_url: signed }
    }
    return data
  },

  updateProfile: async (userId: string, updates: { name?: string; avatar_url?: string | null; theme?: string }) => {
    const { data, error } = await supabase.from('profiles').update(updates).eq('user_id', userId).select().single()
    if (error) throw error
    return data
  },

  uploadAvatar: async (userId: string, uri: string) => {
    const ext = getExt(uri)
    const filePath = `${userId}/avatar.${ext}`
    const formData = new FormData()
    formData.append('file', { uri, name: `avatar.${ext}`, type: `image/${ext === 'png' ? 'png' : 'jpeg'}` } as any)

    console.warn('[profileService] Uploading avatar:', filePath)
    const { error: ue } = await supabase.storage.from('avatars').upload(filePath, formData, { upsert: true })
    if (ue) {
      console.error('[profileService] Avatar upload failed:', ue.message)
      throw ue
    }

    // Use signed URL — public URLs don't work with React Native Image on private buckets
    const { data: signedData, error: signedError } = await supabase.storage
      .from('avatars')
      .createSignedUrl(filePath, 31536000) // 1 year expiry

    if (signedError) {
      console.error('[profileService] Signed URL creation failed:', signedError.message)
      throw signedError
    }

    console.warn('[profileService] Signed URL:', signedData.signedUrl)
    return signedData.signedUrl
  },

  /** Convert a stored avatar URL to a signed URL */
  ensureSignedUrl: signAvatarUrl,
}
