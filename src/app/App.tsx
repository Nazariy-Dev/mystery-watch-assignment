import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { useAppStartup } from './lib/app-startup';
import { RootNavigator } from './navigation/RootNavigator';
import { persistor, store } from './store';
import { SplashIntro } from './ui/SplashIntro';

// The intro hides the native splash itself, once it has drawn the same logo underneath.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const { intro, onIntroDone } = useAppStartup();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={null}>
          <StatusBar style="light" />
          <RootNavigator />
        </PersistGate>
      </Provider>
      {intro && <SplashIntro onDone={onIntroDone} />}
    </GestureHandlerRootView>
  );
}
