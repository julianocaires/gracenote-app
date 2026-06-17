import { useEffect, useState, useRef } from 'react'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import * as WebBrowser from 'expo-web-browser'
import * as Notifications from 'expo-notifications'
import { View, StyleSheet, LogBox, AppState } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTheme } from '../shared/hooks/useTheme'
import { LoadingScreen } from '../shared/components'
import { useLoadFonts } from '../shared/hooks/useLoadFonts'
import { isOnboardingCompleted } from './onboarding/index'
import { authService } from '../features/auth/services/auth.service'
import { useAuthStore } from '../features/auth/store/auth.store'
import { notificationsService } from '../features/notifications/services/notifications.service'
import '../shared/i18n'

// Handle any pending auth session from a previous cold start
WebBrowser.maybeCompleteAuthSession()

// Known harmless warning from react-native-screens — already documented in GRACENOTE_GUIDE.md
LogBox.ignoreLogs([
  'shared value\'s .value inside reanimated inline style',
])

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2 } } })

function RootLayoutInner() {
  const { colors, isDark } = useTheme()
  const setSession = useAuthStore((s) => s.setSession)
  const setLoading = useAuthStore((s) => s.setLoading)
  const [onboardingCheckDone, setOnboardingCheckDone] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [fontsLoaded] = useLoadFonts()

  const appStateRef = useRef(AppState.currentState)
  const userId = useAuthStore((s) => s.session?.user?.id)

  useEffect(() => {
    // Restore session from AsyncStorage on app startup
    authService.getSession().then((s) => {
      setSession(s)
      setLoading(false)
    })

    // Subscribe to auth state changes for the entire app lifecycle
    const { data: subscription } = authService.onAuthStateChange((session) => {
      setSession(session as any)
    })

    return () => {
      subscription?.subscription.unsubscribe()
    }
  }, [])

  // --- Notifications ---
  useEffect(() => {
    if (!userId) return

    notificationsService.init().then((ok) => {
      if (ok) notificationsService.scheduleAll(userId)
    })

    // Handle notification tap — open the app
    const tappedSub = Notifications.addNotificationResponseReceivedListener((_response) => {
      // Just opens the app — the notification tap brings user to the dashboard
    })

    // AppState: schedule/cancel inactivity reminder based on foreground/background
    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current.match(/active/) && nextState.match(/inactive|background/)) {
        notificationsService.onAppBackground()
      } else if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        if (userId) notificationsService.onAppActive(userId)
      }
      appStateRef.current = nextState
    })

    return () => {
      tappedSub.remove()
      appStateSub.remove()
    }
  }, [userId])
  // --- Fim Notificações ---

  useEffect(() => {
    isOnboardingCompleted().then((done) => {
      setNeedsOnboarding(!done)
      setOnboardingCheckDone(true)
    })
  }, [])

  useEffect(() => { SplashScreen.hideAsync() }, [])

  useEffect(() => {
    if (!onboardingCheckDone) return
    if (needsOnboarding) {
      router.replace('/onboarding' as any)
    }
  }, [onboardingCheckDone, needsOnboarding])

  if (!fontsLoaded || !onboardingCheckDone) {
    return <View style={[styles.root, { backgroundColor: colors.background }]}><StatusBar style={isDark ? 'light' : 'dark'} /><LoadingScreen message="Carregando..." /></View>
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right', gestureEnabled: true, fullScreenGestureEnabled: true }} />
    </View>
  )
}

export default function RootLayout() {
  return <QueryClientProvider client={queryClient}><RootLayoutInner /></QueryClientProvider>
}

const styles = StyleSheet.create({ root: { flex: 1 } })
