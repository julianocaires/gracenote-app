import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { Tag, Tags, User, Calendar, ArrowUpDown, Heart } from 'lucide-react-native'

interface FilterBarProps {
  activeFilterCount: number
  hasCategoryFilter: boolean
  hasTagFilter: boolean
  hasPreacherFilter: boolean
  hasDateFilter: boolean
  hasFavoriteFilter: boolean
  onCategoryPress: () => void
  onTagPress: () => void
  onPreacherPress: () => void
  onDatePress: () => void
  onSortPress: () => void
  onFavoritePress: () => void
}

interface FilterBtnProps {
  icon: React.ComponentType<{ size: number; stroke?: string }>
  label: string
  active: boolean
  onPress: () => void
  colors: ReturnType<typeof useTheme>['colors']
}

function FilterBtn({ icon: Icon, label, active, onPress, colors }: FilterBtnProps) {
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          backgroundColor: colors.surface,
          borderColor: active ? colors.accent.primary : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon size={14} stroke={active ? colors.accent.primary : colors.text.tertiary} />
      <Text
        style={[
          styles.btnLabel,
          { color: active ? colors.accent.primary : colors.text.secondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

export function FilterBar({
  activeFilterCount,
  hasCategoryFilter,
  hasTagFilter,
  hasPreacherFilter,
  hasDateFilter,
  hasFavoriteFilter,
  onCategoryPress,
  onTagPress,
  onPreacherPress,
  onDatePress,
  onSortPress,
  onFavoritePress,
}: FilterBarProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FilterBtn
          icon={Tag}
          label="Categorias"
          active={hasCategoryFilter}
          onPress={onCategoryPress}
          colors={colors}
        />
        <FilterBtn
          icon={Tags}
          label="Tags"
          active={hasTagFilter}
          onPress={onTagPress}
          colors={colors}
        />
        <FilterBtn
          icon={User}
          label="Pregador"
          active={hasPreacherFilter}
          onPress={onPreacherPress}
          colors={colors}
        />
        <FilterBtn
          icon={Heart}
          label="Favoritos"
          active={hasFavoriteFilter}
          onPress={onFavoritePress}
          colors={colors}
        />
        <FilterBtn
          icon={Calendar}
          label="Data"
          active={hasDateFilter}
          onPress={onDatePress}
          colors={colors}
        />
        <FilterBtn
          icon={ArrowUpDown}
          label="Ordenar"
          active={false}
          onPress={onSortPress}
          colors={colors}
        />
      </ScrollView>
      {activeFilterCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.accent.primary }]}>
          <Text style={[styles.badgeText, { color: colors.text.inverse }]}>
            {activeFilterCount}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    paddingVertical: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  btnLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: spacing.md,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
})
