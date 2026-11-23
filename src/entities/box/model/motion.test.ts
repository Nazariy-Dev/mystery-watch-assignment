import { BoxMotion } from './motion';

const run = (motion: BoxMotion, seconds: number, state: { open: boolean; charging: boolean }) => {
  const peaks: number[] = [];
  for (let t = 0; t < seconds; t += 1 / 60) {
    motion.tick(1 / 60, state);
    peaks.push(motion.openness);
  }
  return Math.max(...peaks);
};

describe('BoxMotion', () => {
  it('springs the lid open with a small overshoot, then settles fully open', () => {
    const motion = new BoxMotion();
    const peak = run(motion, 3, { open: true, charging: false });

    expect(peak).toBeGreaterThan(1.02);
    // The lid must not swing so far that it clips through the back of the box.
    expect(peak).toBeLessThan(1.2);
    expect(motion.openness).toBeCloseTo(1, 2);
  });

  it('stays stable on a long frame instead of blowing up', () => {
    const motion = new BoxMotion();
    motion.tick(0.5, { open: true, charging: false });
    expect(motion.openness).toBeGreaterThan(0.5);
    expect(motion.openness).toBeLessThan(1.2);
  });

  it('builds the shake gradually while charging, so a quick tap barely moves the box', () => {
    const motion = new BoxMotion();
    run(motion, 0.15, { open: false, charging: true });
    const afterTap = motion.shake;
    run(motion, 1.5, { open: false, charging: true });

    expect(afterTap).toBeLessThan(0.25);
    expect(motion.shake).toBeGreaterThan(0.8);
  });

  it('stops shaking quickly once charging ends', () => {
    const motion = new BoxMotion();
    run(motion, 2, { open: false, charging: true });
    run(motion, 0.5, { open: false, charging: false });
    expect(motion.shake).toBeLessThan(0.05);
  });
});
