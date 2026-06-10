import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing, borderRadius } from '../../shared/design/spacing'
import { Button, Input, Chip } from '../../shared/components'
import { CategoryPicker } from '../../features/categories/components/CategoryPicker'
import { TagPicker } from '../../features/tags/components/TagPicker'
import { CoverPicker } from '../../features/covers/components/CoverPicker'
import { FontSelector, getDefaultFont } from '../../features/editor/components/FontSelector'
import { ColorPicker } from '../../features/editor/components/ColorPicker'
import { useCreateSermon, useSermonLimit } from '../../features/sermons/hooks/useSermons'

import { Image, Type, Palette, Highlighter } from 'lucide-react-native'
import type { Cover } from '../../shared/types'
import type { FontOption } from '../../features/editor/components/FontSelector'

export default function CreateSermonScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const createSermon = useCreateSermon()
  const { data: limit } = useSermonLimit()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [preacher, setPreacher] = useState('')
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [tagIds, setTagIds] = useState<string[]>([])
  const [showCategories, setShowCategories] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [selectedCover, setSelectedCover] = useState<Cover | null>(null)
  const [selectedFont, setSelectedFont] = useState<FontOption>(getDefaultFont())
  const [textColor, setTextColor] = useState('#2C2420')
  const [showFonts, setShowFonts] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [showCovers, setShowCovers] = useState(false)

  async function handleCreate() {
    if (!title.trim()) { Alert.alert('Título obrigatório', 'Dê um título à ministração'); return }
    try {
      await createSermon.mutateAsync({
        title: title.trim(),
        content: { type: 'doc', content: [], font: selectedFont.id, textColor },
        plain_text: content,
        preacher: preacher.trim() || null,
        cover_id: selectedCover?.id ?? null,
        category_ids: categoryIds,
        tag_ids: tagIds,
      })
      router.back()
    } catch (err) {
      if (err instanceof Error && err.message === 'LIMIT_REACHED') { router.push('/premium') }
      else { Alert.alert('Erro', 'Não foi possível criar') }
    }
  }

  if (limit && !limit.canCreate) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Limite atingido</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Você atingiu o limite de 100 ministrações. Assine o Premium para continuar.</Text>
        <Button title="Ver planos" onPress={() => router.push('/premium')} />
        <Button title="Voltar" onPress={() => router.back()} variant="ghost" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Button title="Voltar" onPress={() => router.back()} variant="ghost" />
        <Text style={[styles.title, { color: colors.text.primary }]}>Nova ministração</Text>
        <Button title="Salvar" onPress={handleCreate} loading={createSermon.isPending} disabled={createSermon.isPending} />
      </View>

      <View style={styles.toolbar}>
        <ToolbarButton icon={Type} label="Fonte" onPress={() => setShowFonts(true)} colors={colors} />
        <ToolbarButton icon={Palette} label="Cor" onPress={() => setShowColors(true)} colors={colors} />
        <ToolbarButton icon={Highlighter} label="Destacar" onPress={() => setShowColors(true)} colors={colors} />
        <ToolbarButton icon={Image} label="Capa" onPress={() => setShowCovers(true)} colors={colors} />
      </View>

      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        <Input value={title} onChangeText={setTitle} placeholder="Título da ministração" />
        <Input value={preacher} onChangeText={setPreacher} placeholder="Quem ministrou?" />
        <Text style={[styles.fontIndicator, { color: colors.text.tertiary }]}>Fonte: {selectedFont.name}</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Escreva sua ministração aqui..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          textAlignVertical="top"
          style={[styles.textInput, { color: textColor, backgroundColor: colors.surface, borderColor: colors.border, fontFamily: selectedFont.fontFamily }]}
        />

        <View style={styles.metaRow}>
          <Button title="Categoria" onPress={() => setShowCategories(true)} variant="secondary" />
          <Button title="Tags" onPress={() => setShowTags(true)} variant="secondary" />
        </View>

        <View style={styles.chips}>
          {categoryIds.map((id) => (<Chip key={id} label={id} variant="selected" />))}
        </View>
        <View style={styles.chips}>
          {tagIds.map((id) => (<Chip key={id} label={id} variant="selected" />))}
        </View>
      </ScrollView>

      <CoverPicker visible={showCovers} onClose={() => setShowCovers(false)} selectedCover={selectedCover} onSelect={setSelectedCover} />
      <FontSelector visible={showFonts} onClose={() => setShowFonts(false)} selectedId={selectedFont.id} onSelect={setSelectedFont} />
      <ColorPicker visible={showColors} onClose={() => setShowColors(false)} selectedColor={textColor} onSelect={setTextColor} mode="text" />
      <CategoryPicker visible={showCategories} onClose={() => setShowCategories(false)} selectedIds={categoryIds} onSelect={(id) => setCategoryIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])} />
      <TagPicker visible={showTags} onClose={() => setShowTags(false)} selectedIds={tagIds} onSelect={(id) => setTagIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])} />
    </KeyboardAvoidingView>
  )
}

function ToolbarButton({ icon: Icon, label, onPress, colors, active }: { icon: any; label: string; onPress: () => void; colors: any; active?: boolean }) {
  return (
    <TouchableOpacity style={styles.toolBtn} onPress={onPress}>
      <Icon size={18} color={colors.text.secondary} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  title: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  subtitle: { fontSize: typography.fontSize.base, textAlign: 'center', lineHeight: 24 },
  toolbar: { flexDirection: 'row', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: '#E8E2DC', gap: spacing.xs },
  toolBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  form: { flex: 1, padding: spacing.md, gap: spacing.md },
  fontIndicator: { fontSize: typography.fontSize.xs, marginTop: -spacing.sm },
  metaRow: { flexDirection: 'row', gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  textInput: { fontSize: typography.fontSize.base, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, borderRadius: borderRadius.md, borderWidth: 1, minHeight: 200, lineHeight: 24 },
})
