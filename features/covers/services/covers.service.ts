import { supabase } from '../../../shared/services/supabase'
import type { Cover, Sermon } from '../../../shared/types'

function getExt(uri: string): string {
  // Handle content:// URIs (Android) which have no file extension
  const parts = uri.split('.')
  const last = parts[parts.length - 1]?.toLowerCase()
  if (last === 'png' || last === 'jpg' || last === 'jpeg' || last === 'webp') return last
  return 'jpg' // default for camera/gallery content URIs
}

// Extract file path from a public or signed Supabase storage URL
function extractPath(url: string): string | null {
  // Public URL: .../object/public/covers/<path>
  // Signed URL: .../object/sign/covers/<path>?token=...
  const match = url.match(/\/covers\/(.+?)(?:\?|$)/)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Ensure a cover URL is a signed URL that works with React Native's Image.
 * Public URLs from private buckets fail on RN Android — signed URLs include auth token.
 */
async function signCoverUrl(cover: { url: string }): Promise<string> {
  // Already a signed URL
  if (cover.url.includes('/object/sign/')) return cover.url

  // Try to extract the file path from the public URL
  const path = extractPath(cover.url)
  if (path) {
    const { data } = await supabase.storage.from('covers').createSignedUrl(path, 31536000) // 1 year
    if (data?.signedUrl) return data.signedUrl
  }

  // Fallback: return as-is (won't render, but better than crashing)
  return cover.url
}

export const coversService = {
  getSystemCovers: async () => {
    const { data, error } = await supabase.from('covers').select('*').is('user_id', null).order('is_premium', { ascending: true })
    if (error) throw error
    return data as Cover[]
  },

  getUserCovers: async (userId: string) => {
    const { data, error } = await supabase.from('covers').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return data as Cover[]
  },

  uploadFromDevice: async (userId: string, uri: string): Promise<Cover> => {
    const ext = getExt(uri)
    const fileName = `${userId}/${Date.now()}.${ext}`

    const formData = new FormData()
    formData.append('file', {
      uri,
      name: `cover.${ext}`,
      type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
    } as any)

    console.warn('[coversService] Uploading to covers bucket:', fileName)
    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(fileName, formData, { upsert: false })

    if (uploadError) {
      console.error('[coversService] Storage upload failed:', uploadError.message, JSON.stringify(uploadError))
      throw new Error(`Falha no upload: ${uploadError.message}`)
    }

    // Use signed URL instead of public URL — required for private buckets on React Native
    const { data: signedData, error: signedError } = await supabase.storage
      .from('covers')
      .createSignedUrl(fileName, 31536000) // 1 year expiry

    if (signedError) {
      console.error('[coversService] Signed URL creation failed:', signedError.message)
      throw new Error(`Falha ao gerar URL: ${signedError.message}`)
    }

    console.warn('[coversService] Signed URL:', signedData.signedUrl)

    const { data, error: insertError } = await supabase
      .from('covers')
      .insert({ user_id: userId, url: signedData.signedUrl, is_builtin: false })
      .select()
      .single()

    if (insertError) {
      console.error('[coversService] DB insert failed:', insertError.message, JSON.stringify(insertError))
      throw new Error(`Falha ao registrar capa: ${insertError.message}`)
    }

    return data as Cover
  },

  /**
   * Converts cover URLs in sermon results to signed URLs.
   * Handles existing covers that were stored with public URLs.
   */
  ensureSignedUrls: async (items: Sermon[]): Promise<Sermon[]> => {
    const results = await Promise.allSettled(
      items.map(async (item) => {
        if (item.cover?.url && !item.cover.url.includes('/object/sign/')) {
          const signedUrl = await signCoverUrl(item.cover)
          return { ...item, cover: { ...item.cover, url: signedUrl } }
        }
        return item
      }),
    )
    return results.map((r, i) => (r.status === 'fulfilled' ? r.value : items[i]))
  },
}
