import { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { typography } from '../design/typography'
import { spacing, borderRadius } from '../design/spacing'
interface ToastProps { message: string; type?: 'success' | 'error' | 'info'; visible: boolean; onHide: () => void; duration?: number }
export function Toast({ message, type = 'info', visible, onHide, duration = 3000 }: ToastProps) {
  const { colors } = useTheme()
  const opacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (visible) { Animated.sequence([Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }), Animated.delay(duration), Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true })]).start(() => onHide()) }
  }, [visible])
  if (!visible) return null
  const bg = type === 'success' ? colors.accent.success : type === 'error' ? colors.accent.error : colors.text.primary
  return <Animated.View style={[styles.toast, { backgroundColor: bg, opacity }]} pointerEvents="none"><Text style={[styles.text, { color: colors.text.inverse }]}>{message}</Text></Animated.View>
}
const styles = StyleSheet.create({ toast: { position: 'absolute', bottom: 100, left: spacing.lg, right: spacing.lg, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', zIndex: 9999 }, text: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium } })
