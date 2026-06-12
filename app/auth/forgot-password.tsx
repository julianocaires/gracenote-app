import { useState } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing } from '../../shared/design/spacing'
import { Button, Input } from '../../shared/components'
import { useAuth } from '../../features/auth/hooks/useAuth'

export default function ForgotPasswordScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState(''); const [loading, setLoading] = useState(false); const [sent, setSent] = useState(false); const [error, setError] = useState('')
  async function handleReset() {
    if (!email) { setError('Informe seu email'); return }
    setLoading(true); setError('')
    try { await resetPassword(email); setSent(true) } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao enviar email') } finally { setLoading(false) }
  }
  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Recuperar senha</Text>
      {sent ? (
        <View style={styles.sentContainer}><Text style={[styles.sentText, { color: colors.text.secondary }]}>Email enviado! Verifique sua caixa de entrada.</Text><Button title="Voltar ao login" onPress={() => router.push('/auth/login')} /></View>
      ) : (
        <View style={styles.form}>
          {error && <Text style={[styles.error, { color: colors.accent.error }]}>{error}</Text>}
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Button title="Enviar email de recuperação" onPress={handleReset} loading={loading} disabled={loading} />
          <Button title="Voltar" onPress={() => router.back()} variant="ghost" />
        </View>
      )}
    </KeyboardAvoidingView>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center', gap: spacing.lg }, title: { fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, textAlign: 'center' },
  form: { gap: spacing.md }, error: { fontSize: typography.fontSize.sm, textAlign: 'center' },
  sentContainer: { gap: spacing.lg, alignItems: 'center' }, sentText: { fontSize: typography.fontSize.base, textAlign: 'center', lineHeight: 24 },
})
