import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sermonsService } from '../services/sermons.service'
import { localStorageService } from '../services/localStorage.service'
import { useAuthStore } from '../../auth/store/auth.store'
import { profileService } from '../../profile/services/profile.service'
import type { SermonCreate, SermonUpdate, SermonLimitInfo } from '../../../shared/types'
import type { LocalSermon } from '../services/localStorage.service'

function userId() { return useAuthStore((s) => s.session?.user?.id) }
function isOnline() { return !!useAuthStore((s) => s.session?.user?.id) }

export function useSermons() {
  const u = userId()
  const online = isOnline()
  return useQuery({
    queryKey: ['sermons', u],
    queryFn: online
      ? () => sermonsService.getAll(u!)
      : () => localStorageService.getAll() as any,
    enabled: true,
  })
}

export function useSermonDetail(id: string) {
  const online = isOnline()
  return useQuery({
    queryKey: ['sermon', id],
    queryFn: online
      ? () => sermonsService.getById(id)
      : () => localStorageService.getById(id) as any,
    enabled: !!id,
  })
}

export function useCreateSermon() {
  const q = useQueryClient()
  const u = userId()
  const online = isOnline()
  return useMutation({
    mutationFn: async (d: SermonCreate) => {
      if (online) return sermonsService.create(u!, d)
      return localStorageService.create({
        title: d.title,
        plain_text: d.plain_text,
        preacher: d.preacher,
        cover_id: d.cover_id,
        font: (d.content as any)?.font,
        textColor: (d.content as any)?.textColor,
      }) as any
    },
    onSuccess: () => { q.invalidateQueries({ queryKey: ['sermons'] }); q.invalidateQueries({ queryKey: ['sermon-limit'] }) },
  })
}

export function useUpdateSermon() {
  const q = useQueryClient()
  const online = isOnline()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SermonUpdate }) => {
      if (online) return sermonsService.update(id, data)
      return localStorageService.update(id, {
        title: data.title as string,
        plain_text: data.plain_text as string,
        preacher: data.preacher as string | null,
        cover_id: data.cover_id as string | null,
        is_favorite: data.is_favorite as boolean,
        font: (data.content as any)?.font,
        textColor: (data.content as any)?.textColor,
      }) as any
    },
    onSuccess: () => { q.invalidateQueries({ queryKey: ['sermons'] }); q.invalidateQueries({ queryKey: ['sermon'] }) },
  })
}

export function useDeleteSermon() {
  const q = useQueryClient()
  const online = isOnline()
  return useMutation({
    mutationFn: async (id: string) => {
      if (online) return sermonsService.delete(id)
      return localStorageService.delete(id)
    },
    onSuccess: () => { q.invalidateQueries({ queryKey: ['sermons'] }); q.invalidateQueries({ queryKey: ['sermon-limit'] }) },
  })
}

export function useSermonLimit(): { data: SermonLimitInfo; isLoading: boolean } {
  const u = userId()
  const online = isOnline()
  const { data, isLoading } = useQuery({
    queryKey: ['sermon-limit', u],
    queryFn: online ? () => sermonsService.getLimitInfo(u!) : async () => {
      const count = await localStorageService.getAllCount()
      return { active: count, archived: 0, total: count, canCreate: true }
    },
    enabled: true,
  })
  return { data: data ?? { active: 0, archived: 0, total: 0, canCreate: true }, isLoading }
}

export function useDashboardData() {
  const u = userId()
  const online = isOnline()
  const recent = useQuery({
    queryKey: ['sermons', u, 'recent'],
    queryFn: online ? () => sermonsService.getRecent(u!) : () => localStorageService.getRecent() as any,
    enabled: true,
  })
  const continueReading = useQuery({
    queryKey: ['sermons', u, 'continue-reading'],
    queryFn: online ? () => sermonsService.getContinueReading(u!) : async () => {
      const all = await localStorageService.getAll()
      return (all.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0] ?? null) as any
    },
    enabled: true,
  })
  const onThisDay = useQuery({
    queryKey: ['sermons', u, 'on-this-day'],
    queryFn: online ? () => sermonsService.getOnThisDay(u!) : () => localStorageService.getOnThisDay() as any,
    enabled: true,
  })
  const allSermons = useQuery({
    queryKey: ['sermons', u, 'all'],
    queryFn: online ? () => sermonsService.getAll(u!) : () => localStorageService.getAll() as any,
    enabled: true,
  })
  const profileQuery = useQuery({
    queryKey: ['profile', u],
    queryFn: () => profileService.getProfile(u!),
    enabled: !!u,
  })
  const stats = { sermonCount: allSermons.data?.length ?? 0 }
  return {
    recentSermons: recent.data ?? [],
    continueReading: continueReading.data,
    onThisDay: onThisDay.data ?? [],
    stats,
    profile: profileQuery.data,
    isLoading: recent.isLoading,
    isOnline: online,
  }
}
