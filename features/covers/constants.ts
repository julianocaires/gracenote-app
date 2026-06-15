// UUIDs for built-in covers (inserted by migration 006)
export const BUILTIN_COVER_IDS = {
  COVER_1: 'c0a00001-0001-4000-8000-000000000001', // Light beige
  COVER_2: 'c0a00002-0002-4000-8000-000000000002', // Terracotta
  COVER_3: 'c0a00003-0003-4000-8000-000000000003', // Gold
  COVER_4: 'c0a00004-0004-4000-8000-000000000004', // Dark (premium)
  COVER_5: 'c0a00005-0005-4000-8000-000000000005', // Purple (premium)
  COVER_6: 'c0a00006-0006-4000-8000-000000000006', // Green (premium)
} as const

// Gradient color pairs for each built-in cover (used by CoverPicker preview)
export const BUILTIN_COVER_GRADIENTS: Record<string, [string, string]> = {
  [BUILTIN_COVER_IDS.COVER_1]: ['#F5F2EF', '#FBF8F5'],
  [BUILTIN_COVER_IDS.COVER_2]: ['#C7705C', '#EAA58B'],
  [BUILTIN_COVER_IDS.COVER_3]: ['#D4A853', '#FAE2AD'],
  [BUILTIN_COVER_IDS.COVER_4]: ['#2D2420', '#6B6158'],
  [BUILTIN_COVER_IDS.COVER_5]: ['#7C3AED', '#A78BFA'],
  [BUILTIN_COVER_IDS.COVER_6]: ['#059669', '#34D399'],
}

// Primary color for each built-in cover (used by SermonCard and detail screen)
export const BUILTIN_COVER_COLORS: Record<string, string> = {
  [BUILTIN_COVER_IDS.COVER_1]: '#F5F2EF',
  [BUILTIN_COVER_IDS.COVER_2]: '#C7705C',
  [BUILTIN_COVER_IDS.COVER_3]: '#D4A853',
  [BUILTIN_COVER_IDS.COVER_4]: '#2D2420',
  [BUILTIN_COVER_IDS.COVER_5]: '#7C3AED',
  [BUILTIN_COVER_IDS.COVER_6]: '#059669',
}

// Set of built-in cover IDs for fast lookup
const BUILTIN_IDS: Set<string> = new Set(Object.values(BUILTIN_COVER_IDS))

export function isBuiltinCover(id: string | null | undefined): boolean {
  return !!id && BUILTIN_IDS.has(id)
}

export function getBuiltinCoverColor(id: string | null | undefined): string | undefined {
  if (!id) return undefined
  return BUILTIN_COVER_COLORS[id]
}

export function getBuiltinCoverGradient(id: string): [string, string] | undefined {
  return BUILTIN_COVER_GRADIENTS[id]
}
