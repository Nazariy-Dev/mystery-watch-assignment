// Metro inlines EXPO_PUBLIC_* from .env into the bundle; Jest doesn't, so load it the same way.
require('@expo/env').loadProjectEnv(__dirname, { silent: true });
