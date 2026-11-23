import { MoteField } from './motes';

const run = (field: MoteField, seconds: number, charge: number) => {
  for (let t = 0; t < seconds; t += 1 / 60) field.tick(1 / 60, charge);
};

describe('MoteField', () => {
  it('keeps every mote inside the stage, however long it drifts', () => {
    const field = new MoteField(40);
    run(field, 30, 0.5);
    for (let i = 0; i < field.count; i += 1) {
      const [x, y, z] = field.positions.subarray(i * 3, i * 3 + 3);
      expect(Math.hypot(x, z)).toBeLessThanOrEqual(1.7 + 1e-6);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(2.2);
    }
  });

  it('drifts at a steady distance at rest, so the idle box is calm', () => {
    const field = new MoteField(40);
    const before = field.meanRadius;
    run(field, 2, 0);
    expect(field.meanRadius).toBeCloseTo(before, 5);
  });

  it('draws motes toward the box while charging, so the hold looks like it gathers energy', () => {
    const resting = new MoteField(60, () => 0.5);
    const charging = new MoteField(60, () => 0.5);
    run(resting, 0.3, 0);
    run(charging, 0.3, 1);
    expect(charging.meanRadius).toBeLessThan(resting.meanRadius * 0.8);
  });
});
