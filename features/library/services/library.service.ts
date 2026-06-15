import { supabase } from '../../../shared/services/supabase'
import { coversService } from '../../../features/covers/services/covers.service'
import type { Sermon } from '../../../shared/types'
import type { SearchFilters } from '../types'

export const libraryService = {
  search: async (userId: string, filters: SearchFilters): Promise<Sermon[]> => {
    let query = supabase
      .from('sermons')
      .select(`
        *,
        categories:sermon_categories(category:categories(id, name, color)),
        tags:sermon_tags(tag:tags(id, name)),
        cover:covers(id, url, is_premium)
      `)
      .eq('user_id', userId)
      .eq('archived', false)

    // Text search — using ILIKE (full-text search via tsvector requires migration 003)
    if (filters.query && filters.query.length >= 2) {
      query = query.or(
        `title.ilike.%${filters.query}%,plain_text.ilike.%${filters.query}%`
      )
    }

    // Favorite filter
    if (filters.isFavorite) {
      query = query.eq('is_favorite', true)
    }

    // Preacher filter
    if (filters.preacher) {
      query = query.eq('preacher', filters.preacher)
    }

    // Date range filter
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    // Category filter — two-step: find sermon_ids matching ALL selected categories
    if (filters.categoryIds?.length) {
      const { data: catData, error: catError } = await supabase
        .from('sermon_categories')
        .select('sermon_id, category_id')
        .in('category_id', filters.categoryIds)

      if (catError) throw catError

      const counts = new Map<string, number>()
      for (const row of catData) {
        counts.set(row.sermon_id, (counts.get(row.sermon_id) ?? 0) + 1)
      }
      const matchedIds = Array.from(counts.entries())
        .filter(([_, count]) => count === filters.categoryIds!.length)
        .map(([id]) => id)

      if (matchedIds.length === 0) return []
      query = query.in('id', matchedIds)
    }

    // Tag filter — same approach as categories
    if (filters.tagIds?.length) {
      const { data: tagData, error: tagError } = await supabase
        .from('sermon_tags')
        .select('sermon_id, tag_id')
        .in('tag_id', filters.tagIds)

      if (tagError) throw tagError

      const counts = new Map<string, number>()
      for (const row of tagData) {
        counts.set(row.sermon_id, (counts.get(row.sermon_id) ?? 0) + 1)
      }
      const matchedIds = Array.from(counts.entries())
        .filter(([_, count]) => count === filters.tagIds!.length)
        .map(([id]) => id)

      if (matchedIds.length === 0) return []
      query = query.in('id', matchedIds)
    }

    // Sorting
    const sortBy = filters.sortBy ?? 'created_at'
    const sortOrder = filters.sortOrder ?? 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const { data, error } = await query
    if (error) throw error
    return coversService.ensureSignedUrls(data as unknown as Sermon[])
  },

  getFavorites: async (userId: string) => {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', false)
      .eq('is_favorite', true)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data as Sermon[]
  },

  getDistinctPreachers: async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('sermons')
      .select('preacher')
      .eq('user_id', userId)
      .eq('archived', false)
      .not('preacher', 'is', null)
      .order('preacher')

    if (error) throw error
    return [...new Set(data.map((r: { preacher: string }) => r.preacher))]
  },
}
