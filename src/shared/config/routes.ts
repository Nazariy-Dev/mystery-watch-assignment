import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Shop: undefined;
  Vault: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  BoxDetails: { boxId: string };
  BoxOpening: { boxId: string };
  WatchDetails: { itemId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
