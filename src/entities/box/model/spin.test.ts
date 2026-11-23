import { SpinController } from './spin';

describe('SpinController', () => {
  it('follows the finger exactly while dragging, ignoring the idle spin', () => {
    const spin = new SpinController();
    const start = spin.yaw;
    spin.grab();
    spin.drag(100);
    expect(spin.tick(1, true)).toBeCloseTo(start + 1.2);
  });

  it('keeps turning after a fling, then settles back to the idle speed', () => {
    const spin = new SpinController();
    spin.grab();
    spin.release(2000);
    const flingStep = -spin.yaw + spin.tick(0.1, true);
    for (let i = 0; i < 100; i++) spin.tick(0.1, true);
    const idleStep = -spin.yaw + spin.tick(0.1, true);

    expect(flingStep).toBeGreaterThan(idleStep * 10);
    expect(idleStep).toBeCloseTo(0.06, 3);
  });

  it('stays still without auto spin once a fling has died out', () => {
    const spin = new SpinController();
    for (let i = 0; i < 10; i++) spin.tick(0.1, false);
    const yaw = spin.yaw;
    expect(spin.tick(0.1, false)).toBe(yaw);
  });
});
