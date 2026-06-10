import { View, ActivityIndicator, StyleSheet, Text } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { typography } from '../design/typography'
import { spacing } from '../design/spacing'
export function LoadingScreen({ message }: { message?: string }) {
  const { colors } = useTheme()
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.accent.primary} />
      {message && <Text style={[styles.message, { color: colors.text.secondary }]}>{message}</Text>}
    </View>
  )
}
const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }, message: { fontSize: typography.fontSize.sm } })
