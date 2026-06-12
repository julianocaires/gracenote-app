import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { Tabs, router } from 'expo-router'
import { Library, Search, Crown, User, Plus } from 'lucide-react-native'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'

export default function TabLayout() {
  const { colors } = useTheme()
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accent.primary,
      tabBarInactiveTintColor: colors.text.tertiary,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, paddingTop: 4 },
      tabBarLabelStyle: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <Library size={size} stroke={color} /> }} />
      <Tabs.Screen name="search" options={{ title: 'Buscar', tabBarIcon: ({ color, size }) => <Search size={size} stroke={color} /> }} />
      <Tabs.Screen name="create-button" options={{
        title: '',
        tabBarIcon: ({ size }) => (
          <View style={[styles.createBtn, { backgroundColor: colors.accent.primary, bottom: Platform.OS === 'ios' ? 4 : 8 }]}>
            <Plus size={28} color={colors.text.inverse} />
          </View>
        ),
        tabBarButton: (props) => {
          const { children, style } = props
          return (
            <TouchableOpacity
              onPress={() => router.push('/sermon/create')}
              style={style}
              activeOpacity={0.8}
            >
              {children}
            </TouchableOpacity>
          )
        },
        tabBarLabel: () => null,
      }} />
      <Tabs.Screen name="premium" options={{ title: 'Premium', tabBarIcon: ({ color, size }) => <Crown size={size} stroke={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <User size={size} stroke={color} /> }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
})
