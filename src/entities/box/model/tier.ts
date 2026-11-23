import { Color, type Material, type Mesh, type MeshPhysicalMaterial, type Object3D } from 'three';

import type { Rarity } from '@/shared/api';
import { darkTheme } from '@/shared/theme';

/** Shell body color per tier; the seam glows in the tier's rarity color. */
const BODY_COLORS: Record<Rarity, string> = {
  common: '#6E7890',
  rare: '#2E6296',
  epic: '#5E3C96',
  legendary: '#8A6220',
};

const BODY_MATERIAL = 'ShellRole_Body_Matte';
const ACCENT_MATERIAL = 'ShellRole_SeamAccent_Accent';

/**
 * Recolors the box body and seam for a tier. Materials are cloned first because `scene.clone()`
 * shares them, and recoloring a shared material would repaint every box on screen.
 */
export function applyTierColors(root: Object3D, tier: Rarity) {
  const recolored = new Map<Material, Material>();

  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;

    const source = mesh.material as MeshPhysicalMaterial;
    if (source.name !== BODY_MATERIAL && source.name !== ACCENT_MATERIAL) return;

    let material = recolored.get(source) as MeshPhysicalMaterial | undefined;
    if (!material) {
      material = source.clone();
      if (source.name === BODY_MATERIAL) {
        material.color = new Color(BODY_COLORS[tier]);
      } else {
        material.color = new Color(darkTheme.rarity[tier]);
        material.emissive = new Color(darkTheme.rarity[tier]);
        material.emissiveIntensity = 0.6;
      }
      recolored.set(source, material);
    }
    mesh.material = material;
  });

  return [...recolored.values()];
}
