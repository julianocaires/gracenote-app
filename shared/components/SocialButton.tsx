import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { typography } from '../design/typography'
import { spacing, borderRadius } from '../design/spacing'
import type { ReactNode } from 'react'

interface SocialButtonProps {
  title: string
  icon: ReactNode
  onPress: () => void
  loading?: boolean
  disabled?: boolean
}

export function SocialButton({ title, icon, onPress, loading, disabled }: SocialButtonProps) {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: colors.surface, borderColor: colors.border, opacity: disabled || loading ? 0.5 : 1 }]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.primary} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon}
          <Text style={[styles.text, { color: colors.text.primary }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: { paddingVertical: spacing.md - 2, borderRadius: borderRadius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium },
})
