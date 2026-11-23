import { Entrance } from './entrance';

const run = (entrance: Entrance, seconds: number) => {
  let landings = 0;
  for (let t = 0; t < seconds; t += 1 / 60) if (entrance.tick(1 / 60)) landings += 1;
  return landings;
};

describe('Entrance', () => {
  it('drops the box in from above and settles it exactly on its resting spot', () => {
    const entrance = new Entrance();
    expect(entrance.drop).toBeGreaterThan(1);
    run(entrance, 1.5);
    expect(entrance.drop).toBeCloseTo(0, 5);
    expect(entrance.dolly).toBeCloseTo(1, 5);
  });

  it('reports the landing exactly once, so the thud haptic fires once and not on every bounce', () => {
    expect(run(new Entrance(), 2)).toBe(1);
  });

  it('never sinks the box below its resting spot while bouncing', () => {
    const entrance = new Entrance();
    for (let t = 0; t < 1.2; t += 1 / 60) {
      entrance.tick(1 / 60);
      expect(entrance.drop).toBeGreaterThanOrEqual(-1e-9);
    }
  });

  it('starts settled when the entrance is skipped, with no landing to report', () => {
    const entrance = new Entrance(true);
    expect(entrance.drop).toBe(0);
    expect(entrance.dolly).toBe(1);
    expect(entrance.impact).toBe(0);
    expect(run(entrance, 1)).toBe(0);
  });
});
