import { StyleSheet } from 'react-native-unistyles';

import { darkTheme } from '@/shared/theme';

type AppThemes = {
  dark: typeof darkTheme;
};

declare module 'react-native-unistyles' {
  // Unistyles' documented augmentation pattern: the empty extension is what injects our theme type.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
}

// The app is dark-only by design; a single theme keeps every screen on the neon palette.
StyleSheet.configure({
  themes: { dark: darkTheme },
  settings: { initialTheme: 'dark' },
});
