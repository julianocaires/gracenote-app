import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { Button, Modal, Input } from '../../../shared/components'
import { useCategories, useCreateCategory } from '../hooks/useCategories'
import { Plus } from 'lucide-react-native'

interface CategoryPickerProps { visible: boolean; onClose: () => void; selectedIds: string[]; onSelect: (id: string) => void }

export function CategoryPicker({ visible, onClose, selectedIds, onSelect }: CategoryPickerProps) {
  const { colors } = useTheme()
  const { data: categories } = useCategories()
  const createCategory = useCreateCategory()
  const [newName, setNewName] = useState('')
  const [showNew, setShowNew] = useState(false)

  async function handleCreate() {
    if (!newName.trim()) return
    try {
      await createCategory.mutateAsync({ name: newName.trim() })
      setNewName('')
      setShowNew(false)
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível criar a categoria')
    }
  }

  return (
    <Modal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Categorias</Text>
      {showNew ? (
        <View style={styles.newRow}>
          <Input value={newName} onChangeText={setNewName} placeholder="Nome da categoria" />
          <View style={styles.newActions}>
            <Button title="Cancelar" onPress={() => { setShowNew(false); setNewName('') }} variant="ghost" />
            <Button title="Criar" onPress={handleCreate} loading={createCategory.isPending} />
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.addRow} onPress={() => setShowNew(true)}>
          <Plus size={16} color={colors.accent.primary} />
          <Text style={[styles.addText, { color: colors.accent.primary }]}>Nova categoria</Text>
        </TouchableOpacity>
      )}
      <ScrollView style={styles.list}>
        {categories?.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.item, { backgroundColor: selectedIds.includes(cat.id) ? colors.accent.primaryLight : 'transparent' }]}
            onPress={() => onSelect(cat.id)}
          >
            <Text style={[styles.itemText, { color: colors.text.primary }]}>{cat.name}</Text>
            {selectedIds.includes(cat.id) && <Text style={[styles.selectedMark, { color: colors.accent.primary }]}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Button title="Fechar" onPress={onClose} variant="ghost" />
    </Modal>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: spacing.md },
  list: { maxHeight: 300, marginBottom: spacing.md },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.sm, borderRadius: borderRadius.sm },
  itemText: { fontSize: typography.fontSize.base },
  selectedMark: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  addText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
  newRow: { gap: spacing.sm, marginBottom: spacing.md },
  newActions: { flexDirection: 'row', gap: spacing.sm },
})
