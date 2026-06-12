import { View, Text, StyleSheet, ScrollView, Alert, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing, borderRadius } from '../../shared/design/spacing'
import { Button, LoadingScreen, Chip } from '../../shared/components'
import { useSermonDetail, useDeleteSermon, useUpdateSermon } from '../../features/sermons/hooks/useSermons'
import { Calendar, User, BookOpen } from 'lucide-react-native'

export default function SermonDetailScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: sermon, isLoading } = useSermonDetail(id!)
  const del = useDeleteSermon()
  const upd = useUpdateSermon()

  async function handleDelete() {
    Alert.alert('Excluir', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => { await del.mutateAsync(id!); router.back() } },
    ])
  }

  if (isLoading) return <View style={[styles.container, { backgroundColor: colors.background }]}><LoadingScreen /></View>
  if (!sermon) return <View style={[styles.container, { backgroundColor: colors.background }]}><Text style={{ color: colors.text.secondary }}>Não encontrada</Text></View>

  const date = new Date(sermon.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.header}>
        <Button title="Voltar" onPress={() => router.back()} variant="ghost" />
        <View style={styles.headerActions}>
          <Button title="Editar" onPress={() => router.push(`/sermon/edit/${id}` as any)} variant="ghost" />
          <Button title="Excluir" onPress={handleDelete} variant="ghost" />
        </View>
      </View>

      <View style={styles.meta}>
        <View style={styles.metaRow}>
          <Calendar size={14} color={colors.text.tertiary} />
          <Text style={[styles.metaText, { color: colors.text.tertiary }]}>{date}</Text>
        </View>
        {(sermon as any).preacher && (
          <View style={styles.metaRow}>
            <User size={14} color={colors.text.tertiary} />
            <Text style={[styles.metaText, { color: colors.text.secondary }]}>{(sermon as any).preacher}</Text>
          </View>
        )}
      </View>

      {/* Categories */}
      {(sermon as any).categories?.length > 0 && (
        <View style={styles.chipRow}>
          {(sermon as any).categories.map((c: any) => (
            <Chip key={c.category.id} label={c.category.name} variant="selected" />
          ))}
        </View>
      )}

      {/* Tags */}
      {(sermon as any).tags?.length > 0 && (
        <View style={styles.chipRow}>
          {(sermon as any).tags.map((t: any) => (
            <Chip key={t.tag.id} label={t.tag.name} variant="default" />
          ))}
        </View>
      )}

      <Text style={[styles.title, { color: colors.text.primary }]}>{sermon.title}</Text>
      <Text style={[styles.body, { color: colors.text.primary }]}>{sermon.plain_text || ''}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing['4xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  headerActions: { flexDirection: 'row', gap: spacing.xs },
  meta: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { fontSize: typography.fontSize.sm },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold },
  body: { fontSize: typography.fontSize.base, lineHeight: typography.fontSize.base * 1.5 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
})
