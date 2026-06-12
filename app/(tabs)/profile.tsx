import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import Constants from 'expo-constants'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing, borderRadius } from '../../shared/design/spacing'
import { Button } from '../../shared/components'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { profileService } from '../../features/profile/services/profile.service'
import { authService } from '../../features/auth/services/auth.service'
import { useThemeStore } from '../../shared/hooks/useThemeStore'
import { useEntitlements } from '../../features/premium/hooks/useEntitlements'
import { Crown, Settings, Shield, LogOut, ChevronRight, Camera, User } from 'lucide-react-native'
import type { ThemeMode } from '../../shared/hooks/useThemeStore'

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0'

export default function ProfileScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const session = useAuthStore((s) => s.session)
  const { mode, setMode } = useThemeStore()
  const { isPremium, expiresAt } = useEntitlements()
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const isLoggedIn = !!session?.user?.id

  useEffect(() => {
    if (!session?.user?.id) { setLoading(false); return }
    const user = session.user
    setAvatarUrl(user.user_metadata?.avatar_url ?? null)
    profileService.getProfile(session.user.id).then((p) => {
      setName(p.name)
      if (p.avatar_url) setAvatarUrl(p.avatar_url)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [session])

  async function handleAvatarPick() {
    if (!session?.user.id) return
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 })
    if (result.canceled) return
    const uri = result.assets[0].uri
    try {
      const url = await profileService.uploadAvatar(session.user.id, uri)
      await profileService.updateProfile(session.user.id, { avatar_url: url })
      setAvatarUrl(url)
      Alert.alert('Pronto!', 'Foto atualizada.')
    } catch { Alert.alert('Erro', 'Não foi possível atualizar a foto') }
  }

  async function handleThemeChange(newMode: ThemeMode) {
    setMode(newMode)
    if (!session?.user.id) return
    try { await profileService.updateProfile(session.user.id, { theme: newMode }) } catch {}
  }

  async function handleLogout() {
    await authService.signOut()
  }

  const themeOptions: { label: string; value: ThemeMode }[] = [
    { label: 'Claro', value: 'light' }, { label: 'Escuro', value: 'dark' }, { label: 'Sistema', value: 'system' },
  ]

  if (loading) return <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]} />

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing['4xl'] }]}>
      {isLoggedIn ? (
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarPick} style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={[styles.avatar, { borderColor: colors.border }]} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.skeleton, borderColor: colors.border }]}>
                <User size={32} color={colors.text.tertiary} />
              </View>
            )}
            <View style={[styles.cameraBadge, { backgroundColor: colors.accent.primary }]}>
              <Camera size={12} color={colors.text.inverse} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.name, { color: colors.text.primary }]}>{name || 'Sem nome'}</Text>
          <Text style={[styles.email, { color: colors.text.tertiary }]}>{session?.user.email}</Text>
          <View style={[styles.badge, { backgroundColor: isPremium ? colors.accent.warning + '20' : colors.skeleton, borderColor: isPremium ? colors.accent.warning + '40' : colors.border }]}>
            <Crown size={14} color={isPremium ? colors.accent.warning : colors.text.tertiary} />
            <Text style={[styles.badgeText, { color: isPremium ? colors.accent.warning : colors.text.secondary }]}>
              {isPremium ? `Premium${expiresAt ? ` · até ${new Date(expiresAt).toLocaleDateString('pt-BR')}` : ''}` : 'Free'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.connectSection}>
          <User size={40} color={colors.text.tertiary} />
          <Text style={[styles.connectTitle, { color: colors.text.primary }]}>Você não está conectado</Text>
          <Text style={[styles.connectDesc, { color: colors.text.secondary }]}>Crie uma conta gratuita para sincronizar suas ministrações entre dispositivos e nunca perder seu progresso.</Text>
          <Button title="Criar conta" onPress={() => router.push('/auth/register' as any)} />
          <Button title="Já tenho conta" onPress={() => router.push('/auth/login' as any)} variant="ghost" />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Tema</Text>
        <View style={styles.themeRow}>{themeOptions.map((opt) => (
          <View key={opt.value} style={[styles.themeOption, { backgroundColor: mode === opt.value ? colors.accent.primaryLight : colors.surface, borderColor: mode === opt.value ? colors.accent.primary : colors.border }]}>
            <Button title={opt.label} onPress={() => handleThemeChange(opt.value)} variant={mode === opt.value ? 'primary' : 'ghost'} />
          </View>
        ))}</View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Aplicativo</Text>
        <MenuRow icon={Settings} label="Configurações" onPress={() => router.push('/settings' as any)} colors={colors} />
        <MenuRow icon={Shield} label="Política de Privacidade" onPress={() => router.push('/settings/privacy' as any)} colors={colors} />
      </View>

      {isLoggedIn && (
        <View style={styles.section}>
          <MenuRow icon={LogOut} label="Sair" onPress={handleLogout} colors={colors} danger />
        </View>
      )}

      <Text style={[styles.version, { color: colors.text.tertiary, paddingBottom: insets.bottom }]}>GraceNote v{APP_VERSION}</Text>
    </ScrollView>
  )
}

function MenuRow({ icon: Icon, label, onPress, colors, danger }: { icon: any; label: string; onPress: () => void; colors: any; danger?: boolean }) {
  return (
    <TouchableOpacity style={[styles.menuRow, { borderBottomColor: colors.border }]} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.menuLeft}>
        <Icon size={18} stroke={danger ? colors.accent.error : colors.text.secondary} />
        <Text style={[styles.menuLabel, { color: danger ? colors.accent.error : colors.text.primary }]}>{label}</Text>
      </View>
      <ChevronRight size={16} color={colors.text.tertiary} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing['2xl'] },
  connectSection: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  connectTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
  connectDesc: { fontSize: typography.fontSize.sm, textAlign: 'center', lineHeight: 20 },
  avatarSection: { alignItems: 'center', gap: spacing.sm },
  avatarWrap: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
  email: { fontSize: typography.fontSize.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm + 4, paddingVertical: spacing.xs, borderRadius: borderRadius.full, borderWidth: 1 },
  badgeText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium },
  section: { gap: spacing.md },
  sectionTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, textTransform: 'uppercase', letterSpacing: 1 },
  themeRow: { flexDirection: 'row', gap: spacing.sm },
  themeOption: { flex: 1, borderRadius: borderRadius.md, borderWidth: 1, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuLabel: { fontSize: typography.fontSize.base },
  version: { fontSize: typography.fontSize.xs, textAlign: 'center' },
})
