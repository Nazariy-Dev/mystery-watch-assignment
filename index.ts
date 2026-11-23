// Must run before any StyleSheet.create.
import '@/app/styles/unistyles';

import { registerRootComponent } from 'expo';

import App from '@/app/App';

registerRootComponent(App);
