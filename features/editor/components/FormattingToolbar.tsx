import { useMemo } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useBridgeState } from '@10play/tentap-editor'
import type { EditorBridge } from '@10play/tentap-editor'
import { useTheme } from '../../../shared/hooks/useTheme'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Highlighter,
  Undo2,
  Redo2,
  Type,
} from 'lucide-react-native'

interface FormattingToolbarProps {
  editor: EditorBridge
  onFontPress: () => void
  onColorPress: (mode: 'text' | 'highlight') => void
  activeTextColor?: string | null
  activeHighlight?: string | null
}

/**
 * Rich-text formatting toolbar.
 *
 * Layout (horizontally scrollable):
 * [Font] | [B] [I] [U] | [H2] [•≡] [1.≡] [❝] | [≡◁] [≡◁▸] [≡▸] | [A•] [🖌] | [↩] [↪]
 */
export function FormattingToolbar({
  editor,
  onFontPress,
  onColorPress,
  activeTextColor,
  activeHighlight,
}: FormattingToolbarProps) {
  const { colors } = useTheme()
  const state = useBridgeState(editor)

  const buttons = useMemo(() => {
    const iconProps = { size: 18, strokeWidth: 2 }

    return [
      // --- Font (native modal trigger) ---
      {
        key: 'font',
        icon: <Type {...iconProps} />,
        onPress: onFontPress,
        active: false,
        disabled: false,
      },

      // --- Text formatting ---
      {
        key: 'bold',
        icon: <Bold {...iconProps} />,
        onPress: () => editor.toggleBold(),
        active: state.isBoldActive,
        disabled: !state.canToggleBold,
      },
      {
        key: 'italic',
        icon: <Italic {...iconProps} />,
        onPress: () => editor.toggleItalic(),
        active: state.isItalicActive,
        disabled: !state.canToggleItalic,
      },
      {
        key: 'underline',
        icon: <Underline {...iconProps} />,
        onPress: () => editor.toggleUnderline(),
        active: state.isUnderlineActive,
        disabled: !state.canToggleUnderline,
      },

      // --- Structure ---
      {
        key: 'heading',
        icon: <Heading2 {...iconProps} />,
        onPress: () => editor.toggleHeading(2),
        active: state.headingLevel === 2,
        disabled: false,
      },
      {
        key: 'bulletList',
        icon: <List {...iconProps} />,
        onPress: () => editor.toggleBulletList(),
        active: state.isBulletListActive,
        disabled: !state.canToggleBulletList,
      },
      {
        key: 'orderedList',
        icon: <ListOrdered {...iconProps} />,
        onPress: () => editor.toggleOrderedList(),
        active: state.isOrderedListActive,
        disabled: !state.canToggleOrderedList,
      },
      {
        key: 'blockquote',
        icon: <Quote {...iconProps} />,
        onPress: () => editor.toggleBlockquote(),
        active: state.isBlockquoteActive,
        disabled: !state.canToggleBlockquote,
      },

      // --- Alignment ---
      {
        key: 'alignLeft',
        icon: <AlignLeft {...iconProps} />,
        onPress: () => (editor as any).setCustomTextAlign?.('left'),
        active: (state as any).activeCustomTextAlign === 'left',
        disabled: false,
      },
      {
        key: 'alignCenter',
        icon: <AlignCenter {...iconProps} />,
        onPress: () => (editor as any).setCustomTextAlign?.('center'),
        active: (state as any).activeCustomTextAlign === 'center',
        disabled: false,
      },
      {
        key: 'alignRight',
        icon: <AlignRight {...iconProps} />,
        onPress: () => (editor as any).setCustomTextAlign?.('right'),
        active: (state as any).activeCustomTextAlign === 'right',
        disabled: false,
      },

      // --- Color / Highlight (native modal triggers) ---
      {
        key: 'textColor',
        icon: <Palette {...iconProps} />,
        onPress: () => onColorPress('text'),
        active: !!activeTextColor && activeTextColor !== '#2C2420',
        disabled: false,
      },
      {
        key: 'highlight',
        icon: <Highlighter {...iconProps} />,
        onPress: () => onColorPress('highlight'),
        active: !!activeHighlight,
        disabled: false,
      },

      // --- History ---
      {
        key: 'undo',
        icon: <Undo2 {...iconProps} />,
        onPress: () => editor.undo(),
        active: false,
        disabled: !state.canUndo,
      },
      {
        key: 'redo',
        icon: <Redo2 {...iconProps} />,
        onPress: () => editor.redo(),
        active: false,
        disabled: !state.canRedo,
      },
    ]
  }, [state, activeTextColor, activeHighlight, editor, onFontPress, onColorPress])

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always">
        {buttons.map((btn, i) => {
          const active = btn.active
          const disabled = btn.disabled
          return (
            <TouchableOpacity
              key={btn.key}
              onPress={btn.onPress}
              disabled={disabled}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              style={[
                styles.btn,
                active && { backgroundColor: colors.accent.primaryLight },
              ]}
            >
              {cloneIcon(btn.icon, {
                color: disabled ? colors.text.tertiary : active ? colors.accent.primary : colors.text.secondary,
              })}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

/** Clone a lucide icon element with overridden props */
function cloneIcon(icon: React.ReactElement, props: Record<string, any>): React.ReactElement {
  return {
    ...(icon as any),
    props: { ...(icon as any).props, ...props },
  } as React.ReactElement
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: 2,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
