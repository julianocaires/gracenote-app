import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, BackHandler, Image as RNImage } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { usePreventRemove } from '@react-navigation/native'
import {
  useEditorBridge,
  TenTapStartKit,
  defaultEditorTheme,
  darkEditorTheme,
} from '@10play/tentap-editor'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { Button, Input, LoadingScreen } from '../../../shared/components'
import { CategoryPicker } from '../../../features/categories/components/CategoryPicker'
import { TagPicker } from '../../../features/tags/components/TagPicker'
import { CoverPicker } from '../../../features/covers/components/CoverPicker'
import { FontSelector, getDefaultFont, FONT_OPTIONS } from '../../../features/editor/components/FontSelector'
import { ColorPicker } from '../../../features/editor/components/ColorPicker'
import { RichEditor } from '../../../features/editor/components/RichEditor'
import { FormattingToolbar } from '../../../features/editor/components/FormattingToolbar'
import { TextAlignBridge } from '../../../features/editor/bridges/TextAlignBridge'
import { FontFamilyBridge } from '../../../features/editor/bridges/FontFamilyBridge'
import { useSermonDetail, useUpdateSermon, useDeleteSermon } from '../../../features/sermons/hooks/useSermons'
import { Image as ImageIcon, Trash2 } from 'lucide-react-native'
import type { Cover } from '../../../shared/types'
import type { FontOption } from '../../../features/editor/components/FontSelector'
import { getBuiltinCoverColor, isBuiltinCover } from '../../../features/covers/constants'

