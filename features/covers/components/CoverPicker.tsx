import { useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { Button, Modal } from '../../../shared/components'
import { useEntitlements } from '../../../features/premium/hooks/useEntitlements'
import { useAuthStore } from '../../../features/auth/store/auth.store'
import { coversService } from '../services/covers.service'
import { Image as ImageIcon, Camera, Palette, Crown } from 'lucide-react-native'
import { BUILTIN_COVER_IDS, BUILTIN_COVER_GRADIENTS, getBuiltinCoverGradient } from '../constants'
import type { Cover } from '../../../shared/types'

const BUILTIN_COVERS: Cover[] = [
  { id: BUILTIN_COVER_IDS.COVER_1, url: '', is_premium: false, is_builtin: true, user_id: null, created_at: '' },
  { id: BUILTIN_COVER_IDS.COVER_2, url: '', is_premium: false, is_builtin: true, user_id: null, created_at: '' },
  { id: BUILTIN_COVER_IDS.COVER_3, url: '', is_premium: false, is_builtin: true, user_id: null, created_at: '' },
  { id: BUILTIN_COVER_IDS.COVER_4, url: '', is_premium: true,  is_builtin: true, user_id: null, created_at: '' },
  { id: BUILTIN_COVER_IDS.COVER_5, url: '', is_premium: true,  is_builtin: true, user_id: null, created_at: '' },
  { id: BUILTIN_COVER_IDS.COVER_6, url: '', is_premium: true,  is_builtin: true, user_id: null, created_at: '' },
]

interface CoverPickerProps { visible: boolean; onClose: () => void; selectedCover: Cover | null; onSelect: (cover: Cover | null) => void }

export function CoverPicker({ visible, onClose, selectedCover, onSelect }: CoverPickerProps) {
  const { colors } = useTheme()
  const { isPremium } = useEntitlements()
  const userId = useAuthStore((s) => s.session?.user?.id)
  const [uploading, setUploading] = useState(false)

  async function handleCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar uma foto.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [3, 2], quality: 0.8 })
    if (result.canceled) return
    await uploadAndSelect(result.assets[0].uri)
  }

  async function handleGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar uma foto.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [3, 2], quality: 0.8 })
    if (result.canceled) return
    await uploadAndSelect(result.assets[0].uri)
  }

  async function uploadAndSelect(uri: string) {
    if (!userId) {
      Alert.alert('Offline', 'Conecte-se à internet para enviar imagens.')
      return
    }
    setUploading(true)
    try {
      const cover = await coversService.uploadFromDevice(userId, uri)
      onSelect(cover)
      onClose()
    } catch (e: any) {
      console.error('[CoverPicker] Upload error:', e?.message, JSON.stringify(e))
      Alert.alert('Erro', e?.message || 'Não foi possível enviar a imagem. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  function handleTabPress(newTab: 'modelos' | 'camera' | 'galeria') {
    if (newTab === 'camera') handleCamera()
    else if (newTab === 'galeria') handleGallery()
  }

  function renderGradient(id: string) {
    const gradient = getBuiltinCoverGradient(id)
    if (!gradient) {
      return <View style={[styles.coverPreview, { backgroundColor: colors.skeleton }]} />
    }
    return (
      <View style={styles.gradient}>
        <View style={[styles.gradientHalf, { backgroundColor: gradient[0] }]} />
        <View style={[styles.gradientHalf, { backgroundColor: gradient[1] }]} />
      </View>
    )
  }

  return (
    <Modal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Capa</Text>
      <View style={styles.tabsBar}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => handleTabPress('camera')}>
          <Camera size={16} color={colors.text.secondary} />
          <Text style={[styles.tabText, { color: colors.text.secondary }]}>Câmera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => handleTabPress('galeria')}>
          <ImageIcon size={16} color={colors.text.secondary} />
          <Text style={[styles.tabText, { color: colors.text.secondary }]}>Galeria</Text>
        </TouchableOpacity>
      </View>

      {uploading && <Text style={[styles.uploadingText, { color: colors.text.secondary }]}>Enviando imagem...</Text>}

      <Text style={[styles.sectionLabel, { color: colors.text.tertiary }]}>Modelos</Text>
      <ScrollView style={styles.grid} nestedScrollEnabled>
        <View style={styles.gridRow}>
          {BUILTIN_COVERS.map((cover) => {
            const locked = cover.is_premium && !isPremium
            return (
              <TouchableOpacity
                key={cover.id}
                style={[
                  styles.coverItem,
                  { borderColor: selectedCover?.id === cover.id ? colors.accent.primary : colors.border },
                  { opacity: locked ? 0.4 : 1 },
                ]}
                onPress={() => { if (!locked) { onSelect(cover); onClose() } }}
                disabled={locked}
              >
                {renderGradient(cover.id)}
                {cover.is_premium && (
                  <View style={styles.premiumBadge}>
                    <Crown size={10} color={colors.accent.warning} />
                  </View>
                )}
                {selectedCover?.id === cover.id && (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.accent.primary }]}>
                    <Text style={styles.selectedCheck}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <Button title="Remover capa" onPress={() => { onSelect(null); onClose() }} variant="ghost" />
        <Button title="Fechar" onPress={onClose} variant="ghost" />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: spacing.md },
  tabsBar: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: 'transparent' },
  tabText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
  uploadingText: { fontSize: typography.fontSize.sm, textAlign: 'center', marginBottom: spacing.sm },
  sectionLabel: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  grid: { maxHeight: 280, marginBottom: spacing.md },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  coverItem: { width: '30%', aspectRatio: 3 / 2, borderRadius: borderRadius.sm, borderWidth: 2, overflow: 'hidden', position: 'relative' },
  coverPreview: { flex: 1 },
  gradient: { flex: 1 },
  gradientHalf: { flex: 1 },
  premiumBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 2 },
  selectedBadge: { position: 'absolute', top: 4, left: 4, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  selectedCheck: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
})
