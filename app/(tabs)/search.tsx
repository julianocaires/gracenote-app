import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing } from '../../shared/design/spacing'
import { Input, EmptyState, LoadingScreen } from '../../shared/components'
import { SermonCard } from '../../features/sermons/components/SermonCard'
import { useUpdateSermon, useDeleteSermon } from '../../features/sermons/hooks/useSermons'
import { useSearch } from '../../features/library/hooks/useSearch'
import { useCategories } from '../../features/categories/hooks/useCategories'
import { useTags } from '../../features/tags/hooks/useTags'
import { useSearchFilters } from '../../features/library/hooks/useSearchFilters'
import { FilterBar } from '../../features/library/components/FilterBar'
import { ActiveFiltersBar } from '../../features/library/components/ActiveFiltersBar'
import { SortPicker } from '../../features/library/components/SortPicker'
import { PreacherPicker } from '../../features/library/components/PreacherPicker'
import { DateRangePicker } from '../../features/library/components/DateRangePicker'
import { CategoryPicker } from '../../features/categories/components/CategoryPicker'
import { TagPicker } from '../../features/tags/components/TagPicker'
import type { SearchFilters } from '../../features/library/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

export default function SearchScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const updateSermon = useUpdateSermon()
  const { data: categories } = useCategories()
  const { data: tags } = useTags()

  // Filter state
  const {
    filters,
    setQuery,
    toggleCategory,
    toggleTag,
    toggleFavorite,
    setPreacher,
    setDateRange,
    setSort,
    clearFilters,
    clearFilter,
    activeFilters,
    activeFilterCount,
  } = useSearchFilters()

  // Debounced query
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text)
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        setDebouncedQuery(text)
      }, 300)
    },
    [setQuery],
  )

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  // Picker visibility
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [showPreacherPicker, setShowPreacherPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showSortPicker, setShowSortPicker] = useState(false)

  // Build search filters for the query
  const searchFilters: SearchFilters = {
    ...filters,
    query: debouncedQuery || undefined,
  }
  const hasActiveFilters = activeFilterCount > 0
  const { data: results, isLoading } = useSearch(searchFilters)

  const deleteSermon = useDeleteSermon()

  async function handleFav(id: string, cur: boolean) {
    await updateSermon.mutateAsync({ id, data: { is_favorite: !cur } })
  }

  function handleLongPress(item: any) {
    Alert.alert(item.title, '', [
      { text: 'Editar', onPress: () => router.push(`/sermon/edit/${item.id}` as any) },
      { text: 'Apagar', style: 'destructive', onPress: () => confirmDelete(item) },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  function confirmDelete(item: any) {
    Alert.alert('Apagar ministração?', `"${item.title}" será apagada permanentemente.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: async () => {
        try {
          await deleteSermon.mutateAsync(item.id)
        } catch (err) {
          Alert.alert('Erro', 'Não foi possível apagar.')
        }
      }},
    ])
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Buscar</Text>
      </View>

      {/* Search Input */}
      <View style={styles.inputWrapper}>
        <Input
          value={filters.query ?? ''}
          onChangeText={handleQueryChange}
          placeholder="Busque pelo título, conteúdo, pregador..."
        />
      </View>

      {/* Filter Bar */}
      <FilterBar
        activeFilterCount={activeFilterCount}
        hasCategoryFilter={(filters.categoryIds?.length ?? 0) > 0}
        hasTagFilter={(filters.tagIds?.length ?? 0) > 0}
        hasPreacherFilter={!!filters.preacher}
        hasDateFilter={!!filters.dateFrom || !!filters.dateTo}
        hasFavoriteFilter={!!filters.isFavorite}
        onCategoryPress={() => setShowCategoryPicker(true)}
        onTagPress={() => setShowTagPicker(true)}
        onPreacherPress={() => setShowPreacherPicker(true)}
        onDatePress={() => setShowDatePicker(true)}
        onSortPress={() => setShowSortPicker(true)}
        onFavoritePress={toggleFavorite}
      />

      {/* Active Filters */}
      <ActiveFiltersBar
        filters={activeFilters}
        onRemove={clearFilter}
        onClearAll={clearFilters}
      />

      {/* Results — sempre mostra todas as ministrações, afunilando com filtros */}
      {isLoading ? (
        <LoadingScreen />
      ) : results && results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(i: any) => i.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.md }}
          renderItem={({ item }: { item: any }) => (
            <View style={{ marginBottom: spacing.md, flex: 1 }}>
              <SermonCard
                title={item.title}
                subtitle={formatDate(item.created_at)}
                coverUrl={item.cover?.url}
                coverId={item.cover_id}
                isFavorite={item.is_favorite}
                onPress={() => router.push(`/sermon/${item.id}` as any)}
                onFavoritePress={() => handleFav(item.id, item.is_favorite)}
                onLongPress={() => handleLongPress(item)}
              />
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      ) : (
        <EmptyState
          title={hasActiveFilters ? 'Nenhum resultado encontrado' : 'Nenhuma ministração ainda'}
          description={hasActiveFilters ? 'Tente ajustar os filtros ou buscar por outro termo.' : 'Crie sua primeira ministração para começar.'}
        />
      )}

      {/* Picker Modals */}
      <CategoryPicker
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        selectedIds={filters.categoryIds ?? []}
        onSelect={(id) => {
          const name = categories?.find((c) => c.id === id)?.name ?? id
          toggleCategory(id, name)
        }}
      />
      <TagPicker
        visible={showTagPicker}
        onClose={() => setShowTagPicker(false)}
        selectedIds={filters.tagIds ?? []}
        onSelect={(id) => {
          const name = tags?.find((t) => t.id === id)?.name ?? id
          toggleTag(id, name)
        }}
      />
      <PreacherPicker
        visible={showPreacherPicker}
        onClose={() => setShowPreacherPicker(false)}
        selectedPreacher={filters.preacher}
        onSelect={setPreacher}
      />
      <DateRangePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        dateFrom={filters.dateFrom ?? null}
        dateTo={filters.dateTo ?? null}
        onSelect={setDateRange}
      />
      <SortPicker
        visible={showSortPicker}
        onClose={() => setShowSortPicker(false)}
        currentSort={{
          sortBy: filters.sortBy ?? 'created_at',
          sortOrder: filters.sortOrder ?? 'desc',
        }}
        onSelect={setSort}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold },
  inputWrapper: { paddingHorizontal: spacing.md, paddingBottom: spacing.xs },
  list: { padding: spacing.md },
})
