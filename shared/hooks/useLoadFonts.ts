import { useFonts } from 'expo-font'
import { Inter_400Regular, Inter_700Bold, Inter_400Regular_Italic } from '@expo-google-fonts/inter'
import { Merriweather_400Regular, Merriweather_700Bold } from '@expo-google-fonts/merriweather'
import { Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat'
import { DancingScript_400Regular, DancingScript_700Bold } from '@expo-google-fonts/dancing-script'
import { GreatVibes_400Regular } from '@expo-google-fonts/great-vibes'
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker'
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico'
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito'
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display'
import { Lora_400Regular, Lora_700Bold } from '@expo-google-fonts/lora'

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
    'Dancing Script': DancingScript_400Regular,
    'Dancing Script-Bold': DancingScript_700Bold,
    'Great Vibes': GreatVibes_400Regular,
    'Permanent Marker': PermanentMarker_400Regular,
    Pacifico: Pacifico_400Regular,
    Nunito: Nunito_400Regular,
    'Nunito-Bold': Nunito_700Bold,
    'Playfair Display': PlayfairDisplay_400Regular,
    'Playfair Display-Bold': PlayfairDisplay_700Bold,
    Lora: Lora_400Regular,
    'Lora-Bold': Lora_700Bold,
  })
}
