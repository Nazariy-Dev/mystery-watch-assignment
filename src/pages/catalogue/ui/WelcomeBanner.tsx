import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { Text, Touchable } from '@/shared/ui';

const SparkIcon = withUnistyles(Ionicons, (theme) => ({ color: theme.colors.primary }));
const CloseIcon = withUnistyles(Ionicons, (theme) => ({ color: theme.colors.textMuted }));

/** One-time welcome for a first launch: what the coins are for and how to open a box. Gone for good once dismissed. */
export function WelcomeBanner() {
  const [dismissed, setDismissed] = useMMKVBoolean('catalogue.welcomeDismissed');

  if (dismissed) return null;

  return (
    <Animated.View entering={FadeInDown.delay(300).duration(400)} exiting={FadeOut.duration(200)} style={styles.banner}>
      <View style={styles.iconWell}>
        <SparkIcon name="sparkles" size={20} />
      </View>
      <View style={styles.copy}>
        <Text variant="body">Welcome to the vault</Text>
        <Text variant="caption" tone="muted">
          Your coins are on the house. Pick a box, check what&apos;s inside, then hold to open it.
        </Text>
      </View>
      <Touchable
        accessibilityRole="button"
        accessibilityLabel="Dismiss welcome"
        hitSlop={12}
        feedback="back"
        onPress={() => setDismissed(true)}
        style={styles.close}
      >
        <CloseIcon name="close" size={20} />
      </Touchable>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.gap(3),
    padding: theme.gap(4),
    marginBottom: theme.gap(2),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}33`,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${theme.colors.primary}1A`,
  },
  copy: {
    flex: 1,
    gap: theme.gap(1),
  },
  close: {
    padding: theme.gap(1),
  },
}));
