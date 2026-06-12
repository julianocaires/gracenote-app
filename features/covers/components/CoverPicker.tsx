import { useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { Button, Modal, Chip } from '../../../shared/components'
import { useEntitlements } from '../../../features/premium/hooks/useEntitlements'
import { Image as ImageIcon, Camera, Palette, Crown } from 'lucide-react-native'
import type { Cover } from '../../../shared/types'

const BUILTIN_COVERS: Cover[] = [
  { id: 'cover-1', url: '', is_premium: false, is_builtin: true, user_id: null, created_at: '' },
  { id: 'cover-2', url: '', is_premium: false, is_builtin: true, user_id: null, created_at: '' },
  { id: 'cover-3', url: '', is_premium: false, is_builtin: true, user_id: null, created_at: '' },
  { id: 'cover-4', url: '', is_premium: true, is_builtin: true, user_id: null, created_at: '' },
  { id: 'cover-5', url: '', is_premium: true, is_builtin: true, user_id: null, created_at: '' },
  { id: 'cover-6', url: '', is_premium: true, is_builtin: true, user_id: null, created_at: '' },
]

const COVER_GRADIENTS: Record<string, string[]> = {
  'cover-1': ['#F5F2EF', '#FBF8F5'],
  'cover-2': ['#C7705C', '#EAA58B'],
  'cover-3': ['#D4A853', '#FAE2AD'],
  'cover-4': ['#2D2420', '#6B6158'],
  'cover-5': ['#7C3AED', '#A78BFA'],
  'cover-6': ['#059669', '#34D399'],
}

interface CoverPickerProps { visible: boolean; onClose: () => void; selectedCover: Cover | null; onSelect: (cover: Cover | null) => void }

export function CoverPicker({ visible, onClose, selectedCover, onSelect }: CoverPickerProps) {
  const { colors } = useTheme()
  const { isPremium } = useEntitlements()
  const [tab, setTab] = useState<'modelos' | 'camera' | 'galeria'>('modelos')

  async function handleCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar uma foto.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [3, 2], quality: 0.8 })
    if (result.canceled) return
    const cover: Cover = { id: `camera-${Date.now()}`, url: result.assets[0].uri, is_premium: false, is_builtin: false, user_id: null, created_at: '' }
    onSelect(cover)
    onClose()
  }

  async function handleGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar uma foto.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [3, 2], quality: 0.8 })
    if (result.canceled) return
    const cover: Cover = { id: `gallery-${Date.now()}`, url: result.assets[0].uri, is_premium: false, is_builtin: false, user_id: null, created_at: '' }
    onSelect(cover)
    onClose()
  }

  function handleTabPress(newTab: 'modelos' | 'camera' | 'galeria') {
    setTab(newTab)
    if (newTab === 'camera') {
      handleCamera()
    } else if (newTab === 'galeria') {
      handleGallery()
    }
  }

  return (
    <Modal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Capa</Text>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, { borderColor: tab === 'modelos' ? colors.accent.primary : 'transparent' }]} onPress={() => handleTabPress('modelos')}>
          <Palette size={16} color={tab === 'modelos' ? colors.accent.primary : colors.text.tertiary} />
          <Text style={[styles.tabText, { color: tab === 'modelos' ? colors.accent.primary : colors.text.tertiary }]}>Modelos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, { borderColor: tab === 'camera' ? colors.accent.primary : 'transparent' }]} onPress={() => handleTabPress('camera')}>
          <Camera size={16} color={tab === 'camera' ? colors.accent.primary : colors.text.tertiary} />
          <Text style={[styles.tabText, { color: tab === 'camera' ? colors.accent.primary : colors.text.tertiary }]}>Câmera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, { borderColor: tab === 'galeria' ? colors.accent.primary : 'transparent' }]} onPress={() => handleTabPress('galeria')}>
          <ImageIcon size={16} color={tab === 'galeria' ? colors.accent.primary : colors.text.tertiary} />
          <Text style={[styles.tabText, { color: tab === 'galeria' ? colors.accent.primary : colors.text.tertiary }]}>Galeria</Text>
        </TouchableOpacity>
      </View>
      {tab === 'modelos' && (
        <ScrollView style={styles.grid}>
          <View style={styles.gridRow}>
            {BUILTIN_COVERS.map((cover) => {
              const locked = cover.is_premium && !isPremium
              const gradients = COVER_GRADIENTS[cover.id]
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
                  <View style={[styles.coverPreview, { backgroundColor: colors.skeleton }]} />
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
      )}
      {tab === 'modelos' && (
        <Button title="Remover capa" onPress={() => { onSelect(null); onClose() }} variant="ghost" />
      )}
      <Button title="Fechar" onPress={onClose} variant="ghost" />
    </Modal>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: spacing.md },
  tabs: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  tab: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: 'transparent' },
  tabText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
  grid: { maxHeight: 300, marginBottom: spacing.md },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  coverItem: { width: '30%', aspectRatio: 3 / 2, borderRadius: borderRadius.sm, borderWidth: 2, overflow: 'hidden', position: 'relative' },
  coverPreview: { flex: 1 },
  premiumBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 2 },
  selectedBadge: { position: 'absolute', top: 4, left: 4, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  selectedCheck: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
})
