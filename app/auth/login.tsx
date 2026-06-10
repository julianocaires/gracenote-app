import { useState } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing } from '../../shared/design/spacing'
import { Button, Input, SocialButton } from '../../shared/components'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { GoogleIcon, FacebookIcon } from '../../shared/components/SocialIcons'

export default function LoginScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) { setError('Preencha email e senha'); return }
    setLoading(true); setError('')
    try { await signIn(email, password); router.replace('/(tabs)') } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao entrar') } finally { setLoading(false) }
  }

  async function handleGoogle() {
    setSocialLoading('google')
    try { await signInWithGoogle(); router.replace('/(tabs)') } catch (e) { Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao entrar com Google') } finally { setSocialLoading(null) }
  }

  async function handleFacebook() {
    setSocialLoading('facebook')
    try { await signInWithFacebook(); router.replace('/(tabs)') } catch (e) { Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao entrar com Facebook') } finally { setSocialLoading(null) }
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>GraceNote</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Sua biblioteca espiritual digital</Text>
      </View>
      <View style={styles.socialSection}>
        <SocialButton title="Continuar com Google" icon={<GoogleIcon size={20} />} onPress={handleGoogle} loading={socialLoading === 'google'} />
        <SocialButton title="Continuar com Facebook" icon={<FacebookIcon size={20} />} onPress={handleFacebook} loading={socialLoading === 'facebook'} />
      </View>
      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.text.tertiary }]}>ou</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>
      <View style={styles.form}>
        {error && <Text style={[styles.error, { color: colors.accent.error }]}>{error}</Text>}
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Senha" value={password} onChangeText={setPassword} placeholder="Sua senha" secureTextEntry />
        <Button title="Entrar" onPress={handleLogin} loading={loading} disabled={loading} />
        <Button title="Esqueceu a senha?" onPress={() => router.push('/auth/forgot-password')} variant="ghost" />
      </View>
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text.secondary }]}>Não tem conta?</Text>
        <Button title="Criar conta" onPress={() => router.push('/auth/register')} variant="ghost" />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing['2xl'], gap: spacing.sm },
  title: { fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold },
  subtitle: { fontSize: typography.fontSize.base },
  socialSection: { gap: spacing.sm, marginBottom: spacing.lg },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: typography.fontSize.sm },
  form: { gap: spacing.md },
  error: { fontSize: typography.fontSize.sm, textAlign: 'center' },
  footer: { alignItems: 'center', marginTop: spacing['2xl'], gap: spacing.xs },
  footerText: { fontSize: typography.fontSize.sm },
})
