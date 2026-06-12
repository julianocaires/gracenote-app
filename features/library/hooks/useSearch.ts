import { useQuery } from '@tanstack/react-query'
import { libraryService } from '../services/library.service'
import { localStorageService } from '../../sermons/services/localStorage.service'
import { useAuthStore } from '../../auth/store/auth.store'
import type { SearchFilters } from '../types'
import type { Sermon } from '../../../shared/types'

function getUserId() {
  return useAuthStore((s) => s.session?.user?.id)
}

export function useSearch(filters: SearchFilters) {
  const userId = getUserId()
  const online = !!userId

  // Enable when no query (show with filters only) or query has >= 2 chars
  const queryEnabled = !filters.query || filters.query.length >= 2

  return useQuery<Sermon[]>({
    queryKey: ['search', userId ?? 'offline', filters],
    queryFn: async () => {
      if (online) {
        return libraryService.search(userId!, filters)
      }
      // Offline: cast LocalSermon[] to Sermon[] (partial but sufficient)
      return (await localStorageService.search(filters)) as unknown as Sermon[]
    },
    enabled: queryEnabled,
  })
}

export function useDistinctPreachers() {
  const userId = getUserId()
  const online = !!userId

  return useQuery<string[]>({
    queryKey: ['preachers', userId ?? 'offline'],
    queryFn: async () => {
      if (online) {
        return libraryService.getDistinctPreachers(userId!)
      }
      return localStorageService.getDistinctPreachers()
    },
    enabled: true,
  })
}

export function useFavorites() {
  const userId = getUserId()
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: () => libraryService.getFavorites(userId!),
    enabled: !!userId,
  })
}
