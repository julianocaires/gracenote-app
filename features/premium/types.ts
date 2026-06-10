export type PremiumFeature = 'unlimited-sermons' | 'custom-fonts' | 'premium-covers'
export interface EntitlementInfo { feature: PremiumFeature; isEntitled: boolean }
export interface SubscriptionPlan { identifier: string; name: string; price: string; period: 'monthly' | 'annual' }
