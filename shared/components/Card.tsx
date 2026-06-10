import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { typography } from '../design/typography'
import { spacing, borderRadius } from '../design/spacing'
import { shadows } from '../design/shadows'
interface CardProps { title: string; subtitle?: string; onPress?: () => void }
export function Card({ title, subtitle, onPress }: CardProps) {
  const { colors } = useTheme()
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.placeholder, { backgroundColor: colors.skeleton }]}><Text style={[styles.placeholderText, { color: colors.text.tertiary }]}>{title.charAt(0).toUpperCase()}</Text></View>
      <View style={styles.textContainer}><Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>{title}</Text>{subtitle && <Text style={[styles.subtitle, { color: colors.text.tertiary }]} numberOfLines={1}>{subtitle}</Text>}</View>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({ card: { borderRadius: borderRadius.lg, borderWidth: 1, overflow: 'hidden' }, placeholder: { height: 120, alignItems: 'center', justifyContent: 'center' }, placeholderText: { fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold }, textContainer: { padding: spacing.md, gap: spacing.xs }, title: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold }, subtitle: { fontSize: typography.fontSize.sm } })
