export type CoverSource = 'camera' | 'gallery' | 'app-gallery'
export interface CoverOption { id: string; url: string; isPremium: boolean; source: CoverSource }
