import { useEffect } from 'react'
import { router } from 'expo-router'
import { supabase } from '../../shared/services/supabase'
import { LoadingScreen } from '../../shared/components'

export default function AuthCallbackScreen() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/(tabs)')
      else router.replace('/auth/login')
    })
  }, [])

  return <LoadingScreen message="Autenticando..." />
}
