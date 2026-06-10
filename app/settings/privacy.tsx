import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing } from '../../shared/design/spacing'
import { Button } from '../../shared/components'

export default function PrivacyScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing['4xl'] }]}>
      <View style={styles.header}>
        <Button title="Voltar" onPress={() => router.back()} variant="ghost" />
        <Text style={[styles.title, { color: colors.text.primary }]}>Política de Privacidade</Text>
      </View>
      <Text style={[styles.text, { color: colors.text.secondary }]}>
        O GraceNote respeita sua privacidade. Todas as informações armazenadas no aplicativo são de propriedade exclusiva do usuário.
        {'\n\n'}
        Coletamos apenas os dados necessários para o funcionamento do aplicativo: nome, e-mail e conteúdo das ministrações registradas.
        {'\n\n'}
        Seus dados não são compartilhados com terceiros sem seu consentimento explícito.
        {'\n\n'}
        O GraceNote utiliza serviços de armazenamento em nuvem (Supabase) para sincronização e backup dos dados.
        {'\n\n'}
        Para mais informações, entre em contato através do nosso suporte.
      </Text>
      <Text style={[styles.updated, { color: colors.text.tertiary }]}>Última atualização: Junho de 2026</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing['4xl'] },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.md },
  title: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
  text: { fontSize: typography.fontSize.base, lineHeight: 24 },
  updated: { fontSize: typography.fontSize.xs, textAlign: 'center' },
})
