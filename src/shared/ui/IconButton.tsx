import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

type IconButtonProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Read by screen readers; icon-only buttons have no visible label. */
  accessibilityLabel: string;
  onPress: () => void;
};

const ThemedIcon = withUnistyles(Ionicons, (theme) => ({ color: theme.colors.text }));

/** Round icon-only button for screen chrome such as back and close. */
export function IconButton({ icon, accessibilityLabel, onPress }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <ThemedIcon name={icon} size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
}));
