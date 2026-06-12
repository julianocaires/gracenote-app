import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing } from '../../../shared/design/spacing'
import { Chip } from '../../../shared/components'
import type { ActiveFilter } from '../types'

interface ActiveFiltersBarProps {
  filters: ActiveFilter[]
  onRemove: (type: ActiveFilter['type'], value: string) => void
  onClearAll: () => void
}

export function ActiveFiltersBar({ filters, onRemove, onClearAll }: ActiveFiltersBarProps) {
  const { colors } = useTheme()

  if (filters.length === 0) return null

  return (
    <View style={[styles.wrapper, { borderBottomColor: colors.borderLight }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((f) => (
          <Chip
            key={`${f.type}-${f.value}`}
            label={f.label}
            variant="filter"
            onRemove={() => onRemove(f.type, f.value)}
          />
        ))}
        {filters.length > 1 && (
          <TouchableOpacity onPress={onClearAll} activeOpacity={0.7}>
            <Text style={[styles.clearBtn, { color: colors.accent.primary }]}>
              Limpar todos
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  clearBtn: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
})
