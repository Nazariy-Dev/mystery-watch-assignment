import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import type { TabParamList } from '@/shared/config';
import { Touchable } from '@/shared/ui';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: Record<keyof TabParamList, { label: string; icon: IconName; activeIcon: IconName }> = {
  Shop: { label: 'Shop', icon: 'cube-outline', activeIcon: 'cube' },
  Vault: { label: 'Vault', icon: 'diamond-outline', activeIcon: 'diamond' },
};

const ThemedIcon = withUnistyles(Ionicons);

/** Docked tab bar; the active tab lights up as a glowing tile to match the neon theme. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name as keyof TabParamList];
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Touchable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            feedback="tab"
            onPress={onPress}
            style={[styles.tab, focused && styles.tabActive]}
          >
            <ThemedIcon
              name={focused ? tab.activeIcon : tab.icon}
              size={22}
              uniProps={(theme) => ({ color: focused ? theme.colors.onPrimary : theme.colors.textMuted })}
            />
            <Text style={[styles.label, focused && styles.labelActive]}>{tab.label}</Text>
          </Touchable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  bar: {
    flexDirection: 'row',
    gap: theme.gap(3),
    paddingHorizontal: theme.gap(4),
    paddingTop: theme.gap(3),
    paddingBottom: rt.insets.bottom + theme.gap(3),
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(1),
    paddingVertical: theme.gap(2),
    borderRadius: theme.radius.md,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
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
