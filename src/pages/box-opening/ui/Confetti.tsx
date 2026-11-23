import { useEffect, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { darkTheme } from '@/shared/theme';

type ConfettiRarity = 'epic' | 'legendary';

type Piece = {
  /** Start position across the screen, in percent. */
  x: number;
  delay: number;
  duration: number;
  /** Side-to-side sway in points. */
  drift: number;
  /** Total spin in degrees over the fall. */
  spin: number;
  size: number;
  color: string;
};

const COUNT: Record<ConfettiRarity, number> = { epic: 22, legendary: 48 };
const COLORS: Record<ConfettiRarity, string[]> = {
  epic: [darkTheme.rarity.epic, '#E4CCFF', '#FFFFFF'],
  legendary: [darkTheme.rarity.legendary, '#FFE08A', '#FFF6D8', '#FFFFFF'],
};

const makePieces = (rarity: ConfettiRarity): Piece[] =>
  Array.from({ length: COUNT[rarity] }, () => ({
    x: Math.random() * 100,
    delay: Math.random() * 1200,
    duration: 2200 + Math.random() * 1200,
    drift: 10 + Math.random() * 30,
    spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540),
    size: 6 + Math.random() * 6,
    color: COLORS[rarity][Math.floor(Math.random() * COLORS[rarity].length)],
  }));

/** Confetti raining over the whole screen for the top rarities; nothing under Reduce Motion. */
export function Confetti({ rarity }: { rarity: ConfettiRarity }) {
  const reduceMotion = useReducedMotion();
  const { height } = useWindowDimensions();
  const [pieces] = useState(() => makePieces(rarity));

  if (reduceMotion) return null;

  return (
    <View style={styles.layer} pointerEvents="none">
      {pieces.map((piece, index) => (
        <ConfettiPiece key={index} piece={piece} fall={height + 80} />
      ))}
    </View>
  );
}

function ConfettiPiece({ piece, fall }: { piece: Piece; fall: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(piece.delay, withTiming(1, { duration: piece.duration, easing: Easing.in(Easing.sin) }));
  }, [progress, piece]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value > 0.85 ? (1 - progress.value) / 0.15 : 1,
    transform: [
      { translateX: Math.sin(progress.value * Math.PI * 3) * piece.drift },
      { translateY: -40 + progress.value * fall },
      { rotate: `${progress.value * piece.spin}deg` },
      // Tumbling: the flake flips edge-on and back as it falls.
      { scaleY: Math.cos(progress.value * piece.spin * 0.05) },
    ],
  }));

  return (
    <Animated.View
      style={[styles.piece, { left: `${piece.x}%`, width: piece.size, height: piece.size * 1.6, backgroundColor: piece.color }, style]}
    />
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});
