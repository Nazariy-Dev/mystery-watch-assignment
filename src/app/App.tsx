import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, Screen, Text } from '@/shared/ui';

/** App root. */
export default function App() {
  return (
    <Screen>
      <StatusBar style="light" />
      {/* Temporary style showcase; replaced by navigation in the next step. */}
      <View style={styles.content}>
        <Text variant="label" tone="primary">Mystery Watch</Text>
        <Text variant="display">Open the vault</Text>
        <Text tone="muted">Spin, unlock and collect luxury watches.</Text>
        <Text variant="title" tone="coin">◉ 1,000</Text>
        <View style={styles.rarities}>
          <Text variant="label" style={styles.common}>Common</Text>
          <Text variant="label" style={styles.rare}>Rare</Text>
          <Text variant="label" style={styles.epic}>Epic</Text>
          <Text variant="label" style={styles.legendary}>Legendary</Text>
        </View>
        <Button label="Open box" onPress={() => {}} />
        <Button label="View odds" variant="secondary" onPress={() => {}} />
        <Button label="Not enough coins" onPress={() => {}} disabled />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.gap(4),
  },
  rarities: {
    flexDirection: 'row',
    gap: theme.gap(3),
  },
  common: { color: theme.rarity.common },
  rare: { color: theme.rarity.rare },
  epic: { color: theme.rarity.epic },
  legendary: { color: theme.rarity.legendary },
}));
