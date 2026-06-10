import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = '@gracenote_local_sermons'

export interface LocalSermon {
  id: string
  title: string
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

  create: async (data: { title: string; plain_text: string; preacher?: string | null; cover_id?: string | null; font?: string; textColor?: string }): Promise<LocalSermon> => {
    const items = await getAllRaw()
    const now = new Date().toISOString()
    const sermon: LocalSermon = {
      id: generateId(),
      title: data.title,
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

  update: async (id: string, data: { title?: string; plain_text?: string; preacher?: string | null; cover_id?: string | null; is_favorite?: boolean; font?: string; textColor?: string }): Promise<LocalSermon> => {
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

  migrateToSupabase: async (userId: string): Promise<{ sermons: number }> => {
    const items = await getAllRaw()
      const { sermonsService } = await import('./sermons.service')
    for (const item of items) {
      try {
        await sermonsService.create(userId, {
          title: item.title,
          content: { type: 'doc', content: [], font: item.font, textColor: item.textColor },
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
