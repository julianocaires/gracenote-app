import { supabase } from '../../../shared/services/supabase'
import type { Sermon, SermonCreate, SermonUpdate, SermonLimitInfo } from '../../../shared/types'
export const sermonsService = {
  getAll: async (userId: string) => {
    const { data, error } = await supabase.from('sermons').select('*').eq('user_id', userId).eq('archived', false).order('created_at', { ascending: false })
    if (error) throw error; return data as unknown as Sermon[]
  },
  create: async (userId: string, s: SermonCreate) => {
    const { data: countData } = await supabase.from('sermons').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('archived', false)
    const count = countData?.length ?? 0
    const { data: premium } = await supabase.from('subscriptions').select('id').eq('user_id', userId).eq('is_active', true).maybeSingle()
    if (!premium && count >= 100) throw new Error('LIMIT_REACHED')
    const { data, error } = await supabase.from('sermons').insert({ user_id: userId, title: s.title, content: s.content, plain_text: s.plain_text, preacher: s.preacher ?? null, cover_id: s.cover_id ?? null }).select().single()
    if (error) throw error
    if (s.category_ids?.length) await supabase.from('sermon_categories').insert(s.category_ids.map((c) => ({ sermon_id: data.id, category_id: c })))
    if (s.tag_ids?.length) await supabase.from('sermon_tags').insert(s.tag_ids.map((t) => ({ sermon_id: data.id, tag_id: t })))
    return data as Sermon
  },
  update: async (id: string, u: SermonUpdate) => { const { data, error } = await supabase.from('sermons').update(u).eq('id', id).select().single(); if (error) throw error; return data as Sermon },
  getById: async (id: string) => { const { data, error } = await supabase.from('sermons').select('*').eq('id', id).single(); if (error) throw error; return data as Sermon },
  delete: async (id: string) => { const { error } = await supabase.from('sermons').delete().eq('id', id); if (error) throw error },
  getRecent: async (userId: string, limit = 5) => {
    const { data, error } = await supabase.from('sermons').select('*').eq('user_id', userId).eq('archived', false).order('created_at', { ascending: false }).limit(limit)
    if (error) throw error; return data as unknown as Sermon[]
  },
  getContinueReading: async (userId: string) => {
    const { data, error } = await supabase.from('sermons').select('*').eq('user_id', userId).eq('archived', false).order('updated_at', { ascending: false }).limit(1)
    if (error) throw error; return (data as unknown as Sermon[])[0] ?? null
  },
  getOnThisDay: async (userId: string) => {
    const now = new Date(); const month = now.getMonth() + 1; const day = now.getDate()
    const { data, error } = await supabase.from('sermons').select('*').eq('user_id', userId).eq('archived', false)
    if (error) throw error
    const sermons = data as unknown as Sermon[]
    return sermons.filter((s) => {
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
