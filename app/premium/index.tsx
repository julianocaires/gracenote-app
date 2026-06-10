import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing, borderRadius } from '../../shared/design/spacing'
import { Button } from '../../shared/components'
import { Crown, Check, Infinity, Palette, Image, FileText, Sparkles, Shield, X } from 'lucide-react-native'

const BENEFITS = [
  { icon: Infinity, title: 'Biblioteca ilimitada', desc: 'Registre quantas ministrações quiser, sem limites.' },
  { icon: Shield, title: 'Sem anúncios', desc: 'Experiência limpa e sem interrupções.' },
  { icon: Palette, title: 'Fontes Premium', desc: 'Lettering, Manuscrita, Caligrafia, Brush e Assinatura.' },
  { icon: Image, title: 'Capas Premium', desc: 'Coleções exclusivas de capas para suas ministrações.' },
  { icon: FileText, title: 'Exportação em PDF', desc: 'Transforme ministrações em documentos elegantes.' },
  { icon: Sparkles, title: 'Selo Premium', desc: 'Destaque visual exclusivo no seu perfil.' },
]

export default function PremiumScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [selected, setSelected] = useState<'monthly' | 'annual'>('annual')
  const [purchasing, setPurchasing] = useState(false)

  async function handlePurchase() {
    setPurchasing(true)
    try {
      Alert.alert('Bem-vindo ao Premium!', 'Aproveite todos os recursos.')
      router.back()
    } catch { Alert.alert('Erro', 'Compra não processada.') } finally { setPurchasing(false) }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: colors.accent.warning + '20' }]}>
          <Crown size={48} color={colors.accent.warning} />
        </View>
        <Text style={[styles.heroTitle, { color: colors.text.primary }]}>Leve sua biblioteca espiritual para o próximo nível</Text>
        <Text style={[styles.heroDesc, { color: colors.text.secondary }]}>
          Tenha mais espaço, mais personalização e uma experiência totalmente livre de distrações.
        </Text>
      </View>

      <View style={styles.benefitsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Todos os benefícios</Text>
        {BENEFITS.map((b) => (
          <View key={b.title} style={styles.benefitRow}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.accent.primaryLight }]}>
              <b.icon size={18} color={colors.accent.primary} />
            </View>
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, { color: colors.text.primary }]}>{b.title}</Text>
              <Text style={[styles.benefitDesc, { color: colors.text.tertiary }]}>{b.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.plansSection}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Escolha seu plano</Text>
        <TouchableOpacity
          style={[styles.planCard, { backgroundColor: colors.surface, borderColor: selected === 'annual' ? colors.accent.primary : colors.border }]}
          onPress={() => setSelected('annual')}
        >
          <View style={styles.planTop}>
            <View>
              <Text style={[styles.planLabel, { color: colors.text.primary }]}>Anual</Text>
              <Text style={[styles.planPrice, { color: colors.text.primary }]}>R$ 79,90</Text>
              <Text style={[styles.planPeriod, { color: colors.text.tertiary }]}>R$ 6,66/mês — economia de 33%</Text>
            </View>
            {selected === 'annual' && (
              <View style={[styles.planCheck, { backgroundColor: colors.accent.primary }]}>
                <Check size={14} color="#fff" />
              </View>
            )}
          </View>
          <View style={[styles.bestBadge, { backgroundColor: colors.accent.primary }]}>
            <Text style={styles.bestText}>Melhor oferta</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.planCard, { backgroundColor: colors.surface, borderColor: selected === 'monthly' ? colors.accent.primary : colors.border }]}
          onPress={() => setSelected('monthly')}
        >
          <View style={styles.planTop}>
            <View>
              <Text style={[styles.planLabel, { color: colors.text.primary }]}>Mensal</Text>
              <Text style={[styles.planPrice, { color: colors.text.primary }]}>R$ 9,90</Text>
              <Text style={[styles.planPeriod, { color: colors.text.tertiary }]}>Cancele quando quiser</Text>
            </View>
            {selected === 'monthly' && (
              <View style={[styles.planCheck, { backgroundColor: colors.accent.primary }]}>
                <Check size={14} color="#fff" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Button title="Assinar Premium" onPress={handlePurchase} loading={purchasing} disabled={purchasing} />

      <View style={styles.footer}>
        <Text style={[styles.disclaimer, { color: colors.text.tertiary }]}>
          Pagamento cobrado na sua conta da loja. Assinatura renovada automaticamente, cancele quando quiser.
        </Text>
        <View style={styles.guarantee}>
          <Shield size={14} color={colors.accent.success} />
          <Text style={[styles.guaranteeText, { color: colors.text.secondary }]}>Satisfação garantida. Cancele a qualquer momento.</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing['2xl'] },
  hero: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.xl },
  heroIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, textAlign: 'center' },
  heroDesc: { fontSize: typography.fontSize.sm, textAlign: 'center', lineHeight: 20 },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
  benefitsSection: { gap: spacing.md },
  benefitRow: { flexDirection: 'row', gap: spacing.md },
  benefitIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, gap: 2 },
  benefitTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium },
  benefitDesc: { fontSize: typography.fontSize.sm, lineHeight: 18 },
  plansSection: { gap: spacing.md },
  planCard: { borderRadius: borderRadius.lg, borderWidth: 1.5, padding: spacing.lg, gap: spacing.sm, position: 'relative' },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planLabel: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
  planPrice: { fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold },
  planPeriod: { fontSize: typography.fontSize.sm },
  planCheck: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bestBadge: { position: 'absolute', top: -10, right: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  bestText: { color: '#fff', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold },
  footer: { gap: spacing.md, paddingBottom: spacing.xl },
  disclaimer: { fontSize: typography.fontSize.xs, textAlign: 'center', lineHeight: 18 },
  guarantee: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  guaranteeText: { fontSize: typography.fontSize.xs },
})
