import type { ReactNode } from 'react';
import { AdditiveBlending } from 'three';

import { AURA_Z } from '../config/stage';
import { useRigAnimation, type RigAnimationOptions } from '../lib/rig-animation';

type RigProps = RigAnimationOptions & { children: ReactNode };

// Everything per-frame lives in useFrame on plain objects, so animation never re-renders React.
export function Rig({ children, ...options }: RigProps) {
  const { turntable, shaker, light, flash, aura, glowTexture, burst, motes } = useRigAnimation(options);

  return (
    <>
      <sprite ref={aura} position={[0, 0.6, AURA_Z]} visible={false}>
        <spriteMaterial map={glowTexture} blending={AdditiveBlending} depthWrite={false} transparent opacity={0} />
      </sprite>
      <pointLight ref={flash} position={[0, 0.8, 1.6]} intensity={0} distance={4} />
      {motes && !options.reduceMotion && <primitive object={motes.root} />}
      <group ref={turntable}>
        <group ref={shaker}>
          {children}
          {/* At the box mouth, so the walls hide where the rays start. */}
          <primitive object={burst.root} position={[0, 0.8, 0]} />
          <pointLight ref={light} position={[0, 0.75, 0]} intensity={0} distance={3} />
        </group>
      </group>
    </>
  );
}
