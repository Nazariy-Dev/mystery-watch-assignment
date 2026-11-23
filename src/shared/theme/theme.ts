/** Neon night vault: near-black indigo base, icy-teal accent matching the box seam, glowing rarity hues. */
export const darkTheme = {
  colors: {
    background: '#0B0B1A',
    surface: '#15152B',
    surfaceRaised: '#1E1E3B',
    border: 'rgba(242, 243, 255, 0.08)',
    text: '#F2F3FF',
    textMuted: '#9A9CC4',
    primary: '#5CE1E6',
    onPrimary: '#0B0B1A',
    coin: '#FFC83D',
    danger: '#FF5A7A',
    success: '#3DDC97',
  },
  rarity: {
    common: '#A7B0C8',
    rare: '#4FC3FF',
    epic: '#B66DFF',
    legendary: '#FFB020',
  },
  fonts: {
    display: 'Unbounded_700Bold',
    displayHeavy: 'Unbounded_800ExtraBold',
    body: 'Manrope_500Medium',
    bodySemiBold: 'Manrope_600SemiBold',
    bodyBold: 'Manrope_700Bold',
  },
  /** 4pt grid: `gap(4)` → 16. */
  gap: (multiplier: number) => multiplier * 4,
  radius: {
    sm: 8,
    md: 14,
    lg: 22,
    pill: 999,
  },
} as const;

export type AppTheme = typeof darkTheme;
export type Rarity = keyof AppTheme['rarity'];
