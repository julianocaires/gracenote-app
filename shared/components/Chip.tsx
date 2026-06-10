import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { typography } from '../design/typography'
import { spacing, borderRadius } from '../design/spacing'
interface ChipProps { label: string; variant?: 'default' | 'premium' | 'selected' }
export function Chip({ label, variant = 'default' }: ChipProps) {
  const { colors } = useTheme()
  const bg = variant === 'selected' ? colors.accent.primaryLight : variant === 'premium' ? colors.accent.warning + '20' : colors.skeleton
  const tc = variant === 'selected' ? colors.accent.primary : variant === 'premium' ? colors.accent.warning : colors.text.secondary
  const bc = variant === 'selected' ? colors.accent.primary + '40' : variant === 'premium' ? colors.accent.warning + '40' : colors.border
  return <View style={[styles.chip, { backgroundColor: bg, borderColor: bc }]}><Text style={[styles.text, { color: tc }]}>{label}</Text></View>
}
const styles = StyleSheet.create({ chip: { paddingHorizontal: spacing.sm + 4, paddingVertical: spacing.xs, borderRadius: borderRadius.full, borderWidth: 1, alignSelf: 'flex-start' }, text: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium } })
