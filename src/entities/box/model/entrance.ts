const DROP_HEIGHT = 1.4;
const DROP_SECONDS = 0.9;
const DOLLY_SECONDS = 1.3;
/** Extra camera distance at the start of the dolly, as a fraction of the fitted distance. */
const DOLLY_START = 0.45;
const IMPACT_DECAY = 7;
/** easeOutBounce first reaches the ground at this fraction of its duration. */
const FIRST_CONTACT = 1 / 2.75;

const easeOutBounce = (t: number) => {
  const n = 7.5625;
  if (t < 1 / 2.75) return n * t * t;
  if (t < 2 / 2.75) return n * (t -= 1.5 / 2.75) * t + 0.75;
  if (t < 2.5 / 2.75) return n * (t -= 2.25 / 2.75) * t + 0.9375;
  return n * (t -= 2.625 / 2.75) * t + 0.984375;
};

/** The box arriving on stage: it drops in and bounces while the camera eases in from further back. */
export class Entrance {
  private age = 0;
  private landedAt: number | null = null;

  /** `done` skips straight to the settled pose, for Reduce Motion or stages without an entrance. */
  constructor(done = false) {
    if (done) {
      this.age = DOLLY_SECONDS;
      this.landedAt = -Infinity;
    }
  }

  /** Advances by `delta` seconds; returns true on the frame the box first hits the ground. */
  tick(delta: number) {
    this.age += delta;
    if (this.landedAt === null && this.age >= DROP_SECONDS * FIRST_CONTACT) {
      this.landedAt = this.age;
      return true;
    }
    return false;
  }

  /** Height above the resting position. */
  get drop() {
    const t = Math.min(1, this.age / DROP_SECONDS);
    return DROP_HEIGHT * (1 - easeOutBounce(t));
  }

  /** Camera distance multiplier: starts further back and settles at 1. */
  get dolly() {
    const t = Math.min(1, this.age / DOLLY_SECONDS);
    return 1 + DOLLY_START * (1 - t) ** 3;
  }

  /** 1 at the first landing, decaying to 0: squashes the box and flashes its glow. */
  get impact() {
    if (this.landedAt === null) return 0;
    return Math.exp(-IMPACT_DECAY * (this.age - this.landedAt));
  }
}
