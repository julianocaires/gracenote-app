import { useQuery } from '@tanstack/react-query'
import { libraryService } from '../services/library.service'
import { useAuthStore } from '../../auth/store/auth.store'
function u() { return useAuthStore((s) => s.session?.user?.id) }
export function useSearch(query: string) { const userId = u(); return useQuery({ queryKey: ['search', userId, query], queryFn: () => libraryService.search(userId!, query), enabled: !!userId && query.length >= 2 }) }
export function useFavorites() { const userId = u(); return useQuery({ queryKey: ['favorites', userId], queryFn: () => libraryService.getFavorites(userId!), enabled: !!userId }) }
