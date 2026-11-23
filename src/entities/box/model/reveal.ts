import type { Rarity } from '@/shared/api';

import { CELEBRATION } from './celebration';

/** Rarities from lowest to highest; the tease climbs this ladder and stops at the result. */
const LADDER: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
const STEP_SECONDS = 0.75;
/** The pause after the last step, before the lid blows, is the beat where the user holds their breath. */
const FINAL_HOLD_SECONDS = 0.9;
/** Time for the lid to swing open and the light to flood out before the result card appears. */
const SHOWCASE_SECONDS = 1.1;
const PULSE_DECAY = 4;
/** Effect speed at the deepest point of the slow-motion beat. */
const SLOW_MO_SPEED = 0.25;

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
  private burstAt = 0;
  private result: Rarity | null = null;

  start(result: Rarity) {
    const steps = LADDER.slice(0, LADDER.indexOf(result) + 1);
    const burstAt = (steps.length - 1) * STEP_SECONDS + FINAL_HOLD_SECONDS;
    this.reset();
    this.result = result;
    this.burstAt = burstAt;
    this.schedule = [
      ...steps.map((rarity, index) => ({
        at: index * STEP_SECONDS,
        beat: { kind: 'step', rarity, final: index === steps.length - 1 } as const,
      })),
      { at: burstAt, beat: { kind: 'burst' } },
      { at: burstAt + SHOWCASE_SECONDS + CELEBRATION[result].linger, beat: { kind: 'done' } },
    ];
  }

  reset() {
    this.shown = null;
    this.pulse = 0;
    this.opened = false;
    this.schedule = [];
    this.next = 0;
    this.elapsed = 0;
    this.result = null;
  }

  /** True between start and the burst, while the box is still sealed and straining. */
  get teasing() {
    return this.schedule.length > 0 && !this.opened;
  }

  /** True once started, until reset. */
  get running() {
    return this.schedule.length > 0;
  }

  /** How hard the won rarity celebrates; the common level until a result is set. */
  get celebration() {
    return CELEBRATION[this.result ?? 'common'];
  }

  /**
   * Speed multiplier for the burst effects: dips to slow motion as the lid blows for the rarities that earn it,
   * then eases back to real time. The beats themselves keep real time.
   */
  get effectsTimeScale() {
    const age = this.burstAge;
    const { slowMo } = this.celebration;
    if (age === null || slowMo === 0 || age >= slowMo) return 1;
    return SLOW_MO_SPEED + (1 - SLOW_MO_SPEED) * (age / slowMo) ** 3;
  }

  /**
   * Hurries the reveal: during the tease it jumps straight to the burst, dropping the remaining steps
   * silently; after the burst it jumps to the result card. Each call fires at most the next beat.
   */
  skip() {
    if (!this.running || this.next >= this.schedule.length) return;
    const burstIndex = this.schedule.length - 2;
    if (!this.opened) {
      this.shown = this.result;
      this.next = burstIndex;
      this.elapsed = this.burstAt;
    } else {
      this.elapsed = this.schedule[this.schedule.length - 1].at;
    }
  }

  /** Seconds since the lid burst, or null before it; drives the rays, sparks and camera kick. */
  get burstAge() {
    return this.opened ? this.elapsed - this.burstAt : null;
  }

  /** Advances by `delta` seconds and returns the beats crossed, in order; each beat fires exactly once. */
  tick(delta: number): RevealBeat[] {
    this.pulse *= Math.exp(-PULSE_DECAY * delta);
    if (!this.running) return [];

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
