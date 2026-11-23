// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'ios/*', 'android/*'],
  },
  {
    // Module augmentation (React Navigation, Unistyles) needs `interface X extends Y {}`.
    rules: {
      '@typescript-eslint/no-empty-object-type': ['warn', { allowInterfaces: 'with-single-extends' }],
      // Checks JSX props against DOM attributes; React Native has no DOM and R3F props (position, args) all trip it.
      'react/no-unknown-property': 'off',
    },
  },
]);
