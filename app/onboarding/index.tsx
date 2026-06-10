import { useState, useRef } from 'react'
import { View, Text, StyleSheet, FlatList, Dimensions, Animated, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing, borderRadius } from '../../shared/design/spacing'
import { Button } from '../../shared/components'
import { BookOpen, Search, Palette, Sparkles } from 'lucide-react-native'

const { width } = Dimensions.get('window')

const slides = [
  { icon: BookOpen, title: 'Guarde cada ministração para sempre', description: 'Organize tudo o que Deus tem falado ao seu coração em um único lugar.' },
  { icon: Search, title: 'Encontre qualquer palavra em segundos', description: 'Pesquise ministrações antigas por título, pregador, categoria ou conteúdo.' },
  { icon: Palette, title: 'Crie um espaço com a sua identidade', description: 'Personalize capas, fontes e organização para tornar cada registro único.' },
  { icon: Sparkles, title: 'Bem-vindo ao GraceNote', description: 'Seu caderno espiritual digital começa aqui.' },
]

const ONBOARDING_KEY = 'onboarding_completed'

export async function isOnboardingCompleted(): Promise<boolean> {
  try { return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true' } catch { return false }
}

export default function OnboardingScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const scrollX = useRef(new Animated.Value(0)).current
  const flatRef = useRef<FlatList>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const isLast = currentIndex === slides.length - 1

  async function handleFinish() {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    router.replace('/(tabs)' as any)
  }

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })

  const onMomentumEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width)
    setCurrentIndex(idx)
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.skipRow}>
        {!isLast && (
          <TouchableOpacity onPress={handleFinish}>
            <Text style={[styles.skip, { color: colors.text.tertiary }]}>Pular</Text>
          </TouchableOpacity>
        )}
      </View>

      <Animated.FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
          const scale = scrollX.interpolate({ inputRange, outputRange: [0.8, 1, 0.8], extrapolate: 'clamp' })
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' })
          const Icon = item.icon
          return (
            <Animated.View style={[styles.slide, { width, opacity, transform: [{ scale }] }]}>
              <Animated.View style={[styles.iconWrap, { backgroundColor: colors.accent.primaryLight }]}>
                <Icon size={44} color={colors.accent.primary} />
              </Animated.View>
              <Text style={[styles.title, { color: colors.text.primary }]}>{item.title}</Text>
              <Text style={[styles.desc, { color: colors.text.secondary }]}>{item.description}</Text>
            </Animated.View>
          )
        }}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            })
            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            })
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { backgroundColor: colors.accent.primary, width: dotWidth, opacity: dotOpacity }]}
              />
            )
          })}
        </View>

        {isLast ? (
          <View style={styles.lastActions}>
            <Button title="Criar Conta" onPress={handleFinish} />
            <Button title="Entrar" onPress={() => router.replace('/auth/login' as any)} variant="ghost" />
          </View>
        ) : (
          <Button title="Continuar" onPress={() => {
            const next = currentIndex + 1
            flatRef.current?.scrollToIndex({ index: next, animated: true })
            setCurrentIndex(next)
          }} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, alignItems: 'flex-end', minHeight: 60 },
  skip: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing['2xl'], gap: spacing.lg },
  iconWrap: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, textAlign: 'center' },
  desc: { fontSize: typography.fontSize.base, textAlign: 'center', lineHeight: 24 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing['2xl'] },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: { height: 8, borderRadius: 4 },
  lastActions: { gap: spacing.sm },
})
