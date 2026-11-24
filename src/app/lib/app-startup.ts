import { useEffect, useState } from 'react';

import { prepareTapFeedback } from '@/shared/lib';

import { useBackgroundMusic } from './background-music';

/** Everything that runs once at launch: the splash intro's lifetime, the tap sounds, and the music. */
export function useAppStartup() {
  const [intro, setIntro] = useState(true);
  useEffect(prepareTapFeedback, []);
  useBackgroundMusic();

  return { intro, onIntroDone: () => setIntro(false) };
}
