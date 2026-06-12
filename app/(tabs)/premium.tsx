import { useState } from 'react'
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'
import { spacing, borderRadius } from '../../shared/design/spacing'
import { Button } from '../../shared/components'
import { Check, Shield, Palette, FileText, Sparkles, Infinity } from 'lucide-react-native'

const BENEFITS = [
  { icon: Shield, title: 'Remoção de anúncios', desc: 'Experiência limpa e sem interrupções.' },
  { icon: Infinity, title: 'Ministrações ilimitadas', desc: 'Plano free tem limite de 100 ministrações. Com Premium, registre sem limites.' },
  { icon: Palette, title: 'Recursos premium no editor', desc: 'Fontes exclusivas, Lettering, Manuscrita, Caligrafia, Brush e Assinatura.' },
  { icon: Sparkles, title: 'Capas exclusivas', desc: 'Coleções premium de capas para personalizar suas ministrações.' },
  { icon: FileText, title: 'Exportação em PDF', desc: 'Transforme ministrações em documentos elegantes e personalizados.' },
]

export default function PremiumTabScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [selected, setSelected] = useState<'monthly' | 'annual'>('annual')
  const [purchasing, setPurchasing] = useState(false)

  async function handlePurchase() {
    setPurchasing(true)
    try {
      Alert.alert('Bem-vindo ao Premium!', 'Em breve você poderá assinar diretamente pela loja do seu dispositivo.')
    } catch { Alert.alert('Erro', 'Compra não processada.') } finally { setPurchasing(false) }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={[styles.premiumBadge, { backgroundColor: colors.accent.warning }]}>
            <Text style={[styles.premiumBadgeText, { color: colors.text.inverse }]}>PREMIUM</Text>
          </View>
        </View>
        <Text style={[styles.heroTitle, { color: colors.text.primary }]}>Leve sua biblioteca espiritual para o próximo nível</Text>
        <Text style={[styles.heroDesc, { color: colors.text.secondary }]}>
          Mais espaço, mais personalização e uma experiência totalmente livre de distrações.
        </Text>
      </View>

      {/* Benefits */}
      <View style={styles.section}>
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

      {/* Plans */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Escolha seu plano</Text>

        {/* Annual Plan */}
        <View style={styles.planWrapper}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.highlight.green, borderColor: colors.accent.success + '40' }]}>
              <Text style={[styles.badgeText, { color: colors.accent.success }]}>Economia</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.planCard, { backgroundColor: colors.surface, borderColor: selected === 'annual' ? colors.accent.primary : colors.border }]}
            onPress={() => setSelected('annual')}
            activeOpacity={0.8}
          >
            <View style={styles.planTop}>
              <View>
                <Text style={[styles.planLabel, { color: colors.text.primary }]}>Anual</Text>
                <Text style={[styles.planPrice, { color: colors.text.primary }]}>R$ 79,90</Text>
                <Text style={[styles.planPeriod, { color: colors.text.tertiary }]}>R$ 6,66/mês — economia de 33%</Text>
              </View>
              {selected === 'annual' && (
                <View style={[styles.planCheck, { backgroundColor: colors.accent.primary }]}>
                  <Check size={14} color={colors.text.inverse} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Monthly Plan */}
        <View style={styles.planWrapper}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.accent.primaryLight, borderColor: colors.accent.primary + '40' }]}>
              <Text style={[styles.badgeText, { color: colors.accent.primary }]}>Popular</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.planCard, { backgroundColor: colors.surface, borderColor: selected === 'monthly' ? colors.accent.primary : colors.border }]}
            onPress={() => setSelected('monthly')}
            activeOpacity={0.8}
          >
            <View style={styles.planTop}>
              <View>
                <Text style={[styles.planLabel, { color: colors.text.primary }]}>Mensal</Text>
                <Text style={[styles.planPrice, { color: colors.text.primary }]}>R$ 9,90</Text>
                <Text style={[styles.planPeriod, { color: colors.text.tertiary }]}>Cancele quando quiser</Text>
              </View>
              {selected === 'monthly' && (
                <View style={[styles.planCheck, { backgroundColor: colors.accent.primary }]}>
                  <Check size={14} color={colors.text.inverse} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Button title="Assinar Premium" onPress={handlePurchase} loading={purchasing} disabled={purchasing} />

      {/* Footer */}
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
  hero: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.md },
  logoWrap: { position: 'relative', marginBottom: spacing.sm },
  logo: { width: 88, height: 88, borderRadius: 22 },
  premiumBadge: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  heroTitle: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, textAlign: 'center' },
  heroDesc: { fontSize: typography.fontSize.sm, textAlign: 'center', lineHeight: 20 },
  section: { gap: spacing.md },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
  benefitRow: { flexDirection: 'row', gap: spacing.md },
  benefitIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, gap: 2 },
  benefitTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium },
  benefitDesc: { fontSize: typography.fontSize.sm, lineHeight: 18 },
  planWrapper: { gap: spacing.xs },
  badgeRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingRight: spacing.sm, marginBottom: -10, zIndex: 1 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, borderWidth: 1 },
  planCard: { borderRadius: borderRadius.lg, borderWidth: 1.5, padding: spacing.lg, gap: spacing.sm },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planLabel: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
  planPrice: { fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold },
  planPeriod: { fontSize: typography.fontSize.sm },
  planCheck: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold },
  footer: { gap: spacing.md, paddingBottom: spacing.xl },
  disclaimer: { fontSize: typography.fontSize.xs, textAlign: 'center', lineHeight: 18 },
  guarantee: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  guaranteeText: { fontSize: typography.fontSize.xs },
})
