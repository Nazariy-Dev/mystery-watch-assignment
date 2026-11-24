import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type CoinIconProps = {
  size?: number;
};

export function CoinIcon({ size = 18 }: CoinIconProps) {
  return (
    <View style={styles.coin(size)}>
      <View style={styles.inner(size)} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  coin: (size: number) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: theme.colors.coin,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  inner: (size: number) => ({
    width: size * 0.55,
    height: size * 0.55,
    borderRadius: size,
    borderWidth: Math.max(1, size * 0.08),
    borderColor: theme.colors.background,
    opacity: 0.35,
  }),
}));
