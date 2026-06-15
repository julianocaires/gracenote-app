import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing, borderRadius } from '../../shared/design/spacing'
import { LoadingScreen, EmptyState, Button } from '../../shared/components'
import { MiniSermonCard } from '../../features/sermons/components/MiniSermonCard'
import { SermonCard } from '../../features/sermons/components/SermonCard'
import { useDashboardData, useUpdateSermon } from '../../features/sermons/hooks/useSermons'
import { useCategories } from '../../features/categories/hooks/useCategories'
import { BookOpen, BarChart3, Clock, Sparkles, CloudOff } from 'lucide-react-native'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { text: 'Bom dia', icon: '☀️' }
  if (h < 18) return { text: 'Boa tarde', icon: '🌤️' }
  return { text: 'Boa noite', icon: '🌙' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

export default function HomeScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { recentSermons, continueReading, onThisDay, stats, profile, isLoading, isOnline } = useDashboardData()
  const { data: categories } = useCategories()
  const updateSermon = useUpdateSermon()
  const greeting = getGreeting()

  async function handleFav(id: string, cur: boolean) {
    await updateSermon.mutateAsync({ id, data: { is_favorite: !cur } })
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing['4xl'] }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => {}} tintColor={colors.accent.primary} />}
    >
      <View style={styles.greetingRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.text.primary }]}>
            {greeting.text}{profile?.name ? `, ${profile.name}` : ''} {greeting.icon}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {stats.sermonCount} {stats.sermonCount !== 1 ? 'ministrações' : 'ministração'} registrada{stats.sermonCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push('/(tabs)/search' as any)}
        >
          <Text style={[styles.searchText, { color: colors.text.tertiary }]}>O que deseja encontrar?</Text>
        </TouchableOpacity>
      </View>

      {!isOnline && (
        <TouchableOpacity style={[styles.offlineBanner, { backgroundColor: colors.accent.warning + '15', borderColor: colors.accent.warning + '30' }]} onPress={() => router.push('/(tabs)/profile' as any)}>
          <CloudOff size={14} color={colors.accent.warning} />
          <Text style={[styles.offlineBannerText, { color: colors.accent.warning }]}>Dados salvos apenas localmente. Conecte-se para sincronizar.</Text>
        </TouchableOpacity>
      )}

      {onThisDay.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={16} color={colors.accent.warning} />
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Neste dia</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {onThisDay.map((s: any) => (
              <MiniSermonCard
                key={s.id}
                title={s.title}
                date={`Há ${new Date().getFullYear() - new Date(s.created_at).getFullYear()} anos`}
                coverUrl={s.cover?.url}
                coverId={s.cover_id}
                onPress={() => router.push(`/sermon/${s.id}` as any)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {recentSermons.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpen size={16} color={colors.accent.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Últimas ministrações</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {recentSermons.map((s: any) => (
              <MiniSermonCard key={s.id} title={s.title} date={formatDate(s.created_at)} coverUrl={s.cover?.url} coverId={s.cover_id} onPress={() => router.push(`/sermon/${s.id}` as any)} />
            ))}
          </ScrollView>
        </View>
      ) : (
        <EmptyState
          icon={<Sparkles size={48} stroke={colors.accent.primary} />}
          title="Sua biblioteca está vazia"
          description="Comece registrando sua primeira ministração."
        />
      )}

      {continueReading && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={16} color={colors.accent.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Continuar lendo</Text>
          </View>
          <SermonCard
            title={continueReading.title}
            subtitle={formatDate(continueReading.created_at)}
            coverUrl={continueReading.cover?.url}
            coverId={continueReading.cover_id}
            isFavorite={continueReading.is_favorite}
            onPress={() => router.push(`/sermon/${continueReading.id}` as any)}
            onFavoritePress={() => handleFav(continueReading.id, continueReading.is_favorite)}
          />
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <BarChart3 size={16} color={colors.accent.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Estatísticas</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.accent.primary }]}>{stats.sermonCount}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Ministrações</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.accent.secondary }]}>{categories?.length ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Categorias</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.accent.success }]}>{stats.preacherCount}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Pregadores</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'], gap: spacing['2xl'] },
  greetingRow: { gap: spacing.md },
  greeting: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold },
  subtitle: { fontSize: typography.fontSize.sm, marginTop: 2 },
  searchBtn: { borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4 },
  searchText: { fontSize: typography.fontSize.base },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
  horizontalList: { gap: spacing.sm, paddingRight: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, borderRadius: borderRadius.md, borderWidth: 1, padding: spacing.md, alignItems: 'center', gap: spacing.xs },
  statNumber: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold },
  statLabel: { fontSize: typography.fontSize.xs, textAlign: 'center' },
  offlineBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm + 4, borderRadius: borderRadius.md, borderWidth: 1 },
  offlineBannerText: { fontSize: typography.fontSize.xs, flex: 1 },
})
