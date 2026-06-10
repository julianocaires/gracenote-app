import { TextInput, View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { typography } from '../design/typography'
import { spacing, borderRadius } from '../design/spacing'
interface InputProps { value: string; onChangeText: (t: string) => void; placeholder?: string; label?: string; multiline?: boolean; secureTextEntry?: boolean; error?: string; keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' }
export function Input({ value, onChangeText, placeholder, label, multiline, secureTextEntry, error, keyboardType, autoCapitalize }: InputProps) {
  const { colors } = useTheme()
  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>}
      <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: error ? colors.accent.error : colors.border, minHeight: multiline ? 120 : 48 }]} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.text.tertiary} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize={autoCapitalize} />
      {error && <Text style={[styles.error, { color: colors.accent.error }]}>{error}</Text>}
    </View>
  )
}
const styles = StyleSheet.create({ wrapper: { gap: spacing.xs }, label: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }, input: { fontSize: typography.fontSize.base, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, borderRadius: borderRadius.md, borderWidth: 1 }, error: { fontSize: typography.fontSize.xs } })
