import { Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Touchable } from './Touchable';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

/** Chunky pill button; sinks slightly while pressed for tactile, game-like feedback. */
export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  const variantStyles = styles.useVariants({ variant });

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        variantStyles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={variantStyles.label}>{label}</Text>
    </Touchable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    minHeight: 56,
    paddingHorizontal: theme.gap(6),
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    variants: {
      variant: {
        primary: {
          backgroundColor: theme.colors.primary,
          // Neon glow; Android ignores shadowColor tint, so elevation gives it depth there.
          shadowColor: theme.colors.primary,
          shadowOpacity: 0.5,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
          // A hairline of light along the top edge, so the pill reads as raised rather than flat.
          boxShadow: 'inset 0 1.5px 0 rgba(255, 255, 255, 0.45)',
        },
        secondary: {
          backgroundColor: theme.colors.surfaceRaised,
          borderWidth: 1,
          // A faint accent edge ties secondary actions to the primary color without competing with it.
          borderColor: `${theme.colors.primary}26`,
        },
      },
    },
  },
  label: {
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeight.bold,
    fontSize: 16,
    letterSpacing: 0.5,
    variants: {
      variant: {
        primary: { color: theme.colors.onPrimary },
        secondary: { color: theme.colors.text },
      },
    },
  },
  pressed: {
    transform: [{ translateY: 2 }, { scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
}));
