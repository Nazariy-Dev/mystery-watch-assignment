import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/shared/ui';

export function Fact({ label, last = false, children }: { label: string; last?: boolean; children: ReactNode }) {
  return (
    <View style={[styles.fact, !last && styles.factDivider]}>
      <Text tone="muted">{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.gap(3),
  },
  factDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
}));
