import { useEffect, useImperativeHandle, useMemo, useState, type Ref } from 'react';

import type { Rarity } from '@/shared/api';

import { Entrance } from '../model/entrance';
import { BoxMotion } from '../model/motion';
import { RevealTimeline } from '../model/reveal';
import { SeamGlow } from '../model/seam';
import { SpinController } from '../model/spin';

export type BoxStageHandle = {
  /** Hurries the reveal: the first call jumps to the burst, the next to the result card. */
  skip: () => void;
};

type StageControllersOptions = {
  ref?: Ref<BoxStageHandle>;
  tier: Rarity;
  result?: Rarity;
  /** Skips the drop when false; read once, on mount. */
  entrance: boolean;
  reduceMotion: boolean;
};

/** Creates the stage's per-instance animation state, starts or resets the reveal from `result`, and exposes `skip` on `ref`. */
export function useStageControllers({ ref, tier, result, entrance, reduceMotion }: StageControllersOptions) {
  const [spin] = useState(() => new SpinController());
  const [motion] = useState(() => new BoxMotion());
  const [timeline] = useState(() => new RevealTimeline());
  const [arrival] = useState(() => new Entrance(!entrance || reduceMotion));
  const seam = useMemo(() => new SeamGlow(tier), [tier]);

  useImperativeHandle(ref, () => ({ skip: () => timeline.skip() }), [timeline]);

  useEffect(() => {
    if (result) timeline.start(result);
    else timeline.reset();
  }, [result, timeline]);

  return { spin, motion, timeline, arrival, seam };
}
