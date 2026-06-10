import { useState } from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing } from '../../shared/design/spacing'
import { Input, EmptyState } from '../../shared/components'
import { SermonCard } from '../../features/sermons/components/SermonCard'
import { useSearch } from '../../features/library/hooks/useSearch'
import { useUpdateSermon } from '../../features/sermons/hooks/useSermons'

export default function SearchScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')
  const { data: results } = useSearch(query)
  const updateSermon = useUpdateSermon()
  async function handleFav(id: string, cur: boolean) { await updateSermon.mutateAsync({ id, data: { is_favorite: !cur } }) }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}><Text style={[styles.title, { color: colors.text.primary }]}>Buscar</Text></View>
      <View style={styles.inputWrapper}><Input value={query} onChangeText={setQuery} placeholder="Buscar ministrações..." /></View>
      {query.length < 2 ? <EmptyState title="Digite para buscar" description="Busque pelo título ou conteúdo das ministrações." />
      : results && results.length > 0 ? (
        <FlatList data={results} keyExtractor={(i: any) => i.id} renderItem={({ item }: { item: any }) => (
          <SermonCard title={item.title} subtitle={new Date(item.created_at).toLocaleDateString('pt-BR')} isFavorite={item.is_favorite} onPress={() => router.push(`/sermon/${item.id}` as any)} onFavoritePress={() => handleFav(item.id, item.is_favorite)} />
        )} contentContainerStyle={styles.list} ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />} />
      ) : <EmptyState title="Nenhum resultado" description="Tente buscar por outro termo." />}
    </View>
  )
}
const styles = StyleSheet.create({ container: { flex: 1 }, header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }, title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }, inputWrapper: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm }, list: { padding: spacing.md } })
