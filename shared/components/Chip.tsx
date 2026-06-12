import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { typography } from '../design/typography'
import { spacing, borderRadius } from '../design/spacing'
import { X } from 'lucide-react-native'

interface ChipProps {
  label: string
  variant?: 'default' | 'premium' | 'selected' | 'filter'
  onPress?: () => void
  onRemove?: () => void
}

export function Chip({ label, variant = 'default', onPress, onRemove }: ChipProps) {
  const { colors } = useTheme()

  const bg = variant === 'selected' ? colors.accent.primaryLight
    : variant === 'premium' ? colors.accent.warning + '20'
    : variant === 'filter' ? colors.accent.primaryLight
    : colors.skeleton

  const tc = variant === 'selected' ? colors.accent.primary
    : variant === 'premium' ? colors.accent.warning
    : variant === 'filter' ? colors.accent.primary
    : colors.text.secondary

  const bc = variant === 'selected' ? colors.accent.primary + '40'
    : variant === 'premium' ? colors.accent.warning + '40'
    : variant === 'filter' ? colors.accent.primary + '40'
    : colors.border

  const content = (
    <>
      <Text style={[styles.text, { color: tc }]}>{label}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={12} color={tc} />
        </TouchableOpacity>
      )}
    </>
  )

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.chip, { backgroundColor: bg, borderColor: bc }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    )
  }

  return <View style={[styles.chip, { backgroundColor: bg, borderColor: bc }]}>{content}</View>
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
})
