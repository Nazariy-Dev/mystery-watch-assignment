/** Candy night: near-black indigo base, electric-violet accent with glossy controls, glowing rarity hues. */
export const darkTheme = {
  colors: {
    background: '#0D0A1F',
    surface: '#18142F',
    surfaceRaised: '#231D45',
    border: 'rgba(236, 230, 255, 0.08)',
    text: '#F4F1FF',
    textMuted: '#9F98C8',
    primary: '#6D3BFF',
    /** Lighter violet for accent text and icons: plain `primary` is too dark to read on the base. */
    accent: '#A68BFF',
    onPrimary: '#FFFFFF',
    /** Hot pink for promo banners and "new" badges. */
    promo: '#FF2E93',
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
  /** Embedded at build time by the expo-font plugin (app.json); pair each family with a `fontWeight`. */
  fonts: {
    display: 'Unbounded',
    body: 'Manrope',
  },
  /** Two weights only, for a calm type ramp; app.json embeds Unbounded 700 and Manrope 500/700 for them. */
  fontWeight: {
    medium: '500',
    bold: '700',
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
