import { useState, useEffect, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Image, Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing, borderRadius } from '../../shared/design/spacing'
import { Button, Input } from '../../shared/components'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { profileService } from '../../features/profile/services/profile.service'
import { authService } from '../../features/auth/services/auth.service'
import { useThemeStore } from '../../shared/hooks/useThemeStore'
import { GoogleIcon, FacebookIcon } from '../../shared/components/SocialIcons'
import { notificationsService, hasNotificationPermission } from '../../features/notifications/services/notifications.service'
import { Bell, Globe, Database, ChevronRight, Camera, User, Link as LinkIcon, Sun, Moon, Monitor } from 'lucide-react-native'
import type { ThemeMode } from '../../shared/hooks/useThemeStore'

export default function SettingsScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const session = useAuthStore((s) => s.session)
  const { mode, setMode } = useThemeStore()
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermissionOk, setNotificationPermissionOk] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)

  const [linking, setLinking] = useState<string | null>(null)

  const isLoggedIn = !!session?.user?.id

  const linkedProviders = useMemo(() => authService.getLinkedProviders(session), [session])

  useEffect(() => {
    if (!isLoggedIn) return
    profileService.getProfile(session!.user.id).then((p) => {
      setName(p.name)
      if (p.avatar_url) setAvatarUrl(p.avatar_url)
      setNotificationsEnabled(p.notifications_enabled ?? true)
    }).catch(() => {})
    hasNotificationPermission().then(setNotificationPermissionOk)
  }, [session])

  async function handleLink(provider: 'google' | 'facebook') {
    setLinking(provider)
    try {
      await authService.linkIdentity(provider)
    } catch (err: any) {
      Alert.alert('Erro', err?.message || `Não foi possível vincular ${provider}`)
    } finally {
      setLinking(null)
    }
  }

  function handleUnlink(provider: 'google' | 'facebook') {
    const identity = session?.user?.identities?.find((i: any) => i.provider === provider)
    if (!identity) return
    Alert.alert(
      `Desvincular ${provider === 'google' ? 'Google' : 'Facebook'}`,
      'Você poderá vincular novamente depois.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desvincular',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.unlinkIdentity(identity as any)
            } catch (err: any) {
              Alert.alert('Erro', err?.message || 'Não foi possível desvincular')
            }
          },
        },
      ],
    )
  }

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

  async function handleSaveName() {
    if (!session?.user.id || !name.trim()) return
    setSaving(true)
    try {
      await profileService.updateProfile(session.user.id, { name: name.trim() })
      Alert.alert('Salvo!', 'Nome atualizado.')
    } catch { Alert.alert('Erro', 'Não foi possível salvar') } finally { setSaving(false) }
  }

  async function handleNotificationToggle(v: boolean) {
    if (v && !notificationPermissionOk) {
      Alert.alert('Permissão necessária', 'Ative as notificações nos Ajustes do seu dispositivo.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
      ])
      return
    }
    setNotificationsEnabled(v)
    if (session?.user.id) {
      profileService.updateProfile(session.user.id, { notifications_enabled: v }).catch(() => {})
      if (v) {
        notificationsService.scheduleAll(session.user.id)
      } else {
        notificationsService.cancelAll()
      }
    }
  }

  function handleThemeChange(newMode: ThemeMode) {
    setMode(newMode)
    if (session?.user.id) {
      profileService.updateProfile(session.user.id, { theme: newMode }).catch(() => {})
    }
  }

  const themeModes: { label: string; value: ThemeMode; icon: any }[] = [
    { label: 'Claro', value: 'light', icon: Sun },
    { label: 'Escuro', value: 'dark', icon: Moon },
    { label: 'Sistema', value: 'system', icon: Monitor },
  ]

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing['4xl'] }]}>
      <View style={styles.header}>
        <Button title="Voltar" onPress={() => router.back()} variant="ghost" />
        <Text style={[styles.title, { color: colors.text.primary }]}>Configurações</Text>
      </View>

      {/* Profile section — only visible when logged in */}
      {isLoggedIn && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Perfil</Text>
          <TouchableOpacity onPress={handleAvatarPick} style={styles.avatarRow}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={[styles.avatar, { borderColor: colors.border }]} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.skeleton, borderColor: colors.border }]}>
                <User size={24} color={colors.text.tertiary} />
              </View>
            )}
            <View style={[styles.cameraBadge, { backgroundColor: colors.accent.primary }]}>
              <Camera size={10} color={colors.text.inverse} />
            </View>
          </TouchableOpacity>
          <Input label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
          <Button title="Salvar" onPress={handleSaveName} loading={saving} disabled={saving} />
        </View>
      )}

      {/* Linked accounts section — only visible when logged in */}
      {isLoggedIn && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Contas vinculadas</Text>
          <ProviderRow
            icon={<GoogleIcon size={20} />}
            label="Google"
            connected={linkedProviders.includes('google')}
            loading={linking === 'google'}
            onConnect={() => handleLink('google')}
            onDisconnect={() => handleUnlink('google')}
            colors={colors}
          />
          <ProviderRow
            icon={<FacebookIcon size={20} />}
            label="Facebook"
            connected={linkedProviders.includes('facebook')}
            loading={linking === 'facebook'}
            onConnect={() => handleLink('facebook')}
            onDisconnect={() => handleUnlink('facebook')}
            colors={colors}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Aparência</Text>
        <SettingRow icon={Globe} label="Idioma" value="Português" onPress={() => {}} colors={colors} />
        <View style={[styles.themeRow, { borderBottomColor: colors.border }]}>
          {themeModes.map((opt) => {
            const active = mode === opt.value
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.themeOption, { backgroundColor: active ? colors.accent.primaryLight : colors.surface, borderColor: active ? colors.accent.primary : colors.border }]}
                onPress={() => handleThemeChange(opt.value)}
                activeOpacity={0.7}
              >
                <opt.icon size={16} color={active ? colors.accent.primary : colors.text.tertiary} />
                <Text style={[styles.themeLabel, { color: active ? colors.accent.primary : colors.text.secondary, fontWeight: active ? typography.fontWeight.semibold : typography.fontWeight.regular }]}>{opt.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Notificações</Text>
        <ToggleRow icon={Bell} label="Notificações" value={notificationsEnabled} onToggle={handleNotificationToggle} colors={colors} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Dados</Text>
        <ToggleRow icon={Database} label="Backup automático" value={autoBackup} onToggle={setAutoBackup} colors={colors} />
      </View>
    </ScrollView>
  )
}

function SettingRow({ icon: Icon, label, value, onPress, colors }: { icon: any; label: string; value: string; onPress: () => void; colors: any }) {
  return (
    <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.rowLeft}>
        <Icon size={18} color={colors.text.secondary} />
        <Text style={[styles.rowLabel, { color: colors.text.primary }]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowValue, { color: colors.text.tertiary }]}>{value}</Text>
        <ChevronRight size={14} color={colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  )
}

