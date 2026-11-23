import type { Rarity } from '@/shared/api';
import { darkTheme } from '@/shared/theme';

type BoxLightingProps = {
  tier: Rarity;
};

// No PMREM environment map: it needs float render targets, which crashed expo-gl on the iOS Simulator.
export function BoxLighting({ tier }: BoxLightingProps) {
  return (
    <>
      <hemisphereLight args={['#ffffff', darkTheme.colors.background, 1]} />
      <directionalLight position={[2.5, 4, 3]} intensity={2.6} />
      <directionalLight position={[-3, 2, -3]} intensity={3} color={darkTheme.rarity[tier]} />
    </>
  );
}
