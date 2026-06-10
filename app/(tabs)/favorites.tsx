import { View, Text, StyleSheet, FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing } from '../../shared/design/spacing'
import { EmptyState, LoadingScreen } from '../../shared/components'
import { SermonCard } from '../../features/sermons/components/SermonCard'
import { useFavorites } from '../../features/library/hooks/useSearch'
import { useUpdateSermon } from '../../features/sermons/hooks/useSermons'

export default function FavoritesScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { data: favs, isLoading } = useFavorites()
  const updateSermon = useUpdateSermon()

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}><Text style={[styles.title, { color: colors.text.primary }]}>Favoritos</Text></View>
      {isLoading ? <LoadingScreen /> : favs && favs.length > 0 ? (
        <FlatList data={favs} keyExtractor={(i: any) => i.id} renderItem={({ item }: { item: any }) => (
          <SermonCard title={item.title} subtitle={new Date(item.created_at).toLocaleDateString('pt-BR')} isFavorite={true} onPress={() => router.push(`/sermon/${item.id}` as any)} onFavoritePress={() => updateSermon.mutateAsync({ id: item.id, data: { is_favorite: false } })} />
        )} contentContainerStyle={styles.list} ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />} />
      ) : <EmptyState title="Nenhum favorito ainda" description="Favorite ministrações para encontrá-las rapidamente aqui." />}
    </View>
  )
}
const styles = StyleSheet.create({ container: { flex: 1 }, header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }, title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }, list: { padding: spacing.md } })
