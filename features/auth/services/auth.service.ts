import { Platform } from 'react-native'
import { makeRedirectUri } from 'expo-auth-session'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import { supabase } from '../../../shared/services/supabase'
import { useAuthStore } from '../store/auth.store'

const redirectUri = makeRedirectUri({
  native: 'gracenote://auth/callback',
  path: '/auth/callback',
})

async function openAuthSession(url: string): Promise<string | null> {
  try {
    const { maybeCompleteAuthSession, openAuthSessionAsync } = await import('expo-web-browser')
    maybeCompleteAuthSession()
    const result = await openAuthSessionAsync(url, redirectUri)
    return result.type === 'success' ? result.url : null
  } catch {
    throw new Error(
      'Login social indisponível no momento. Tente usar email/senha.'
    )
  }
}

export const authService = {
  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
    if (error) throw error
    if (data.session) {
      useAuthStore.getState().setSession(data.session)
      useAuthStore.getState().setLoading(false)
    }
    return data
  },
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.session) {
      useAuthStore.getState().setSession(data.session)
      useAuthStore.getState().setLoading(false)
    }
    return data
  },
  signInWithSocial: async (provider: 'google' | 'facebook') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUri, skipBrowserRedirect: true },
    })
    if (error) throw error

    const resultUrl = await openAuthSession(data.url)
    if (!resultUrl) throw new Error('Autenticação cancelada')

    const { params, errorCode } = QueryParams.getQueryParams(resultUrl)
    if (errorCode) throw new Error(`Erro na autenticação: ${errorCode}`)

    const accessToken = params.access_token || params['access_token']
    const refreshToken = params.refresh_token || params['refresh_token']

    if (!accessToken || !refreshToken) {
      const msg =
        'Não foi possível completar o login social.\n\n' +
        'Verifique se o URI de redirecionamento abaixo está cadastrado nos provedores do Supabase:\n\n' +
        `URI: ${redirectUri}`
      throw new Error(msg)
    }

    const { data: sd, error: se } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    if (se) throw se

    const session = sd?.session
    if (session) {
      useAuthStore.getState().setSession(session)
      useAuthStore.getState().setLoading(false)
    }
    return sd
  },
  signInWithGoogle: async () => authService.signInWithSocial('google'),
  signInWithFacebook: async () => authService.signInWithSocial('facebook'),
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    useAuthStore.getState().setSession(null)
    useAuthStore.getState().setLoading(false)
  },
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'gracenote://auth/callback' })
    if (error) throw error
  },
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },
  onAuthStateChange: (cb: (session: unknown) => void) => supabase.auth.onAuthStateChange((_e, s) => cb(s)),
}
