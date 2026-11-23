"""Synthesizes the box-opening sound effects as 16-bit mono WAVs. Pure Python: math, random, wave.

Usage: python3 scripts/synthesize-sounds.py src
"""
import math
import random
import struct
import sys
import wave

SR = 44100
OUT = sys.argv[1]
random.seed(7)
TAU = 2 * math.pi


def silence(seconds):
    return [0.0] * int(seconds * SR)


def mix(target, source, at=0.0, gain=1.0):
    start = int(at * SR)
    if start + len(source) > len(target):
        target.extend([0.0] * (start + len(source) - len(target)))
    for i, value in enumerate(source):
        target[start + i] += value * gain
    return target


def lowpass(samples, cutoff):
    a = 1 - math.exp(-TAU * cutoff / SR)
    y, out = 0.0, []
    for x in samples:
        y += a * (x - y)
        out.append(y)
    return out


def highpass(samples, cutoff):
    low = lowpass(samples, cutoff)
    return [x - l for x, l in zip(samples, low)]


def noise(seconds):
    return [random.uniform(-1, 1) for _ in range(int(seconds * SR))]


def glock(freq, seconds, decay=3.0, bright=1.0):
    """Glockenspiel-like strike: a few inharmonic partials, the upper ones dying faster."""
    partials = [(1, 1.0, decay), (2.76, 0.35 * bright, decay * 2.2), (5.4, 0.15 * bright, decay * 4), (8.93, 0.06 * bright, decay * 6)]
    out = []
    for i in range(int(seconds * SR)):
        t = i / SR
        attack = min(1, t / 0.002)
        out.append(attack * sum(a * math.sin(TAU * freq * r * t) * math.exp(-d * t) for r, a, d in partials))
    return out


def thump(start_hz, end_hz, seconds, decay):
    """A sine whose pitch falls: the body of an impact."""
    out, phase = [], 0.0
    for i in range(int(seconds * SR)):
        t = i / SR
        freq = end_hz + (start_hz - end_hz) * math.exp(-t * 18)
        phase += TAU * freq / SR
        out.append(math.sin(phase) * math.exp(-decay * t) * min(1, t / 0.003))
    return out


def pad(freqs, seconds, attack, release):
    """Soft sustained chord: detuned saw-ish voices, low-passed."""
    out = []
    for i in range(int(seconds * SR)):
        t = i / SR
        env = min(1, t / attack) * min(1, (seconds - t) / release)
        v = 0.0
        for f in freqs:
            for detune in (-0.4, 0.4):
                for k in (1, 2, 3):
                    v += math.sin(TAU * (f + detune) * k * t) / (k * k)
        out.append(v * env / (len(freqs) * 3))
    return lowpass(out, 2400)


def sparkle(seconds, count, low=2500, high=6000, gain=0.25):
    """Scattered tiny high pings, like sparks or glitter."""
    out = silence(seconds)
    for _ in range(count):
        at = random.uniform(0, seconds * 0.8)
        ping = glock(random.uniform(low, high), 0.25, decay=14, bright=0.3)
        mix(out, ping, at, gain * random.uniform(0.3, 1))
    return out[: int(seconds * SR)]


def reverb(samples, wet=0.22, tail=0.6):
    """Cheap room: four feedback combs in parallel, so chimes bloom instead of stopping dead."""
    out = samples + [0.0] * int(tail * SR)
    wet_sum = [0.0] * len(out)
    for delay_ms, feedback in ((29.7, 0.78), (37.1, 0.76), (41.1, 0.74), (43.7, 0.72)):
        d = int(delay_ms / 1000 * SR)
        buf = [0.0] * len(out)
        for i in range(len(out)):
            buf[i] = out[i] + (buf[i - d] * feedback if i >= d else 0.0)
        for i in range(len(out)):
            wet_sum[i] += buf[i] / 4
    return lowpass([o * (1 - wet) + w * wet for o, w in zip(out, wet_sum)], 9000)


def write(name, samples, peak=0.85, folder='pages/box-opening/sounds'):
    fade = int(0.02 * SR)
    for i in range(min(fade, len(samples))):
        samples[-1 - i] *= i / fade
    top = max(abs(s) for s in samples) or 1
    with wave.open(f'{OUT}/{folder}/{name}.wav', 'wb') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(b''.join(struct.pack('<h', int(s / top * peak * 32767)) for s in samples))


