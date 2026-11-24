import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type TextProps = RNTextProps & {
  variant?: 'display' | 'title' | 'body' | 'caption' | 'label';
  /** Omit for the default text color. */
  tone?: 'muted' | 'primary' | 'coin';
};

/** Themed text; `variant` picks the type ramp, `tone` the color. */
export function Text({ variant = 'body', tone, style, ...rest }: TextProps) {
  const variantStyles = styles.useVariants({ variant, tone });

  return <RNText {...rest} style={[variantStyles.text, style]} />;
}

const styles = StyleSheet.create((theme) => ({
  text: {
    // Fixed-width digits, so prices, stats and counters don't shift as they change.
    fontVariant: ['tabular-nums'],
    variants: {
      variant: {
        display: {
          fontFamily: theme.fonts.display,
          fontWeight: theme.fontWeight.bold,
          fontSize: 32,
          lineHeight: 38,
        },
        title: {
          fontFamily: theme.fonts.display,
          fontWeight: theme.fontWeight.bold,
          fontSize: 20,
          lineHeight: 26,
        },
        body: {
          fontFamily: theme.fonts.body,
          fontWeight: theme.fontWeight.medium,
          fontSize: 16,
          lineHeight: 22,
        },
        caption: {
          fontFamily: theme.fonts.body,
          fontWeight: theme.fontWeight.medium,
          fontSize: 13,
          lineHeight: 18,
        },
        // Small caps-style labels for tiers, odds and stats.
        label: {
          fontFamily: theme.fonts.body,
          fontWeight: theme.fontWeight.bold,
          fontSize: 13,
          lineHeight: 18,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
        },
      },
      tone: {
        default: { color: theme.colors.text },
        muted: { color: theme.colors.textMuted },
        primary: { color: theme.colors.primary },
        coin: { color: theme.colors.coin },
      },
    },
  },
}));
