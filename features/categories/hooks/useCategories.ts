import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesService } from '../services/categories.service'
import { useAuthStore } from '../../auth/store/auth.store'

export function useCategories() {
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useQuery({ queryKey: ['categories', userId], queryFn: () => categoriesService.getAll(userId!), enabled: !!userId })
}

export function useCreateCategory() {
  const q = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color?: string }) => {
      const userId = useAuthStore.getState().session?.user?.id
      if (!userId) throw new Error('Usuário não autenticado')
      return categoriesService.create(userId, name, color)
    },
    onSuccess: () => q.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const q = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; name?: string; color?: string | null }) => categoriesService.update(id, updates),
    onSuccess: () => q.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const q = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => q.invalidateQueries({ queryKey: ['categories'] }),
  })
}