# Box lands on the stage: a soft, low thud that rings out instead of stopping dead.
land = thump(120, 44, 1.1, 4.5)
mix(land, [n * math.exp(-30 * i / SR) for i, n in enumerate(lowpass(noise(0.25), 700))], 0, 0.6)
write('land', reverb(land, wet=0.2, tail=0.5), peak=0.7)

# Hold-to-open charge: an endless rise (Shepard tone). Octave-spaced layers glide upward together, each fading in
# at the bottom and out at the top, so the pitch seems to climb for as long as the hold and the wait last, without
# ever getting shrill. The app stops it at the first tease step.
HOLD_SECONDS = 1.2
CHARGE_SECONDS = 2.8
LAYERS = 5
BASE_HZ = 55.0
charge = []
phases = [0.0] * LAYERS
position = 0.0  # octaves climbed so far
for i in range(int(CHARGE_SECONDS * SR)):
    t = i / SR
    # The climb speeds up as the hold builds, then keeps its pace through the wait.
    position += (0.35 + 0.55 * min(1, t / HOLD_SECONDS)) / SR
    voice = 0.0
    for layer in range(LAYERS):
        octave = (layer + position) % LAYERS
        freq = BASE_HZ * 2 ** octave
        phases[layer] += TAU * freq / SR
        # Raised-cosine weight over the octave span: silent at both ends, so the wrap from top to bottom is inaudible.
        weight = 0.5 - 0.5 * math.cos(TAU * octave / LAYERS)
        voice += weight * (math.sin(phases[layer]) + 0.3 * math.sin(2 * phases[layer]))
    progress = min(1, t / HOLD_SECONDS)
    tremolo = 1 - 0.3 * (0.5 + 0.5 * math.sin(TAU * (5 + 15 * min(1, t / CHARGE_SECONDS)) * t))
    swell = 0.15 + 0.6 * progress ** 1.5 + 0.25 * max(0, (t - HOLD_SECONDS) / (CHARGE_SECONDS - HOLD_SECONDS))
    charge.append(voice * tremolo * swell)
charge = lowpass(charge, 2500)
riser = highpass(noise(CHARGE_SECONDS), 3000)
mix(charge, [r * 0.6 * min(1, (i / SR) / HOLD_SECONDS) ** 3 for i, r in enumerate(riser)], 0, 0.2)
write('charge', charge, peak=0.7)

def energy_stab(freq, seconds):
    """A saw stab whose low-pass snaps open and closes again: a short synthetic 'bwom', not a bell."""
    out, low, phase = [], 0.0, 0.0
    for i in range(int(seconds * SR)):
        t = i / SR
        phase += freq / SR
        saw = 2 * (phase % 1) - 1
        cutoff = 250 + 2600 * math.exp(-t * 14)
        low += (1 - math.exp(-TAU * cutoff / SR)) * (saw - low)
        out.append(low * math.exp(-t * 6) * min(1, t / 0.004))
    return out


# Tease steps: an energy pulse per rarity, pitched up the ladder in a low register.
for rarity, note in (('common', 164.81), ('rare', 220.0), ('epic', 277.18), ('legendary', 329.63)):
    step = thump(170, 48, 0.6, 7)
    mix(step, energy_stab(note, 0.6), 0, 0.7)
    mix(step, energy_stab(note * 1.005, 0.6), 0, 0.5)
    mix(step, [math.sin(TAU * note / 2 * i / SR) * math.exp(-6 * i / SR) for i in range(int(0.6 * SR))], 0, 0.5)
    write(f'step-{rarity}', reverb(step, wet=0.15, tail=0.25), peak=0.75)

# Lid bursts open: a boom, a bright noise blast and a spray of sparks.
burst = thump(90, 34, 1.4, 3.2)
blast = noise(1.0)
mix(burst, [b * math.exp(-14 * i / SR) for i, b in enumerate(blast)], 0, 0.7)
mix(burst, [b * math.exp(-3 * i / SR) for i, b in enumerate(lowpass(blast, 900))], 0, 0.8)
mix(burst, sparkle(1.2, 28), 0.03, 0.6)
write('burst', reverb(burst, wet=0.15, tail=0.4), peak=0.9)

