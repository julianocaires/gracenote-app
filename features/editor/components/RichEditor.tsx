import { useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  RichText,
  type EditorBridge,
} from '@10play/tentap-editor'
import { useTheme } from '../../../shared/hooks/useTheme'
import { borderRadius } from '../../../shared/design/spacing'
import { EditorLoadingOverlay } from './EditorLoadingOverlay'

interface RichEditorProps {
  editor: EditorBridge
  fontFamily?: string
  placeholder?: string
}

/**
 * Rich-text editor component wrapping @10play/tentap-editor's RichText WebView.
 *
 * The EditorBridge instance is created by the parent screen and passed as a prop,
 * so both the toolbar and the editor share the same bridge without ref issues.
 *
 * Font-family is injected ONCE as default; per-selection font changes are handled
 * by the FontFamilyBridge (TipTap textStyle mark) — NOT by re-injecting CSS.
 *
 * The loading overlay has a solid background, so the placeholder text
 * is never visible during loading — no need for delayed injection.
 */
export function RichEditor({
  editor,
  fontFamily: _fontFamily,
  placeholder = 'Escreva sua ministração aqui...',
}: RichEditorProps) {
  const { isDark } = useTheme()
  const cssInjectedRef = useRef(false)

  // Inject editor CSS on mount (one-time). Font-family here is the FALLBACK default
  // for unstyled text. Per-selection font changes come from TipTap marks (inline styles)
  // which override this class-level declaration.
  useEffect(() => {
    if (cssInjectedRef.current) return
    cssInjectedRef.current = true

    const textColor = isDark ? '#E5E5E5' : '#2C2420'
    const placeholderColor = isDark ? '#666' : '#999'
    const blockquoteBorder = isDark ? '#555' : '#ccc'
    const blockquoteColor = isDark ? '#999' : '#666'

    // Inject Google Fonts <link> after WebView loads (document.head is available)
    if (editor.webviewRef?.current) {
      editor.webviewRef.current.injectJavaScript(`
        if (document.head) {
          var fontLink = document.createElement('link');
          fontLink.rel = 'stylesheet';
          fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Merriweather:wght@400;700&family=Caveat:wght@400;700&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Permanent+Marker&family=Pacifico&family=Nunito:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&display=swap';
          document.head.appendChild(fontLink);
        }
        true;
      `)
    }

    const css = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Merriweather:wght@400;700&family=Caveat:wght@400;700&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Permanent+Marker&family=Pacifico&family=Nunito:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&display=swap');
      .ProseMirror {
        font-family: 'Inter', sans-serif;
        font-size: 16px;
        line-height: 1.6;
        padding: 12px;
        min-height: 280px;
        outline: none;
        color: ${textColor};
      }
      .ProseMirror p { margin: 0 0 0.75em; }
      .ProseMirror h1 { font-size: 1.5em; margin: 1em 0 0.5em; }
      .ProseMirror h2 { font-size: 1.3em; margin: 0.8em 0 0.4em; }
      .ProseMirror h3 { font-size: 1.1em; margin: 0.6em 0 0.3em; }
      .ProseMirror blockquote { border-left: 3px solid ${blockquoteBorder}; margin: 0.5em 0; padding-left: 1em; color: ${blockquoteColor}; }
      .ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; margin: 0.25em 0; }
      .ProseMirror li { margin: 0.15em 0; }
      .ProseMirror mark { background-color: #FEF3C7; padding: 0 2px; border-radius: 2px; }
      .ProseMirror p.is-editor-empty:first-child::before {
        content: '${placeholder}';
        color: ${placeholderColor};
        float: left;
        pointer-events: none;
        height: 0;
      }
    `
    editor.injectCSS(css)
  }, [editor, isDark])

  return (
    <View style={styles.container}>
      <RichText editor={editor} style={styles.webview} />
      <EditorLoadingOverlay editor={editor} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    minHeight: 300,
    position: 'relative',
  },
  webview: {
    flex: 1,
    minHeight: 300,
  },
})
