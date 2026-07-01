import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert, Image as RNImage } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { WebView } from 'react-native-webview'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing, borderRadius } from '../../shared/design/spacing'
import { Button, LoadingScreen, Chip } from '../../shared/components'
import { useSermonDetail, useDeleteSermon } from '../../features/sermons/hooks/useSermons'
import { FONT_OPTIONS } from '../../features/editor/components/FontSelector'
import { Calendar, User } from 'lucide-react-native'
import { getBuiltinCoverColor, isBuiltinCover } from '../../features/covers/constants'

function buildContentHtml(sermon: any, isDark: boolean): string {
  const contentData = sermon.content
  let bodyHtml = ''

  if (typeof contentData === 'string') {
    // New format: HTML string
    bodyHtml = contentData
  } else if (contentData && typeof contentData === 'object' && contentData.type === 'doc') {
    // Old format: plain_text wrapped in paragraphs
    bodyHtml = (sermon.plain_text || '')
      .split('\n')
      .map((p: string) => `<p>${p || '<br>'}</p>`)
      .join('')
  } else {
    bodyHtml = `<p>${sermon.plain_text || ''}</p>`
  }

  // Determine font: from sermon.font (new format), content JSON (old format), or default
  let fontFamily = 'Inter'
  const sermonFont = (sermon as any).font
  if (sermonFont) {
    const fontOpt = FONT_OPTIONS.find(f => f.id === sermonFont)
    if (fontOpt) fontFamily = fontOpt.fontFamily
  } else if (contentData && typeof contentData === 'object' && (contentData as any).font) {
    const fontOpt = FONT_OPTIONS.find(f => f.id === (contentData as any).font)
    if (fontOpt) fontFamily = fontOpt.fontFamily
  }
  const textColor = isDark ? '#E5E5E5' : '#2C2420'
  const bgColor = isDark ? '#121212' : '#FFFFFF'

  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Merriweather:wght@400;700&family=Caveat:wght@400;700&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Permanent+Marker&family=Pacifico&family=Nunito:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; font-size: 17px; color: ${textColor}; background: ${bgColor}; padding: 8px; line-height: 1.7; }
  p { margin: 0 0 0.75em; }
  h1 { font-size: 1.5em; margin: 1em 0 0.5em; }
  h2 { font-size: 1.3em; margin: 0.8em 0 0.4em; }
  h3 { font-size: 1.1em; margin: 0.6em 0 0.3em; }
  blockquote { border-left: 3px solid ${isDark ? '#555' : '#ccc'}; margin: 0.5em 0; padding-left: 1em; color: ${isDark ? '#999' : '#666'}; }
  ul, ol { padding-left: 1.5em; margin: 0.25em 0; }
  li { margin: 0.15em 0; }
  strong { font-weight: 700; }
  em { font-style: italic; }
  u { text-decoration: underline; }
  mark { background-color: #FEF3C7; padding: 0 2px; border-radius: 2px; }
  /* Alignment from execCommand (produces align attribute on block elements) */
  [align="left"] { text-align: left; }
  [align="center"] { text-align: center; }
  [align="right"] { text-align: right; }
  /* Inline style alignment (from execCommand on some platforms) */
  [style*="text-align:left"], [style*="text-align: left"] { text-align: left; }
  [style*="text-align:center"], [style*="text-align: center"] { text-align: center; }
  [style*="text-align:right"], [style*="text-align: right"] { text-align: right; }
</style></head>
<body>${bodyHtml}</body>
</html>`
}

const INJECTED_HEIGHT_SCRIPT = `
setTimeout(() => {
  /* Re-apply inline styles from HTML attributes.
     Some WebViews lose inline styles when loaded via source={{ html }}. */
  document.querySelectorAll('[style]').forEach(function(el) {
    var raw = el.getAttribute('style') || '';
    var ta = raw.match(/text-align\\s*:\\s*(left|center|right)/i);
    if (ta) { el.style.textAlign = ta[1]; }
    var ff = raw.match(/font-family\\s*:\\s*['\"]?([^;'\"]+)['\"]?/i);
    if (ff) { el.style.fontFamily = ff[1].trim(); }
  });
  window.ReactNativeWebView.postMessage(JSON.stringify(document.body.scrollHeight));
}, 150);
`

export default function SermonDetailScreen() {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: sermon, isLoading } = useSermonDetail(id!)
  const del = useDeleteSermon()
  const [contentHeight, setContentHeight] = useState(400)

  async function handleDelete() {
    Alert.alert('Excluir', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => { await del.mutateAsync(id!); router.back() } },
    ])
  }

  if (isLoading) return <View style={[styles.container, { backgroundColor: colors.background }]}><LoadingScreen /></View>
  if (!sermon) return <View style={[styles.container, { backgroundColor: colors.background }]}><Text style={{ color: colors.text.secondary }}>Não encontrada</Text></View>

  const date = new Date(sermon.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  const htmlContent = buildContentHtml(sermon, isDark)

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.header}>
        <Button title="Voltar" onPress={() => router.back()} variant="ghost" />
        <View style={styles.headerActions}>
          <Button title="Editar" onPress={() => router.push(`/sermon/edit/${id}` as any)} variant="ghost" />
          <Button title="Excluir" onPress={handleDelete} variant="ghost" />
        </View>
      </View>

      {/* Cover */}
      {(sermon as any).cover?.url ? (
        <RNImage
          source={{ uri: (sermon as any).cover.url }}
          style={styles.coverImage}
          resizeMode="cover"
          onError={(e) => console.warn('[SermonDetail] Cover image load error:', (sermon as any).cover.url, e.nativeEvent?.error)}
        />
      ) : isBuiltinCover((sermon as any).cover_id) ? (
        <View style={[styles.coverImage, { backgroundColor: getBuiltinCoverColor((sermon as any).cover_id) || colors.skeleton }]} />
      ) : null}

      <View style={styles.meta}>
        <View style={styles.metaRow}>
          <Calendar size={14} color={colors.text.tertiary} />
          <Text style={[styles.metaText, { color: colors.text.tertiary }]}>{date}</Text>
        </View>
        {(sermon as any).preacher && (
          <View style={styles.metaRow}>
            <User size={14} color={colors.text.tertiary} />
            <Text style={[styles.metaText, { color: colors.text.secondary }]}>{(sermon as any).preacher}</Text>
          </View>
        )}
      </View>

      {/* Categories */}
      {(sermon as any).categories?.length > 0 && (
        <View style={styles.chipRow}>
          {(sermon as any).categories.map((c: any) => (
            <Chip key={c.category.id} label={c.category.name} variant="selected" />
          ))}
        </View>
      )}

      {/* Tags */}
      {(sermon as any).tags?.length > 0 && (
        <View style={styles.chipRow}>
          {(sermon as any).tags.map((t: any) => (
            <Chip key={t.tag.id} label={t.tag.name} variant="default" />
          ))}
        </View>
      )}

      <Text style={[styles.title, { color: colors.text.primary }]}>{sermon.title}</Text>

      {/* Rich content via WebView */}
      <View style={[styles.contentContainer, { height: Math.max(contentHeight, 200) }]}>
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent, baseUrl: 'https://gracenote.app/' }}
          scrollEnabled={false}
          style={[styles.contentWebView, { backgroundColor: 'transparent' }]}
          onMessage={(e) => {
            try {
              const h = Number(JSON.parse(e.nativeEvent.data))
              if (h > 0) setContentHeight(h + 16)
            } catch { /* ignore */ }
          }}
          injectedJavaScript={INJECTED_HEIGHT_SCRIPT}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing['4xl'] },
  coverImage: { width: '100%', height: 160, borderRadius: borderRadius.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  headerActions: { flexDirection: 'row', gap: spacing.xs },
  meta: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { fontSize: typography.fontSize.sm },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold },
  contentContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  contentWebView: {
    flex: 1,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
})
