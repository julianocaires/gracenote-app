import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { Button, Modal, Input } from '../../../shared/components'
import { useTags, useCreateTag } from '../hooks/useTags'
import { Plus } from 'lucide-react-native'

interface TagPickerProps { visible: boolean; onClose: () => void; selectedIds: string[]; onSelect: (id: string) => void }

export function TagPicker({ visible, onClose, selectedIds, onSelect }: TagPickerProps) {
  const { colors } = useTheme()
  const { data: tags } = useTags()
  const createTag = useCreateTag()
  const [newName, setNewName] = useState('')
  const [showNew, setShowNew] = useState(false)

  async function handleCreate() {
    if (!newName.trim()) return
    try {
      await createTag.mutateAsync(newName.trim())
      setNewName('')
      setShowNew(false)
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível criar a tag')
    }
  }

  return (
    <Modal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Tags</Text>
      {showNew ? (
        <View style={styles.newRow}>
          <Input value={newName} onChangeText={setNewName} placeholder="Nome da tag" />
          <View style={styles.newActions}>
            <Button title="Cancelar" onPress={() => { setShowNew(false); setNewName('') }} variant="ghost" />
            <Button title="Criar" onPress={handleCreate} loading={createTag.isPending} />
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.addRow} onPress={() => setShowNew(true)}>
          <Plus size={16} color={colors.accent.primary} />
          <Text style={[styles.addText, { color: colors.accent.primary }]}>Nova tag</Text>
        </TouchableOpacity>
      )}
      <ScrollView style={styles.list}>
        {tags?.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            style={[styles.item, { backgroundColor: selectedIds.includes(tag.id) ? colors.accent.primaryLight : 'transparent' }]}
            onPress={() => onSelect(tag.id)}
          >
            <Text style={[styles.itemText, { color: colors.text.primary }]}>{tag.name}</Text>
            {selectedIds.includes(tag.id) && <Text style={[styles.selectedMark, { color: colors.accent.primary }]}>✓</Text>}
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
