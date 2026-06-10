import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsService } from '../services/tags.service'
import { useAuthStore } from '../../auth/store/auth.store'

export function useTags() {
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useQuery({ queryKey: ['tags', userId], queryFn: () => tagsService.getAll(userId!), enabled: !!userId })
}

export function useCreateTag() {
  const q = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const userId = useAuthStore.getState().session?.user?.id
      if (!userId) throw new Error('Usuário não autenticado')
      return tagsService.create(userId, name)
    },
    onSuccess: () => q.invalidateQueries({ queryKey: ['tags'] }),
  })
}

export function useUpdateTag() {
  const q = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => tagsService.update(id, name),
    onSuccess: () => q.invalidateQueries({ queryKey: ['tags'] }),
  })
}

export function useDeleteTag() {
  const q = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tagsService.delete(id),
    onSuccess: () => q.invalidateQueries({ queryKey: ['tags'] }),
  })
}
