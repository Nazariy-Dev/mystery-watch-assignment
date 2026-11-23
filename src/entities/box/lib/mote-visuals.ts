import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, PointsMaterial, type Color } from 'three';

import { MoteField } from '../model/motes';
import { createGlowTexture } from './glow-texture';

const MOTE_COUNT = 70;

/** Faint dust motes around the box, as a three.js Points cloud; they brighten and gather while charging. */
export class MoteVisuals {
  readonly root: Points;
  private readonly field = new MoteField(MOTE_COUNT);
  private readonly geometry = new BufferGeometry();
  private readonly texture = createGlowTexture();
  private readonly material = new PointsMaterial({
    map: this.texture,
    size: 0.05,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    opacity: 0,
  });

  constructor() {
    this.geometry.setAttribute('position', new BufferAttribute(this.field.positions, 3));
    this.root = new Points(this.geometry, this.material);
    // Motes orbit outside the geometry's initial bounds.
    this.root.frustumCulled = false;
  }

  update(delta: number, { charge, color }: { charge: number; color: Color }) {
    this.field.tick(delta, charge);
    this.geometry.attributes.position.needsUpdate = true;
    this.material.color.copy(color);
    this.material.opacity = 0.35 + charge * 0.65;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
