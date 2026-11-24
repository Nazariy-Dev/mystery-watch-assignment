import { usePanGesture } from 'react-native-gesture-handler';

import type { SpinController } from '../model/spin';

/** Pan gesture that turns the box through `spin`; only horizontal drags are claimed. */
export function useInspectDrag(spin: SpinController, enabled: boolean) {
  return usePanGesture({
    // SpinController is a plain JS object, so the callbacks must run on the JS thread, not as worklets.
    runOnJS: true,
    enabled,
    // Vertical drags fail early and fall through to the parent scroll view.
    activeOffsetX: [-8, 8],
    failOffsetY: [-8, 8],
    onActivate: () => spin.grab(),
    onUpdate: (event) => spin.drag(event.translationX),
    onDeactivate: (event) => spin.release(event.velocityX),
  });
}
