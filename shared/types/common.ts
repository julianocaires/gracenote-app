export interface SermonCreate { title: string; content: Record<string, unknown>; plain_text: string; preacher?: string | null; cover_id?: string | null; category_ids?: string[]; tag_ids?: string[] }
export interface SermonUpdate { title?: string; content?: Record<string, unknown>; plain_text?: string; preacher?: string | null; cover_id?: string | null; is_favorite?: boolean; last_opened_at?: string | null; category_ids?: string[]; tag_ids?: string[] }
export interface CategoryCreate { name: string; color?: string | null }
export interface TagCreate { name: string }
export interface CoverCreate { url: string; is_premium?: boolean }
export interface ProfileUpdate { name?: string; avatar_url?: string | null; theme?: 'light' | 'dark' | 'system' }
export type SermonLimitInfo = { active: number; archived: number; total: number; canCreate: boolean }
