import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { Button, Input, Chip, LoadingScreen } from '../../../shared/components'
import { CategoryPicker } from '../../../features/categories/components/CategoryPicker'
import { TagPicker } from '../../../features/tags/components/TagPicker'
import { CoverPicker } from '../../../features/covers/components/CoverPicker'
import { FontSelector, getDefaultFont } from '../../../features/editor/components/FontSelector'
import { ColorPicker } from '../../../features/editor/components/ColorPicker'
import { useSermonDetail, useUpdateSermon } from '../../../features/sermons/hooks/useSermons'
import { Type, Palette, Highlighter, Image } from 'lucide-react-native'
import type { Cover } from '../../../shared/types'
import type { FontOption } from '../../../features/editor/components/FontSelector'

export default function EditSermonScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: sermon, isLoading } = useSermonDetail(id!)
  const updateSermon = useUpdateSermon()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [preacher, setPreacher] = useState('')
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [tagIds, setTagIds] = useState<string[]>([])
  const [selectedCover, setSelectedCover] = useState<Cover | null>(null)
  const [selectedFont, setSelectedFont] = useState<FontOption>(getDefaultFont())
  const [textColor, setTextColor] = useState('#2C2420')
  const [showCategories, setShowCategories] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [showCovers, setShowCovers] = useState(false)
  const [showFonts, setShowFonts] = useState(false)
  const [showColors, setShowColors] = useState(false)

  useEffect(() => {
    if (sermon) {
      setTitle(sermon.title)
      setContent(sermon.plain_text || '')
    }
  }, [sermon])

  async function handleSave() {
    if (!title.trim()) { Alert.alert('Título obrigatório', 'Dê um título'); return }
    try {
      await updateSermon.mutateAsync({
        id: id!,
        data: { title: title.trim(), content: { type: 'doc', content: [], font: selectedFont.id, textColor }, plain_text: content, preacher: preacher.trim() || null },
      })
      router.back()
    } catch { Alert.alert('Erro', 'Não foi possível salvar') }
  }

  if (isLoading) return <LoadingScreen />

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Button title="Voltar" onPress={() => router.back()} variant="ghost" />
        <Text style={[styles.title, { color: colors.text.primary }]}>Editar</Text>
        <Button title="Salvar" onPress={handleSave} loading={updateSermon.isPending} />
      </View>

      <View style={styles.toolbar}>
        <ToolBtn icon={Type} onPress={() => setShowFonts(true)} colors={colors} />
        <ToolBtn icon={Palette} onPress={() => setShowColors(true)} colors={colors} />
        <ToolBtn icon={Highlighter} onPress={() => setShowColors(true)} colors={colors} />
        <ToolBtn icon={Image} onPress={() => setShowCovers(true)} colors={colors} />
      </View>

      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        <Input value={title} onChangeText={setTitle} placeholder="Título" />
        <Input value={preacher} onChangeText={setPreacher} placeholder="Quem ministrou?" />
        <Text style={[styles.fontIndicator, { color: colors.text.tertiary }]}>Fonte: {selectedFont.name}</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Conteúdo..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          textAlignVertical="top"
          style={[styles.textInput, { color: textColor, backgroundColor: colors.surface, borderColor: colors.border, fontFamily: selectedFont.fontFamily }]}
        />

        <View style={styles.metaRow}>
          <Button title="Categoria" onPress={() => setShowCategories(true)} variant="secondary" />
          <Button title="Tags" onPress={() => setShowTags(true)} variant="secondary" />
        </View>
        <View style={styles.chips}>{categoryIds.map((id) => (<Chip key={id} label={id} variant="selected" />))}</View>
        <View style={styles.chips}>{tagIds.map((id) => (<Chip key={id} label={id} variant="selected" />))}</View>
      </ScrollView>

      <CoverPicker visible={showCovers} onClose={() => setShowCovers(false)} selectedCover={selectedCover} onSelect={setSelectedCover} />
      <FontSelector visible={showFonts} onClose={() => setShowFonts(false)} selectedId={selectedFont.id} onSelect={setSelectedFont} />
      <ColorPicker visible={showColors} onClose={() => setShowColors(false)} selectedColor={textColor} onSelect={setTextColor} mode="text" />
      <CategoryPicker visible={showCategories} onClose={() => setShowCategories(false)} selectedIds={categoryIds} onSelect={(id) => setCategoryIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])} />
      <TagPicker visible={showTags} onClose={() => setShowTags(false)} selectedIds={tagIds} onSelect={(id) => setTagIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])} />
    </KeyboardAvoidingView>
  )
}

function ToolBtn({ icon: Icon, onPress, colors }: { icon: any; onPress: () => void; colors: any }) {
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
  toolbar: { flexDirection: 'row', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: '#E8E2DC', gap: spacing.xs },
  form: { flex: 1, padding: spacing.md, gap: spacing.md },
  fontIndicator: { fontSize: typography.fontSize.xs, marginTop: -spacing.sm },
  metaRow: { flexDirection: 'row', gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  toolBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  textInput: { fontSize: typography.fontSize.base, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, borderRadius: borderRadius.md, borderWidth: 1, minHeight: 200, lineHeight: 24 },
})
