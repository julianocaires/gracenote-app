import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { Button, Modal } from '../../../shared/components'
import { Check } from 'lucide-react-native'

const TEXT_COLORS = [
  { label: 'Padrão', value: '#2C2420' },
  { label: 'Vermelho', value: '#DC2626' },
  { label: 'Laranja', value: '#EA580C' },
  { label: 'Âmbar', value: '#D97706' },
  { label: 'Verde', value: '#059669' },
  { label: 'Azul', value: '#2563EB' },
  { label: 'Roxo', value: '#7C3AED' },
  { label: 'Rosa', value: '#DB2777' },
  { label: 'Cinza', value: '#78716C' },
]

const HIGHLIGHT_COLORS = [
  { label: 'Amarelo', value: '#FEF3C7' },
  { label: 'Verde', value: '#D1FAE5' },
  { label: 'Azul', value: '#DBEAFE' },
  { label: 'Rosa', value: '#FCE7F3' },
  { label: 'Laranja', value: '#FED7AA' },
  { label: 'Roxo', value: '#EDE9FE' },
]

interface ColorPickerProps { visible: boolean; onClose: () => void; selectedColor: string; onSelect: (color: string) => void; mode: 'text' | 'highlight' }

export function ColorPicker({ visible, onClose, selectedColor, onSelect, mode }: ColorPickerProps) {
  const { colors } = useTheme()
  const palette = mode === 'text' ? TEXT_COLORS : HIGHLIGHT_COLORS

  return (
    <Modal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text.primary }]}>
        {mode === 'text' ? 'Cor do texto' : 'Marca-texto'}
      </Text>
      <ScrollView style={styles.list}>
        {palette.map((c) => {
          const isSelected = selectedColor === c.value
          return (
            <TouchableOpacity
              key={c.value}
              style={[styles.item, { backgroundColor: isSelected ? colors.accent.primaryLight : 'transparent' }]}
              onPress={() => onSelect(c.value)}
            >
              <View style={styles.itemLeft}>
                <View style={[styles.swatch, { backgroundColor: c.value, borderColor: colors.border }]} />
                <Text style={[styles.itemText, { color: colors.text.primary }]}>{c.label}</Text>
              </View>
              {isSelected && <Check size={16} color={colors.accent.primary} />}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
      <Button title="Fechar" onPress={onClose} variant="ghost" />
    </Modal>
  )
}

export const COLOR_PALETTES = { TEXT_COLORS, HIGHLIGHT_COLORS }

const styles = StyleSheet.create({
  title: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: spacing.md },
  list: { maxHeight: 350, marginBottom: spacing.md },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.sm, borderRadius: borderRadius.sm },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  swatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 1 },
  itemText: { fontSize: typography.fontSize.base },
})
