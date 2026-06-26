import { BridgeExtension } from '@10play/tentap-editor'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-text-style/font-family'

/**
 * Bridge that applies font-family to the current text selection.
 *
 * The corresponding web-side bridge is injected into the editorHtml
 * via patch-package. This native-side bridge sends messages that
 * the web-side bridge handles via TipTap commands.
 */
type FontMessage = { type: 'setFontFamily'; payload: string } | { type: 'unsetFontFamily' }

export const FontFamilyBridge = new BridgeExtension<
  { activeFontFamily: string | undefined },
  { setCustomFontFamily: (fontFamily: string) => void; unsetCustomFontFamily: () => void },
  FontMessage
>({
  tiptapExtension: FontFamily,
  tiptapExtensionDeps: [TextStyle],

  onBridgeMessage: (editor, message) => {
    if (message.type === 'setFontFamily') {
      editor.chain().focus().setFontFamily(message.payload).run()
      return true
    }
    if (message.type === 'unsetFontFamily') {
      editor.chain().focus().unsetFontFamily().run()
      return true
    }
    return false
  },

  extendEditorInstance: (sendBridgeMessage) => ({
    setCustomFontFamily: (fontFamily: string) => {
      sendBridgeMessage({ type: 'setFontFamily', payload: fontFamily })
    },
    unsetCustomFontFamily: () => {
      sendBridgeMessage({ type: 'unsetFontFamily' })
    },
  }),

  extendEditorState: (editor) => {
    const attrs = editor.getAttributes('textStyle')
    return { activeFontFamily: attrs.fontFamily || undefined }
  },

})
