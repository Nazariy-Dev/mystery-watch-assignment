import type { Rarity } from '@/shared/api';

/** Rarities from lowest to highest; the tease climbs this ladder and stops at the result. */
const LADDER: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
const STEP_SECONDS = 0.75;
/** The pause after the last step, before the lid blows, is the beat where the user holds their breath. */
const FINAL_HOLD_SECONDS = 0.9;
/** Time for the lid to swing open and the light to flood out before the result card appears. */
const SHOWCASE_SECONDS = 1.1;
const PULSE_DECAY = 4;

export type RevealBeat =
  | { kind: 'step'; rarity: Rarity; final: boolean }
  | { kind: 'burst' }
  | { kind: 'done' };

/**
 * Plays the opening once the result is known: the seam steps up the rarity ladder to the won rarity,
 * holds, then the lid bursts. The result is decided before this starts; the timeline only stages it.
 */
export class RevealTimeline {
  /** Rarity the seam currently shows; null until the first step. */
  shown: Rarity | null = null;
  /** 1 on each step, decaying to 0; drives the flare and the punch. */
  pulse = 0;
  /** True from the burst on: the lid opens. */
  opened = false;
  private schedule: { at: number; beat: RevealBeat }[] = [];
  private next = 0;
  private elapsed = 0;

  start(result: Rarity) {
    const steps = LADDER.slice(0, LADDER.indexOf(result) + 1);
    const burstAt = (steps.length - 1) * STEP_SECONDS + FINAL_HOLD_SECONDS;
    this.reset();
    this.schedule = [
      ...steps.map((rarity, index) => ({
        at: index * STEP_SECONDS,
        beat: { kind: 'step', rarity, final: index === steps.length - 1 } as const,
      })),
      { at: burstAt, beat: { kind: 'burst' } },
      { at: burstAt + SHOWCASE_SECONDS, beat: { kind: 'done' } },
    ];
  }

  reset() {
    this.shown = null;
    this.pulse = 0;
    this.opened = false;
    this.schedule = [];
    this.next = 0;
    this.elapsed = 0;
  }

  /** True between start and the burst, while the box is still sealed and straining. */
  get teasing() {
    return this.schedule.length > 0 && !this.opened;
  }

  /** True once started, until reset. */
  get running() {
    return this.schedule.length > 0;
  }

  /** Advances by `delta` seconds and returns the beats crossed, in order; each beat fires exactly once. */
  tick(delta: number): RevealBeat[] {
    this.pulse *= Math.exp(-PULSE_DECAY * delta);
    if (this.next >= this.schedule.length) return [];

    this.elapsed += delta;
    const fired: RevealBeat[] = [];
    while (this.next < this.schedule.length && this.schedule[this.next].at <= this.elapsed) {
      const { beat } = this.schedule[this.next];
      if (beat.kind === 'step') {
        this.shown = beat.rarity;
        this.pulse = 1;
      } else if (beat.kind === 'burst') {
        this.opened = true;
      }
      fired.push(beat);
      this.next += 1;
    }
    return fired;
  }
}
