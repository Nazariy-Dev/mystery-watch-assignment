import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type ScreenProps = {
  children: ReactNode;
  withBottomInset?: boolean;
};

export function Screen({ children, withBottomInset = true }: ScreenProps) {
  return <View style={[styles.container, withBottomInset && styles.bottomInset]}>{children}</View>;
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: rt.insets.top,
    paddingHorizontal: theme.gap(4),
  },
  bottomInset: {
    paddingBottom: rt.insets.bottom,
  },
}));
