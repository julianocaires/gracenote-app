import { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, BackHandler, Image as RNImage } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useNavigation } from 'expo-router'
import { usePreventRemove } from '@react-navigation/native'
import {
  useEditorBridge,
  TenTapStartKit,
  defaultEditorTheme,
  darkEditorTheme,
} from '@10play/tentap-editor'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing, borderRadius } from '../../shared/design/spacing'
import { Button, Input } from '../../shared/components'
import { CategoryPicker } from '../../features/categories/components/CategoryPicker'
import { TagPicker } from '../../features/tags/components/TagPicker'
import { CoverPicker } from '../../features/covers/components/CoverPicker'
import { FontSelector, getDefaultFont } from '../../features/editor/components/FontSelector'
import { ColorPicker } from '../../features/editor/components/ColorPicker'
import { RichEditor } from '../../features/editor/components/RichEditor'
import { FormattingToolbar } from '../../features/editor/components/FormattingToolbar'
import { TextAlignBridge } from '../../features/editor/bridges/TextAlignBridge'
import { FontFamilyBridge } from '../../features/editor/bridges/FontFamilyBridge'
import { useCreateSermon, useSermonLimit } from '../../features/sermons/hooks/useSermons'
import { Image as ImageIcon } from 'lucide-react-native'
import type { Cover } from '../../shared/types'
import type { FontOption } from '../../features/editor/components/FontSelector'
import { getBuiltinCoverColor } from '../../features/covers/constants'

export default function CreateSermonScreen() {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const createSermon = useCreateSermon()
  const { data: limit } = useSermonLimit()
  const [title, setTitle] = useState('')
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
  const [contentDirty, setContentDirty] = useState(false)
  const initialLoadRef = useRef(true)

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

  // Allow dirty tracking after initial load
  useEffect(() => { initialLoadRef.current = false }, [])

  const handleCoverSelect = useCallback((cover: Cover | null) => {
    setCoverImgError(false)
    setSelectedCover(cover)
  }, [])

  const isDirty = !!title || contentDirty || !!preacher || !!selectedCover || categoryIds.length > 0 || tagIds.length > 0 || selectedFont.id !== getDefaultFont().id || textColor !== '#2C2420' || !!highlightColor

  // Prevent swipe-back gesture on iOS when there are unsaved changes
  const navigation = useNavigation()
  const savingRef = useRef(false)
  const discardingRef = useRef(false)
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
    savingRef.current = true
    try {
      const html = await editor.getHTML() || ''
      const plainText = await editor.getText() || ''
      const payload = {
        title: title.trim(),
        content: html,
        plain_text: plainText,
        font: selectedFont.id,
        preacher: preacher.trim() || null,
        cover_id: selectedCover?.id ?? null,
        category_ids: categoryIds,
        tag_ids: tagIds,
      }

      // Retry on network failure (up to 2 retries with 1s delay)
      let lastErr: any
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await createSermon.mutateAsync(payload)
          router.back()
          return
        } catch (e: any) {
          lastErr = e
          if (e?.message === 'LIMIT_REACHED') { router.push('/premium'); return }
          const isNetworkError = e?.message?.includes('Network request failed') || e?.message?.includes('fetch')
          if (!isNetworkError || attempt === 2) throw e
          console.warn(`[CreateSermon] Retry ${attempt + 1}/2: network error, retrying...`)
          await new Promise(r => setTimeout(r, 1000))
        }
      }
      throw lastErr
    } catch (err) {
      console.error('[CreateSermon] Error:', err)
      const msg = (err as any)?.message || String(err)
      Alert.alert('Erro ao criar', msg || 'Não foi possível salvar. Verifique sua conexão e tente novamente.')
    }
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

        <Input value={title} onChangeText={setTitle} placeholder="Título da ministração" />
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
