import { AppState } from 'react-native';
import { AudioContext, AudioManager, type AudioBuffer } from 'react-native-audio-api';

let context: AudioContext | null = null;
const decoded = new Map<number, Promise<AudioBuffer>>();

/**
 * The app's one audio context, created on first use. The iOS session is `ambient` with `mixWithOthers`: game
 * sounds obey the silent switch and never stop the user's own music.
 */
export function getContext() {
  if (!context) {
    AudioManager.setSystemOptions({ ios: { category: 'ambient', options: ['mixWithOthers'] } });
    context = new AudioContext();
    // Android keeps a context playing in the background, so the music loop would follow the user out of the app.
    AppState.addEventListener('change', (state) => {
      if (state === 'background') context?.suspend();
      else if (state === 'active') context?.resume();
    });
  }
  return context;
}

/** Decodes a bundled sound (a `require`d asset) into memory once; later calls share the same buffer. */
export function loadSound(source: number) {
  let buffer = decoded.get(source);
  if (!buffer) {
    buffer = getContext().decodeAudioData(source);
    decoded.set(source, buffer);
  }
  return buffer;
}

export type PlayingSound = {
  stop: () => void;
  /** Silences the sound but lets it run on to its end. */
  mute: () => void;
};

/** Starts a decoded sound from the top at once. Each call is its own voice, so rapid repeats overlap. */
export function playSound(buffer: AudioBuffer): PlayingSound {
  const audio = getContext();
  // A context the system suspended (an interruption, the app backgrounded) plays nothing until resumed.
  if (audio.state === 'suspended') audio.resume();
  const gain = audio.createGain();
  gain.connect(audio.destination);
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  source.start();
  return {
    stop: () => source.stop(),
    mute: () => {
      gain.gain.value = 0;
    },
  };
}
