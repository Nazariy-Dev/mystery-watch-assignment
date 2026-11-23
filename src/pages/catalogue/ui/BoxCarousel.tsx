import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { scheduleOnRN } from 'react-native-worklets';

import type { Box } from '@/shared/api';

import { BoxCard } from './BoxCard';

type BoxCarouselProps = {
  boxes: Box[];
};

const CARD_GAP = 16;
/** Room for the card glow (shadow radius + offset); a scroll view clips anything drawn past its edges. */
const GLOW_SPACE = 32;
/** Cards within this distance of the focused one keep a live canvas: at most 3 GL contexts. */
const STAGE_RADIUS = 1;

export function BoxCarousel({ boxes }: BoxCarouselProps) {
  const navigation = useNavigation();
  // Covered screens stay mounted; dropping their canvases frees GL contexts for the screen on top.
  const isFocused = useIsFocused();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.round(screenWidth * 0.78);
  const snap = cardWidth + CARD_GAP;
  const sideInset = (screenWidth - cardWidth) / 2;

  const scrollX = useSharedValue(0);
  const focusedOnUI = useSharedValue(0);
  const [focused, setFocused] = useState(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
    const index = Math.round(event.contentOffset.x / snap);
    // Only cross to JS when the focused card changes, not on every scroll frame.
    if (index !== focusedOnUI.value) {
      focusedOnUI.value = index;
      scheduleOnRN(setFocused, index);
    }
  });

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={boxes}
        keyExtractor={(box) => box.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snap}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        // iOS blurs shadows wider than Android, past GLOW_SPACE; unclipping lets the glow fade out naturally.
        style={styles.list}
        contentContainerStyle={{ paddingHorizontal: sideInset, paddingVertical: GLOW_SPACE, gap: CARD_GAP }}
        getItemLayout={(_, index) => ({ length: snap, offset: snap * index, index })}
        renderItem={({ item, index }) => (
          <BoxCard
            box={item}
            index={index}
            snap={snap}
            width={cardWidth}
            scrollX={scrollX}
            hasStage={isFocused && Math.abs(index - focused) <= STAGE_RADIUS}
            focused={index === focused}
            onPress={() => navigation.navigate('BoxDetails', { boxId: item.id })}
          />
        )}
      />
      <View style={styles.dots}>
        {boxes.map((box, index) => (
          <View key={box.id} style={[styles.dot, index === focused && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  list: {
    overflow: 'visible',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.gap(2),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
}));
