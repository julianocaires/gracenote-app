export const palette = {
  offWhite: '#FAFAF9',
  warmWhite: '#FEFCF9',
  white: '#FFFFFF',
  warmBlack: '#2C2420',
  nearBlack: '#1C1917',
  gray: { 50: '#F5F2EF', 100: '#E8E2DC', 200: '#D4CBC2', 300: '#B8ADA3', 400: '#8F847A', 500: '#6B6158', 600: '#554C44', 700: '#3D3630', 800: '#2A2522', 900: '#1A1714' },
  terracotta: { 50: '#FDF2EE', 100: '#F9E4DA', 200: '#F2C9B6', 300: '#EAA58B', 400: '#E08464', 500: '#D4725C', 600: '#C7705C', 700: '#A55746', 800: '#86473A', 900: '#6F3D31' },
  gold: { 50: '#FEF9EE', 100: '#FDF2D9', 200: '#FAE2AD', 300: '#F6CE7A', 400: '#F1B84A', 500: '#D4A853', 600: '#C28F3B', 700: '#A37434', 800: '#855E2E', 900: '#6E4D27' },
  emerald: { 400: '#34D399', 500: '#10B981', 600: '#059669' },
  amber: { 300: '#FCD34D', 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706' },
  red: { 400: '#F87171', 500: '#EF4444', 600: '#DC2626' },
  highlight: { yellow: '#FEF3C7', green: '#D1FAE5', blue: '#DBEAFE', pink: '#FCE7F3', orange: '#FED7AA' },
}

export const light = {
  background: palette.offWhite,
  surface: palette.warmWhite,
  text: { primary: palette.warmBlack, secondary: palette.gray[400], tertiary: palette.gray[300], inverse: palette.white },
  accent: { primary: palette.terracotta[600], primaryLight: palette.terracotta[50], secondary: palette.gold[500], success: palette.emerald[500], warning: palette.amber[500], error: palette.red[500] },
  border: palette.gray[100],
  borderLight: palette.gray[50],
  highlight: { yellow: palette.highlight.yellow, green: palette.highlight.green, blue: palette.highlight.blue, pink: palette.highlight.pink, orange: palette.highlight.orange },
  skeleton: palette.gray[100],
  overlay: 'rgba(44,36,32,0.3)',
}

export const dark = {
  background: palette.gray[900],
  surface: palette.gray[800],
  text: { primary: palette.gray[50], secondary: palette.gray[300], tertiary: palette.gray[400], inverse: palette.gray[900] },
  accent: { primary: palette.terracotta[400], primaryLight: palette.terracotta[900], secondary: palette.gold[400], success: palette.emerald[400], warning: palette.amber[400], error: palette.red[400] },
  border: palette.gray[700],
  borderLight: palette.gray[800],
  highlight: { yellow: palette.highlight.yellow + '40', green: palette.highlight.green + '40', blue: palette.highlight.blue + '40', pink: palette.highlight.pink + '40', orange: palette.highlight.orange + '40' },
  skeleton: palette.gray[700],
  overlay: 'rgba(0,0,0,0.5)',
}

export type ThemeColors = typeof light