# Reveal fanfares, growing with rarity.
C5, E5, G5, C6, E6, G6 = 523.25, 659.25, 783.99, 1046.5, 1318.5, 1568.0
fanfares = {
    'common': [(0, C5), (0.08, G5)],
    'rare': [(0, C5), (0.11, G5), (0.22, C6)],
    'epic': [(0, C5), (0.09, E5), (0.18, G5), (0.27, C6)],
    'legendary': [(0, C5), (0.07, E5), (0.14, G5), (0.21, C6), (0.28, E6), (0.35, G6)],
}
lengths = {'common': 1.0, 'rare': 1.2, 'epic': 1.6, 'legendary': 2.6}
for rarity, notes in fanfares.items():
    out = silence(lengths[rarity])
    for at, note in notes:
        mix(out, glock(note, lengths[rarity] - at, decay=2.5), at, 0.55)
    if rarity in ('epic', 'legendary'):
        mix(out, pad([261.63, 329.63, 392.0], lengths[rarity] - 0.2, attack=0.35, release=0.6), 0.2, 0.5)
    if rarity == 'legendary':
        mix(out, sparkle(2.2, 40, gain=0.3), 0.3, 0.7)
    write(f'reveal-{rarity}', reverb(out, wet=0.25, tail=0.6), peak=0.75)

def resonate(samples, freq, q):
    """Two-pole band-pass (RBJ, 0 dB peak): rings at `freq` for a time set by `q`, like one mode of a struck body."""
    w = TAU * freq / SR
    alpha = math.sin(w) / (2 * q)
    b0, b2 = alpha, -alpha
    a0, a1, a2 = 1 + alpha, -2 * math.cos(w), 1 - alpha
    x1 = x2 = y1 = y2 = 0.0
    out = []
    for x in samples:
        y = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0
        x2, x1, y2, y1 = x1, x, y1, y
        out.append(y)
    return out


def wood_click(pitch, brightness=1.0, ring=1.0):
    """
    A struck plastic or wooden button: a 1.5 ms noise strike exciting a few resonant modes (strongest near 1.3 kHz,
    with 950 Hz, 2.45 kHz and a little 250 Hz body), plus the raw strike for the bright edge. About 35 ms long.
    `pitch` scales every mode, `brightness` the upper modes and the strike, `ring` how long the modes sustain.
    """
    seconds = 0.08
    strike = [random.uniform(-1, 1) * math.exp(-i / (0.0012 * SR)) for i in range(int(seconds * SR))]
    out = [0.0] * len(strike)
    modes = ((1320, 42, 1.0), (940, 20, 0.45), (2450, 40, 0.9), (4100, 28, 0.8), (6200, 24, 0.5), (250, 5, 0.3))
    for freq, q, gain in modes:
        upper = brightness if freq > 2000 else 1.0
        mix(out, resonate(strike, freq * pitch, q * ring), 0, gain * upper * q * ring / 6)
    mix(out, highpass(strike, 3000), 0, 0.25 * brightness)
    return out


def denied_thud(pitch):
    """A dull, short thud for tapping something unavailable: low and muffled, with nothing bright to read as success."""
    out = thump(190 * pitch, 95 * pitch, 0.12, 28)
    strike = [random.uniform(-1, 1) * math.exp(-i / (0.002 * SR)) for i in range(int(0.12 * SR))]
    mix(out, resonate(strike, 420 * pitch, 6), 0, 0.8)
    return lowpass(out, 1200)


# UI clicks by meaning, each in three pitches about 3% apart: the app picks one at random so repeats don't wear.
UI_CLICKS = {
    'confirm': lambda pitch: (wood_click(0.9 * pitch), 0.35),
    'back': lambda pitch: (wood_click(0.74 * pitch, brightness=0.5, ring=0.8), 0.28),
    'tab': lambda pitch: (wood_click(1.05 * pitch, brightness=0.7, ring=0.6), 0.24),
    'denied': lambda pitch: (denied_thud(pitch), 0.4),
}
for kind, make in UI_CLICKS.items():
    for variant, pitch in enumerate((0.97, 1.0, 1.03), start=1):
        samples, peak = make(pitch)
        write(f'{kind}-{variant}', samples, peak=peak, folder='shared/lib/sounds')

print('done')
