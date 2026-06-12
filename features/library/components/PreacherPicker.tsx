import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { Button, Modal, LoadingScreen } from '../../../shared/components'
import { useDistinctPreachers } from '../hooks/useSearch'

interface PreacherPickerProps {
  visible: boolean
  onClose: () => void
  selectedPreacher?: string
  onSelect: (preacher: string | undefined) => void
}

export function PreacherPicker({ visible, onClose, selectedPreacher, onSelect }: PreacherPickerProps) {
  const { colors } = useTheme()
  const { data: preachers, isLoading } = useDistinctPreachers()

  return (
    <Modal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Pregador</Text>

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <ScrollView style={styles.list}>
          {/* All option */}
          <TouchableOpacity
            style={[
              styles.item,
              { backgroundColor: !selectedPreacher ? colors.accent.primaryLight : 'transparent' },
            ]}
            onPress={() => onSelect(undefined)}
          >
            <Text style={[styles.itemText, { color: colors.text.primary }]}>
              Todos os pregadores
            </Text>
            {!selectedPreacher && (
              <Text style={[styles.checkmark, { color: colors.accent.primary }]}>✓</Text>
            )}
          </TouchableOpacity>

          {preachers?.length ? (
            preachers.map((preacher) => {
              const isSelected = selectedPreacher === preacher
              return (
                <TouchableOpacity
                  key={preacher}
                  style={[
                    styles.item,
                    { backgroundColor: isSelected ? colors.accent.primaryLight : 'transparent' },
                  ]}
                  onPress={() => onSelect(isSelected ? undefined : preacher)}
                >
                  <Text style={[styles.itemText, { color: colors.text.primary }]}>
                    {preacher}
                  </Text>
                  {isSelected && (
                    <Text style={[styles.checkmark, { color: colors.accent.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              )
            })
          ) : (
            <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>
              Nenhum pregador registrado
            </Text>
          )}
        </ScrollView>
      )}

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
  emptyText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
})
