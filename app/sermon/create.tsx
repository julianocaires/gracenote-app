import { useState, useCallback, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, TextInput, BackHandler, Image as RNImage } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing, borderRadius } from '../../shared/design/spacing'
import { Button, Input } from '../../shared/components'
import { CategoryPicker } from '../../features/categories/components/CategoryPicker'
import { TagPicker } from '../../features/tags/components/TagPicker'
import { CoverPicker } from '../../features/covers/components/CoverPicker'
import { FontSelector, getDefaultFont } from '../../features/editor/components/FontSelector'
import { ColorPicker } from '../../features/editor/components/ColorPicker'
import { useCreateSermon, useSermonLimit } from '../../features/sermons/hooks/useSermons'
import { Image as ImageIcon, Type, Palette, Highlighter } from 'lucide-react-native'
import type { Cover } from '../../shared/types'
import type { FontOption } from '../../features/editor/components/FontSelector'
import { getBuiltinCoverColor } from '../../features/covers/constants'

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
  const [highlightColor, setHighlightColor] = useState<string | null>(null)
  const [showFonts, setShowFonts] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [colorMode, setColorMode] = useState<'text' | 'highlight'>('text')
  const [showCovers, setShowCovers] = useState(false)
  const [coverImgError, setCoverImgError] = useState(false)

  // Reset image error when cover changes
  const handleCoverSelect = useCallback((cover: Cover | null) => {
    setCoverImgError(false)
    setSelectedCover(cover)
  }, [])

  const isDirty = !!title || !!content || !!preacher || !!selectedCover || categoryIds.length > 0 || tagIds.length > 0 || selectedFont.id !== getDefaultFont().id || textColor !== '#2C2420' || !!highlightColor

  function handleBack() {
    if (isDirty) {
      Alert.alert('Descartar alterações?', 'Você tem alterações que ainda não foram salvas.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Descartar', style: 'destructive', onPress: () => router.back() },
      ])
    } else {
      router.back()
    }
  }

  // Intercept hardware back button on Android
  useEffect(() => {
    const onBackPress = () => {
      if (isDirty) {
        handleBack()
        return true
      }
      return false
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)
    return () => subscription.remove()
  }, [isDirty])

  async function handleCreate() {
    if (!title.trim()) { Alert.alert('Título obrigatório', 'Dê um título à ministração'); return }
    try {
      const result = await createSermon.mutateAsync({
        title: title.trim(),
        content: { type: 'doc', content: [], font: selectedFont.id, textColor, highlightColor: highlightColor || undefined },
        plain_text: content,
        preacher: preacher.trim() || null,
        cover_id: selectedCover?.id ?? null,
        category_ids: categoryIds,
        tag_ids: tagIds,
      })
      console.log('[CreateSermon] Success:', JSON.stringify(result))
      router.back()
    } catch (err) {
      console.error('[CreateSermon] Error:', err)
      console.error('[CreateSermon] Error constructor:', (err as any)?.constructor?.name)
      console.error('[CreateSermon] Error keys:', Object.keys(err as object))
      const msg = (err as any)?.message || String(err)
      const details = JSON.stringify(err, Object.getOwnPropertyNames(err as object))
      console.error('[CreateSermon] Full details:', details)
      if (msg === 'LIMIT_REACHED') { router.push('/premium') }
      else { Alert.alert('Erro ao criar', msg) }
    }
  }

  function handleColorSelect(color: string) {
    if (colorMode === 'text') {
      setTextColor(color)
    } else {
      setHighlightColor(color === highlightColor ? null : color)
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
        <Button title="Voltar" onPress={handleBack} variant="ghost" />
        <Text style={[styles.title, { color: colors.text.primary }]}>Nova ministração</Text>
        <Button title="Salvar" onPress={handleCreate} loading={createSermon.isPending} disabled={createSermon.isPending} />
      </View>
      <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={[styles.coverArea, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowCovers(true)}
          activeOpacity={0.7}
        >
          {selectedCover?.url && !coverImgError ? (
            <RNImage
              source={{ uri: selectedCover.url }}
              style={styles.coverImage}
              resizeMode="cover"
              onError={(e) => {
                console.warn('[CreateSermon] Cover image load error:', selectedCover.url, e.nativeEvent?.error)
                setCoverImgError(true)
              }}
            />
          ) : selectedCover ? (
            <View style={[styles.coverImage, { backgroundColor: getBuiltinCoverColor(selectedCover.id) || colors.skeleton }]} />
          ) : (
            <View style={styles.coverEmpty}>
              <ImageIcon size={28} color={colors.text.tertiary} />
              <Text style={[styles.coverPlaceholderText, { color: colors.text.tertiary }]}>Adicionar capa</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Title */}
        <Input value={title} onChangeText={setTitle} placeholder="Título da ministração" />

        {/* Preacher */}
        <Input value={preacher} onChangeText={setPreacher} placeholder="Quem ministrou?" />

        {/* Categories and Tags buttons */}
        <View style={styles.metaRow}>
          <View style={styles.metaBtnWrap}>
            <Button
              title={`Categoria${categoryIds.length > 0 ? ` (${categoryIds.length})` : ''}`}
              onPress={() => setShowCategories(true)}
              variant={categoryIds.length > 0 ? 'primary' : 'secondary'}
            />
          </View>
          <View style={styles.metaBtnWrap}>
            <Button
              title={`Tag${tagIds.length > 0 ? ` (${tagIds.length})` : ''}`}
              onPress={() => setShowTags(true)}
              variant={tagIds.length > 0 ? 'primary' : 'secondary'}
            />
          </View>
        </View>

        {/* Toolbar */}
        <View style={[styles.toolbar, { borderBottomColor: colors.border, borderTopColor: colors.border }]}>
          <ToolbarButton icon={Type} label="Fonte" onPress={() => setShowFonts(true)} colors={colors} />
          <ToolbarButton icon={Palette} label="Cor" onPress={() => { setColorMode('text'); setShowColors(true) }} colors={colors} active={textColor !== '#2C2420'} />
          <ToolbarButton icon={Highlighter} label="Destacar" onPress={() => { setColorMode('highlight'); setShowColors(true) }} colors={colors} active={!!highlightColor} />
        </View>

        {/* Editor */}
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Escreva sua ministração aqui..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          textAlignVertical="top"
          style={[
            styles.textInput,
            {
              color: textColor,
              backgroundColor: highlightColor || colors.surface,
              borderColor: colors.border,
              fontFamily: selectedFont.fontFamily,
            },
          ]}
        />
      </ScrollView>

      <CoverPicker visible={showCovers} onClose={() => setShowCovers(false)} selectedCover={selectedCover} onSelect={handleCoverSelect} />
      <FontSelector visible={showFonts} onClose={() => setShowFonts(false)} selectedId={selectedFont.id} onSelect={setSelectedFont} />
      <ColorPicker visible={showColors} onClose={() => setShowColors(false)} selectedColor={colorMode === 'text' ? textColor : (highlightColor ?? '')} onSelect={handleColorSelect} mode={colorMode} />
      <CategoryPicker visible={showCategories} onClose={() => setShowCategories(false)} selectedIds={categoryIds} onSelect={(id) => setCategoryIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])} />
      <TagPicker visible={showTags} onClose={() => setShowTags(false)} selectedIds={tagIds} onSelect={(id) => setTagIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])} />
    </KeyboardAvoidingView>
  )
}

function ToolbarButton({ icon: Icon, label, onPress, colors, active }: { icon: any; label: string; onPress: () => void; colors: any; active?: boolean }) {
  return (
    <TouchableOpacity style={styles.toolBtn} onPress={onPress}>
      <Icon size={18} color={active ? colors.accent.primary : colors.text.secondary} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  title: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  subtitle: { fontSize: typography.fontSize.base, textAlign: 'center', lineHeight: 24 },
  scrollArea: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing['4xl'] },
  coverArea: {
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    overflow: 'hidden',
    minHeight: 120,
  },
  coverImage: { width: '100%', height: 120 },
  coverPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
  },
  coverLabel: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium },
  coverEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
  },
  coverPlaceholderText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium },
  metaRow: { flexDirection: 'row', gap: spacing.sm },
  metaBtnWrap: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    gap: spacing.xs,
  },
  toolBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  textInput: {
    fontSize: typography.fontSize.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 280,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
})
