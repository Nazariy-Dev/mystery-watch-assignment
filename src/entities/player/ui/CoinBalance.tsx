import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useCountUp } from '@/shared/lib';
import { CoinIcon, Text } from '@/shared/ui';

import { useGetMeQuery } from '../api/playerApi';

export function CoinBalance() {
  const { data: me } = useGetMeQuery();
  const balance = useCountUp(me?.balance ?? 0);

  return (
    <View style={styles.chip} accessibilityLabel={me ? `${me.balance} coins` : 'Loading balance'}>
      <CoinIcon />
      <Text variant="title" tone="coin" style={styles.amount}>
        {me ? balance.toLocaleString('en-US') : '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(2),
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}40`,
  },
  amount: {
    fontSize: 16,
    lineHeight: 20,
  },
}));
