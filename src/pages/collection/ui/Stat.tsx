import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CoinIcon, Text } from '@/shared/ui';

export function Stat({ label, value, coin = false }: { label: string; value: string; coin?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text variant="label" tone="muted">{label}</Text>
      <View style={styles.statValue}>
        {coin && <CoinIcon size={18} />}
        <Text variant="title" tone={coin ? 'coin' : undefined}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  stat: {
    flex: 1,
    gap: theme.gap(1),
    padding: theme.gap(5),
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}55`,
    backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}40 0%, ${theme.colors.surface} 75%)`,
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
  },
}));
