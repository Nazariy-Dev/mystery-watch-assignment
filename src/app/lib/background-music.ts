import { useEffect } from 'react';

import { startMusic } from '@/shared/lib';

// Synthesized for this app by `scripts/synthesize-sounds.py`.
const MUSIC = require('../sounds/music.wav');

/** Starts the background music loop once the app mounts; it then plays for the app's whole life. */
export function useBackgroundMusic() {
  useEffect(() => {
    startMusic(MUSIC);
  }, []);
}
