import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  type Color,
} from 'three';

import { SparkBurst } from '../model/sparks';
import { createBeamTexture, createGlowTexture } from './glow-texture';

const RAY_COUNT = 9;
const RAY_WIDTH = 0.28;
const RAY_HEIGHT = 1.5;
const RAY_SPIN = 0.5;
const SPARK_COUNT = 140;
const SPARK_HEAT = 0.35;

/**
 * The burst as three.js objects: light shafts fanning up out of the box mouth plus a spark fountain.
 * Place `root` at the box mouth, inside the box's group, so the walls hide where the rays start.
 */
export class BurstVisuals {
  readonly root = new Group();
  private readonly rays = new Group();
  private readonly sparks = new SparkBurst(SPARK_COUNT);
  private readonly sparkColors = new Float32Array(SPARK_COUNT * 3);
  private readonly sparkGeometry = new BufferGeometry();
  private readonly rayGeometry = new PlaneGeometry(RAY_WIDTH, RAY_HEIGHT).translate(0, RAY_HEIGHT / 2, 0);
  private readonly beamTexture = createBeamTexture();
  private readonly glowTexture = createGlowTexture();
  private readonly rayMaterial = new MeshBasicMaterial({
    map: this.beamTexture,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
  });
  private readonly sparkMaterial = new PointsMaterial({
    map: this.glowTexture,
    size: 0.09,
    vertexColors: true,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });

  constructor() {
    for (let i = 0; i < RAY_COUNT; i += 1) {
      const ray = new Mesh(this.rayGeometry, this.rayMaterial);
      // Spread evenly around the vertical and alternate the lean, so the fan never looks regular.
      const lean = (i % 2 ? 1 : -1) * (0.15 + ((i * 7) % 5) * 0.1);
      ray.rotation.set(0, (i / RAY_COUNT) * Math.PI, lean, 'YXZ');
      this.rays.add(ray);
    }
    this.sparkGeometry.setAttribute('position', new BufferAttribute(this.sparks.positions, 3));
    this.sparkGeometry.setAttribute('color', new BufferAttribute(this.sparkColors, 3));
    const points = new Points(this.sparkGeometry, this.sparkMaterial);
    // Sparks fly far from where the geometry started, so its stale bounds must not cull them.
    points.frustumCulled = false;
    this.root.add(this.rays, points);
    this.root.visible = false;
  }

  /** Launches the spark fountain; the rays follow `burstAge` on their own. */
  burst() {
    this.sparks.emit([0, 0.1, 0]);
  }

  /** @param burstAge seconds since the lid blew, or null while the box is sealed. */
  update(delta: number, burstAge: number | null, color: Color) {
    this.root.visible = burstAge !== null;
    if (burstAge === null) return;

    // Snap in, flare, then settle to a steady glow that stays behind the rising watch.
    const envelope = Math.min(1, burstAge / 0.12) * (0.4 + 0.6 * Math.exp(-burstAge * 2.2));
    this.rayMaterial.color.copy(color);
    this.rayMaterial.opacity = envelope;
    this.rays.scale.y = 1 - (1 - Math.min(1, burstAge / 0.3)) ** 3;
    this.rays.rotation.y += delta * RAY_SPIN;

    this.sparks.tick(delta);
    for (let i = 0; i < SPARK_COUNT; i += 1) {
      // A little white on top of the rarity color reads as hot metal rather than flat confetti.
      const glow = this.sparks.brightness[i];
      this.sparkColors[i * 3] = (color.r + SPARK_HEAT) * glow;
      this.sparkColors[i * 3 + 1] = (color.g + SPARK_HEAT) * glow;
      this.sparkColors[i * 3 + 2] = (color.b + SPARK_HEAT) * glow;
    }
    this.sparkGeometry.attributes.position.needsUpdate = true;
    this.sparkGeometry.attributes.color.needsUpdate = true;
  }

  dispose() {
    this.rayGeometry.dispose();
    this.sparkGeometry.dispose();
    this.rayMaterial.dispose();
    this.sparkMaterial.dispose();
    this.beamTexture.dispose();
    this.glowTexture.dispose();
  }
}
