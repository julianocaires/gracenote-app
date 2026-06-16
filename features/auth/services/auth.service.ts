import { Platform } from 'react-native'
import { makeRedirectUri } from 'expo-auth-session'
import * as Linking from 'expo-linking'
import { supabase } from '../../../shared/services/supabase'
import { useAuthStore } from '../store/auth.store'

// Compute redirect URI lazily — when using --tunnel, the URL changes from
// exp://192.168.x.x to exp://xxx.anonymous.app.exp.direct. Computing at
// call time ensures we always use the correct URL.
function getRedirectUri(): string {
  const uri = makeRedirectUri({ path: '/auth/callback' })
  // Fallback: use Linking.createURL which is aware of tunnel URLs
  return uri || Linking.createURL('/auth/callback')
}

async function openAuthSession(url: string): Promise<string | null> {
  const returnUrl = getRedirectUri()
  console.warn('[Auth] Redirect URI:', returnUrl)
  try {
    const { openAuthSessionAsync } = await import('expo-web-browser')
    console.warn('[Auth] Abrindo navegador OAuth...')
    const result = await openAuthSessionAsync(url, returnUrl)
    console.warn('[Auth] Resultado:', result.type)
    if (result.type === 'success') {
      console.warn('[Auth] URL capturada com sucesso')
      return result.url
    }
    return null
  } catch (err: any) {
    console.error('[Auth] Erro ao abrir navegador:', err?.message || err)
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
    console.warn(`[Auth] Iniciando login social: ${provider}`)
    const redirectTo = getRedirectUri()
    console.warn('[Auth] Redirect URI:', redirectTo)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    })
    if (error) {
      console.error('[Auth] Erro signInWithOAuth:', error.message)
      throw error
    }
    console.warn('[Auth] URL OAuth obtida, abrindo navegador...')

    // iOS: ASWebAuthenticationSession intercepta redirect automaticamente
    // Android: Chrome Custom Tabs intercepta redirect
    // Se a interceptação falhar, o callback screen (app/auth/callback.tsx) processa o deep link
    const resultUrl = await openAuthSession(data.url)

    if (!resultUrl) {
      console.warn('[Auth] Navegador fechado sem capturar URL — pode ter sido cancelado ou redirecionado via deep link')
      // Don't throw — the callback screen might handle the deep link
      return
    }

    // Extract tokens from captured redirect URL
    const fragment = resultUrl.includes('#') ? resultUrl.split('#')[1] : ''
    const params = new URLSearchParams(fragment)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    console.warn('[Auth] Tokens extraídos:', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken })

    if (!accessToken || !refreshToken) {
      console.error('[Auth] Tokens ausentes na URL. Fragment:', fragment.substring(0, 100))
      throw new Error(
        'Não foi possível completar o login social.\n\n' +
        'Verifique se o URI de redirecionamento está cadastrado nas Redirect URLs do Supabase:\n\n' +
        `URI: ${redirectTo}`
      )
    }

    console.warn('[Auth] Chamando setSession...')
    const { data: sd, error: se } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    if (se) {
      console.error('[Auth] Erro setSession:', se.message)
      throw se
    }

    const session = sd?.session
    console.warn('[Auth] Sessão:', session ? `OK (${session.user?.email})` : 'NULL')
    if (session) {
      useAuthStore.getState().setSession(session)
      useAuthStore.getState().setLoading(false)
      console.warn('[Auth] Store atualizada com sucesso')
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

  /** Returns list of OAuth providers linked to the current session (e.g. ['google', 'facebook']) */
  getLinkedProviders: (session: unknown): string[] => {
    const s = session as { user?: { identities?: Array<{ provider: string }> } } | null
    if (!s?.user?.identities) return []
    return s.user.identities.map((i) => i.provider)
  },

  /** Link an OAuth provider to the current user account */
  linkIdentity: async (provider: 'google' | 'facebook') => {
    console.warn(`[Auth] Vinculando provedor: ${provider}`)
    const redirectTo = getRedirectUri()

    const { data, error } = await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    })
    if (error) {
      console.error('[Auth] Erro linkIdentity:', error.message)
      throw error
    }
    console.warn('[Auth] URL linkIdentity obtida, abrindo navegador...')

    const resultUrl = await openAuthSession(data.url)
    if (!resultUrl) {
      console.warn('[Auth] Navegador fechado sem capturar URL — callback screen fará fallback')
      return
    }

    const fragment = resultUrl.includes('#') ? resultUrl.split('#')[1] : ''
    const p = new URLSearchParams(fragment)
    const accessToken = p.get('access_token')
    const refreshToken = p.get('refresh_token')

    if (accessToken && refreshToken) {
      console.warn('[Auth] Atualizando sessão após linkIdentity...')
      const { data: sd } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      if (sd?.session) {
        useAuthStore.getState().setSession(sd.session)
        useAuthStore.getState().setLoading(false)
        console.warn('[Auth] Sessão atualizada com novo provedor vinculado')
      }
    }
  },

  /** Unlink an OAuth provider from the current user account */
  unlinkIdentity: async (identity: { id: string; provider: string }) => {
    console.warn(`[Auth] Desvinculando provedor: ${identity.provider}`)
    const { error } = await supabase.auth.unlinkIdentity(identity as any)
    if (error) {
      console.error('[Auth] Erro unlinkIdentity:', error.message)
      throw error
    }
    // Refresh session to get updated identities
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      useAuthStore.getState().setSession(data.session)
      console.warn('[Auth] Sessão atualizada após desvincular provedor')
    }
  },
}
