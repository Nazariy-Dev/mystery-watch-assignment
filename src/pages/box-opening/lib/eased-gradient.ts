import type { EasingFunction } from 'react-native';
import { easeGradient } from 'react-native-easing-gradient';

type RadialGradientParams = {
  /** Color from the center out to `start`. */
  from: string;
  /** Color from `end` outward. */
  to: string;
  /** Where the fade starts, 0…1 of the gradient radius; defaults to the center. */
  start?: number;
  /** Where the fade ends, 0…1 of the gradient radius. */
  end: number;
  /** React Native `Easing` curve for the fade; defaults to ease-in-out, which has no edge at either end. */
  easing?: EasingFunction;
  /** CSS radial shape and size, e.g. `circle` or `ellipse farthest-corner at center`. */
  shape: string;
};

/**
 * A CSS radial gradient whose fade follows an easing curve. A plain two-stop fade has a visible edge where it
 * starts and stops; easing adds stops along a curve that eases in and out, so the transition is seamless.
 * react-native-easing-gradient computes the stops; React Native's own `backgroundImage` draws them.
 */
export function easedRadialGradient({ from, to, start = 0, end, easing, shape }: RadialGradientParams) {
  const { colors, locations } = easeGradient({
    colorStops: { [start]: { color: from }, [end]: { color: to } },
    ...(easing && { easing }),
  });
  const stops = colors.map((color, index) => `${color} ${(locations[index] * 100).toFixed(1)}%`);
  return `radial-gradient(${shape}, ${stops.join(', ')})`;
}
