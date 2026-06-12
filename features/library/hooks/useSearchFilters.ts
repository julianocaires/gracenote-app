import { useState, useCallback, useMemo } from 'react'
import type { SearchFilters, ActiveFilter } from '../types'

interface UseSearchFiltersReturn {
  filters: SearchFilters
  setQuery: (query: string) => void
  toggleCategory: (id: string, name: string) => void
  toggleTag: (id: string, name: string) => void
  toggleFavorite: () => void
  setPreacher: (preacher: string | undefined) => void
  setDateRange: (from: string | null, to: string | null) => void
  setSort: (sortBy: SearchFilters['sortBy'], sortOrder: SearchFilters['sortOrder']) => void
  clearFilters: () => void
  clearFilter: (type: ActiveFilter['type'], value: string) => void
  activeFilters: ActiveFilter[]
  activeFilterCount: number
}

export function useSearchFilters(): UseSearchFiltersReturn {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [tagNames, setTagNames] = useState<Record<string, string>>({})

  const setQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, query: query || undefined }))
  }, [])

  const toggleCategory = useCallback((id: string, name: string) => {
    setCategoryNames((prev) => ({ ...prev, [id]: name }))
    setFilters((prev) => {
      const current = prev.categoryIds ?? []
      const next = current.includes(id)
        ? current.filter((c) => c !== id)
        : [...current, id]
      return { ...prev, categoryIds: next.length > 0 ? next : undefined }
    })
  }, [])

  const toggleTag = useCallback((id: string, name: string) => {
    setTagNames((prev) => ({ ...prev, [id]: name }))
    setFilters((prev) => {
      const current = prev.tagIds ?? []
      const next = current.includes(id)
        ? current.filter((t) => t !== id)
        : [...current, id]
      return { ...prev, tagIds: next.length > 0 ? next : undefined }
    })
  }, [])

  const toggleFavorite = useCallback(() => {
    setFilters((prev) => ({ ...prev, isFavorite: !prev.isFavorite }))
  }, [])

  const setPreacher = useCallback((preacher: string | undefined) => {
    setFilters((prev) => ({ ...prev, preacher }))
  }, [])

  const setDateRange = useCallback((from: string | null, to: string | null) => {
    setFilters((prev) => ({
      ...prev,
      dateFrom: from || undefined,
      dateTo: to || undefined,
    }))
  }, [])

  const setSort = useCallback(
    (sortBy: SearchFilters['sortBy'], sortOrder: SearchFilters['sortOrder']) => {
      setFilters((prev) => ({ ...prev, sortBy, sortOrder }))
    },
    [],
  )

  const clearFilters = useCallback(() => {
    setFilters({})
    setCategoryNames({})
    setTagNames({})
  }, [])

  const clearFilter = useCallback((type: ActiveFilter['type'], value: string) => {
    switch (type) {
      case 'query':
        setFilters((prev) => ({ ...prev, query: undefined }))
        break
      case 'category':
        setFilters((prev) => ({
          ...prev,
          categoryIds: prev.categoryIds?.filter((id) => id !== value),
        }))
        setCategoryNames((prev) => {
          const next = { ...prev }
          delete next[value]
          return next
        })
        break
      case 'tag':
        setFilters((prev) => ({
          ...prev,
          tagIds: prev.tagIds?.filter((id) => id !== value),
        }))
        setTagNames((prev) => {
          const next = { ...prev }
          delete next[value]
          return next
        })
        break
      case 'favorite':
        setFilters((prev) => ({ ...prev, isFavorite: undefined }))
        break
      case 'preacher':
        setFilters((prev) => ({ ...prev, preacher: undefined }))
        break
      case 'date':
        setFilters((prev) => ({ ...prev, dateFrom: undefined, dateTo: undefined }))
        break
    }
  }, [])

  const activeFilters = useMemo((): ActiveFilter[] => {
    const result: ActiveFilter[] = []
    if (filters.query) {
      result.push({ type: 'query', label: `"${filters.query}"`, value: filters.query })
    }
    if (filters.categoryIds?.length) {
      for (const id of filters.categoryIds) {
        result.push({ type: 'category', label: categoryNames[id] ?? id, value: id })
      }
    }
    if (filters.tagIds?.length) {
      for (const id of filters.tagIds) {
        result.push({ type: 'tag', label: tagNames[id] ?? id, value: id })
      }
    }
    if (filters.isFavorite) {
      result.push({ type: 'favorite', label: 'Favoritos', value: 'favorite' })
    }
    if (filters.preacher) {
      result.push({ type: 'preacher', label: filters.preacher, value: filters.preacher })
    }
    if (filters.dateFrom || filters.dateTo) {
      result.push({ type: 'date', label: 'Período', value: 'date' })
    }
    return result
  }, [filters, categoryNames, tagNames])

  const activeFilterCount = activeFilters.length

  return {
    filters,
    setQuery,
    toggleCategory,
    toggleTag,
    toggleFavorite,
    setPreacher,
    setDateRange,
    setSort,
    clearFilters,
    clearFilter,
    activeFilters,
    activeFilterCount,
  }
}
