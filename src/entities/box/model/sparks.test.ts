import { SparkBurst } from './sparks';

const run = (sparks: SparkBurst, seconds: number) => {
  for (let t = 0; t < seconds; t += 1 / 60) sparks.tick(1 / 60);
};

const heights = (sparks: SparkBurst) => Array.from({ length: sparks.capacity }, (_, i) => sparks.positions[i * 3 + 1]);

describe('SparkBurst', () => {
  it('is dark until emitted, so nothing shows before the lid blows', () => {
    const sparks = new SparkBurst(20);
    run(sparks, 1);
    expect(sparks.active).toBe(false);
  });

  it('shoots every spark up out of the box mouth', () => {
    const sparks = new SparkBurst(50);
    sparks.emit([0, 1, 0]);
    run(sparks, 0.3);
    expect(Math.min(...heights(sparks))).toBeGreaterThan(1);
  });

  it('pulls sparks back down, so the burst reads as a fountain rather than a beam', () => {
    const sparks = new SparkBurst(50);
    sparks.emit([0, 1, 0]);
    run(sparks, 0.4);
    const rising = heights(sparks);
    run(sparks, 0.35);
    const later = heights(sparks);
    expect(later.filter((y, i) => y < rising[i]).length).toBeGreaterThan(25);
  });

  it('burns every spark out within two seconds, so the effect never lingers over the result', () => {
    const sparks = new SparkBurst(50);
    sparks.emit([0, 1, 0]);
    run(sparks, 0.2);
    expect(sparks.active).toBe(true);
    run(sparks, 1.8);
    expect(sparks.active).toBe(false);
  });
});
