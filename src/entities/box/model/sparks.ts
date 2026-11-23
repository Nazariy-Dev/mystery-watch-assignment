const GRAVITY = -3.5;
const DRAG = 1.4;

/**
 * Particle physics for the burst: sparks shoot up and out of the box mouth, slow down, fall and fade.
 * Plain arrays so the render loop can hand them straight to a GPU buffer without allocating.
 */
export class SparkBurst {
  /** xyz per spark. */
  readonly positions: Float32Array;
  /** 0…1 per spark: 1 when fresh, 0 when dead. */
  readonly brightness: Float32Array;
  private readonly velocities: Float32Array;
  private readonly ages: Float32Array;
  private readonly lifespans: Float32Array;

  constructor(
    readonly capacity: number,
    private readonly random: () => number = Math.random,
  ) {
    this.positions = new Float32Array(capacity * 3);
    this.brightness = new Float32Array(capacity);
    this.velocities = new Float32Array(capacity * 3);
    this.ages = new Float32Array(capacity);
    this.lifespans = new Float32Array(capacity);
  }

  /** Launches every spark from `origin` in a fountain that fans out around the vertical. */
  emit([x, y, z]: [number, number, number]) {
    for (let i = 0; i < this.capacity; i += 1) {
      const angle = this.random() * Math.PI * 2;
      const outward = 0.3 + this.random() * 1.2;
      this.positions.set([x, y, z], i * 3);
      this.velocities.set([Math.cos(angle) * outward, 1.6 + this.random() * 2, Math.sin(angle) * outward], i * 3);
      this.ages[i] = 0;
      this.lifespans[i] = 0.8 + this.random() * 0.9;
      this.brightness[i] = 1;
    }
  }

  tick(delta: number) {
    const drag = Math.exp(-DRAG * delta);
    for (let i = 0; i < this.capacity; i += 1) {
      if (this.brightness[i] <= 0) continue;
      this.ages[i] += delta;
      const life = 1 - this.ages[i] / this.lifespans[i];
      if (life <= 0) {
        this.brightness[i] = 0;
        continue;
      }
      // Eased out so sparks stay bright through their flight and only fade near the end.
      this.brightness[i] = 1 - (1 - life) ** 3;
      const v = i * 3;
      this.velocities[v] *= drag;
      this.velocities[v + 1] = this.velocities[v + 1] * drag + GRAVITY * delta;
      this.velocities[v + 2] *= drag;
      this.positions[v] += this.velocities[v] * delta;
      this.positions[v + 1] += this.velocities[v + 1] * delta;
      this.positions[v + 2] += this.velocities[v + 2] * delta;
    }
  }

  /** True while any spark is still visible. */
  get active() {
    return this.brightness.some((value) => value > 0);
  }
}
