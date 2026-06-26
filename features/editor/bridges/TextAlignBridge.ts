import { BridgeExtension } from '@10play/tentap-editor'
import TextAlign from '@tiptap/extension-text-align'

/**
 * Bridge that adds text-align support to the editor.
 *
 * The corresponding web-side bridge is injected into the editorHtml
 * via patch-package. This native-side bridge sends messages that
 * the web-side bridge handles via TipTap commands.
 */
type AlignMessage = { type: 'setTextAlign'; payload: 'left' | 'center' | 'right' } | { type: 'unsetTextAlign' }

export const TextAlignBridge = new BridgeExtension<
  { activeCustomTextAlign: 'left' | 'center' | 'right' | undefined },
  { setCustomTextAlign: (alignment: 'left' | 'center' | 'right') => void },
  AlignMessage
>({
  tiptapExtension: TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right'],
  }),
  tiptapExtensionDeps: [],

  onBridgeMessage: (editor, message) => {
    if (message.type === 'setTextAlign') {
      editor.chain().focus().setTextAlign(message.payload).run()
      return true
    }
    if (message.type === 'unsetTextAlign') {
      editor.chain().focus().unsetTextAlign().run()
      return true
    }
    return false
  },

  extendEditorInstance: (sendBridgeMessage) => ({
    setCustomTextAlign: (alignment: 'left' | 'center' | 'right') => {
      sendBridgeMessage({ type: 'setTextAlign', payload: alignment })
    },
  }),

  extendEditorState: (editor) => {
    const attrs = editor.getAttributes('paragraph')
    return { activeCustomTextAlign: attrs.textAlign || undefined }
  },

})
