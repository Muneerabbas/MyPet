/**
 * Design tokens for the "My Pet" game.
 * Soft pastel palette, generous radii and consistent spacing for a
 * polished, casual mobile-game look.
 */

export const colors = {
  // Backdrop gradient (faux gradient layered in the screen)
  bgTop: '#FDF2FF',
  bgMid: '#EFF4FF',
  bgBottom: '#E6FBFF',

  // Glass surfaces
  glass: 'rgba(255, 255, 255, 0.55)',
  glassStrong: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.85)',

  text: '#3A2E55',
  textSoft: '#7C7196',
  white: '#FFFFFF',

  // Stat colors
  happiness: '#FF7BAC',
  happinessSoft: '#FFD7E6',
  hunger: '#FFA64D',
  hungerSoft: '#FFE6CC',
  energy: '#5CC8FF',
  energySoft: '#D6F1FF',

  // XP
  xp: '#9B8CFF',
  xpSoft: '#E7E2FF',

  // Coins / level accents
  coin: '#FFC53D',
  level: '#FF9F45',

  // Pet
  petBody: '#FFB37A',
  petBodyDark: '#FF9A5A',
  petBelly: '#FFE2C7',
  petEar: '#FF9A5A',
  petInnerEar: '#FFC9A6',
  blush: '#FF8FB3',
  face: '#4A3B2E',
  platform: '#FFE3C2',
  platformShade: '#F6C99E',

  shadow: '#3A2E55',
} as const;

// Mood-driven button / accent gradient pairs [top, bottom]
export const gradients = {
  feed: ['#FFB877', '#FF8A50'] as [string, string],
  play: ['#7CE0C0', '#34C39A'] as [string, string],
  sleep: ['#9FB6FF', '#6D86FF'] as [string, string],
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
} as const;

export const radius = {
  sm: 14,
  md: 22,
  lg: 28,
  xl: 36,
  pill: 999,
} as const;

export const shadow = {
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;
