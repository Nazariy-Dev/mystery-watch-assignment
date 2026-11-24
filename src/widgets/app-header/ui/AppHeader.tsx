import { Image, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CoinBalance } from '@/entities/player';
import { Text } from '@/shared/ui';

const LOGO_MARK = require('../../../../assets/app/logo-mark.png');

export function AppHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.brand} accessible accessibilityRole="header" accessibilityLabel="Mystery Watch">
        <Image source={LOGO_MARK} style={styles.mark} />
        <Text variant="body" style={styles.wordmark}>
          Mystery<Text variant="body" style={[styles.wordmark, styles.wordmarkAccent]}>Watch</Text>
        </Text>
      </View>
      <CoinBalance />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.gap(2),
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
  },
  mark: {
    width: 44,
    height: 44,
  },
  wordmark: {
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeight.bold,
  },
  wordmarkAccent: {
    color: theme.colors.accent,
  },
}));
