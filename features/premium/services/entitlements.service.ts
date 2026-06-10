import { supabase } from '../../../shared/services/supabase'
import type { SermonLimitInfo } from '../../../shared/types'
export type PremiumEntitlement = 'unlimited-sermons' | 'custom-fonts' | 'premium-covers'
export const entitlementsService = {
  isPremium: async (userId: string) => { const { data } = await supabase.from('subscriptions').select('id').eq('user_id', userId).eq('is_active', true).gt('expires_at', new Date().toISOString()).maybeSingle(); return !!data },
  getSubscription: async (userId: string) => {
    const { data } = await supabase.from('subscriptions').select('*').eq('user_id', userId).eq('is_active', true).maybeSingle()
    return data ?? null
  },
  getEntitlement: async (userId: string, _feature: PremiumEntitlement) => entitlementsService.isPremium(userId),
  checkSermonLimit: async (userId: string): Promise<SermonLimitInfo> => {
    const { data: active } = await supabase.from('sermons').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('archived', false)
    const { data: archived } = await supabase.from('sermons').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('archived', true)
    const isPremium = await entitlementsService.isPremium(userId)
    return { active: active?.length ?? 0, archived: archived?.length ?? 0, total: (active?.length ?? 0) + (archived?.length ?? 0), canCreate: isPremium || (active?.length ?? 0) < 100 }
  },
}
