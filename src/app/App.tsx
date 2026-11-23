import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { RootNavigator } from './navigation/RootNavigator';
import { persistor, store } from './store';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={null}>
          <StatusBar style="light" />
          <RootNavigator />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
