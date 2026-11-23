import type { Group, Material, Object3D } from 'three';

import type { Rarity } from '@/shared/api';

import { attachLidHinge } from './hinge';
import { applyTierColors } from './tier';

export type BoxInstance = {
  root: Object3D;
  hinge: Group;
  /** Materials owned by this instance; dispose them when the instance unmounts. */
  materials: Material[];
};

/** Builds an independent, tier-colored copy of the loaded box scene with a working lid hinge. */
export function createBoxInstance(scene: Object3D, tier: Rarity): BoxInstance {
  const root = scene.clone(true);
  const materials = applyTierColors(root, tier);
  const hinge = attachLidHinge(root);
  return { root, hinge, materials };
}
