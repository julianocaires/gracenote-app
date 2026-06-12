import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { Button, Modal } from '../../../shared/components'
import { SORT_OPTIONS } from '../types'

interface SortPickerProps {
  visible: boolean
  onClose: () => void
  currentSort: { sortBy: string; sortOrder: string }
  onSelect: (sortBy: 'created_at' | 'title' | 'updated_at' | 'last_opened_at', sortOrder: 'asc' | 'desc') => void
}

export function SortPicker({ visible, onClose, currentSort, onSelect }: SortPickerProps) {
  const { colors } = useTheme()

  return (
    <Modal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Ordenar por</Text>
      <ScrollView style={styles.list}>
        {SORT_OPTIONS.map((opt) => {
          const isSelected =
            currentSort.sortBy === opt.sortBy && currentSort.sortOrder === opt.sortOrder
          return (
            <TouchableOpacity
              key={`${opt.sortBy}-${opt.sortOrder}`}
              style={[
                styles.item,
                { backgroundColor: isSelected ? colors.accent.primaryLight : 'transparent' },
              ]}
              onPress={() => onSelect(opt.sortBy, opt.sortOrder)}
            >
              <Text style={[styles.itemText, { color: colors.text.primary }]}>
                {opt.label}
              </Text>
              {isSelected && (
                <Text style={[styles.checkmark, { color: colors.accent.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
      <Button title="Fechar" onPress={onClose} variant="ghost" />
    </Modal>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  list: {
    maxHeight: 300,
    marginBottom: spacing.md,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  itemText: {
    fontSize: typography.fontSize.base,
  },
  checkmark: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
})
