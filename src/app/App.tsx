import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from './navigation/RootNavigator';

/** App root. */
export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
}
