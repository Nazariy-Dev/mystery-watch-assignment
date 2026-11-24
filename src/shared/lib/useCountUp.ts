import { useEffect, useRef, useState } from 'react';
import { Easing } from 'react-native-reanimated';

const easeOutCubic = Easing.out(Easing.cubic);

/** Returns `target`, animating from the previous target over `durationMs`; the first value shows instantly. */
export function useCountUp(target: number, durationMs = 700) {
  const [value, setValue] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    if (start === target) return;

    const startedAt = Date.now();
    let frame = requestAnimationFrame(function tick() {
      const progress = Math.min((Date.now() - startedAt) / durationMs, 1);
      setValue(Math.round(start + (target - start) * easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    });
    from.current = target;
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
