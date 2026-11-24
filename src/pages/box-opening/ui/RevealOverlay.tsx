import Animated, { FadeIn } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import type { OwnedItem } from '@/shared/api';

import { RevealActions } from './RevealActions';
import { RevealDetails } from './RevealDetails';
import { RevealShowcase } from './RevealShowcase';

type RevealOverlayProps = {
  item: OwnedItem;
  canOpenAnother: boolean;
  selling: boolean;
  error: string | null;
  onKeep: () => void;
  onSell: () => void;
  onOpenAnother: () => void;
};

export function RevealOverlay({ item, ...actions }: RevealOverlayProps) {
  return (
    <Animated.View entering={FadeIn.duration(350)} style={styles.backdrop}>
      <RevealShowcase watch={item.watch} />
      <RevealDetails watch={item.watch} />
      <RevealActions watch={item.watch} {...actions} />
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: `${theme.colors.background}F0`,
    paddingTop: rt.insets.top + theme.gap(6),
    paddingBottom: rt.insets.bottom + theme.gap(3),
    paddingHorizontal: theme.gap(4),
  },
}));
