import { Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Unbounded_700Bold, Unbounded_800ExtraBold, useFonts } from '@expo-google-fonts/unbounded';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, Screen, Text } from '@/shared/ui';

SplashScreen.preventAutoHideAsync();

/** App root: holds the splash until fonts are ready so text never flashes in a fallback face. */
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Unbounded_700Bold,
    Unbounded_800ExtraBold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    if (fontError) console.warn('Font loading failed, falling back to system fonts', fontError);
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

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