export default function EditSermonScreen() {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: sermon, isLoading } = useSermonDetail(id!)
  const updateSermon = useUpdateSermon()
  const deleteSermon = useDeleteSermon()
  const [title, setTitle] = useState('')
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
  const [contentDirty, setContentDirty] = useState(false)
  const initialLoadRef = useRef(true)
  const contentLoadedRef = useRef(false)
  const discardingRef = useRef(false)

  const editor = useEditorBridge({
    bridgeExtensions: [...TenTapStartKit, TextAlignBridge, FontFamilyBridge],
    initialContent: '',
    autofocus: false,
    avoidIosKeyboard: false,
    theme: {
      ...(isDark ? darkEditorTheme : defaultEditorTheme),
      webviewContainer: {
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: 'transparent',
      },
    },
    onChange: () => {
      if (!initialLoadRef.current) setContentDirty(true)
    },
  })

  // Load sermon data into editor when both sermon and editor are ready
  useEffect(() => {
    if (!sermon || contentLoadedRef.current) return

    function loadIntoEditor() {
      contentLoadedRef.current = true
      setTitle(sermon.title)
      setPreacher(sermon.preacher || '')

      // Detect content format: new (HTML string) vs old (JSON object)
      const contentData = sermon.content
      // Load font from sermon record (new format) or from content JSON (old format)
      if ((sermon as any).font) {
        const font = FONT_OPTIONS.find(f => f.id === (sermon as any).font) || getDefaultFont()
        setSelectedFont(font)
      }
      if (typeof contentData === 'string') {
        // New format: HTML string
        editor.setContent(contentData)
        setTimeout(() => { initialLoadRef.current = false }, 100)
      } else if (contentData && typeof contentData === 'object' && (contentData as any).type === 'doc') {
        // Old format: JSON { type: 'doc', content: [], font, textColor, highlightColor }
        const old = contentData as Record<string, any>
        if (old.font) {
          const font = FONT_OPTIONS.find(f => f.id === old.font) || getDefaultFont()
          setSelectedFont(font)
        }
        if (old.textColor) setTextColor(old.textColor)
        if (old.highlightColor) setHighlightColor(old.highlightColor)
        // Convert plain_text to simple HTML
        const text = sermon.plain_text || ''
        const paragraphs = text.split('\n').map((p: string) => `<p>${p || '<br>'}</p>`).join('')
        editor.setContent(paragraphs)
        setTimeout(() => { initialLoadRef.current = false }, 100)
      } else if (sermon.plain_text) {
        // Fallback: just plain_text
        const text = sermon.plain_text
        const paragraphs = text.split('\n').map((p: string) => `<p>${p || '<br>'}</p>`).join('')
        editor.setContent(paragraphs)
        setTimeout(() => { initialLoadRef.current = false }, 100)
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

    // If editor is already ready, load immediately
    if (editor.getEditorState()?.isReady) {
      loadIntoEditor()
      return
    }

    // Otherwise wait for editor readiness signal via subscription
    const unsub = editor._subscribeToEditorStateUpdate?.(() => {
      if (editor.getEditorState()?.isReady) {
        unsub?.()
        loadIntoEditor()
      }
    })

    // Fallback: load after 5s even if isReady never fires
    const timeout = setTimeout(() => {
      unsub?.()
      loadIntoEditor()
    }, 5000)

    return () => {
      unsub?.()
      clearTimeout(timeout)
    }
  }, [sermon])

  const origFont = (sermon as any)?.font || (sermon?.content as Record<string, any>)?.font || getDefaultFont().id
  const oldContent = sermon?.content as Record<string, any> | undefined
  const origTextColor = oldContent?.textColor || '#2C2420'
  const origHighlight = oldContent?.highlightColor || null
  const s = sermon as any
  const origCategoryIds: string[] = s?.categories?.map((c: any) => c.category.id) ?? []
  const origTagIds: string[] = s?.tags?.map((t: any) => t.tag.id) ?? []
  const origCoverId = s?.cover?.id ?? s?.cover_id ?? null
  const coverChanged = (selectedCover?.id ?? null) !== origCoverId
  const hasData = !!title || !!preacher || !!selectedCover
  const catsChanged = JSON.stringify(categoryIds.sort()) !== JSON.stringify(origCategoryIds.sort())
  const tagsChanged = JSON.stringify(tagIds.sort()) !== JSON.stringify(origTagIds.sort())
  const isDirty = hasData && (
    title !== sermon?.title || contentDirty ||
    catsChanged || tagsChanged || coverChanged ||
    selectedFont.id !== origFont || textColor !== origTextColor ||
    (highlightColor || null) !== origHighlight
  )

  // Prevent swipe-back gesture on iOS when there are unsaved changes
  const navigation = useNavigation()
  const savingRef = useRef(false)
  usePreventRemove(isDirty && !discardingRef.current, ({ data }) => {
    if (savingRef.current) {
      navigation.dispatch(data.action)
      return
    }
    discardingRef.current = true
    Alert.alert('Descartar alterações?', 'Você tem alterações que ainda não foram salvas.', [
      { text: 'Cancelar', style: 'cancel', onPress: () => { discardingRef.current = false } },
      { text: 'Descartar', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ])
  })

  function handleBack() {
    if (isDirty) {
      discardingRef.current = true
      Alert.alert('Descartar alterações?', 'Você tem alterações que ainda não foram salvas.', [
        { text: 'Cancelar', style: 'cancel', onPress: () => { discardingRef.current = false } },
        { text: 'Descartar', style: 'destructive', onPress: () => router.back() },
      ])
    } else {
      router.back()
    }
  }

  function handleCoverSelect(cover: Cover | null) {
    setCoverImgError(false)
    setSelectedCover(cover)
  }

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
      const html = await editor.getHTML() || ''
      const plainText = await editor.getText() || ''
      const data: Record<string, any> = {
        title: title.trim(),
        content: html,
        plain_text: plainText,
        font: selectedFont.id,
        preacher: preacher.trim() || null,
        cover_id: selectedCover?.id ?? null,
      }
      if (categoryIds.length > 0) data.category_ids = categoryIds
      if (tagIds.length > 0) data.tag_ids = tagIds

      // Retry on network failure (up to 2 retries with 1s delay)
      let lastErr: any
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await updateSermon.mutateAsync({ id: id!, data: data as any })
          router.back()
          return
        } catch (e: any) {
          lastErr = e
          const isNetworkError = e?.message?.includes('Network request failed') || e?.message?.includes('fetch')
          if (!isNetworkError || attempt === 2) throw e
          console.warn(`[EditSermon] Retry ${attempt + 1}/2: network error, retrying...`)
          await new Promise(r => setTimeout(r, 1000))
        }
      }
      throw lastErr
    } catch (err: any) {
      const msg = err?.message || err?.error || JSON.stringify(err) || 'Erro desconhecido'
      console.error('[EditSermon] Error:', msg)
      Alert.alert('Erro ao salvar', 'Não foi possível salvar. Verifique sua conexão e tente novamente.')
    }
  }

  function handleDelete() {
    Alert.alert('Excluir ministração?', `"${title || sermon?.title}" será apagada permanentemente.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try { await deleteSermon.mutateAsync(id!); router.back() } catch { Alert.alert('Erro', 'Não foi possível excluir') }
      }},
    ])
  }

  function handleColorSelect(color: string) {
    if (colorMode === 'text') {
      setTextColor(color)
      if (color === '#2C2420') {
        ;(editor as any).unsetColor?.()
      } else {
        editor.setColor(color)
      }
    } else {
      const newColor = color === highlightColor ? null : color
      setHighlightColor(newColor)
      if (newColor) {
        ;(editor as any).toggleHighlight?.(newColor)
      } else {
        ;(editor as any).unsetHighlight?.()
      }
    }
  }

  function handleFontSelect(font: FontOption) {
    setSelectedFont(font)
    if (font.id === getDefaultFont().id) {
      ;(editor as any).unsetCustomFontFamily?.()
    } else {
      ;(editor as any).setCustomFontFamily?.(font.fontFamily)
    }
  }

  if (isLoading) return <LoadingScreen />

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Button title="Voltar" onPress={handleBack} variant="ghost" />
        <Text style={[styles.title, { color: colors.text.primary }]}>Editar</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.deleteBtn}>
            <Trash2 size={18} color={colors.accent.error} />
          </TouchableOpacity>
          <Button title="Salvar" onPress={handleSave} loading={updateSermon.isPending} />
        </View>
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

        <Input value={title} onChangeText={setTitle} placeholder="Título" />
        <Input value={preacher} onChangeText={setPreacher} placeholder="Quem ministrou?" />

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

        {/* Rich text toolbar */}
        <FormattingToolbar
          editor={editor}
          onFontPress={() => setShowFonts(true)}
          onColorPress={(mode) => { setColorMode(mode); setShowColors(true) }}
          activeTextColor={textColor}
          activeHighlight={highlightColor}
        />

        {/* Rich text editor */}
        <RichEditor
          editor={editor}
          fontFamily={selectedFont.fontFamily}
        />
      </ScrollView>

      <CoverPicker visible={showCovers} onClose={() => setShowCovers(false)} selectedCover={selectedCover} onSelect={handleCoverSelect} />
      <FontSelector visible={showFonts} onClose={() => setShowFonts(false)} selectedId={selectedFont.id} onSelect={handleFontSelect} />
      <ColorPicker visible={showColors} onClose={() => setShowColors(false)} selectedColor={colorMode === 'text' ? textColor : (highlightColor ?? '')} onSelect={handleColorSelect} mode={colorMode} />
      <CategoryPicker visible={showCategories} onClose={() => setShowCategories(false)} selectedIds={categoryIds} onSelect={(id) => setCategoryIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])} />
      <TagPicker visible={showTags} onClose={() => setShowTags(false)} selectedIds={tagIds} onSelect={(id) => setTagIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])} />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  deleteBtn: { padding: spacing.xs },
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
})
