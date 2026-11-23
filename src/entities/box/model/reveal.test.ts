import { RevealTimeline, type RevealBeat } from './reveal';

const play = (timeline: RevealTimeline, seconds: number, frame = 1 / 60) => {
  const beats: RevealBeat[] = [];
  for (let t = 0; t < seconds; t += frame) beats.push(...timeline.tick(frame));
  return beats;
};

describe('RevealTimeline', () => {
  it('climbs the rarity ladder and stops at the won rarity, never past it', () => {
    const timeline = new RevealTimeline();
    timeline.start('epic');
    const steps = play(timeline, 5).filter((beat) => beat.kind === 'step');

    expect(steps).toEqual([
      { kind: 'step', rarity: 'common', final: false },
      { kind: 'step', rarity: 'rare', final: false },
      { kind: 'step', rarity: 'epic', final: true },
    ]);
    expect(timeline.shown).toBe('epic');
  });

  it('keeps the lid shut through the tease, then bursts, then hands over to the result card', () => {
    const timeline = new RevealTimeline();
    timeline.start('rare');

    play(timeline, 0.9);
    expect(timeline.opened).toBe(false);
    expect(timeline.teasing).toBe(true);

    const rest = play(timeline, 3).map((beat) => beat.kind);
    expect(rest).toEqual(['burst', 'done']);
    expect(timeline.opened).toBe(true);
  });

  it('lets a common result open quickly, so low rolls are not dragged out', () => {
    const timeline = new RevealTimeline();
    timeline.start('common');
    const beats = play(timeline, 1);
    expect(beats.map((beat) => beat.kind)).toContain('burst');
  });

  it('fires every beat exactly once even when a long frame skips past several', () => {
    const timeline = new RevealTimeline();
    timeline.start('legendary');
    const beats = [...timeline.tick(10), ...timeline.tick(10)];
    expect(beats.map((beat) => beat.kind)).toEqual(['step', 'step', 'step', 'step', 'burst', 'done']);
  });

  it('flares on each step and calms between them', () => {
    const timeline = new RevealTimeline();
    timeline.start('rare');
    timeline.tick(0);
    expect(timeline.pulse).toBe(1);
    play(timeline, 0.7);
    expect(timeline.pulse).toBeLessThan(0.1);
  });

  it('times the burst effects from the moment the lid blows, not from the start', () => {
    const timeline = new RevealTimeline();
    timeline.start('common');
    play(timeline, 0.5);
    expect(timeline.burstAge).toBeNull();

    play(timeline, 1);
    expect(timeline.burstAge).toBeGreaterThan(0.5);
    expect(timeline.burstAge).toBeLessThan(0.7);
  });

  it('skips the rest of the climb straight to the burst, without firing the skipped steps', () => {
    const timeline = new RevealTimeline();
    timeline.start('legendary');
    timeline.tick(0.1);
    timeline.skip();
    const beats = timeline.tick(1 / 60).map((beat) => beat.kind);

    expect(beats).toEqual(['burst']);
    expect(timeline.shown).toBe('legendary');
  });

  it('skips from the open box to the result card on a second tap', () => {
    const timeline = new RevealTimeline();
    timeline.start('rare');
    timeline.skip();
    timeline.tick(1 / 60);
    timeline.skip();
    expect(timeline.tick(1 / 60).map((beat) => beat.kind)).toEqual(['done']);
  });

  it('lets rarer results linger longer on the open box before the card covers it', () => {
    const doneAfterBurst = (rarity: 'common' | 'legendary') => {
      const timeline = new RevealTimeline();
      timeline.start(rarity);
      for (let t = 0; t < 10; t += 1 / 60) {
        if (timeline.tick(1 / 60).some((beat) => beat.kind === 'done')) return timeline.burstAge ?? 0;
      }
      return Infinity;
    };
    expect(doneAfterBurst('legendary')).toBeGreaterThan(doneAfterBurst('common') + 0.5);
  });

  it('slows the burst effects for a legendary but never for a common', () => {
    const slowest = (rarity: 'common' | 'legendary') => {
      const timeline = new RevealTimeline();
      timeline.start(rarity);
      let min = 1;
      for (let t = 0; t < 6; t += 1 / 60) {
        timeline.tick(1 / 60);
        min = Math.min(min, timeline.effectsTimeScale);
      }
      return { min, end: timeline.effectsTimeScale };
    };
    expect(slowest('common').min).toBe(1);
    expect(slowest('legendary').min).toBeLessThan(0.5);
    expect(slowest('legendary').end).toBe(1);
  });

  it('returns to a sealed box on reset, ready for the next opening', () => {
    const timeline = new RevealTimeline();
    timeline.start('epic');
    play(timeline, 5);
    timeline.reset();
    expect(timeline).toMatchObject({ shown: null, opened: false, running: false });
    expect(timeline.tick(1)).toEqual([]);
  });
});
