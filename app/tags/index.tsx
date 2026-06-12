import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing } from '../../shared/design/spacing'
import { Button, Input, Modal, EmptyState, LoadingScreen } from '../../shared/components'
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '../../features/tags/hooks/useTags'

export default function TagsScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { data: tags, isLoading } = useTags()
  const createTag = useCreateTag()
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')

  function openCreate() { setEditingId(null); setName(''); setShowModal(true) }
  function openEdit(tag: { id: string; name: string }) { setEditingId(tag.id); setName(tag.name); setShowModal(true) }
  async function handleSave() {
    if (!name.trim()) return
    try {
      if (editingId) { await updateTag.mutateAsync({ id: editingId, name: name.trim() }) }
      else { await createTag.mutateAsync(name.trim()) }
      setShowModal(false)
    } catch { Alert.alert('Erro', 'Não foi possível salvar') }
  }
  async function handleDelete(id: string) {
    Alert.alert('Excluir', 'Tem certeza?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: () => deleteTag.mutateAsync(id) }])
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}><Button title="Voltar" onPress={() => router.back()} variant="ghost" /><Text style={[styles.title, { color: colors.text.primary }]}>Tags</Text><Button title="Nova" onPress={openCreate} variant="ghost" /></View>
      {isLoading ? <LoadingScreen /> : tags && tags.length > 0 ? (
        <FlatList data={tags} keyExtractor={(i) => i.id} renderItem={({ item }) => (
          <View style={[styles.item, { borderBottomColor: colors.border }]}>
            <Text style={[styles.itemName, { color: colors.text.primary }]}>{item.name}</Text>
            <View style={styles.itemActions}><Button title="Editar" onPress={() => openEdit(item)} variant="ghost" /><Button title="Excluir" onPress={() => handleDelete(item.id)} variant="ghost" /></View>
          </View>
        )} contentContainerStyle={styles.list} />
      ) : <EmptyState title="Nenhuma tag" description="Crie tags para marcar suas ministrações." />}
      <Modal visible={showModal} onClose={() => setShowModal(false)}>
        <Text style={[styles.modalTitle, { color: colors.text.primary }]}>{editingId ? 'Editar tag' : 'Nova tag'}</Text>
        <Input value={name} onChangeText={setName} placeholder="Nome da tag" label="Nome" />
        <View style={styles.modalActions}><Button title="Cancelar" onPress={() => setShowModal(false)} variant="ghost" /><Button title="Salvar" onPress={handleSave} /></View>
      </Modal>
    </View>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  title: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  list: { paddingHorizontal: spacing.md },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1 },
  itemName: { fontSize: typography.fontSize.base },
  itemActions: { flexDirection: 'row', gap: spacing.xs },
  modalTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
})
