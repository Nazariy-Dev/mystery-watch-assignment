import type { Group, Material, MeshPhysicalMaterial, Object3D } from 'three';

import type { Rarity } from '@/shared/api';

import { attachLidHinge } from './hinge';
import { ACCENT_MATERIAL, applyTierColors } from './tier';

export type BoxInstance = {
  root: Object3D;
  hinge: Group;
  /** Materials owned by this instance; dispose them when the instance unmounts. */
  materials: Material[];
  /** The glowing seam accent, repainted per frame during the reveal. */
  seam: MeshPhysicalMaterial | undefined;
};

/** Builds an independent, tier-colored copy of the loaded box scene with a working lid hinge. */
export function createBoxInstance(scene: Object3D, tier: Rarity): BoxInstance {
  const root = scene.clone(true);
  const materials = applyTierColors(root, tier);
  const hinge = attachLidHinge(root);
  const seam = materials.find((material) => material.name === ACCENT_MATERIAL) as MeshPhysicalMaterial | undefined;
  return { root, hinge, materials, seam };
}
