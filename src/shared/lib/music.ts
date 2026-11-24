import type { GainNode } from 'react-native-audio-api';

import { getContext, loadSound } from './audio';

/** Kept well under the effects, so the music sits in the background instead of competing with them. */
const VOLUME = 0.8;
const DUCKED_VOLUME = 0.2;
const FADE_IN_SECONDS = 3;
/** How quickly the level follows a duck: about 95% there after three times this. */
const DUCK_SECONDS = 0.3;

let gain: GainNode | null = null;

/** Loops a bundled track forever from app start, fading in. Later calls do nothing while it is playing. */
export async function startMusic(source: number) {
  if (gain) return;
  const audio = getContext();
  const level = audio.createGain();
  gain = level;
  const buffer = await loadSound(source);
  level.gain.setValueAtTime(0, audio.currentTime);
  level.gain.linearRampToValueAtTime(VOLUME, audio.currentTime + FADE_IN_SECONDS);
  level.connect(audio.destination);
  const track = audio.createBufferSource();
  track.buffer = buffer;
  track.loop = true;
  track.connect(level);
  track.start();
}

/** Lowers the music under a moment that needs the room, or brings it back. */
export function duckMusic(ducked: boolean) {
  if (!gain) return;
  const now = getContext().currentTime;
  gain.gain.cancelAndHoldAtTime(now);
  gain.gain.setTargetAtTime(ducked ? DUCKED_VOLUME : VOLUME, now, DUCK_SECONDS);
}
