import { useFrame, useLoader } from '@react-three/fiber/native';
import { useEffect, useMemo, useRef } from 'react';
import type { Group } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import type { Rarity } from '@/shared/api';

import boxModelAsset from '../../../../assets/box/designer-box-2-v1-icy.glb';
import { createBoxInstance } from '../model/box';
import { LID_OPEN_ANGLE } from '../model/hinge';
import type { BoxMotion } from '../model/motion';
import type { SeamGlow } from '../model/seam';

type BoxModelProps = {
  tier: Rarity;
  motion: BoxMotion;
  seam: SeamGlow;
};

/** The supplied box, tier-colored, with its base on y = 0; the lid follows `motion` and the seam is painted from `seam`. Render inside a Canvas under Suspense. */
export function BoxModel({ tier, motion, seam }: BoxModelProps) {
  // R3F's native loaders resolve Metro asset ids at runtime, but its types only accept URLs.
  const gltf = useLoader(GLTFLoader, boxModelAsset as unknown as string);
  const box = useMemo(() => createBoxInstance(gltf.scene, tier), [gltf.scene, tier]);
  const hinge = useRef<Group>(null);

  useEffect(() => () => box.materials.forEach((material) => material.dispose()), [box]);

  useFrame(() => {
    if (hinge.current) hinge.current.rotation.x = (motion.openness + motion.rattle) * LID_OPEN_ANGLE;
    if (box.seam) seam.paint(box.seam);
  });

  return (
    <primitive object={box.root}>
      <primitive object={box.hinge} ref={hinge} />
    </primitive>
  );
}
