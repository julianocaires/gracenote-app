import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import { Button, Modal, Input } from '../../../shared/components'

interface DateRangePickerProps {
  visible: boolean
  onClose: () => void
  dateFrom: string | null
  dateTo: string | null
  onSelect: (from: string | null, to: string | null) => void
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function firstOfMonthISO(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}

function thirtyDaysAgoISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}

function firstOfYearISO(): string {
  const d = new Date()
  return new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0]
}

interface QuickOption {
  label: string
  from: string | null
  to: string | null
}

const QUICK_OPTIONS: QuickOption[] = [
  { label: 'Todas as datas', from: null, to: null },
  { label: 'Este mês', from: firstOfMonthISO(), to: todayISO() },
  { label: 'Últimos 30 dias', from: thirtyDaysAgoISO(), to: todayISO() },
  { label: 'Este ano', from: firstOfYearISO(), to: todayISO() },
]

export function DateRangePicker({ visible, onClose, dateFrom, dateTo, onSelect }: DateRangePickerProps) {
  const { colors } = useTheme()
  const [customMode, setCustomMode] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const isSelected = (opt: QuickOption) =>
    dateFrom === opt.from && dateTo === opt.to

  const handleQuickSelect = useCallback(
    (opt: QuickOption) => {
      setCustomMode(false)
      onSelect(opt.from, opt.to)
    },
    [onSelect],
  )

  const handleCustomApply = useCallback(() => {
    // Parse DD/MM/AAAA to ISO or use as-is if already ISO
    const parseDate = (val: string): string | null => {
      if (!val.trim()) return null
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
      const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
      if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`
      }
      return null
    }
    const from = parseDate(customFrom)
    const to = parseDate(customTo)
    onSelect(from, to)
    setCustomMode(false)
  }, [customFrom, customTo, onSelect])

  const hasCustomSelection =
    dateFrom && !QUICK_OPTIONS.some((o) => o.from === dateFrom && o.to === dateTo)

  return (
    <Modal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Período</Text>

      {/* Quick options */}
      {QUICK_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.label}
          style={[
            styles.option,
            {
              backgroundColor: isSelected(opt) ? colors.accent.primaryLight : 'transparent',
            },
          ]}
          onPress={() => handleQuickSelect(opt)}
        >
          <Text style={[styles.optionText, { color: colors.text.primary }]}>
            {opt.label}
          </Text>
          {isSelected(opt) && (
            <Text style={[styles.checkmark, { color: colors.accent.primary }]}>✓</Text>
          )}
        </TouchableOpacity>
      ))}

      {/* Custom option */}
      <TouchableOpacity
        style={[
          styles.option,
          {
            backgroundColor:
              customMode || hasCustomSelection ? colors.accent.primaryLight : 'transparent',
          },
        ]}
        onPress={() => setCustomMode(true)}
      >
        <Text
          style={[
            styles.optionText,
            { color: customMode || hasCustomSelection ? colors.accent.primary : colors.text.primary },
          ]}
        >
          Personalizado
        </Text>
        {(customMode || hasCustomSelection) && (
          <Text style={[styles.checkmark, { color: colors.accent.primary }]}>✓</Text>
        )}
      </TouchableOpacity>

      {/* Custom date inputs */}
      {customMode && (
        <View style={styles.customRow}>
          <View style={styles.customField}>
            <Input
              value={customFrom}
              onChangeText={setCustomFrom}
              placeholder="DD/MM/AAAA"
              label="De"
            />
          </View>
          <View style={styles.customField}>
            <Input
              value={customTo}
              onChangeText={setCustomTo}
              placeholder="DD/MM/AAAA"
              label="Até"
            />
          </View>
        </View>
      )}

      <View style={styles.actions}>
        {customMode ? (
          <>
            <Button
              title="Cancelar"
              onPress={() => setCustomMode(false)}
              variant="ghost"
            />
            <Button title="Aplicar" onPress={handleCustomApply} />
          </>
        ) : (
          <Button title="Fechar" onPress={onClose} variant="ghost" />
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  optionText: {
    fontSize: typography.fontSize.base,
  },
  checkmark: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  customRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  customField: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
})
