import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { Button, Modal, Chip } from '../../../shared/components'
import { useEntitlements } from '../../../features/premium/hooks/useEntitlements'
import { Crown } from 'lucide-react-native'

export interface FontOption { id: string; name: string; fontFamily: string; isPremium: boolean }

const FONT_OPTIONS: FontOption[] = [
  { id: 'classica', name: 'Clássica', fontFamily: 'Inter', isPremium: false },
  { id: 'moderna', name: 'Moderna', fontFamily: 'Inter', isPremium: false },
  { id: 'serifada', name: 'Serifada', fontFamily: 'Merriweather', isPremium: false },
  { id: 'elegante', name: 'Elegante', fontFamily: 'Merriweather', isPremium: false },
  { id: 'minimalista', name: 'Minimalista', fontFamily: 'Inter', isPremium: false },
  { id: 'lettering', name: 'Lettering', fontFamily: 'Caveat', isPremium: true },
  { id: 'manuscrita', name: 'Manuscrita', fontFamily: 'Caveat', isPremium: true },
  { id: 'caligrafia', name: 'Caligrafia', fontFamily: 'Caveat', isPremium: true },
  { id: 'brush', name: 'Brush', fontFamily: 'Caveat', isPremium: true },
  { id: 'assinatura', name: 'Assinatura', fontFamily: 'Caveat', isPremium: true },
]

interface FontSelectorProps { visible: boolean; onClose: () => void; selectedId: string; onSelect: (font: FontOption) => void }

export function FontSelector({ visible, onClose, selectedId, onSelect }: FontSelectorProps) {
  const { colors } = useTheme()
  const { isPremium } = useEntitlements()

  return (
    <Modal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Fonte</Text>
      <ScrollView style={styles.list}>
        {FONT_OPTIONS.map((f) => {
          const locked = f.isPremium && !isPremium
          return (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.item,
                { backgroundColor: selectedId === f.id ? colors.accent.primaryLight : 'transparent', opacity: locked ? 0.4 : 1 },
              ]}
              onPress={() => { if (!locked) onSelect(f) }}
              disabled={locked}
            >
              <Text style={[styles.itemText, { color: colors.text.primary, fontFamily: f.fontFamily }]}>{f.name}</Text>
              {f.isPremium && (
                <Chip label="Premium" variant="premium" />
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
      <Button title="Fechar" onPress={onClose} variant="ghost" />
    </Modal>
  )
}

export function getDefaultFont(): FontOption { return FONT_OPTIONS[0] }
export { FONT_OPTIONS }

const styles = StyleSheet.create({
  title: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: spacing.md },
  list: { maxHeight: 400, marginBottom: spacing.md },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.sm, borderRadius: borderRadius.sm },
  itemText: { fontSize: typography.fontSize.base },
})
