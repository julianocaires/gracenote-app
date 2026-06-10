import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { shadows } from '../../../shared/design/shadows'
import { Heart } from 'lucide-react-native'
interface SermonCardProps { title: string; subtitle?: string; categoryName?: string; isFavorite: boolean; onPress: () => void; onFavoritePress: () => void }
export function SermonCard({ title, subtitle, isFavorite, onPress, onFavoritePress }: SermonCardProps) {
  const { colors } = useTheme()
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.coverPlaceholder, { backgroundColor: colors.skeleton }]}>
        <Text style={[styles.coverLetter, { color: colors.text.tertiary }]}>{title.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: colors.text.tertiary }]} numberOfLines={1}>{subtitle}</Text>}
        </View>
        <TouchableOpacity onPress={onFavoritePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Heart size={18} stroke={isFavorite ? colors.accent.error : colors.text.tertiary} fill={isFavorite ? colors.accent.error : 'transparent'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  card: { borderRadius: borderRadius.lg, borderWidth: 1, overflow: 'hidden' },
  coverPlaceholder: { height: 100, alignItems: 'center', justifyContent: 'center' },
  coverLetter: { fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold },
  content: { padding: spacing.md, flexDirection: 'row', gap: spacing.sm },
  textContent: { flex: 1, gap: 2 },
  title: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
  subtitle: { fontSize: typography.fontSize.sm },
})
