import { useEffect } from 'react'
import { useAuthStore } from '../store/auth.store'
import { authService } from '../services/auth.service'

export function useAuth() {
  const { session, isLoading, setSession, setLoading } = useAuthStore()

  useEffect(() => {
    authService.getSession().then((s) => { setSession(s); setLoading(false) })
    const { data: l } = authService.onAuthStateChange((session) => setSession(session as any))
    return () => l?.subscription.unsubscribe()
  }, [])

  return {
    session,
    isLoading,
    isAuthenticated: !!session?.user,
    user: session?.user ?? null,
    signIn: authService.signIn,
    signUp: authService.signUp,
    signOut: authService.signOut,
    resetPassword: authService.resetPassword,
    signInWithGoogle: authService.signInWithGoogle,
    signInWithFacebook: authService.signInWithFacebook,
  }
}
