import { useLoader } from '@react-three/fiber/native';
import { useEffect, useMemo } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import type { Rarity } from '@/shared/api';

import boxModelAsset from '../../../../assets/box/designer-box-2-v1-icy.glb';
import { createBoxInstance } from '../model/box';
import { LID_OPEN_ANGLE } from '../model/hinge';

type BoxModelProps = {
  tier: Rarity;
  /** 0 = closed, 1 = fully open (115°). */
  openness?: number;
};

/** The supplied box, tier-colored, with its base on y = 0. Render inside a Canvas under Suspense. */
export function BoxModel({ tier, openness = 0 }: BoxModelProps) {
  // R3F's native loaders resolve Metro asset ids at runtime, but its types only accept URLs.
  const gltf = useLoader(GLTFLoader, boxModelAsset as unknown as string);
  const box = useMemo(() => createBoxInstance(gltf.scene, tier), [gltf.scene, tier]);

  useEffect(() => () => box.materials.forEach((material) => material.dispose()), [box]);

  return (
    <primitive object={box.root}>
      <primitive object={box.hinge} rotation-x={openness * LID_OPEN_ANGLE} />
    </primitive>
  );
}
