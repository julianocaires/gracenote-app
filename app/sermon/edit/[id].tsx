import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, TextInput, BackHandler, Image as RNImage } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { usePreventRemove } from '@react-navigation/native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { Button, Input, LoadingScreen } from '../../../shared/components'
import { CategoryPicker } from '../../../features/categories/components/CategoryPicker'
import { TagPicker } from '../../../features/tags/components/TagPicker'
import { CoverPicker } from '../../../features/covers/components/CoverPicker'
import { FontSelector, getDefaultFont } from '../../../features/editor/components/FontSelector'
import { ColorPicker } from '../../../features/editor/components/ColorPicker'
import { useSermonDetail, useUpdateSermon } from '../../../features/sermons/hooks/useSermons'
import { Type, Palette, Highlighter, Image as ImageIcon } from 'lucide-react-native'
import type { Cover } from '../../../shared/types'
import type { FontOption } from '../../../features/editor/components/FontSelector'
import { getBuiltinCoverColor, isBuiltinCover } from '../../../features/covers/constants'

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
  const [highlightColor, setHighlightColor] = useState<string | null>(null)
  const [showCategories, setShowCategories] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [showCovers, setShowCovers] = useState(false)
  const [coverImgError, setCoverImgError] = useState(false)
  const [showFonts, setShowFonts] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [colorMode, setColorMode] = useState<'text' | 'highlight'>('text')

  useEffect(() => {
    if (sermon) {
      setTitle(sermon.title)
      setContent(sermon.plain_text || '')
      setPreacher(sermon.preacher || '')
      const contentData = sermon.content as Record<string, any> | undefined
      if (contentData?.font) {
        const font = getDefaultFont()
        setSelectedFont({ ...font, id: contentData.font })
        setTextColor(contentData.textColor ?? '#2C2420')
        setHighlightColor(contentData.highlightColor ?? null)
      }
      // Load existing categories and tags
      const s = sermon as any
      if (s.categories?.length) {
        setCategoryIds(s.categories.map((c: any) => c.category.id))
      }
      if (s.tags?.length) {
        setTagIds(s.tags.map((t: any) => t.tag.id))
      }
      // Load existing cover
      if (s.cover) {
        setSelectedCover({ id: s.cover.id, url: s.cover.url, is_premium: s.cover.is_premium, is_builtin: false, user_id: null, created_at: '' })
      } else if (isBuiltinCover(s.cover_id)) {
        setSelectedCover({ id: s.cover_id, url: '', is_premium: false, is_builtin: true, user_id: null, created_at: '' })
      }
    }
  }, [sermon])

  const origContent = sermon?.content as Record<string, any> | undefined
  const origFont = origContent?.font || getDefaultFont().id
  const origTextColor = origContent?.textColor || '#2C2420'
  const origHighlight = origContent?.highlightColor || null
  const s = sermon as any
  const origCategoryIds: string[] = s?.categories?.map((c: any) => c.category.id) ?? []
  const origTagIds: string[] = s?.tags?.map((t: any) => t.tag.id) ?? []
  // Determine original cover: uploaded covers have a URL (from join), built-in only have cover_id
  const origCoverId = s?.cover?.id ?? s?.cover_id ?? null
  const coverChanged = (selectedCover?.id ?? null) !== origCoverId
  const hasData = !!title || !!content || !!preacher || !!selectedCover
  const catsChanged = JSON.stringify(categoryIds.sort()) !== JSON.stringify(origCategoryIds.sort())
  const tagsChanged = JSON.stringify(tagIds.sort()) !== JSON.stringify(origTagIds.sort())
  const isDirty = hasData && !!(
    title !== sermon?.title || content !== (sermon.plain_text || '') ||
    catsChanged || tagsChanged || coverChanged ||
    selectedFont.id !== origFont || textColor !== origTextColor ||
    (highlightColor || null) !== origHighlight
  )

  // Prevent swipe-back gesture on iOS when there are unsaved changes
  const navigation = useNavigation()
  const savingRef = useRef(false)
  usePreventRemove(isDirty, ({ data }) => {
    if (savingRef.current) {
      navigation.dispatch(data.action)
      return
    }
    Alert.alert('Descartar alterações?', 'Você tem alterações que ainda não foram salvas.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ])
  })

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

  // Reset image error when cover changes
  function handleCoverSelect(cover: Cover | null) {
    setCoverImgError(false)
    setSelectedCover(cover)
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

  async function handleSave() {
    if (!title.trim()) { Alert.alert('Título obrigatório', 'Dê um título'); return }
    savingRef.current = true
    try {
      const data: Record<string, any> = {
        title: title.trim(),
        content: { type: 'doc', content: [], font: selectedFont.id, textColor, highlightColor: highlightColor || undefined },
        plain_text: content,
        preacher: preacher.trim() || null,
        cover_id: selectedCover?.id ?? null,
      }
      // Only pass category/tag updates if user has interacted with the pickers
      if (categoryIds.length > 0) data.category_ids = categoryIds
      if (tagIds.length > 0) data.tag_ids = tagIds
      await updateSermon.mutateAsync({ id: id!, data: data as any })
      router.back()
    } catch (err) {
      console.error('[EditSermon] Error:', err)
      Alert.alert('Erro ao salvar', (err as any)?.message || 'Não foi possível salvar')
    }
  }

  function handleColorSelect(color: string) {
    if (colorMode === 'text') {
      setTextColor(color)
    } else {
      setHighlightColor(color === highlightColor ? null : color)
    }
  }

  if (isLoading) return <LoadingScreen />

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Button title="Voltar" onPress={handleBack} variant="ghost" />
        <Text style={[styles.title, { color: colors.text.primary }]}>Editar</Text>
        <Button title="Salvar" onPress={handleSave} loading={updateSermon.isPending} />
      </View>

      <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        {/* Cover area */}
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
                console.warn('[EditSermon] Cover image load error:', selectedCover.url, e.nativeEvent?.error)
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
        <Input value={title} onChangeText={setTitle} placeholder="Título" />

        {/* Preacher */}
        <Input value={preacher} onChangeText={setPreacher} placeholder="Quem ministrou?" />

        {/* Categories and Tags */}
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
          <ToolBtn icon={Type} onPress={() => setShowFonts(true)} colors={colors} />
          <ToolBtn icon={Palette} onPress={() => { setColorMode('text'); setShowColors(true) }} colors={colors} active={textColor !== '#2C2420'} />
          <ToolBtn icon={Highlighter} onPress={() => { setColorMode('highlight'); setShowColors(true) }} colors={colors} active={!!highlightColor} />
        </View>

        {/* Editor */}
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Conteúdo..."
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

function ToolBtn({ icon: Icon, onPress, colors, active }: { icon: any; onPress: () => void; colors: any; active?: boolean }) {
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
