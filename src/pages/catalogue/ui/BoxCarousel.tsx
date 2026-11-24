import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { scheduleOnRN } from 'react-native-worklets';

import type { Box } from '@/shared/api';

import { BoxCard } from './BoxCard';
import { CarouselDot } from './CarouselDot';

type BoxCarouselProps = {
  boxes: Box[];
  /** Index of the card in focus; changing it from outside scrolls the carousel there. */
  focused: number;
  /** Fires whenever a swipe brings another card into focus. */
  onFocusChange: (index: number) => void;
};

const CARD_GAP = 16;
/** Room for the card glow (shadow radius + offset); a scroll view clips anything drawn past its edges. */
const GLOW_SPACE = 32;
/** Cards within this distance of the focused one keep a live canvas: at most 3 GL contexts. */
const STAGE_RADIUS = 1;
const CARD_WIDTH_SHARE = 0.84;
/** Card height as a multiple of its width. */
const CARD_ASPECT = 1.3;

export function BoxCarousel({ boxes, focused, onFocusChange }: BoxCarouselProps) {
  const navigation = useNavigation();
  // Covered screens stay mounted; dropping their canvases frees GL contexts for the screen on top.
  const isFocused = useIsFocused();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.round(screenWidth * CARD_WIDTH_SHARE);
  const snap = cardWidth + CARD_GAP;
  const sideInset = (screenWidth - cardWidth) / 2;

  const list = useRef<FlatList<Box>>(null);
  const scrollX = useSharedValue(0);
  const focusedOnUI = useSharedValue(focused);

  // Card a chip-triggered scroll is heading to, or -1. The cards it passes on the way must not report focus:
  // each report re-renders the list, and on Android that cuts the animated scroll short.
  const jumpTarget = useSharedValue(-1);
  // The card the live canvases cluster around. It follows swipes, but holds still through a chip jump so the box
  // being left keeps drawing until the target arrives, instead of blinking out the moment the chip is tapped.
  // The target mounts at the tap so it has loaded by arrival: one GL context over the cap, for the jump only.
  const [stageCenter, setStageCenter] = useState(focused);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const index = Math.round(event.contentOffset.x / snap);
      if (jumpTarget.value >= 0) {
        if (index === jumpTarget.value) {
          jumpTarget.value = -1;
          scheduleOnRN(setStageCenter, index);
        }
        return;
      }
      // Only cross to JS when the focused card changes, not on every scroll frame.
      if (index !== focusedOnUI.value) {
        focusedOnUI.value = index;
        scheduleOnRN(onFocusChange, index);
        scheduleOnRN(setStageCenter, index);
      }
    },
    // A finger taking over mid-jump hands focus back to the swipe.
    onBeginDrag: () => {
      if (jumpTarget.value < 0) return;
      jumpTarget.value = -1;
      scheduleOnRN(setStageCenter, Math.round(scrollX.value / snap));
    },
  });

  // A focus change that didn't come from a swipe (a chip tap) scrolls the carousel to that card.
  useEffect(() => {
    if (focused === focusedOnUI.value) return;
    focusedOnUI.value = focused;
    jumpTarget.value = focused;
    list.current?.scrollToOffset({ offset: focused * snap, animated: true });
  }, [focused, focusedOnUI, jumpTarget, snap]);

  return (
    <View>
      <Animated.FlatList
        ref={list}
        data={boxes}
        keyExtractor={(box) => box.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snap}
        // A hard fling still moves one box, so none is skipped past unseen.
        disableIntervalMomentum
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        // iOS blurs shadows wider than Android, past GLOW_SPACE; unclipping lets the glow fade out naturally.
        style={[styles.list, { height: cardWidth * CARD_ASPECT + GLOW_SPACE * 2 }]}
        contentContainerStyle={{ paddingHorizontal: sideInset, paddingVertical: GLOW_SPACE, gap: CARD_GAP }}
        getItemLayout={(_, index) => ({ length: snap, offset: snap * index, index })}
        renderItem={({ item, index }) => (
          <BoxCard
            box={item}
            index={index}
            snap={snap}
            width={cardWidth}
            scrollX={scrollX}
            hasStage={isFocused && (Math.abs(index - stageCenter) <= STAGE_RADIUS || index === focused)}
            focused={index === focused}
            onPress={() => navigation.navigate('BoxDetails', { boxId: item.id })}
          />
        )}
      />
      <View style={styles.dots}>
        {boxes.map((box, index) => (
          <CarouselDot key={box.id} index={index} snap={snap} scrollX={scrollX} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: {
    overflow: 'visible',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.gap(2),
  },
}));
