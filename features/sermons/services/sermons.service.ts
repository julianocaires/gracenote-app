import { supabase } from '../../../shared/services/supabase'
import { coversService } from '../../../features/covers/services/covers.service'
import type { Sermon, SermonCreate, SermonUpdate, SermonLimitInfo } from '../../../shared/types'

export const sermonsService = {
  getAll: async (userId: string) => {
    const { data, error } = await supabase.from('sermons').select(`*, cover:covers(id, url, is_premium)`).eq('user_id', userId).eq('archived', false).order('created_at', { ascending: false })
    if (error) throw error
    return coversService.ensureSignedUrls(data as unknown as Sermon[])
  },

  create: async (userId: string, s: SermonCreate) => {
    const { data: countData } = await supabase.from('sermons').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('archived', false)
    const count = countData?.length ?? 0
    const { data: premium } = await supabase.from('subscriptions').select('id').eq('user_id', userId).eq('is_active', true).maybeSingle()
    if (!premium && count >= 100) throw new Error('LIMIT_REACHED')
    const { data, error } = await supabase.from('sermons').insert({ user_id: userId, title: s.title, content: s.content, plain_text: s.plain_text, font: s.font ?? null, preacher: s.preacher ?? null, cover_id: s.cover_id ?? null }).select().single()
    if (error) throw error
    // Link categories
    if (s.category_ids?.length) {
      const catRows = s.category_ids.map((c) => ({ sermon_id: data.id, category_id: c }))
      console.warn('[sermonsService] Inserting categories:', JSON.stringify(catRows))
      const { error: catError } = await supabase.from('sermon_categories').insert(catRows)
      if (catError) {
        console.error('[sermonsService] Category insert FAILED:', catError.message, JSON.stringify(catError))
        throw new Error('Erro ao salvar categorias: ' + catError.message)
      }
      console.warn('[sermonsService] Categories inserted successfully')
    }
    // Link tags
    if (s.tag_ids?.length) {
      const tagRows = s.tag_ids.map((t) => ({ sermon_id: data.id, tag_id: t }))
      console.warn('[sermonsService] Inserting tags:', JSON.stringify(tagRows))
      const { error: tagError } = await supabase.from('sermon_tags').insert(tagRows)
      if (tagError) {
        console.error('[sermonsService] Tag insert FAILED:', tagError.message, JSON.stringify(tagError))
        throw new Error('Erro ao salvar tags: ' + tagError.message)
      }
      console.warn('[sermonsService] Tags inserted successfully')
    }
    return data as Sermon
  },

  update: async (id: string, u: SermonUpdate) => {
    // Separate sermon fields from junction fields (categories/tags are NOT columns on sermons table)
    const { category_ids, tag_ids, ...sermonFields } = u
    const { data, error } = await supabase.from('sermons').update(sermonFields).eq('id', id).select().single()
    if (error) throw error
    // Sync categories if provided
    if (category_ids !== undefined) {
      await supabase.from('sermon_categories').delete().eq('sermon_id', id)
      if (category_ids.length > 0) {
        const { error: catError } = await supabase.from('sermon_categories').insert(category_ids.map((c) => ({ sermon_id: id, category_id: c })))
        if (catError) throw catError
      }
    }
    // Sync tags if provided
    if (tag_ids !== undefined) {
      await supabase.from('sermon_tags').delete().eq('sermon_id', id)
      if (tag_ids.length > 0) {
        const { error: tagError } = await supabase.from('sermon_tags').insert(tag_ids.map((t) => ({ sermon_id: id, tag_id: t })))
        if (tagError) throw tagError
      }
    }
    return data as Sermon
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('sermons')
      .select(`
        *,
        categories:sermon_categories(category:categories(id, name, color)),
        tags:sermon_tags(tag:tags(id, name)),
        cover:covers(id, url, is_premium)
      `)
      .eq('id', id).single()
    if (error) throw error
    const [signed] = await coversService.ensureSignedUrls([data as unknown as Sermon])
    return signed
  },

  delete: async (id: string) => { const { error } = await supabase.from('sermons').delete().eq('id', id); if (error) throw error },

  getRecent: async (userId: string, limit = 5) => {
    const { data, error } = await supabase.from('sermons').select(`*, cover:covers(id, url, is_premium)`).eq('user_id', userId).eq('archived', false).order('created_at', { ascending: false }).limit(limit)
    if (error) throw error
    return coversService.ensureSignedUrls(data as unknown as Sermon[])
  },

  getContinueReading: async (userId: string) => {
    const { data, error } = await supabase.from('sermons').select(`*, cover:covers(id, url, is_premium)`).eq('user_id', userId).eq('archived', false).order('updated_at', { ascending: false }).limit(1)
    if (error) throw error
    const [signed] = await coversService.ensureSignedUrls(data as unknown as Sermon[])
    return signed ?? null
  },

  getOnThisDay: async (userId: string) => {
    const now = new Date(); const month = now.getMonth() + 1; const day = now.getDate()
    const { data, error } = await supabase.from('sermons').select(`*, cover:covers(id, url, is_premium)`).eq('user_id', userId).eq('archived', false)
    if (error) throw error
    const signed = await coversService.ensureSignedUrls(data as unknown as Sermon[])
    return signed.filter((s) => {
      const d = new Date(s.created_at)
      return d.getMonth() + 1 === month && d.getDate() === day && d.getFullYear() < now.getFullYear()
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  markAsOpened: async (id: string) => {
    const { error } = await supabase.from('sermons').update({ last_opened_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
  },

  getLimitInfo: async (userId: string): Promise<SermonLimitInfo> => {
    const { data: active } = await supabase.from('sermons').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('archived', false)
    const { data: archived } = await supabase.from('sermons').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('archived', true)
    const { data: premium } = await supabase.from('subscriptions').select('id').eq('user_id', userId).eq('is_active', true).maybeSingle()
    return { active: active?.length ?? 0, archived: archived?.length ?? 0, total: (active?.length ?? 0) + (archived?.length ?? 0), canCreate: !!premium || (active?.length ?? 0) < 100 }
  },
}
