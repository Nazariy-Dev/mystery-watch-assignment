import { StyleSheet } from 'react-native-unistyles';

import { darkTheme } from '@/shared/theme';

type AppThemes = {
  dark: typeof darkTheme;
};

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}

// The app is dark-only by design; a single theme keeps every screen on the neon palette.
StyleSheet.configure({
  themes: { dark: darkTheme },
  settings: { initialTheme: 'dark' },
});
