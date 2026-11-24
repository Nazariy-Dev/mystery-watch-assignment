import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import type { Watch } from '@/shared/api';
import { Button, Text } from '@/shared/ui';

type RevealActionsProps = {
  watch: Watch;
  canOpenAnother: boolean;
  selling: boolean;
  error: string | null;
  onKeep: () => void;
  onSell: () => void;
  onOpenAnother: () => void;
};

export function RevealActions({ watch, canOpenAnother, selling, error, onKeep, onSell, onOpenAnother }: RevealActionsProps) {
  return (
    <Animated.View entering={FadeInDown.delay(550).duration(400)} style={styles.actions}>
      {error && <Text variant="caption" style={styles.error}>{error}</Text>}
      <Button label="Keep it" onPress={onKeep} disabled={selling} />
      <View style={styles.row}>
        <View style={styles.cell}>
          <Button
            label={selling ? 'Selling…' : `Sell ${watch.value.toLocaleString('en-US')}`}
            variant="secondary"
            onPress={onSell}
            disabled={selling}
          />
        </View>
        {canOpenAnother && (
          <View style={styles.cell}>
            <Button label="Open again" variant="secondary" onPress={onOpenAnother} disabled={selling} />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  actions: {
    gap: theme.gap(3),
  },
  row: {
    flexDirection: 'row',
    gap: theme.gap(3),
  },
  cell: {
    flex: 1,
  },
  error: {
    color: theme.colors.danger,
    textAlign: 'center',
  },
}));
