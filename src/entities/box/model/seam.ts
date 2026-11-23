import { Color, type MeshPhysicalMaterial } from 'three';

import type { Rarity } from '@/shared/api';
import { darkTheme } from '@/shared/theme';

const WHITE_HOT = new Color('#ffffff');
const REST_INTENSITY = 0.6;

type SeamState = {
  /** 0…1 charge from the hold; heats the seam toward white. */
  charge: number;
  /** Teased rarity, which replaces the tier color once the tease starts. */
  shown: Rarity | null;
  /** 0…1 flare on each tease step. */
  pulse: number;
};

/** Paints the seam accent per frame: tier color at rest, heating up with the charge, then the teased rarity. */
export class SeamGlow {
  /** Current seam color; the aura and the inner light reuse it so everything glows together. */
  readonly color = new Color();
  intensity = REST_INTENSITY;
  private readonly rest: Color;

  constructor(tier: Rarity) {
    this.rest = new Color(darkTheme.rarity[tier]);
    this.color.copy(this.rest);
  }

  update({ charge, shown, pulse }: SeamState) {
    if (shown) this.color.set(darkTheme.rarity[shown]);
    else this.color.copy(this.rest).lerp(WHITE_HOT, charge * 0.75);
    this.intensity = REST_INTENSITY + charge * 1.6 + pulse * 3;
  }

  paint(material: MeshPhysicalMaterial) {
    material.color.copy(this.color);
    material.emissive.copy(this.color);
    material.emissiveIntensity = this.intensity;
  }
}
