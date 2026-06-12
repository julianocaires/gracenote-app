export interface SearchFilters {
  query?: string
  categoryIds?: string[]
  tagIds?: string[]
  preacher?: string
  isFavorite?: boolean
  dateFrom?: string | null
  dateTo?: string | null
  sortBy?: 'created_at' | 'title' | 'updated_at' | 'last_opened_at'
  sortOrder?: 'asc' | 'desc'
}

export interface ActiveFilter {
  type: 'category' | 'tag' | 'preacher' | 'date' | 'query' | 'favorite'
  label: string
  value: string
}

export const SORT_OPTIONS = [
  { label: 'Mais recentes', sortBy: 'created_at' as const, sortOrder: 'desc' as const },
  { label: 'Mais antigas', sortBy: 'created_at' as const, sortOrder: 'asc' as const },
  { label: 'A - Z', sortBy: 'title' as const, sortOrder: 'asc' as const },
  { label: 'Z - A', sortBy: 'title' as const, sortOrder: 'desc' as const },
  { label: 'Última leitura', sortBy: 'last_opened_at' as const, sortOrder: 'desc' as const },
]
