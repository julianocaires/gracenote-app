import AsyncStorage from '@react-native-async-storage/async-storage'
import type { SearchFilters } from '../../library/types'

const STORAGE_KEY = '@gracenote_local_sermons'

export interface LocalSermon {
  id: string
  title: string
  content: string  // HTML string (new format) or JSON stringified (old format)
  plain_text: string
  preacher: string | null
  cover_id: string | null
  is_favorite: boolean
  font: string
  textColor: string
  created_at: string
  updated_at: string
}

function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

async function getAllRaw(): Promise<LocalSermon[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

async function saveAll(items: LocalSermon[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const localStorageService = {
  getAll: async (): Promise<LocalSermon[]> => getAllRaw(),

  getById: async (id: string): Promise<LocalSermon | null> => {
    const items = await getAllRaw()
    return items.find((i) => i.id === id) ?? null
  },

  create: async (data: { title: string; content: string; plain_text: string; font?: string; preacher?: string | null; cover_id?: string | null; textColor?: string }): Promise<LocalSermon> => {
    const items = await getAllRaw()
    const now = new Date().toISOString()
    const sermon: LocalSermon = {
      id: generateId(),
      title: data.title,
      content: data.content,
      plain_text: data.plain_text,
      preacher: data.preacher ?? null,
      cover_id: data.cover_id ?? null,
      is_favorite: false,
      font: data.font ?? 'classica',
      textColor: data.textColor ?? '#2C2420',
      created_at: now,
      updated_at: now,
    }
    items.unshift(sermon)
    await saveAll(items)
    return sermon
  },

  update: async (id: string, data: { title?: string; content?: string; plain_text?: string; font?: string; preacher?: string | null; cover_id?: string | null; is_favorite?: boolean; textColor?: string }): Promise<LocalSermon> => {
    const items = await getAllRaw()
    const idx = items.findIndex((i) => i.id === id)
    if (idx === -1) throw new Error('Ministração não encontrada')
    items[idx] = { ...items[idx], ...data, updated_at: new Date().toISOString() }
    await saveAll(items)
    return items[idx]
  },

  delete: async (id: string): Promise<void> => {
    const items = await getAllRaw()
    await saveAll(items.filter((i) => i.id !== id))
  },

  getStats: async (): Promise<{ sermonCount: number }> => {
    const items = await getAllRaw()
    return { sermonCount: items.length }
  },

  getRecent: async (limit = 5): Promise<LocalSermon[]> => {
    const items = await getAllRaw()
    return items.slice(0, limit)
  },

  getOnThisDay: async (): Promise<LocalSermon[]> => {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const items = await getAllRaw()
    return items.filter((s) => {
      const d = new Date(s.created_at)
      return d.getMonth() + 1 === month && d.getDate() === day && d.getFullYear() < now.getFullYear()
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  getAllCount: async (): Promise<number> => {
    const items = await getAllRaw()
    return items.length
  },

  search: async (filters: SearchFilters): Promise<LocalSermon[]> => {
    const items = await getAllRaw()
    const q = filters.query?.toLowerCase()

    const filtered = items.filter((s) => {
      // Text search: case-insensitive includes
      if (q && q.length >= 2) {
        if (!s.title.toLowerCase().includes(q) &&
            !s.plain_text.toLowerCase().includes(q)) {
          return false
        }
      }
      // Preacher filter
      if (filters.preacher && s.preacher !== filters.preacher) {
        return false
      }
      // Favorite filter
      if (filters.isFavorite && !s.is_favorite) {
        return false
      }
      // Date range filter
      if (filters.dateFrom && new Date(s.created_at) < new Date(filters.dateFrom)) {
        return false
      }
      if (filters.dateTo && new Date(s.created_at) > new Date(filters.dateTo)) {
        return false
      }
      return true
    })

    // Sort
    const sortBy = filters.sortBy ?? 'created_at'
    const sortOrder = filters.sortOrder ?? 'desc'
    const dir = sortOrder === 'asc' ? 1 : -1

    filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return dir * a.title.localeCompare(b.title)
      }
      const aDate = new Date(
        sortBy === 'updated_at' ? a.updated_at : a.created_at
      ).getTime()
      const bDate = new Date(
        sortBy === 'updated_at' ? b.updated_at : b.created_at
      ).getTime()
      return dir * (aDate - bDate)
    })

    return filtered
  },

  getDistinctPreachers: async (): Promise<string[]> => {
    const items = await getAllRaw()
    return [...new Set(items.map((s) => s.preacher).filter(Boolean) as string[])]
  },

  migrateToSupabase: async (userId: string): Promise<{ sermons: number }> => {
    const items = await getAllRaw()
    const { sermonsService } = await import('./sermons.service')
    for (const item of items) {
      try {
        await sermonsService.create(userId, {
          title: item.title,
          content: item.content || { type: 'doc', content: [], font: item.font, textColor: item.textColor },
          plain_text: item.plain_text,
          preacher: item.preacher,
          cover_id: item.cover_id,
        })
      } catch { /* skip duplicates */ }
    }
    await AsyncStorage.removeItem(STORAGE_KEY)
    return { sermons: items.length }
  },
}
