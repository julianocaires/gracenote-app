import { useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { light, dark } from '../design'
import { useThemeStore } from './useThemeStore'
import type { ThemeMode } from './useThemeStore'
import type { ThemeColors } from '../design'

function resolve(mode: ThemeMode, system: string | null | undefined): ThemeColors {
  const s = (system === 'dark' ? 'dark' : 'light') as 'light' | 'dark'
  return (mode === 'system' ? s : mode) === 'dark' ? dark : light
}

export function useTheme() {
  const system = useColorScheme()
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)
  const isDark = (mode === 'system' ? system : mode) === 'dark'

  const colors = useMemo(() => resolve(mode, system), [mode, system])

  return useMemo(() => ({ colors, mode, setMode, isDark }), [colors, mode, setMode, isDark])
}
