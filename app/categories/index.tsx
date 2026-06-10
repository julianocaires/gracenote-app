import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing, borderRadius } from '../../shared/design/spacing'
import { Button, Input, Modal, EmptyState, LoadingScreen } from '../../shared/components'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../features/categories/hooks/useCategories'

export default function CategoriesScreen() {
  const { colors } = useTheme()
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('')

  function openCreate() { setEditingId(null); setName(''); setColor(''); setShowModal(true) }
  function openEdit(cat: { id: string; name: string; color?: string | null }) { setEditingId(cat.id); setName(cat.name); setColor(cat.color ?? ''); setShowModal(true) }
  async function handleSave() {
    if (!name.trim()) return
    try {
      if (editingId) { await updateCategory.mutateAsync({ id: editingId, name: name.trim(), color: color || undefined }) }
      else { await createCategory.mutateAsync({ name: name.trim(), color: color || undefined }) }
      setShowModal(false)
    } catch { Alert.alert('Erro', 'Não foi possível salvar') }
  }
  async function handleDelete(id: string) {
    Alert.alert('Excluir', 'Tem certeza?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: () => deleteCategory.mutateAsync(id) }])
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}><Button title="Voltar" onPress={() => router.back()} variant="ghost" /><Text style={[styles.title, { color: colors.text.primary }]}>Categorias</Text><Button title="Nova" onPress={openCreate} variant="ghost" /></View>
      {isLoading ? <LoadingScreen /> : categories && categories.length > 0 ? (
        <FlatList data={categories} keyExtractor={(i) => i.id} renderItem={({ item }) => (
          <View style={[styles.item, { borderBottomColor: colors.border }]}>
            <View style={styles.itemInfo}><View style={[styles.colorDot, { backgroundColor: item.color ?? colors.accent.primary }]} /><Text style={[styles.itemName, { color: colors.text.primary }]}>{item.name}</Text></View>
            <View style={styles.itemActions}><Button title="Editar" onPress={() => openEdit(item)} variant="ghost" /><Button title="Excluir" onPress={() => handleDelete(item.id)} variant="ghost" /></View>
          </View>
        )} contentContainerStyle={styles.list} />
      ) : <EmptyState title="Nenhuma categoria" description="Crie categorias para organizar suas ministrações." />}
      <Modal visible={showModal} onClose={() => setShowModal(false)}>
        <Text style={[styles.modalTitle, { color: colors.text.primary }]}>{editingId ? 'Editar categoria' : 'Nova categoria'}</Text>
        <Input value={name} onChangeText={setName} placeholder="Nome da categoria" label="Nome" />
        <Input value={color} onChangeText={setColor} placeholder="Cor (ex: #6366F1)" label="Cor" />
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
  itemInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  itemName: { fontSize: typography.fontSize.base },
  itemActions: { flexDirection: 'row', gap: spacing.xs },
  modalTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
})
