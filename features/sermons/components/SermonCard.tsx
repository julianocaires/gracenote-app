import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useState } from 'react'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { shadows } from '../../../shared/design/shadows'
import { Heart } from 'lucide-react-native'
import { getBuiltinCoverColor, isBuiltinCover } from '../../../features/covers/constants'

interface SermonCardProps {
  title: string
  subtitle?: string
  coverUrl?: string
  coverId?: string
  isFavorite: boolean
  onPress: () => void
  onFavoritePress: () => void
}

export function SermonCard({ title, subtitle, coverUrl, coverId, isFavorite, onPress, onFavoritePress }: SermonCardProps) {
  const { colors } = useTheme()
  const [imgError, setImgError] = useState(false)

  function renderCover() {
    // User-uploaded cover with real URL
    if (coverUrl && !imgError) {
      return (
        <Image
          source={{ uri: coverUrl }}
          style={styles.coverImage}
          resizeMode="cover"
          onError={(e) => {
            console.warn('[SermonCard] Image load error:', coverUrl, e.nativeEvent?.error)
            setImgError(true)
          }}
        />
      )
    }
    // Built-in cover (now uses real UUIDs from migration 006)
    if (isBuiltinCover(coverId)) {
      const color = getBuiltinCoverColor(coverId) || colors.skeleton
      return <View style={[styles.coverImage, { backgroundColor: color }]} />
    }
    // Image failed to load — fallback to coverId color or placeholder
    if (imgError && coverId) {
      const color = getBuiltinCoverColor(coverId) || colors.skeleton
      return <View style={[styles.coverImage, { backgroundColor: color }]} />
    }
    // No cover at all
    return (
      <View style={[styles.coverPlaceholder, { backgroundColor: colors.skeleton }]}>
        <Text style={[styles.coverLetter, { color: colors.text.tertiary }]}>{title.charAt(0).toUpperCase()}</Text>
      </View>
    )
  }

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.coverWrap}>
        {renderCover()}
        <TouchableOpacity onPress={onFavoritePress} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} style={styles.favBtn}>
          <Heart size={16} stroke={isFavorite ? colors.accent.error : colors.text.tertiary} fill={isFavorite ? colors.accent.error : 'transparent'} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.text.tertiary }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: borderRadius.md, borderWidth: 1, overflow: 'hidden' },
  coverWrap: { position: 'relative' },
  coverImage: { aspectRatio: 1.15, width: '100%' },
  coverPlaceholder: { aspectRatio: 1.15, width: '100%', alignItems: 'center', justifyContent: 'center' },
  coverLetter: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
  favBtn: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.sm, gap: 2 },
  title: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  subtitle: { fontSize: typography.fontSize.xs },
})
