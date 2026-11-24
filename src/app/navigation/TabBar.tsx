import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useState, type ComponentProps } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import type { TabParamList } from '@/shared/config';
import { Touchable } from '@/shared/ui';

type IconName = ComponentProps<typeof Ionicons>['name'];
type Tab = { label: string; icon: IconName; activeIcon: IconName };

const TABS: Record<keyof TabParamList, Tab> = {
  Shop: { label: 'Shop', icon: 'cube-outline', activeIcon: 'cube' },
  Vault: { label: 'Vault', icon: 'diamond-outline', activeIcon: 'diamond' },
};

const SLIDE_MS = 280;

const MutedIcon = withUnistyles(Ionicons, (theme) => ({ color: theme.colors.textMuted }));
const ActiveIcon = withUnistyles(Ionicons, (theme) => ({ color: theme.colors.onPrimary }));

/** Floating pill tab bar; a glowing highlight slides under whichever tab is selected. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const reduceMotion = useReducedMotion();
  // Fractional tab index the highlight sits at; each tab cross-fades its colors as the highlight passes under it.
  const position = useSharedValue(state.index);
  const [tabWidth, setTabWidth] = useState(0);

  useEffect(() => {
    position.value = withTiming(state.index, { duration: reduceMotion ? 0 : SLIDE_MS, easing: Easing.out(Easing.cubic) });
  }, [position, state.index, reduceMotion]);

  const onLayout = (event: LayoutChangeEvent) => setTabWidth(event.nativeEvent.layout.width / state.routes.length);

  const highlightStyle = useAnimatedStyle(() => ({
    width: tabWidth,
    opacity: tabWidth > 0 ? 1 : 0,
    transform: [{ translateX: position.value * tabWidth }],
  }));

  return (
    <View style={styles.dock}>
      <View style={styles.bar}>
        <View style={styles.track} onLayout={onLayout}>
          <Animated.View style={[styles.highlight, highlightStyle]} />
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            };

            return (
              <TabItem
                key={route.key}
                tab={TABS[route.name as keyof TabParamList]}
                index={index}
                focused={focused}
                position={position}
                onPress={onPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

type TabItemProps = { tab: Tab; index: number; focused: boolean; position: SharedValue<number>; onPress: () => void };

/** A tab drawn twice, muted and highlighted, cross-faded by how close the sliding highlight is. */
function TabItem({ tab, index, focused, position, onPress }: TabItemProps) {
  const activeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(position.value - index), [0, 1], [1, 0], 'clamp'),
  }));

  return (
    <Touchable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={tab.label}
      feedback="tab"
      onPress={onPress}
      style={styles.tab}
    >
      <View style={styles.content}>
        <MutedIcon name={tab.icon} size={22} />
        <Text style={styles.label}>{tab.label}</Text>
      </View>
      <Animated.View style={[styles.content, styles.overlay, activeStyle]}>
        <ActiveIcon name={tab.activeIcon} size={22} />
        <Text style={[styles.label, styles.labelActive]}>{tab.label}</Text>
      </Animated.View>
    </Touchable>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  dock: {
    paddingHorizontal: theme.gap(6),
    paddingTop: theme.gap(2),
    paddingBottom: rt.insets.bottom + theme.gap(2),
    backgroundColor: theme.colors.background,
  },
  bar: {
    padding: theme.gap(1.5),
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}40`,
    backgroundColor: theme.colors.surface,
    // Centered, so the glow hugs every edge evenly instead of pooling below.
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    // Android elevation always casts downward; keep it low so the bar barely shadows its bottom there.
    elevation: 4,
  },
  track: {
    flexDirection: 'row',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  tab: {
    flex: 1,
    height: 56,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(1),
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  label: {
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeight.bold,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  labelActive: {
    color: theme.colors.onPrimary,
  },
}));
