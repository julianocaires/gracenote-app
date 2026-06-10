import { Tabs } from 'expo-router'
import { Library, Search, Heart, User } from 'lucide-react-native'
import { useTheme } from '../../shared/hooks/useTheme'
import { typography } from '../../shared/design/typography'

export default function TabLayout() {
  const { colors } = useTheme()
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accent.primary,
      tabBarInactiveTintColor: colors.text.tertiary,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      tabBarLabelStyle: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <Library size={size} stroke={color} /> }} />
      <Tabs.Screen name="search" options={{ title: 'Buscar', tabBarIcon: ({ color, size }) => <Search size={size} stroke={color} /> }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favoritos', tabBarIcon: ({ color, size }) => <Heart size={size} stroke={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <User size={size} stroke={color} /> }} />
    </Tabs>
  )
}