function ToggleRow({ icon: Icon, label, value, onToggle, colors }: { icon: any; label: string; value: boolean; onToggle: (v: boolean) => void; colors: any }) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rowLeft}>
        <Icon size={18} color={colors.text.secondary} />
        <Text style={[styles.rowLabel, { color: colors.text.primary }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.accent.primaryLight }}
        thumbColor={value ? colors.accent.primary : colors.text.tertiary}
      />
    </View>
  )
}

function ProviderRow({ icon, label, connected, loading, onConnect, onDisconnect, colors }: {
  icon: React.ReactNode
  label: string
  connected: boolean
  loading: boolean
  onConnect: () => void
  onDisconnect: () => void
  colors: any
}) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rowLeft}>
        {icon}
        <Text style={[styles.rowLabel, { color: colors.text.primary }]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {loading ? (
          <Text style={[styles.rowValue, { color: colors.text.tertiary }]}>Vinculando...</Text>
        ) : connected ? (
          <TouchableOpacity onPress={onDisconnect} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.connectedBadge, { color: colors.accent.success }]}>Conectado</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onConnect} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.connectBtn, { color: colors.accent.primary }]}>Conectar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing['2xl'], paddingBottom: spacing['4xl'] },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.md },
  title: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, textTransform: 'uppercase', letterSpacing: 1, paddingLeft: spacing.xs },
  avatarRow: { position: 'relative', alignSelf: 'center', marginBottom: spacing.sm },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2 },
  avatarPlaceholder: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowLabel: { fontSize: typography.fontSize.base },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rowValue: { fontSize: typography.fontSize.sm },
  connectedBadge: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium },
  connectBtn: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
  themeRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  themeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderRadius: borderRadius.md, borderWidth: 1, paddingVertical: spacing.sm + 2 },
  themeLabel: { fontSize: typography.fontSize.xs },
})
