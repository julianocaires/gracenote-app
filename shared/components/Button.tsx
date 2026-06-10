import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { typography } from '../design/typography'
import { spacing } from '../design/spacing'
interface ButtonProps { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean; loading?: boolean }
export function Button({ title, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  const { colors } = useTheme()
  const bg = variant === 'primary' ? colors.accent.primary : variant === 'secondary' ? colors.surface : 'transparent'
  const tc = variant === 'primary' ? colors.text.inverse : variant === 'secondary' ? colors.text.primary : colors.accent.primary
  const b = variant === 'secondary' ? { borderWidth: 1, borderColor: colors.border } : {}
  return (
    <TouchableOpacity style={[styles.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, b]} onPress={onPress} disabled={disabled || loading} activeOpacity={0.7}>
      {loading ? <ActivityIndicator color={tc} size="small" /> : <Text style={[styles.text, { color: tc }]}>{title}</Text>}
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({ btn: { paddingVertical: spacing.md - 2, paddingHorizontal: spacing.lg, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 48 }, text: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold } })
