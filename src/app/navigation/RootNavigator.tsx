import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BoxDetailsPage } from '@/pages/box-details';
import { BoxOpeningPage } from '@/pages/box-opening';
import { CataloguePage } from '@/pages/catalogue';
import { CollectionPage } from '@/pages/collection';
import { WatchDetailsPage } from '@/pages/watch-details';
import type { RootStackParamList, TabParamList } from '@/shared/config';
import { darkTheme } from '@/shared/theme';

import { TabBar } from './TabBar';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Navigation paints its own containers during transitions; match them to the app background
// so pushes and modals never flash the default theme color.
const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: darkTheme.colors.background,
    card: darkTheme.colors.surface,
    primary: darkTheme.colors.primary,
    text: darkTheme.colors.text,
    border: darkTheme.colors.border,
  },
};

function Tabs() {
  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Shop" component={CataloguePage} />
      <Tab.Screen name="Vault" component={CollectionPage} />
    </Tab.Navigator>
  );
}

/** App navigation: tabs at the root, details pushed on top, opening shown as a full-screen modal. */
export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="BoxDetails" component={BoxDetailsPage} />
        <Stack.Screen
          name="BoxOpening"
          component={BoxOpeningPage}
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen name="WatchDetails" component={WatchDetailsPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
