import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../features/auth/store/auth.store'
import { entitlementsService } from '../services/entitlements.service'
import type { PremiumEntitlement } from '../services/entitlements.service'

export interface SubscriptionInfo {
  isPremium: boolean
  expiresAt: string | null
  planType: string | null
}

export function useEntitlements(feature?: PremiumEntitlement) {
  const userId = useAuthStore((s) => s.session?.user?.id)
  const [state, setState] = useState<SubscriptionInfo>({ isPremium: false, expiresAt: null, planType: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    ;(async () => {
      try {
        const sub = await entitlementsService.getSubscription(userId)
        const isPremium = !!sub && new Date(sub.expires_at!) > new Date()
        setState({ isPremium, expiresAt: sub?.expires_at ?? null, planType: sub?.plan_type ?? null })
      } catch { setState({ isPremium: false, expiresAt: null, planType: null }) }
      setLoading(false)
    })()
  }, [userId])

  return { ...state, loading }
}
