const INNER_RADIUS = 0.5;
const OUTER_RADIUS = 1.7;
const TOP = 2.2;
const ORBIT_SPEED = 0.12;
/** How fast a full charge drags motes toward the box, per second, as a fraction of their radius. */
const PULL = 1.6;

/**
 * Dust motes floating around the box: they drift up and slowly orbit, and a charge draws them into it.
 * Kept in polar form (radius, angle, height); `positions` is the xyz view handed to the GPU.
 */
export class MoteField {
  readonly positions: Float32Array;
  private readonly radius: Float32Array;
  private readonly angle: Float32Array;
  private readonly height: Float32Array;
  private readonly rise: Float32Array;

  constructor(
    readonly count: number,
    private readonly random: () => number = Math.random,
  ) {
    this.positions = new Float32Array(count * 3);
    this.radius = new Float32Array(count);
    this.angle = new Float32Array(count);
    this.height = new Float32Array(count);
    this.rise = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      this.radius[i] = INNER_RADIUS + 0.3 + this.random() * (OUTER_RADIUS - INNER_RADIUS - 0.3);
      this.angle[i] = this.random() * Math.PI * 2;
      this.height[i] = this.random() * TOP;
      this.rise[i] = 0.05 + this.random() * 0.12;
    }
    this.write();
  }

  /** @param charge 0…1 from the hold; speeds the drift and pulls motes into the box. */
  tick(delta: number, charge: number) {
    for (let i = 0; i < this.count; i += 1) {
      this.height[i] += this.rise[i] * (1 + charge * 3) * delta;
      if (this.height[i] > TOP) this.height[i] -= TOP;
      this.angle[i] += ORBIT_SPEED * (1 + charge * 4) * delta;
      this.radius[i] -= this.radius[i] * PULL * charge * delta;
      // A mote swallowed by the box reappears at the edge, so the field never empties.
      if (this.radius[i] < INNER_RADIUS) this.radius[i] = OUTER_RADIUS;
    }
    this.write();
  }

  /** Mean distance from the box's vertical axis. */
  get meanRadius() {
    return this.radius.reduce((sum, value) => sum + value, 0) / this.count;
  }

  private write() {
    for (let i = 0; i < this.count; i += 1) {
      this.positions[i * 3] = Math.cos(this.angle[i]) * this.radius[i];
      this.positions[i * 3 + 1] = this.height[i];
      this.positions[i * 3 + 2] = Math.sin(this.angle[i]) * this.radius[i];
    }
  }
}
