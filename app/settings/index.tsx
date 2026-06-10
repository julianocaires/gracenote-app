import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing, borderRadius } from '../../shared/design/spacing'
import { Button } from '../../shared/components'
import { Bell, Globe, Database, ChevronRight } from 'lucide-react-native'

export default function SettingsScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing['4xl'] }]}>
      <View style={styles.header}>
        <Button title="Voltar" onPress={() => router.back()} variant="ghost" />
        <Text style={[styles.title, { color: colors.text.primary }]}>Configurações</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Aparência</Text>
        <SettingRow icon={Globe} label="Idioma" value="Português" onPress={() => {}} colors={colors} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Notificações</Text>
        <ToggleRow icon={Bell} label="Notificações" value={notificationsEnabled} onToggle={setNotificationsEnabled} colors={colors} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Dados</Text>
        <ToggleRow icon={Database} label="Backup automático" value={autoBackup} onToggle={setAutoBackup} colors={colors} />
      </View>
    </ScrollView>
  )
}

function SettingRow({ icon: Icon, label, value, onPress, colors }: { icon: any; label: string; value: string; onPress: () => void; colors: any }) {
  return (
    <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.rowLeft}>
        <Icon size={18} color={colors.text.secondary} />
        <Text style={[styles.rowLabel, { color: colors.text.primary }]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowValue, { color: colors.text.tertiary }]}>{value}</Text>
        <ChevronRight size={14} color={colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  )
}

function ToggleRow({ icon: Icon, label, value, onToggle, colors }: { icon: any; label: string; value: boolean; onToggle: (v: boolean) => void; colors: any }) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rowLeft}>
        <Icon size={18} color={colors.text.secondary} />
        <Text style={[styles.rowLabel, { color: colors.text.primary }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.accent.primaryLight }}
        thumbColor={value ? colors.accent.primary : colors.text.tertiary}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing['2xl'], paddingBottom: spacing['4xl'] },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.md },
  title: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, textTransform: 'uppercase', letterSpacing: 1, paddingLeft: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowLabel: { fontSize: typography.fontSize.base },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rowValue: { fontSize: typography.fontSize.sm },
})
