export interface RevenueCatProduct { identifier: string; title: string; description: string; price: string; period: 'monthly' | 'annual' }
export const MOCK_PRODUCTS: RevenueCatProduct[] = [
  { identifier: 'premium_monthly', title: 'Premium Mensal', description: 'Acesso completo a todos os recursos premium', price: 'R$ 9,90', period: 'monthly' },
  { identifier: 'premium_annual', title: 'Premium Anual', description: 'Acesso completo com 2 meses grátis', price: 'R$ 99,90', period: 'annual' },
]
export const revenuecatService = { getProducts: async () => MOCK_PRODUCTS, purchase: async (p: string) => { console.log('[Mock] Purchase:', p); return true }, restore: async () => { console.log('[Mock] Restore'); return true }, getCustomerInfo: async () => ({ entitlements: { active: {} } }) }
