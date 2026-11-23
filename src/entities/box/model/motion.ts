// Under-damped (ζ ≈ 0.58): the lid overshoots a little and settles, like a sprung hinge.
const LID_STIFFNESS = 60;
const LID_DAMPING = 9;
const SHAKE_RAMP_UP = 1.2;
const SHAKE_RAMP_DOWN = 8;
/** Longer frames are split so a dropped frame can't make the spring explode. */
const MAX_STEP = 1 / 60;

const approach = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));

/** Lid openness (0 closed, 1 open, briefly above 1 on overshoot) and charge-up shake of a box, advanced per frame. */
export class BoxMotion {
  openness = 0;
  /** 0 = still, 1 = full shake. Builds slowly while charging, stops quickly. */
  shake = 0;
  private velocity = 0;
  private time = 0;

  tick(delta: number, { open, charging }: { open: boolean; charging: boolean }) {
    for (let left = delta; left > 0; left -= MAX_STEP) {
      const dt = Math.min(left, MAX_STEP);
      const accel = LID_STIFFNESS * ((open ? 1 : 0) - this.openness) - LID_DAMPING * this.velocity;
      this.velocity += accel * dt;
      this.openness += this.velocity * dt;
      this.shake = approach(this.shake, charging ? 1 : 0, charging ? SHAKE_RAMP_UP : SHAKE_RAMP_DOWN, dt);
      this.time += dt;
    }
  }

  /** Lid lift as a fraction of fully open: it strains against the latch while the box shakes. */
  get rattle() {
    return Math.max(0, Math.sin(this.time * 23)) * this.shake * 0.02;
  }

  /** Side-to-side wobble in -shake…shake. */
  get wobble() {
    return Math.sin(this.time * 42) * this.shake;
  }
}
