export type ThemeMode = 'light' | 'dark' | 'system'
export interface ProfileFormData { name: string; avatar_url?: string | null; theme: ThemeMode }
