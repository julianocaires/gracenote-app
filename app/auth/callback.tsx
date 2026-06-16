import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import * as Linking from 'expo-linking'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import { supabase } from '../../shared/services/supabase'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { LoadingScreen } from '../../shared/components'

export default function AuthCallbackScreen() {
  const [handled, setHandled] = useState(false)

  useEffect(() => {
    async function handleCallback() {
      try {
        // Try to get the deep link URL that opened this screen
        const url = await Linking.getInitialURL()
        console.warn('[Callback] Deep link URL:', url ?? 'nenhuma')

        if (url) {
          const { params, errorCode } = QueryParams.getQueryParams(url)
          console.warn('[Callback] Params extraídos:', {
            errorCode,
            hasAccessToken: !!params.access_token,
            hasRefreshToken: !!params.refresh_token,
            paramKeys: Object.keys(params),
          })

          if (errorCode) {
            console.error('[Callback] Erro OAuth na URL:', errorCode)
            router.replace('/auth/login')
            return
          }

          const accessToken = params.access_token || params['access_token']
          const refreshToken = params.refresh_token || params['refresh_token']

          if (accessToken && refreshToken) {
            console.warn('[Callback] Tokens encontrados na URL, chamando setSession...')
            const { data: sd, error: se } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (se) {
              console.error('[Callback] Erro setSession:', se.message)
              router.replace('/auth/login')
              return
            }

            const session = sd?.session
            if (session) {
              console.warn('[Callback] Sessão criada via deep link. User:', session.user?.email)
              useAuthStore.getState().setSession(session)
              useAuthStore.getState().setLoading(false)
              router.replace('/(tabs)')
              return
            }
          }
        }

        // Fallback: check if session already exists (normal flow or linkIdentity)
        console.warn('[Callback] Verificando sessão existente (fallback)...')
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.warn('[Callback] Sessão existente encontrada. User:', session.user?.email)
          useAuthStore.getState().setSession(session)
          useAuthStore.getState().setLoading(false)
          router.replace('/(tabs)')
        } else if (useAuthStore.getState().session) {
          // User already logged in (e.g., linkIdentity deep link fallback) — just refresh session
          console.warn('[Callback] Sessão já existe na store (linkIdentity?) — recarregando...')
          const { data: { session: updatedSession } } = await supabase.auth.getSession()
          if (updatedSession) {
            useAuthStore.getState().setSession(updatedSession)
          }
          router.replace('/(tabs)')
        } else {
          console.error('[Callback] Nenhuma sessão encontrada — redirecionando para login')
          router.replace('/auth/login')
        }
      } catch (err: any) {
        console.error('[Callback] Erro inesperado:', err?.message || err)
        router.replace('/auth/login')
      } finally {
        setHandled(true)
      }
    }

    handleCallback()
  }, [])

  return <LoadingScreen message={handled ? 'Redirecionando...' : 'Autenticando...'} />
}
