import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
interface AuthState { session: Session | null; isLoading: boolean; setSession: (s: Session | null) => void; setLoading: (b: boolean) => void }
export const useAuthStore = create<AuthState>((set) => ({ session: null, isLoading: true, setSession: (session) => set({ session }), setLoading: (isLoading) => set({ isLoading }) }))
