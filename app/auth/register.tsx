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

export default function RegisterScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { signUp, signInWithGoogle, signInWithFacebook } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  async function handleRegister() {
    if (!name || !email || !password) { setError('Preencha todos os campos'); return }
    if (password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres'); return }
    setLoading(true); setError('')
    try {
      const data = await signUp(email, password, name)
      if (data?.session) {
        router.replace('/(tabs)')
      } else {
        // Email confirmation required
        setEmailSent(true)
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao criar conta') } finally { setLoading(false) }
  }

  async function handleGoogle() {
    setSocialLoading('google')
    try {
      const result = await signInWithGoogle()
      if (result) router.replace('/(tabs)')
    } catch (e) { Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao entrar com Google') } finally { setSocialLoading(null) }
  }

  async function handleFacebook() {
    setSocialLoading('facebook')
    try {
      const result = await signInWithFacebook()
      if (result) router.replace('/(tabs)')
    } catch (e) { Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao entrar com Facebook') } finally { setSocialLoading(null) }
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.xl }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Criar conta</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{emailSent ? 'Confirme seu email' : 'Comece sua biblioteca espiritual'}</Text>
      </View>

      {emailSent ? (
        <View style={styles.emailSentContainer}>
          <Text style={[styles.emailSentText, { color: colors.text.secondary }]}>
            Enviamos um email de confirmação para <Text style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>{email}</Text>.
            {'\n\n'}Verifique sua caixa de entrada e clique no link para ativar sua conta.
          </Text>
          <Button title="Voltar ao login" onPress={() => router.push('/auth/login')} />
        </View>
      ) : (<>
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
        <Input label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Senha" value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" secureTextEntry />
        <Button title="Criar conta" onPress={handleRegister} loading={loading} disabled={loading} />
      </View>
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text.secondary }]}>Já tem conta?</Text>
        <Button title="Entrar" onPress={() => router.push('/auth/login')} variant="ghost" />
      </View>
      </>)}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing['2xl'], gap: spacing.sm },
  title: { fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold },
  subtitle: { fontSize: typography.fontSize.base },
  socialSection: { gap: spacing.sm, marginBottom: spacing.lg },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: typography.fontSize.sm },
  form: { gap: spacing.md },
  error: { fontSize: typography.fontSize.sm, textAlign: 'center' },
  footer: { alignItems: 'center', marginTop: spacing['2xl'], gap: spacing.xs },
  footerText: { fontSize: typography.fontSize.sm },
  emailSentContainer: { gap: spacing.lg, alignItems: 'center', paddingHorizontal: spacing.md },
  emailSentText: { fontSize: typography.fontSize.base, textAlign: 'center', lineHeight: 24 },
})
