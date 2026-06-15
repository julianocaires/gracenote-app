import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { getBuiltinCoverColor, isBuiltinCover } from '../../../features/covers/constants'

interface MiniSermonCardProps {
  title: string
  date: string
  coverUrl?: string
  coverId?: string
  onPress: () => void
}

export function MiniSermonCard({ title, date, coverUrl, coverId, onPress }: MiniSermonCardProps) {
  const { colors } = useTheme()

  function renderThumb() {
    if (coverUrl) {
      return <Image source={{ uri: coverUrl }} style={styles.thumb} resizeMode="cover" />
    }
    if (isBuiltinCover(coverId)) {
      const color = getBuiltinCoverColor(coverId) || colors.skeleton
      return <View style={[styles.thumb, { backgroundColor: color }]} />
    }
    return (
      <View style={[styles.thumb, { backgroundColor: colors.skeleton }]}>
        <Text style={[styles.letter, { color: colors.text.tertiary }]}>{title.charAt(0).toUpperCase()}</Text>
      </View>
    )
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {renderThumb()}
      <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>{title}</Text>
      <Text style={[styles.date, { color: colors.text.tertiary }]} numberOfLines={1}>{date}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { width: 140, borderRadius: borderRadius.md, borderWidth: 1, overflow: 'hidden' },
  thumb: { height: 72, alignItems: 'center', justifyContent: 'center' },
  letter: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold },
  title: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
  date: { fontSize: typography.fontSize.xs, paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, paddingTop: 2 },
})
