import { useEffect, useRef } from 'react';
import type { LayoutChangeEvent, ScrollViewInstance } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * Keeps the selected item of a horizontal scroll row in view: whenever `selected` changes, the row scrolls to
 * center that item, as far as the row's ends allow. Pass `scroller` and the handlers to the ScrollView, and `onItemLayout(index)` to each item.
 */
export function useFollowSelection(selected: number) {
  const reduceMotion = useReducedMotion();
  const scroller = useRef<ScrollViewInstance>(null);
  const layout = useRef({ view: 0, content: 0, items: [] as { x: number; width: number }[] });

  useEffect(() => {
    const { view, content, items } = layout.current;
    const item = items[selected];
    if (!item || !view) return;
    const x = Math.min(Math.max(item.x + item.width / 2 - view / 2, 0), Math.max(content - view, 0));
    scroller.current?.scrollTo({ x, animated: !reduceMotion });
  }, [selected, reduceMotion]);

  return {
    scroller,
    onLayout: (event: LayoutChangeEvent) => {
      layout.current.view = event.nativeEvent.layout.width;
    },
    onContentSizeChange: (width: number) => {
      layout.current.content = width;
    },
    onItemLayout: (index: number) => (event: LayoutChangeEvent) => {
      layout.current.items[index] = event.nativeEvent.layout;
    },
  };
}
