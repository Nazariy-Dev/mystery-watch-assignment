import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { Box } from '@/shared/api';
import { Button, Text } from '@/shared/ui';

export function Footer({ box, balance, onOpen }: { box: Box; balance?: number; onOpen: () => void }) {
  const shortBy = balance === undefined ? 0 : box.price - balance;

  return (
    <View style={styles.footer}>
      {shortBy > 0 && (
        <Text variant="caption" tone="muted" style={styles.shortfall}>
          You need {shortBy.toLocaleString('en-US')} more coins
        </Text>
      )}
      <Button
        label={`Buy & open · ${box.price.toLocaleString('en-US')}`}
        disabled={balance === undefined || shortBy > 0}
        onPress={onOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  footer: {
    gap: theme.gap(2),
    paddingTop: theme.gap(3),
    paddingBottom: rt.insets.bottom + theme.gap(3),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  shortfall: {
    textAlign: 'center',
  },
}));
