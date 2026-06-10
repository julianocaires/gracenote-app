import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { typography } from '../design/typography'
import { spacing } from '../design/spacing'
import { BookOpen } from 'lucide-react-native'
interface EmptyStateProps { icon?: React.ReactNode; title: string; description?: string }
export function EmptyState({ icon, title, description }: EmptyStateProps) {
  const { colors } = useTheme()
  return (
    <View style={styles.container}>
      {icon || <BookOpen size={48} stroke={colors.text.tertiary} />}
      <Text style={[styles.title, { color: colors.text.secondary }]}>{title}</Text>
      {description && <Text style={[styles.description, { color: colors.text.tertiary }]}>{description}</Text>}
    </View>
  )
}
const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['2xl'], gap: spacing.md }, title: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, textAlign: 'center' }, description: { fontSize: typography.fontSize.sm, textAlign: 'center', lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed } })
