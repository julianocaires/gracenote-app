import { useFonts } from 'expo-font'
import { Inter_400Regular, Inter_700Bold, Inter_400Regular_Italic } from '@expo-google-fonts/inter'
import { Merriweather_400Regular, Merriweather_700Bold } from '@expo-google-fonts/merriweather'
import { Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat'

/**
 * Hook that loads all custom fonts used in the app.
 * Font family names registered here must match the `fontFamily` values
 * used in TextInput, FontSelector, and the editor WebView CSS.
 *
 * Returns the same tuple as expo-font's useFonts: [loaded, error]
 */
export function useLoadFonts() {
  return useFonts({
    Inter: Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
    'Inter-Italic': Inter_400Regular_Italic,
    Merriweather: Merriweather_400Regular,
    'Merriweather-Bold': Merriweather_700Bold,
    Caveat: Caveat_400Regular,
    'Caveat-Bold': Caveat_700Bold,
  })
}
