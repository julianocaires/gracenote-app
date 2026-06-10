import { Modal as RNModal, View, StyleSheet, Pressable } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { spacing, borderRadius } from '../design/spacing'
interface ModalProps { visible: boolean; onClose: () => void; children: React.ReactNode }
export function Modal({ visible, onClose, children }: ModalProps) {
  const { colors } = useTheme()
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.content, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>{children}</Pressable>
      </Pressable>
    </RNModal>
  )
}
const styles = StyleSheet.create({ overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }, content: { width: '100%', maxWidth: 400, borderRadius: borderRadius.lg, padding: spacing.lg } })
