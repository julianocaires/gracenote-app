import { useEffect, useState } from 'react'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { View, StyleSheet } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTheme } from '../shared/hooks/useTheme'
import { LoadingScreen } from '../shared/components'
import { isOnboardingCompleted } from './onboarding/index'
import '../shared/i18n'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2 } } })

function RootLayoutInner() {
  const { colors, isDark } = useTheme()
  const [onboardingCheckDone, setOnboardingCheckDone] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

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

  if (!onboardingCheckDone) {
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
