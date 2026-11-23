const AUTO_SPIN = 0.6;
const RADIANS_PER_PX = 0.012;
const FLING_DECAY = 3;

/**
 * Yaw of a turntable box: an idle spin, a drag that takes over directly, and a fling that decays back into the idle spin.
 * Lives outside React state so gestures and the render loop share it without re-renders.
 */
export class SpinController {
  yaw = -0.6;
  private velocity = 0;
  private dragging = false;
  private dragStartYaw = 0;

  grab() {
    this.dragging = true;
    this.dragStartYaw = this.yaw;
    this.velocity = 0;
  }

  /** `dx` is the total horizontal travel since `grab`, in px. */
  drag(dx: number) {
    this.yaw = this.dragStartYaw + dx * RADIANS_PER_PX;
  }

  /** `vx` is the release speed in px/s. */
  release(vx = 0) {
    this.dragging = false;
    this.velocity = vx * RADIANS_PER_PX;
  }

  tick(delta: number, autoSpin: boolean) {
    if (this.dragging) return this.yaw;
    this.velocity *= Math.exp(-FLING_DECAY * delta);
    this.yaw += ((autoSpin ? AUTO_SPIN : 0) + this.velocity) * delta;
    return this.yaw;
  }
}
